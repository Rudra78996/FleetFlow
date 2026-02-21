import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const fuelLogs = await prisma.fuelLog.findMany({
            include: { vehicle: true, driver: true, trip: true },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({ fuelLogs });
    } catch (error) {
        console.error("Fuel GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { tripId, vehicleId, driverId, liters, cost, distance, date } = body;

        if (!vehicleId) {
            return NextResponse.json({ error: "Vehicle is required" }, { status: 400 });
        }

        const fuelLog = await prisma.fuelLog.create({
            data: {
                tripId: tripId || null,
                vehicleId,
                driverId: driverId || null,
                liters: parseFloat(liters) || 0,
                cost: parseFloat(cost) || 0,
                distance: parseFloat(distance) || 0,
                date: date ? new Date(date) : new Date(),
            },
            include: { vehicle: true, driver: true },
        });

        return NextResponse.json({ fuelLog }, { status: 201 });
    } catch (error) {
        console.error("Fuel POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
