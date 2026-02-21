import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { origin: { contains: search } },
                { destination: { contains: search } },
            ];
        }

        const trips = await prisma.trip.findMany({
            where,
            include: { vehicle: true, driver: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ trips });
    } catch (error) {
        console.error("Trips GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { vehicleId, driverId, origin, destination, cargoWeight, estimatedFuelCost, revenue } = body;

        if (!vehicleId || !driverId || !origin || !destination) {
            return NextResponse.json({ error: "Vehicle, driver, origin, and destination are required" }, { status: 400 });
        }

        // Validate vehicle
        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        if (vehicle.status !== "AVAILABLE") {
            return NextResponse.json({ error: `Vehicle is currently ${vehicle.status}. Only AVAILABLE vehicles can be dispatched.` }, { status: 400 });
        }
        if (parseFloat(cargoWeight) > vehicle.maxCapacity) {
            return NextResponse.json({ error: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg). Too heavy!` }, { status: 400 });
        }

        // Validate driver
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
        if (driver.status === "SUSPENDED") {
            return NextResponse.json({ error: "Driver is suspended and cannot be assigned to trips" }, { status: 400 });
        }
        if (driver.status !== "AVAILABLE") {
            return NextResponse.json({ error: `Driver is currently ${driver.status}. Only AVAILABLE drivers can be assigned.` }, { status: 400 });
        }
        if (new Date(driver.licenseExpiry) < new Date()) {
            return NextResponse.json({ error: "Driver's license has expired. Cannot assign to trip." }, { status: 400 });
        }

        const trip = await prisma.trip.create({
            data: {
                vehicleId,
                driverId,
                origin,
                destination,
                cargoWeight: parseFloat(cargoWeight) || 0,
                estimatedFuelCost: parseFloat(estimatedFuelCost) || 0,
                revenue: parseFloat(revenue) || 0,
                status: "DRAFT",
            },
            include: { vehicle: true, driver: true },
        });

        return NextResponse.json({ trip }, { status: 201 });
    } catch (error) {
        console.error("Trip POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
