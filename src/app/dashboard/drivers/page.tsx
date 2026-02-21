"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Search, Pencil, Users, AlertTriangle } from "lucide-react";

interface Driver {
    id: string; name: string; licenseNumber: string; licenseExpiry: string;
    licenseCategory: string; status: string; safetyScore: number;
    completionRate: number; complaints: number;
    _count: { trips: number };
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Driver | null>(null);
    const [form, setForm] = useState({
        name: "", licenseNumber: "", licenseExpiry: "", licenseCategory: "C", status: "AVAILABLE",
        safetyScore: "100", complaints: "0",
    });
    const api = useApi();

    const fetchDrivers = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (statusFilter !== "all") params.set("status", statusFilter);
            const data = await api.get(`/api/drivers?${params}`);
            setDrivers(data.drivers);
        } catch { toast.error("Failed to fetch drivers"); }
        finally { setLoading(false); }
    }, [search, statusFilter]);

    useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/api/drivers/${editing.id}`, form);
                toast.success("Driver updated");
            } else {
                await api.post("/api/drivers", form);
                toast.success("Driver added");
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            fetchDrivers();
        } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to save driver"); }
    };

    const handleEdit = (driver: Driver) => {
        setEditing(driver);
        setForm({
            name: driver.name, licenseNumber: driver.licenseNumber,
            licenseExpiry: new Date(driver.licenseExpiry).toISOString().split("T")[0],
            licenseCategory: driver.licenseCategory, status: driver.status,
            safetyScore: String(driver.safetyScore), complaints: String(driver.complaints),
        });
        setDialogOpen(true);
    };

    const resetForm = () => setForm({ name: "", licenseNumber: "", licenseExpiry: "", licenseCategory: "C", status: "AVAILABLE", safetyScore: "100", complaints: "0" });

    const isLicenseExpired = (expiry: string) => new Date(expiry) < new Date();
    const isLicenseExpiringSoon = (expiry: string) => {
        const d = new Date(expiry);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
    };

    if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-slate-800/50 rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Driver Performance & Safety</h1>
                    <p className="text-slate-400 text-sm mt-1">Monitor driver compliance and performance</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); resetForm(); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4 mr-2" /> Add Driver
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
                        <DialogHeader><DialogTitle>{editing ? "Edit Driver" : "Add New Driver"}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Full Name</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                    className="bg-slate-800/50 border-slate-700 text-white" placeholder="James Wilson" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">License Number</Label>
                                    <Input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} required
                                        className="bg-slate-800/50 border-slate-700 text-white" placeholder="DL-25001" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">License Expiry</Label>
                                    <Input type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} required
                                        className="bg-slate-800/50 border-slate-700 text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">License Category</Label>
                                    <Select value={form.licenseCategory} onValueChange={v => setForm({ ...form, licenseCategory: v })}>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="A">A - Motorcycle</SelectItem>
                                            <SelectItem value="B">B - Light Vehicle</SelectItem>
                                            <SelectItem value="C">C - Heavy Vehicle</SelectItem>
                                            <SelectItem value="D">D - Articulated</SelectItem>
                                            <SelectItem value="E">E - Special</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Status</Label>
                                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="AVAILABLE">Available</SelectItem>
                                            <SelectItem value="ON_DUTY">On Duty</SelectItem>
                                            <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600">{editing ? "Update" : "Add Driver"}</Button>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Compliance Alerts */}
            {drivers.filter(d => isLicenseExpired(d.licenseExpiry) || d.status === "SUSPENDED").length > 0 && (
                <Card className="bg-red-500/10 border-red-500/20 rounded-2xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <h3 className="text-sm font-medium text-red-400">Compliance Alerts</h3>
                        </div>
                        <div className="space-y-1">
                            {drivers.filter(d => isLicenseExpired(d.licenseExpiry)).map(d => (
                                <p key={d.id} className="text-xs text-red-300">⚠ {d.name} — License expired on {new Date(d.licenseExpiry).toLocaleDateString()}</p>
                            ))}
                            {drivers.filter(d => d.status === "SUSPENDED").map(d => (
                                <p key={d.id} className="text-xs text-red-300">🚫 {d.name} — Currently suspended ({d.complaints} complaints)</p>
                            ))}
                            {drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry) && !isLicenseExpired(d.licenseExpiry)).map(d => (
                                <p key={d.id} className="text-xs text-amber-300">⏰ {d.name} — License expires {new Date(d.licenseExpiry).toLocaleDateString()}</p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers..."
                                className="pl-10 bg-slate-800/50 border-slate-700 text-white" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="ON_DUTY">On Duty</SelectItem>
                                <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Driver Table */}
            <Card className="bg-slate-900/80 border-slate-800 rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">License#</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Expiry</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Completion Rate</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Safety Score</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Complaints</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map(driver => (
                                    <tr key={driver.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-white font-medium">{driver.name}</td>
                                        <td className="py-3 px-4 text-slate-300 font-mono text-xs">{driver.licenseNumber}</td>
                                        <td className="py-3 px-4">
                                            <span className={isLicenseExpired(driver.licenseExpiry) ? "text-red-400" : isLicenseExpiringSoon(driver.licenseExpiry) ? "text-amber-400" : "text-slate-300"}>
                                                {new Date(driver.licenseExpiry).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">{driver.completionRate}%</td>
                                        <td className="py-3 px-4">
                                            <span className={`font-semibold ${driver.safetyScore >= 90 ? "text-emerald-400" : driver.safetyScore >= 70 ? "text-amber-400" : "text-red-400"}`}>
                                                {driver.safetyScore}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">{driver.complaints}</td>
                                        <td className="py-3 px-4"><StatusBadge status={driver.status} /></td>
                                        <td className="py-3 px-4">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(driver)}
                                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {drivers.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No drivers found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
