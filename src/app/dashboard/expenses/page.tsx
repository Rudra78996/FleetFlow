"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, DollarSign } from "lucide-react";

interface Expense {
    id: string; tripId: string | null; vehicleId: string | null; driverId: string | null;
    category: string; amount: number; description: string; date: string;
    vehicle: { name: string; licensePlate: string } | null;
    driver: { name: string } | null;
    trip: { origin: string; destination: string } | null;
}

interface Trip { id: string; origin: string; destination: string; status: string; vehicle: { name: string } }
interface Vehicle { id: string; name: string; licensePlate: string }

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ tripId: "", vehicleId: "", category: "FUEL", amount: "", description: "", date: "" });
    const api = useApi();

    const fetchData = useCallback(async () => {
        try {
            const [expRes, tripRes, vehRes] = await Promise.all([
                api.get("/api/expenses"), api.get("/api/trips"), api.get("/api/vehicles"),
            ]);
            setExpenses(expRes.expenses);
            setTrips(tripRes.trips);
            setVehicles(vehRes.vehicles);
        } catch { toast.error("Failed to fetch data"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/api/expenses", form);
            toast.success("Expense recorded");
            setDialogOpen(false);
            setForm({ tripId: "", vehicleId: "", category: "FUEL", amount: "", description: "", date: "" });
            fetchData();
        } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to add expense"); }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fuelExpenses = expenses.filter(e => e.category === "FUEL").reduce((sum, e) => sum + e.amount, 0);
    const maintenanceExpenses = expenses.filter(e => e.category === "MAINTENANCE").reduce((sum, e) => sum + e.amount, 0);

    const categoryColors: Record<string, string> = {
        FUEL: "text-blue-400", MAINTENANCE: "text-amber-400", TOLL: "text-purple-400", OTHER: "text-slate-400",
    };

    if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-slate-800/50 rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Expense & Fuel Logging</h1>
                    <p className="text-slate-400 text-sm mt-1">Track all operational costs</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4 mr-2" /> Add an Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
                        <DialogHeader><DialogTitle>New Expense</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Trip ID (Optional)</Label>
                                <Select value={form.tripId} onValueChange={v => setForm({ ...form, tripId: v })}>
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue placeholder="Select trip" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="none">No Trip</SelectItem>
                                        {trips.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.origin} → {t.destination} ({t.status})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Driver</Label>
                                    <Select value={form.vehicleId} onValueChange={v => setForm({ ...form, vehicleId: v })}>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue placeholder="Vehicle" /></SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Category</Label>
                                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="FUEL">Fuel</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="TOLL">Toll</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Fuel Cost (₹)</Label>
                                    <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                        className="bg-slate-800/50 border-slate-700 text-white" placeholder="5000" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Max Expense (₹)</Label>
                                    <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="bg-slate-800/50 border-slate-700 text-white" placeholder="Description" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600">Confirm</Button>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-400">Total Expenses</p>
                        <p className="text-2xl font-bold text-white mt-1">₹{totalExpenses.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-400">Total Fuel Expense</p>
                        <p className="text-2xl font-bold text-blue-400 mt-1">₹{fuelExpenses.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-400">Maintenance Expense</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">₹{maintenanceExpenses.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expense Table */}
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Trip ID</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Driver</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Km/Liters</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuel Expense</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Max. Expns</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                                            {exp.trip ? `${exp.trip.origin}→${exp.trip.destination}` : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">{exp.driver?.name || exp.vehicle?.name || "—"}</td>
                                        <td className="py-3 px-4 text-slate-300">{exp.description || "—"}</td>
                                        <td className="py-3 px-4 text-white font-medium">₹{exp.amount.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-slate-300">₹{exp.amount.toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-medium ${categoryColors[exp.category] || "text-slate-400"}`}>{exp.category}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {expenses.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No expenses recorded</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
