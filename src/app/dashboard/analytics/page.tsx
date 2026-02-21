"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Fuel, ArrowUpRight, ArrowDownRight, Percent, Gauge } from "lucide-react";
import {
    ChartContainer, ChartTooltip, ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid,
} from "recharts";

interface AnalyticsData {
    summary: { totalFuelCost: number; totalMaintenanceCost: number; totalRevenue: number; totalExpenses: number; fleetROI: number; utilizationRate: number };
    vehicleAnalytics: { id: string; name: string; licensePlate: string; type: string; status: string; fuelEfficiency: number; roi: number; costPerKm: number; totalFuelCost: number; totalMaintenanceCost: number; totalCost: number; revenue: number; totalDistance: number; totalLiters: number; acquisitionCost: number }[];
    topCostliest: { name: string; totalCost: number; licensePlate: string }[];
    financialSummary: { month: string; revenue: number; fuelCost: number; maintenance: number; netProfit: number }[];
    efficiencyTrend: { month: string; efficiency: number }[];
}

const efficiencyConfig = {
    efficiency: { label: "Fuel Efficiency (km/L)", theme: { light: "#2563eb", dark: "#3b82f6" } },
} satisfies ChartConfig;

const costliestConfig = {
    totalCost: { label: "Total Cost", theme: { light: "#3b82f6", dark: "#60a5fa" } },
} satisfies ChartConfig;

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const api = useApi();

    useEffect(() => { api.get("/api/analytics").then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

    const exportCSV = () => {
        if (!data) return;
        const headers = "Vehicle,License Plate,Type,Fuel Efficiency (km/L),ROI (%),Cost/km,Total Cost,Revenue\n";
        const rows = data.vehicleAnalytics.map(v => `${v.name},${v.licensePlate},${v.type},${v.fuelEfficiency},${v.roi},${v.costPerKm},${v.totalCost},${v.revenue}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "fleetflow-analytics.csv"; a.click(); toast.success("CSV exported");
    };

    const exportPDF = async () => {
        try {
            const { jsPDF } = await import("jspdf"); const { default: autoTable } = await import("jspdf-autotable");
            if (!data) return;
            const doc = new jsPDF(); doc.setFontSize(18); doc.text("FleetFlow Analytics Report", 14, 22); doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.setFontSize(12); doc.text("Financial Summary", 14, 42);
            autoTable(doc, { startY: 46, head: [["Metric", "Value"]], body: [["Total Revenue", `Rs. ${data.summary.totalRevenue.toLocaleString()}`], ["Total Fuel Cost", `Rs. ${data.summary.totalFuelCost.toLocaleString()}`], ["Total Maintenance", `Rs. ${data.summary.totalMaintenanceCost.toLocaleString()}`], ["Fleet ROI", `${data.summary.fleetROI}%`], ["Utilization Rate", `${data.summary.utilizationRate}%`]], theme: "grid" });
            doc.addPage(); doc.text("Vehicle Performance", 14, 22);
            autoTable(doc, { startY: 26, head: [["Vehicle", "Fuel Eff.", "ROI %", "Cost/km", "Revenue"]], body: data.vehicleAnalytics.map(v => [v.name, `${v.fuelEfficiency} km/L`, `${v.roi}%`, `Rs. ${v.costPerKm}`, `Rs. ${v.revenue.toLocaleString()}`]), theme: "grid" });
            doc.save("fleetflow-report.pdf"); toast.success("PDF exported");
        } catch { toast.error("Failed to export PDF"); }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 bg-muted rounded-2xl" />)}
            </div>
            <Skeleton className="h-80 bg-muted rounded-2xl" />
        </div>
    );
    if (!data) return null;

    // Compute trends from financialSummary (compare last 2 months)
    const months = data.financialSummary;
    const latest = months[0];
    const previous = months[1];
    const revenueTrend = previous && latest ? ((latest.revenue - previous.revenue) / (previous.revenue || 1) * 100) : 0;
    const fuelTrend = previous && latest ? ((latest.fuelCost - previous.fuelCost) / (previous.fuelCost || 1) * 100) : 0;
    const maintenanceTrend = previous && latest ? ((latest.maintenance - previous.maintenance) / (previous.maintenance || 1) * 100) : 0;
    const profitTrend = previous && latest ? ((latest.netProfit - previous.netProfit) / (previous.netProfit || 1) * 100) : 0;

    const bentoCards = [
        {
            title: "Total Revenue",
            value: `₹${data.summary.totalRevenue.toLocaleString()}`,
            trend: revenueTrend,
            icon: DollarSign,
            span: "col-span-2 md:col-span-1",
        },
        {
            title: "Total Fuel Cost",
            value: `₹${data.summary.totalFuelCost.toLocaleString()}`,
            trend: fuelTrend,
            icon: Fuel,
            span: "col-span-2 md:col-span-1",
        },
        {
            title: "Maintenance Cost",
            value: `₹${data.summary.totalMaintenanceCost.toLocaleString()}`,
            trend: maintenanceTrend,
            icon: DollarSign,
            span: "col-span-2 md:col-span-1",
        },
        {
            title: "Net Profit",
            value: `₹${(data.summary.totalRevenue - data.summary.totalExpenses).toLocaleString()}`,
            trend: profitTrend,
            icon: TrendingUp,
            span: "col-span-2 md:col-span-1",
        },
        {
            title: "Fleet ROI",
            value: `${data.summary.fleetROI > 0 ? "+" : ""}${data.summary.fleetROI}%`,
            trend: data.summary.fleetROI,
            icon: Percent,
            span: "col-span-1",
        },
        {
            title: "Utilization Rate",
            value: `${data.summary.utilizationRate}%`,
            trend: data.summary.utilizationRate > 50 ? 10 : -5,
            icon: Gauge,
            span: "col-span-1",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Operational Analytics</h1>
                    <p className="text-muted-foreground text-sm mt-1">Financial reports and fleet intelligence</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline" className="gap-2"><Download className="w-4 h-4" /> CSV</Button>
                    <Button onClick={exportPDF} variant="outline" className="gap-2"><FileText className="w-4 h-4" /> PDF</Button>
                </div>
            </div>

            {/* Bento Grid — KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bentoCards.map((card, i) => {
                    const isPositive = card.trend >= 0;
                    // For costs, positive trend (increase) is bad; for revenue/profit/ROI/utilization it's good
                    const isCost = card.title.includes("Cost") || card.title.includes("Maintenance");
                    const isGoodTrend = isCost ? !isPositive : isPositive;

                    return (
                        <Card key={i} className={`${card.span} rounded-2xl overflow-hidden relative group hover:border-foreground/20 transition-all duration-300`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <card.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isGoodTrend
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        }`}>
                                        {isPositive
                                            ? <ArrowUpRight className="w-3 h-3" />
                                            : <ArrowDownRight className="w-3 h-3" />
                                        }
                                        {Math.abs(Math.round(card.trend))}%
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fuel Efficiency Trend */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Fuel className="w-4 h-4" /> Fuel Efficiency Trend</CardTitle>
                        <CardDescription>Average km/L over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={efficiencyConfig} className="min-h-[250px] w-full">
                            <LineChart accessibilityLayer data={data.efficiencyTrend}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => v.slice(0, 3)} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="efficiency" stroke="var(--color-efficiency)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-efficiency)" }} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Top Costliest Vehicles */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4" /> Top 5 Costliest Vehicles</CardTitle>
                        <CardDescription>Highest operational expenditure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={costliestConfig} className="min-h-[250px] w-full">
                            <BarChart accessibilityLayer data={data.topCostliest} layout="vertical" barCategoryGap="20%">
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₹${Number(value).toLocaleString()}`} />} />
                                <Bar dataKey="totalCost" fill="var(--color-totalCost)" radius={[0, 6, 6, 0]} style={{ filter: "none" }} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Summary */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Financial Summary</CardTitle>
                    <CardDescription>Monthly revenue, costs, and profit</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border"><th className="text-left py-3 px-4 text-muted-foreground font-medium">Month</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Revenue</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Fuel Cost</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Maintenance</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Net Profit</th></tr></thead>
                            <tbody>
                                {data.financialSummary.map(row => (
                                    <tr key={row.month} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="py-3 px-4 text-foreground font-medium">{row.month}</td>
                                        <td className="py-3 px-4 text-foreground">₹{row.revenue.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-muted-foreground">₹{row.fuelCost.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-muted-foreground">₹{row.maintenance.toLocaleString()}</td>
                                        <td className="py-3 px-4 font-bold text-foreground">₹{row.netProfit.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Performance */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base">Vehicle Performance Analytics</CardTitle>
                    <CardDescription>Per-vehicle cost and revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border"><th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Fuel Eff.</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">ROI</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Cost/km</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Total Cost</th><th className="text-left py-3 px-4 text-muted-foreground font-medium">Revenue</th></tr></thead>
                            <tbody>
                                {data.vehicleAnalytics.map(v => (
                                    <tr key={v.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="py-3 px-4"><p className="text-foreground font-medium">{v.name}</p><p className="text-xs text-muted-foreground">{v.licensePlate}</p></td>
                                        <td className="py-3 px-4 text-muted-foreground">{v.type}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{v.fuelEfficiency} km/L</td>
                                        <td className="py-3 px-4 font-semibold text-foreground">{v.roi}%</td>
                                        <td className="py-3 px-4 text-muted-foreground">₹{v.costPerKm}</td>
                                        <td className="py-3 px-4 text-muted-foreground">₹{v.totalCost.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-foreground">₹{v.revenue.toLocaleString()}</td>
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
