"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, AlertTriangle, TrendingUp, Package, Users, Route } from "lucide-react";
import {
    ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    LineChart, Line, CartesianGrid,
} from "recharts";

interface DashboardData {
    kpi: {
        activeFleet: number; maintenanceAlerts: number; utilizationRate: number;
        pendingCargo: number; totalVehicles: number; availableVehicles: number;
        totalDrivers: number; availableDrivers: number; totalTrips: number;
        completedTrips: number; dispatchedTrips: number;
    };
    fleetByType: { name: string; value: number }[];
    fleetByStatus: { name: string; value: number }[];
    monthlyCosts: { month: string; cost: number }[];
    tripTrend: { month: string; completed: number; total: number }[];
    recentTrips: {
        id: string; origin: string; destination: string; status: string;
        vehicle: { name: string }; driver: { name: string }; createdAt: string;
    }[];
}

// --- Chart Configs with dual-theme colors ---

const fleetTypeConfig = {
    TRUCK: { label: "Truck", theme: { light: "#2563eb", dark: "#3b82f6" } },
    VAN: { label: "Van", theme: { light: "#60a5fa", dark: "#60a5fa" } },
    BIKE: { label: "Bike", theme: { light: "#1e40af", dark: "#1e40af" } },
    SEDAN: { label: "Sedan", theme: { light: "#93c5fd", dark: "#93c5fd" } },
    SUV: { label: "SUV", theme: { light: "#3b82f6", dark: "#2563eb" } },
    OTHER: { label: "Other", theme: { light: "#dbeafe", dark: "#1d4ed8" } },
} satisfies ChartConfig;

const fleetStatusConfig = {
    AVAILABLE: { label: "Available", theme: { light: "#2563eb", dark: "#3b82f6" } },
    ON_TRIP: { label: "On Trip", theme: { light: "#60a5fa", dark: "#60a5fa" } },
    IN_SHOP: { label: "In Shop", theme: { light: "#1e40af", dark: "#1e40af" } },
    RETIRED: { label: "Retired", theme: { light: "#93c5fd", dark: "#93c5fd" } },
} satisfies ChartConfig;

const tripTrendConfig = {
    completed: { label: "Completed", theme: { light: "#2563eb", dark: "#3b82f6" } },
    total: { label: "Total", theme: { light: "#93c5fd", dark: "#60a5fa" } },
} satisfies ChartConfig;

const monthlyCostConfig = {
    cost: { label: "Cost", theme: { light: "#2563eb", dark: "#3b82f6" } },
} satisfies ChartConfig;

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        api.get("/api/dashboard").then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 bg-muted rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 bg-muted rounded-2xl" />
                    <Skeleton className="h-80 bg-muted rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const kpiCards = [
        { title: "Active Fleet", value: data.kpi.activeFleet, subtitle: `of ${data.kpi.totalVehicles} vehicles`, icon: Truck },
        { title: "Maintenance Alerts", value: data.kpi.maintenanceAlerts, subtitle: "vehicles in shop", icon: AlertTriangle },
        { title: "Utilization Rate", value: `${data.kpi.utilizationRate}%`, subtitle: "fleet utilization", icon: TrendingUp },
        { title: "Pending Cargo", value: data.kpi.pendingCargo, subtitle: "draft trips waiting", icon: Package },
    ];

    // Map fleet data to use name as key for ChartConfig color lookup
    const fleetTypeData = data.fleetByType.map(item => ({ ...item, fill: `var(--color-${item.name})` }));
    const fleetStatusData = data.fleetByStatus.map(item => ({ ...item, fill: `var(--color-${item.name})` }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
                <p className="text-muted-foreground text-sm mt-1">Real-time fleet overview and operations</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, i) => (
                    <Card key={i} className="rounded-2xl hover:border-foreground/20 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                                    <p className="text-3xl font-bold text-foreground mt-2">{kpi.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                                </div>
                                <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center">
                                    <kpi.icon className="w-5 h-5 text-primary-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Available Drivers", value: data.kpi.availableDrivers, total: data.kpi.totalDrivers, icon: Users },
                    { label: "Available Vehicles", value: data.kpi.availableVehicles, total: data.kpi.totalVehicles, icon: Truck },
                    { label: "Active Trips", value: data.kpi.dispatchedTrips, icon: Route },
                    { label: "Completed Trips", value: data.kpi.completedTrips, icon: TrendingUp },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-xl">
                        <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <stat.icon className="w-4 h-4 text-foreground" />
                                <span className="text-xs text-muted-foreground">{stat.label}</span>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {stat.value}
                                {stat.total && <span className="text-sm text-muted-foreground font-normal">/{stat.total}</span>}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fleet Distribution — Pie */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Fleet Distribution</CardTitle>
                        <CardDescription>Vehicles by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={fleetTypeConfig} className="mx-auto aspect-square max-h-[280px]">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={fleetTypeData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2} stroke="var(--background)">
                                    {fleetTypeData.map((entry) => (
                                        <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 text-xs" />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Vehicle Status — Pie */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Vehicle Status</CardTitle>
                        <CardDescription>Current fleet availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={fleetStatusConfig} className="mx-auto aspect-square max-h-[280px]">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={fleetStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2} stroke="var(--background)">
                                    {fleetStatusData.map((entry) => (
                                        <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 text-xs" />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Trip Completion Trend — Line */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Trip Completion Trend</CardTitle>
                        <CardDescription>Monthly trip completions vs total</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={tripTrendConfig} className="min-h-[250px] w-full">
                            <LineChart accessibilityLayer data={data.tripTrend}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => v.slice(0, 3)} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-completed)" }} />
                                <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-total)" }} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Monthly Costs — Bar */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Monthly Costs</CardTitle>
                        <CardDescription>Operational expenditure by month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={monthlyCostConfig} className="min-h-[250px] w-full">
                            <BarChart accessibilityLayer data={data.monthlyCosts}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => v.slice(0, 3)} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₹${Number(value).toLocaleString()}`} />} />
                                <Bar dataKey="cost" fill="var(--color-cost)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Trips */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">Recent Trips</CardTitle>
                    <CardDescription>Latest dispatched and completed trips</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Trip</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Driver</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentTrips.map((trip) => (
                                    <tr key={trip.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="py-3 px-4 text-foreground">{trip.origin} → {trip.destination}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{trip.vehicle.name}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{trip.driver.name}</td>
                                        <td className="py-3 px-4"><StatusBadge status={trip.status} /></td>
                                        <td className="py-3 px-4 text-muted-foreground">{new Date(trip.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
