import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [vehicles, fuelLogs, expenses, maintenanceLogs, trips] = await Promise.all([
            prisma.vehicle.findMany(),
            prisma.fuelLog.findMany({ include: { vehicle: true } }),
            prisma.expense.findMany({ include: { vehicle: true } }),
            prisma.maintenanceLog.findMany({ include: { vehicle: true } }),
            prisma.trip.findMany({ where: { status: "COMPLETED" }, include: { vehicle: true } }),
        ]);

        // Total fuel cost
        const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);

        // Total maintenance cost
        const totalMaintenanceCost = maintenanceLogs.reduce((sum, l) => sum + l.cost, 0);

        // Total revenue
        const totalRevenue = trips.reduce((sum, t) => sum + t.revenue, 0);

        // Fuel efficiency per vehicle
        const vehicleFuelData = vehicles.map((v) => {
            const vFuel = fuelLogs.filter((f) => f.vehicleId === v.id);
            const vMaint = maintenanceLogs.filter((m) => m.vehicleId === v.id);
            const vTrips = trips.filter((t) => t.vehicleId === v.id);
            const totalLiters = vFuel.reduce((sum, f) => sum + f.liters, 0);
            const totalDistance = vFuel.reduce((sum, f) => sum + f.distance, 0);
            const fuelCost = vFuel.reduce((sum, f) => sum + f.cost, 0);
            const maintCost = vMaint.reduce((sum, m) => sum + m.cost, 0);
            const revenue = vTrips.reduce((sum, t) => sum + t.revenue, 0);
            const fuelEfficiency = totalLiters > 0 ? Math.round((totalDistance / totalLiters) * 100) / 100 : 0;
            const roi = v.acquisitionCost > 0
                ? Math.round(((revenue - (fuelCost + maintCost)) / v.acquisitionCost) * 100 * 100) / 100
                : 0;
            const costPerKm = totalDistance > 0 ? Math.round(((fuelCost + maintCost) / totalDistance) * 100) / 100 : 0;

            return {
                id: v.id,
                name: v.name,
                licensePlate: v.licensePlate,
                type: v.type,
                status: v.status,
                fuelEfficiency,
                roi,
                costPerKm,
                totalFuelCost: fuelCost,
                totalMaintenanceCost: maintCost,
                totalCost: fuelCost + maintCost,
                revenue,
                totalDistance,
                totalLiters,
                acquisitionCost: v.acquisitionCost,
            };
        });

        // Monthly financial summary
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData: Record<string, { revenue: number; fuelCost: number; maintenance: number }> = {};

        trips.forEach((t) => {
            if (t.completedAt) {
                const month = monthNames[new Date(t.completedAt).getMonth()];
                if (!monthlyData[month]) monthlyData[month] = { revenue: 0, fuelCost: 0, maintenance: 0 };
                monthlyData[month].revenue += t.revenue;
                monthlyData[month].fuelCost += t.actualFuelCost;
            }
        });

        maintenanceLogs.forEach((m) => {
            const month = monthNames[new Date(m.date).getMonth()];
            if (!monthlyData[month]) monthlyData[month] = { revenue: 0, fuelCost: 0, maintenance: 0 };
            monthlyData[month].maintenance += m.cost;
        });

        const financialSummary = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            ...data,
            netProfit: data.revenue - data.fuelCost - data.maintenance,
        }));

        // Fuel efficiency trend
        const fuelEfficiencyTrend = fuelLogs.reduce((acc: Record<string, { liters: number; distance: number }>, f) => {
            const month = monthNames[new Date(f.date).getMonth()];
            if (!acc[month]) acc[month] = { liters: 0, distance: 0 };
            acc[month].liters += f.liters;
            acc[month].distance += f.distance;
            return acc;
        }, {});

        const efficiencyTrend = Object.entries(fuelEfficiencyTrend).map(([month, data]) => ({
            month,
            efficiency: data.liters > 0 ? Math.round((data.distance / data.liters) * 100) / 100 : 0,
        }));

        // Utilization rate
        const operationalVehicles = vehicles.filter((v) => v.status !== "RETIRED").length;
        const activeVehicles = vehicles.filter((v) => v.status === "ON_TRIP").length;
        const utilizationRate = operationalVehicles > 0 ? Math.round((activeVehicles / operationalVehicles) * 100) : 0;

        // Top 5 costliest vehicles
        const topCostliest = [...vehicleFuelData].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

        // Fleet ROI
        const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
        const totalExpenses = totalFuelCost + totalMaintenanceCost;
        const fleetROI = totalAcquisitionCost > 0
            ? Math.round(((totalRevenue - totalExpenses) / totalAcquisitionCost) * 100 * 100) / 100
            : 0;

        return NextResponse.json({
            summary: {
                totalFuelCost,
                totalMaintenanceCost,
                totalRevenue,
                totalExpenses,
                fleetROI,
                utilizationRate,
            },
            vehicleAnalytics: vehicleFuelData,
            topCostliest,
            financialSummary,
            efficiencyTrend,
        });
    } catch (error) {
        console.error("Analytics GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
