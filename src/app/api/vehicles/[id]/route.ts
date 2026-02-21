import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: { trips: true, maintenanceLogs: true, fuelLogs: true, expenses: true },
        });

        if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        return NextResponse.json({ vehicle });
    } catch (error) {
        console.error("Vehicle GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.model && { model: body.model }),
                ...(body.type && { type: body.type }),
                ...(body.maxCapacity !== undefined && { maxCapacity: parseFloat(body.maxCapacity) }),
                ...(body.odometer !== undefined && { odometer: parseFloat(body.odometer) }),
                ...(body.acquisitionCost !== undefined && { acquisitionCost: parseFloat(body.acquisitionCost) }),
                ...(body.status && { status: body.status }),
                ...(body.region && { region: body.region }),
            },
        });

        return NextResponse.json({ vehicle });
    } catch (error) {
        console.error("Vehicle PUT error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const activeTrips = await prisma.trip.findFirst({
            where: { vehicleId: id, status: { in: ["DISPATCHED", "DRAFT"] } },
        });

        if (activeTrips) {
            return NextResponse.json({ error: "Cannot delete vehicle with active trips" }, { status: 400 });
        }

        await prisma.vehicle.delete({ where: { id } });
        return NextResponse.json({ message: "Vehicle deleted" });
    } catch (error) {
        console.error("Vehicle DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
