"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Wrench } from "lucide-react";

interface MaintenanceLog {
    id: string; vehicleId: string; serviceType: string; cost: number;
    date: string; notes: string; status: string;
    vehicle: { id: string; name: string; licensePlate: string };
}

interface Vehicle { id: string; name: string; licensePlate: string; status: string }

export default function MaintenancePage() {
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ vehicleId: "", serviceType: "", cost: "", date: "", notes: "" });
    const api = useApi();

    const fetchData = useCallback(async () => {
        try {
            const [logsRes, vehiclesRes] = await Promise.all([
                api.get("/api/maintenance"), api.get("/api/vehicles"),
            ]);
            setLogs(logsRes.logs);
            setVehicles(vehiclesRes.vehicles);
        } catch { toast.error("Failed to fetch data"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/api/maintenance", form);
            toast.success("Service log created — Vehicle set to In Shop");
            setDialogOpen(false);
            setForm({ vehicleId: "", serviceType: "", cost: "", date: "", notes: "" });
            fetchData();
        } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to create service log"); }
    };

    if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-slate-800/50 rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Maintenance & Service Logs</h1>
                    <p className="text-slate-400 text-sm mt-1">Track vehicle maintenance and repairs</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4 mr-2" /> Create New Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
                        <DialogHeader><DialogTitle>New Service Entry</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Vehicle Name</Label>
                                <Select value={form.vehicleId} onValueChange={v => setForm({ ...form, vehicleId: v })}>
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {vehicles.filter(v => v.status !== "RETIRED").map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Issue/Service</Label>
                                <Input value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}
                                    className="bg-slate-800/50 border-slate-700 text-white" placeholder="Oil Change, Brake Repair..." required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Cost (₹)</Label>
                                    <Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
                                        className="bg-slate-800/50 border-slate-700 text-white" placeholder="5000" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Date</Label>
                                    <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="bg-slate-800/50 border-slate-700 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Notes</Label>
                                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="bg-slate-800/50 border-slate-700 text-white" placeholder="Additional details..." rows={3} />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600">Create</Button>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Log ID</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Vehicle</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name/Service</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Cost</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{log.id.slice(0, 8)}</td>
                                        <td className="py-3 px-4 text-slate-300">{log.vehicle.name}</td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="text-white">{log.serviceType}</p>
                                                {log.notes && <p className="text-xs text-slate-500 mt-0.5">{log.notes}</p>}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-white font-medium">₹{log.cost.toLocaleString()}</td>
                                        <td className="py-3 px-4"><StatusBadge status={log.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No maintenance logs</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
