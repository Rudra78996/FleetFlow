"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, AlertTriangle, TrendingUp, Package, Users, Route } from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface DashboardData {
    kpi: {
        activeFleet: number;
        maintenanceAlerts: number;
        utilizationRate: number;
        pendingCargo: number;
        totalVehicles: number;
        availableVehicles: number;
        totalDrivers: number;
        availableDrivers: number;
        totalTrips: number;
        completedTrips: number;
        dispatchedTrips: number;
    };
    fleetByType: { name: string; value: number }[];
    fleetByStatus: { name: string; value: number }[];
    monthlyCosts: { month: string; cost: number }[];
    tripTrend: { month: string; completed: number; total: number }[];
    recentTrips: {
        id: string;
        origin: string;
        destination: string;
        status: string;
        vehicle: { name: string };
        driver: { name: string };
        createdAt: string;
    }[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const statusColors: Record<string, string> = {
    AVAILABLE: "#10b981",
    ON_TRIP: "#3b82f6",
    IN_SHOP: "#ef4444",
    RETIRED: "#64748b",
};

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
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 bg-slate-800/50 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 bg-slate-800/50 rounded-2xl" />
                    <Skeleton className="h-80 bg-slate-800/50 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const kpiCards = [
        {
            title: "Active Fleet",
            value: data.kpi.activeFleet,
            subtitle: `of ${data.kpi.totalVehicles} vehicles`,
            icon: Truck,
            gradient: "from-emerald-500 to-emerald-600",
            bgGlow: "shadow-emerald-500/20",
        },
        {
            title: "Maintenance Alerts",
            value: data.kpi.maintenanceAlerts,
            subtitle: "vehicles in shop",
            icon: AlertTriangle,
            gradient: "from-red-500 to-red-600",
            bgGlow: "shadow-red-500/20",
        },
        {
            title: "Utilization Rate",
            value: `${data.kpi.utilizationRate}%`,
            subtitle: "fleet utilization",
            icon: TrendingUp,
            gradient: "from-blue-500 to-blue-600",
            bgGlow: "shadow-blue-500/20",
        },
        {
            title: "Pending Cargo",
            value: data.kpi.pendingCargo,
            subtitle: "draft trips waiting",
            icon: Package,
            gradient: "from-amber-500 to-amber-600",
            bgGlow: "shadow-amber-500/20",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Command Center</h1>
                <p className="text-slate-400 text-sm mt-1">Real-time fleet overview and operations</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, i) => (
                    <Card key={i} className="bg-slate-900/80 border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">{kpi.title}</p>
                                    <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
                                    <p className="text-xs text-slate-500 mt-1">{kpi.subtitle}</p>
                                </div>
                                <div className={`w-11 h-11 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-lg ${kpi.bgGlow}`}>
                                    <kpi.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-400">Available Drivers</span>
                    </div>
                    <p className="text-xl font-bold text-white">{data.kpi.availableDrivers}<span className="text-sm text-slate-500 font-normal">/{data.kpi.totalDrivers}</span></p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-400">Available Vehicles</span>
                    </div>
                    <p className="text-xl font-bold text-white">{data.kpi.availableVehicles}<span className="text-sm text-slate-500 font-normal">/{data.kpi.totalVehicles}</span></p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Route className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-400">Active Trips</span>
                    </div>
                    <p className="text-xl font-bold text-white">{data.kpi.dispatchedTrips}</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-400">Completed Trips</span>
                    </div>
                    <p className="text-xl font-bold text-white">{data.kpi.completedTrips}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fleet Distribution */}
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Fleet Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie data={data.fleetByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="transparent">
                                        {data.fleetByType.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {data.fleetByType.map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm text-slate-400">{item.name}</span>
                                        <span className="text-sm font-semibold text-white ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fleet by Status */}
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Vehicle Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie data={data.fleetByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="transparent">
                                        {data.fleetByStatus.map((entry) => (
                                            <Cell key={entry.name} fill={statusColors[entry.name] || "#64748b"} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {data.fleetByStatus.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[item.name] || "#64748b" }} />
                                        <span className="text-sm text-slate-400">{item.name.replace("_", " ")}</span>
                                        <span className="text-sm font-semibold text-white ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Trip Completion Trend */}
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Trip Completion Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.tripTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                <Legend />
                                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="Completed" />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Total" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Monthly Costs */}
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Monthly Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.monthlyCosts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Cost"]}
                                />
                                <Bar dataKey="cost" fill="url(#costGradient)" radius={[4, 4, 0, 0]} />
                                <defs>
                                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Trips */}
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-white text-base">Recent Trips</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Trip</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Vehicle</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Driver</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentTrips.map((trip) => (
                                    <tr key={trip.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-white">{trip.origin} → {trip.destination}</td>
                                        <td className="py-3 px-4 text-slate-300">{trip.vehicle.name}</td>
                                        <td className="py-3 px-4 text-slate-300">{trip.driver.name}</td>
                                        <td className="py-3 px-4"><StatusBadge status={trip.status} /></td>
                                        <td className="py-3 px-4 text-slate-400">{new Date(trip.createdAt).toLocaleDateString()}</td>
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
