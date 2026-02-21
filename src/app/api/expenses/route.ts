import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const expenses = await prisma.expense.findMany({
            include: { vehicle: true, driver: true, trip: true },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({ expenses });
    } catch (error) {
        console.error("Expenses GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { tripId, vehicleId, driverId, category, amount, description, date } = body;

        const expense = await prisma.expense.create({
            data: {
                tripId: tripId || null,
                vehicleId: vehicleId || null,
                driverId: driverId || null,
                category: category || "OTHER",
                amount: parseFloat(amount) || 0,
                description: description || "",
                date: date ? new Date(date) : new Date(),
            },
            include: { vehicle: true, driver: true, trip: true },
        });

        return NextResponse.json({ expense }, { status: 201 });
    } catch (error) {
        console.error("Expense POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
