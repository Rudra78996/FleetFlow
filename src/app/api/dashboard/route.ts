import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // KPI metrics
        const [
            totalVehicles,
            activeFleet,
            inShopCount,
            availableCount,
            retiredCount,
            totalDrivers,
            availableDrivers,
            onDutyDrivers,
            totalTrips,
            draftTrips,
            dispatchedTrips,
            completedTrips,
            vehicles,
            recentTrips,
            monthlyExpenses,
            fuelLogs,
        ] = await Promise.all([
            prisma.vehicle.count(),
            prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
            prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
            prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
            prisma.vehicle.count({ where: { status: "RETIRED" } }),
            prisma.driver.count(),
            prisma.driver.count({ where: { status: "AVAILABLE" } }),
            prisma.driver.count({ where: { status: "ON_DUTY" } }),
            prisma.trip.count(),
            prisma.trip.count({ where: { status: "DRAFT" } }),
            prisma.trip.count({ where: { status: "DISPATCHED" } }),
            prisma.trip.count({ where: { status: "COMPLETED" } }),
            prisma.vehicle.findMany({ select: { type: true, status: true } }),
            prisma.trip.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: { vehicle: true, driver: true },
            }),
            prisma.expense.findMany({
                where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } },
                select: { amount: true, date: true, category: true },
            }),
            prisma.fuelLog.findMany({
                select: { cost: true, liters: true, distance: true, date: true },
            }),
        ]);

        const operationalVehicles = totalVehicles - retiredCount;
        const utilizationRate = operationalVehicles > 0
            ? Math.round(((activeFleet + dispatchedTrips) / operationalVehicles) * 100)
            : 0;

        // Fleet distribution by type
        const fleetByType = vehicles.reduce((acc: Record<string, number>, v) => {
            acc[v.type] = (acc[v.type] || 0) + 1;
            return acc;
        }, {});

        // Fleet distribution by status
        const fleetByStatus = vehicles.reduce((acc: Record<string, number>, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        }, {});

        // Monthly cost data (last 6 months)
        const monthlyCosts: Record<string, number> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        monthlyExpenses.forEach((e) => {
            const month = monthNames[new Date(e.date).getMonth()];
            monthlyCosts[month] = (monthlyCosts[month] || 0) + e.amount;
        });

        // Trip completion trend (last 6 months)
        const allTrips = await prisma.trip.findMany({
            where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } },
            select: { status: true, createdAt: true },
        });

        const tripTrend: Record<string, { completed: number; total: number }> = {};
        allTrips.forEach((t) => {
            const month = monthNames[new Date(t.createdAt).getMonth()];
            if (!tripTrend[month]) tripTrend[month] = { completed: 0, total: 0 };
            tripTrend[month].total++;
            if (t.status === "COMPLETED") tripTrend[month].completed++;
        });

        return NextResponse.json({
            kpi: {
                activeFleet,
                maintenanceAlerts: inShopCount,
                utilizationRate,
                pendingCargo: draftTrips,
                totalVehicles,
                availableVehicles: availableCount,
                totalDrivers,
                availableDrivers,
                onDutyDrivers,
                totalTrips,
                completedTrips,
                dispatchedTrips,
            },
            fleetByType: Object.entries(fleetByType).map(([name, value]) => ({ name, value })),
            fleetByStatus: Object.entries(fleetByStatus).map(([name, value]) => ({ name, value })),
            monthlyCosts: Object.entries(monthlyCosts).map(([month, cost]) => ({ month, cost })),
            tripTrend: Object.entries(tripTrend).map(([month, data]) => ({ month, ...data })),
            recentTrips,
        });
    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
