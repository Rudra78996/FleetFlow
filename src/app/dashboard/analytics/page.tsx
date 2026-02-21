"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, FileText, TrendingUp, DollarSign, Fuel } from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface AnalyticsData {
    summary: {
        totalFuelCost: number; totalMaintenanceCost: number; totalRevenue: number;
        totalExpenses: number; fleetROI: number; utilizationRate: number;
    };
    vehicleAnalytics: {
        id: string; name: string; licensePlate: string; type: string; status: string;
        fuelEfficiency: number; roi: number; costPerKm: number;
        totalFuelCost: number; totalMaintenanceCost: number; totalCost: number;
        revenue: number; totalDistance: number; totalLiters: number; acquisitionCost: number;
    }[];
    topCostliest: { name: string; totalCost: number; licensePlate: string }[];
    financialSummary: { month: string; revenue: number; fuelCost: number; maintenance: number; netProfit: number }[];
    efficiencyTrend: { month: string; efficiency: number }[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        api.get("/api/analytics").then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    const exportCSV = () => {
        if (!data) return;
        const headers = "Vehicle,License Plate,Type,Fuel Efficiency (km/L),ROI (%),Cost/km,Total Cost,Revenue\n";
        const rows = data.vehicleAnalytics.map(v =>
            `${v.name},${v.licensePlate},${v.type},${v.fuelEfficiency},${v.roi},${v.costPerKm},${v.totalCost},${v.revenue}`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "fleetflow-analytics.csv"; a.click();
        toast.success("CSV exported");
    };

    const exportPDF = async () => {
        try {
            const { jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");
            if (!data) return;

            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("FleetFlow Analytics Report", 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

            doc.setFontSize(12);
            doc.text("Financial Summary", 14, 42);
            autoTable(doc, {
                startY: 46,
                head: [["Metric", "Value"]],
                body: [
                    ["Total Revenue", `Rs. ${data.summary.totalRevenue.toLocaleString()}`],
                    ["Total Fuel Cost", `Rs. ${data.summary.totalFuelCost.toLocaleString()}`],
                    ["Total Maintenance", `Rs. ${data.summary.totalMaintenanceCost.toLocaleString()}`],
                    ["Fleet ROI", `${data.summary.fleetROI}%`],
                    ["Utilization Rate", `${data.summary.utilizationRate}%`],
                ],
                theme: "grid",
            });

            doc.addPage();
            doc.text("Vehicle Performance", 14, 22);
            autoTable(doc, {
                startY: 26,
                head: [["Vehicle", "Fuel Eff.", "ROI %", "Cost/km", "Revenue"]],
                body: data.vehicleAnalytics.map(v => [
                    v.name, `${v.fuelEfficiency} km/L`, `${v.roi}%`, `Rs. ${v.costPerKm}`, `Rs. ${v.revenue.toLocaleString()}`,
                ]),
                theme: "grid",
            });

            doc.save("fleetflow-report.pdf");
            toast.success("PDF exported");
        } catch {
            toast.error("Failed to export PDF");
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 bg-slate-800/50 rounded-2xl" />)}</div>
            <Skeleton className="h-80 bg-slate-800/50 rounded-2xl" />
        </div>
    );

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Operational Analytics</h1>
                    <p className="text-slate-400 text-sm mt-1">Financial reports and fleet intelligence</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button onClick={exportPDF} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
                        <FileText className="w-4 h-4" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 rounded-2xl">
                    <CardContent className="p-5 text-center">
                        <p className="text-sm text-slate-400">Total Fuel Cost</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">₹{data.summary.totalFuelCost.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 rounded-2xl">
                    <CardContent className="p-5 text-center">
                        <p className="text-sm text-slate-400">Fleet ROI</p>
                        <p className="text-2xl font-bold text-blue-400 mt-1">{data.summary.fleetROI > 0 ? "+" : ""}{data.summary.fleetROI}%</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 rounded-2xl">
                    <CardContent className="p-5 text-center">
                        <p className="text-sm text-slate-400">Utilization Rate</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">{data.summary.utilizationRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fuel Efficiency Trend */}
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-emerald-400" /> Fuel Efficiency Trend (km/L)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.efficiencyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Costliest Vehicles */}
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-400" /> Top 5 Costliest Vehicles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.topCostliest} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Total Cost"]}
                                />
                                <Bar dataKey="totalCost" fill="url(#costBarGradient)" radius={[0, 4, 4, 0]} />
                                <defs>
                                    <linearGradient id="costBarGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#ef4444" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Summary */}
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" /> Financial Summary of Month
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Month</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Revenue</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuel Cost</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Maintenance</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.financialSummary.map(row => (
                                    <tr key={row.month} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-white font-medium">{row.month}</td>
                                        <td className="py-3 px-4 text-emerald-400">₹{row.revenue.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-slate-300">₹{row.fuelCost.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-slate-300">₹{row.maintenance.toLocaleString()}</td>
                                        <td className={`py-3 px-4 font-bold ${row.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            ₹{row.netProfit.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Performance Table */}
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-white text-base">Vehicle Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Vehicle</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuel Eff.</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">ROI</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Cost/km</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Total Cost</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.vehicleAnalytics.map(v => (
                                    <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="text-white font-medium">{v.name}</p>
                                                <p className="text-xs text-slate-500">{v.licensePlate}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">{v.type}</td>
                                        <td className="py-3 px-4 text-slate-300">{v.fuelEfficiency} km/L</td>
                                        <td className={`py-3 px-4 font-semibold ${v.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{v.roi}%</td>
                                        <td className="py-3 px-4 text-slate-300">₹{v.costPerKm}</td>
                                        <td className="py-3 px-4 text-slate-300">₹{v.totalCost.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-emerald-400">₹{v.revenue.toLocaleString()}</td>
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
