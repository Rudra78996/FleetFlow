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
import { Plus, Search, Pencil, Users, AlertTriangle, ShieldAlert, Clock, XCircle, ChevronRight, ChevronDown } from "lucide-react";

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
    const [alertsExpanded, setAlertsExpanded] = useState(false);
    const [form, setForm] = useState({ name: "", licenseNumber: "", licenseExpiry: "", licenseCategory: "C", status: "AVAILABLE", safetyScore: "100", complaints: "0" });
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
            if (editing) { await api.put(`/api/drivers/${editing.id}`, form); toast.success("Driver updated"); }
            else { await api.post("/api/drivers", form); toast.success("Driver added"); }
            setDialogOpen(false); setEditing(null); resetForm(); fetchDrivers();
        } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to save driver"); }
    };

    const handleEdit = (driver: Driver) => {
        setEditing(driver);
        setForm({ name: driver.name, licenseNumber: driver.licenseNumber, licenseExpiry: new Date(driver.licenseExpiry).toISOString().split("T")[0], licenseCategory: driver.licenseCategory, status: driver.status, safetyScore: String(driver.safetyScore), complaints: String(driver.complaints) });
        setDialogOpen(true);
    };

    const resetForm = () => setForm({ name: "", licenseNumber: "", licenseExpiry: "", licenseCategory: "C", status: "AVAILABLE", safetyScore: "100", complaints: "0" });
    const isLicenseExpired = (expiry: string) => new Date(expiry) < new Date();
    const isLicenseExpiringSoon = (expiry: string) => { const d = new Date(expiry); const now = new Date(); const diff = d.getTime() - now.getTime(); return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; };

    if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-muted rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Driver Performance & Safety</h1>
                    <p className="text-muted-foreground text-sm mt-1">Monitor driver compliance and performance</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); resetForm(); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Driver</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground max-w-lg">
                        <DialogHeader><DialogTitle>{editing ? "Edit Driver" : "Add New Driver"}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">Full Name</Label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-muted border-border text-foreground" placeholder="James Wilson" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">License Number</Label>
                                    <Input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} required className="bg-muted border-border text-foreground" placeholder="DL-25001" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">License Expiry</Label>
                                    <Input type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} required className="bg-muted border-border text-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">License Category</Label>
                                    <Select value={form.licenseCategory} onValueChange={v => setForm({ ...form, licenseCategory: v })}>
                                        <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="A">A - Motorcycle</SelectItem><SelectItem value="B">B - Light Vehicle</SelectItem><SelectItem value="C">C - Heavy Vehicle</SelectItem><SelectItem value="D">D - Articulated</SelectItem><SelectItem value="E">E - Special</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Status</Label>
                                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                        <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="AVAILABLE">Available</SelectItem><SelectItem value="ON_DUTY">On Duty</SelectItem><SelectItem value="OFF_DUTY">Off Duty</SelectItem><SelectItem value="SUSPENDED">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">{editing ? "Update" : "Add Driver"}</Button>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-accent">Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {(drivers.filter(d => isLicenseExpired(d.licenseExpiry)).length > 0 || 
              drivers.filter(d => d.status === "SUSPENDED").length > 0 ||
              drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry) && !isLicenseExpired(d.licenseExpiry)).length > 0) && (
                <Card className="bg-card border-border rounded-2xl overflow-hidden">
                    <button 
                        onClick={() => setAlertsExpanded(!alertsExpanded)}
                        className="w-full bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent p-4 hover:from-destructive/15 hover:via-destructive/8 transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-destructive/15 rounded-xl flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-destructive" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-semibold text-foreground">Compliance Alerts</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {drivers.filter(d => isLicenseExpired(d.licenseExpiry) || d.status === "SUSPENDED").length} critical · {drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry) && !isLicenseExpired(d.licenseExpiry)).length} warnings
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground hidden sm:inline">{alertsExpanded ? "Click to collapse" : "Click to expand"}</span>
                                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${alertsExpanded ? "rotate-180" : ""}`} />
                            </div>
                        </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${alertsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <CardContent className="p-0 border-t border-border">
                            <div className="divide-y divide-border">
                            {drivers.filter(d => isLicenseExpired(d.licenseExpiry)).map(d => (
                                <div key={`expired-${d.id}`} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group">
                                    <div className="w-9 h-9 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <XCircle className="w-4 h-4 text-destructive" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-destructive/15 text-destructive rounded-full">Expired</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            License expired on {new Date(d.licenseExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(d)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground">
                                        Update <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            ))}
                            {drivers.filter(d => d.status === "SUSPENDED").map(d => (
                                <div key={`suspended-${d.id}`} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group">
                                    <div className="w-9 h-9 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-4 h-4 text-destructive" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-destructive/15 text-destructive rounded-full">Suspended</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {d.complaints} complaint{d.complaints !== 1 ? "s" : ""} on record
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(d)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground">
                                        Review <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            ))}
                            {drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiry) && !isLicenseExpired(d.licenseExpiry)).map(d => (
                                <div key={`expiring-${d.id}`} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group">
                                    <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full">Expiring Soon</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            License expires {new Date(d.licenseExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(d)} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground">
                                        Update <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            ))}
                            </div>
                        </CardContent>
                    </div>
                </Card>
            )}

            <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers..." className="pl-10 bg-muted border-border text-foreground" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Status</SelectItem><SelectItem value="AVAILABLE">Available</SelectItem><SelectItem value="ON_DUTY">On Duty</SelectItem><SelectItem value="OFF_DUTY">Off Duty</SelectItem><SelectItem value="SUSPENDED">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">License#</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Expiry</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Completion Rate</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Safety Score</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Complaints</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map(driver => (
                                    <tr key={driver.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="py-3 px-4 text-foreground font-medium">{driver.name}</td>
                                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{driver.licenseNumber}</td>
                                        <td className="py-3 px-4"><span className={isLicenseExpired(driver.licenseExpiry) ? "text-destructive" : "text-muted-foreground"}>{new Date(driver.licenseExpiry).toLocaleDateString()}</span></td>
                                        <td className="py-3 px-4 text-muted-foreground">{driver.completionRate}%</td>
                                        <td className="py-3 px-4"><span className="font-semibold text-foreground">{driver.safetyScore}%</span></td>
                                        <td className="py-3 px-4 text-muted-foreground">{driver.complaints}</td>
                                        <td className="py-3 px-4"><StatusBadge status={driver.status} /></td>
                                        <td className="py-3 px-4"><Button variant="ghost" size="icon" onClick={() => handleEdit(driver)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"><Pencil className="w-3.5 h-3.5" /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {drivers.length === 0 && (<div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No drivers found</p></div>)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
