import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const trip = await prisma.trip.findUnique({
            where: { id },
            include: { vehicle: true, driver: true, fuelLogs: true, expenses: true },
        });

        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        return NextResponse.json({ trip });
    } catch (error) {
        console.error("Trip GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        const trip = await prisma.trip.findUnique({
            where: { id },
            include: { vehicle: true, driver: true },
        });
        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

        if (action === "dispatch") {
            if (trip.status !== "DRAFT") {
                return NextResponse.json({ error: "Only DRAFT trips can be dispatched" }, { status: 400 });
            }

            // Re-validate vehicle and driver availability
            if (trip.vehicle.status !== "AVAILABLE") {
                return NextResponse.json({ error: `Vehicle is ${trip.vehicle.status}, cannot dispatch` }, { status: 400 });
            }
            if (trip.driver.status !== "AVAILABLE") {
                return NextResponse.json({ error: `Driver is ${trip.driver.status}, cannot dispatch` }, { status: 400 });
            }

            const [updatedTrip] = await prisma.$transaction([
                prisma.trip.update({ where: { id }, data: { status: "DISPATCHED" }, include: { vehicle: true, driver: true } }),
                prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "ON_TRIP" } }),
                prisma.driver.update({ where: { id: trip.driverId }, data: { status: "ON_DUTY" } }),
            ]);

            return NextResponse.json({ trip: updatedTrip });
        }

        if (action === "complete") {
            if (trip.status !== "DISPATCHED") {
                return NextResponse.json({ error: "Only DISPATCHED trips can be completed" }, { status: 400 });
            }

            const finalOdometer = body.finalOdometer ? parseFloat(body.finalOdometer) : trip.vehicle.odometer;
            const distance = body.distance ? parseFloat(body.distance) : trip.distance;
            const actualFuelCost = body.actualFuelCost ? parseFloat(body.actualFuelCost) : trip.actualFuelCost;

            const [updatedTrip] = await prisma.$transaction([
                prisma.trip.update({
                    where: { id },
                    data: { status: "COMPLETED", completedAt: new Date(), distance, actualFuelCost },
                    include: { vehicle: true, driver: true },
                }),
                prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE", odometer: finalOdometer } }),
                prisma.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } }),
            ]);

            return NextResponse.json({ trip: updatedTrip });
        }

        if (action === "cancel") {
            if (trip.status === "COMPLETED") {
                return NextResponse.json({ error: "Cannot cancel a completed trip" }, { status: 400 });
            }

            const updates = [
                prisma.trip.update({ where: { id }, data: { status: "CANCELLED" }, include: { vehicle: true, driver: true } }),
            ];

            if (trip.status === "DISPATCHED") {
                updates.push(prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } }) as never);
                updates.push(prisma.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } }) as never);
            }

            const [updatedTrip] = await prisma.$transaction(updates);
            return NextResponse.json({ trip: updatedTrip });
        }

        // Generic update
        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: {
                ...(body.origin && { origin: body.origin }),
                ...(body.destination && { destination: body.destination }),
                ...(body.cargoWeight !== undefined && { cargoWeight: parseFloat(body.cargoWeight) }),
                ...(body.estimatedFuelCost !== undefined && { estimatedFuelCost: parseFloat(body.estimatedFuelCost) }),
                ...(body.revenue !== undefined && { revenue: parseFloat(body.revenue) }),
            },
            include: { vehicle: true, driver: true },
        });

        return NextResponse.json({ trip: updatedTrip });
    } catch (error) {
        console.error("Trip PUT error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
