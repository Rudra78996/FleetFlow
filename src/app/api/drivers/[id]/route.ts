import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const driver = await prisma.driver.findUnique({
            where: { id },
            include: { trips: { include: { vehicle: true } }, _count: { select: { trips: true } } },
        });

        if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
        return NextResponse.json({ driver });
    } catch (error) {
        console.error("Driver GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        const driver = await prisma.driver.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.licenseNumber && { licenseNumber: body.licenseNumber }),
                ...(body.licenseExpiry && { licenseExpiry: new Date(body.licenseExpiry) }),
                ...(body.licenseCategory && { licenseCategory: body.licenseCategory }),
                ...(body.status && { status: body.status }),
                ...(body.safetyScore !== undefined && { safetyScore: parseFloat(body.safetyScore) }),
                ...(body.complaints !== undefined && { complaints: parseInt(body.complaints) }),
            },
        });

        return NextResponse.json({ driver });
    } catch (error) {
        console.error("Driver PUT error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const activeTrips = await prisma.trip.findFirst({
            where: { driverId: id, status: { in: ["DISPATCHED", "DRAFT"] } },
        });

        if (activeTrips) {
            return NextResponse.json({ error: "Cannot delete driver with active trips" }, { status: 400 });
        }

        await prisma.driver.delete({ where: { id } });
        return NextResponse.json({ message: "Driver deleted" });
    } catch (error) {
        console.error("Driver DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
