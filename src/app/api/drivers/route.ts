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
                { name: { contains: search } },
                { licenseNumber: { contains: search } },
            ];
        }

        const drivers = await prisma.driver.findMany({
            where,
            include: { _count: { select: { trips: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ drivers });
    } catch (error) {
        console.error("Drivers GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { name, licenseNumber, licenseExpiry, licenseCategory, status: driverStatus } = body;

        if (!name || !licenseNumber || !licenseExpiry) {
            return NextResponse.json({ error: "Name, license number, and license expiry are required" }, { status: 400 });
        }

        const existing = await prisma.driver.findUnique({ where: { licenseNumber } });
        if (existing) {
            return NextResponse.json({ error: "License number already registered" }, { status: 409 });
        }

        const driver = await prisma.driver.create({
            data: {
                name,
                licenseNumber,
                licenseExpiry: new Date(licenseExpiry),
                licenseCategory: licenseCategory || "C",
                status: driverStatus || "AVAILABLE",
            },
        });

        return NextResponse.json({ driver }, { status: 201 });
    } catch (error) {
        console.error("Driver POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
