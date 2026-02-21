import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const logs = await prisma.maintenanceLog.findMany({
            include: { vehicle: true },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Maintenance GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { vehicleId, serviceType, cost, date, notes } = body;

        if (!vehicleId || !serviceType) {
            return NextResponse.json({ error: "Vehicle and service type are required" }, { status: 400 });
        }

        // Auto-update vehicle status to IN_SHOP
        const [log] = await prisma.$transaction([
            prisma.maintenanceLog.create({
                data: {
                    vehicleId,
                    serviceType,
                    cost: parseFloat(cost) || 0,
                    date: date ? new Date(date) : new Date(),
                    notes: notes || "",
                    status: "IN_PROGRESS",
                },
                include: { vehicle: true },
            }),
            prisma.vehicle.update({
                where: { id: vehicleId },
                data: { status: "IN_SHOP" },
            }),
        ]);

        return NextResponse.json({ log }, { status: 201 });
    } catch (error) {
        console.error("Maintenance POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
