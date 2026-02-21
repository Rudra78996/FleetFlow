import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");

        const where: Record<string, unknown> = {};
        if (type) where.type = type;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { model: { contains: search } },
                { licensePlate: { contains: search } },
            ];
        }

        const [vehicles, total] = await Promise.all([
            prisma.vehicle.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.vehicle.count({ where }),
        ]);

        return NextResponse.json({ vehicles, total, page, limit });
    } catch (error) {
        console.error("Vehicles GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { name, model, licensePlate, type, maxCapacity, odometer, acquisitionCost, region } = body;

        if (!name || !licensePlate) {
            return NextResponse.json({ error: "Name and license plate are required" }, { status: 400 });
        }

        const existing = await prisma.vehicle.findUnique({ where: { licensePlate } });
        if (existing) {
            return NextResponse.json({ error: "License plate already registered" }, { status: 409 });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                name,
                model: model || "",
                licensePlate,
                type: type || "TRUCK",
                maxCapacity: parseFloat(maxCapacity) || 0,
                odometer: parseFloat(odometer) || 0,
                initialOdometer: parseFloat(odometer) || 0,
                acquisitionCost: parseFloat(acquisitionCost) || 0,
                status: "AVAILABLE",
                region: region || "Default",
            },
        });

        return NextResponse.json({ vehicle }, { status: 201 });
    } catch (error) {
        console.error("Vehicle POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
