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
import { Plus, Search, Play, CheckCircle, XCircle, Route } from "lucide-react";

interface Trip {
    id: string; vehicleId: string; driverId: string; origin: string; destination: string;
    cargoWeight: number; estimatedFuelCost: number; actualFuelCost: number; distance: number;
    revenue: number; status: string; createdAt: string;
    vehicle: { id: string; name: string; licensePlate: string; maxCapacity: number };
    driver: { id: string; name: string };
}
interface Vehicle { id: string; name: string; licensePlate: string; maxCapacity: number; status: string }
interface Driver { id: string; name: string; licenseNumber: string; status: string; licenseExpiry: string }

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [form, setForm] = useState({ vehicleId: "", driverId: "", origin: "", destination: "", cargoWeight: "", estimatedFuelCost: "", revenue: "" });
    const [completeForm, setCompleteForm] = useState({ finalOdometer: "", distance: "", actualFuelCost: "" });
    const api = useApi();

    const fetchAll = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (statusFilter !== "all") params.set("status", statusFilter);
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                api.get(`/api/trips?${params}`), api.get("/api/vehicles"), api.get("/api/drivers"),
            ]);
            setTrips(tripsRes.trips); setVehicles(vehiclesRes.vehicles); setDrivers(driversRes.drivers);
        } catch { toast.error("Failed to fetch data"); }
        finally { setLoading(false); }
    }, [search, statusFilter]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/api/trips", form);
            toast.success("Trip created (Draft)");
            setDialogOpen(false);
            setForm({ vehicleId: "", driverId: "", origin: "", destination: "", cargoWeight: "", estimatedFuelCost: "", revenue: "" });
            fetchAll();
        } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to create trip"); }
    };

    const handleAction = async (tripId: string, action: string, data?: Record<string, unknown>) => {
        try {
            await api.put(`/api/trips/${tripId}`, { action, ...data });
            toast.success(`Trip ${action}ed successfully`);
            if (action === "complete") setCompleteDialogOpen(false);
            fetchAll();
        } catch (err: unknown) { toast.error(err instanceof Error ? err.message : `Failed to ${action} trip`); }
    };

    const availableVehicles = vehicles.filter(v => v.status === "AVAILABLE");
    const availableDrivers = drivers.filter(d => d.status === "AVAILABLE" && new Date(d.licenseExpiry) > new Date());

    if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-muted rounded-xl" />)}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Trip Dispatcher</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage deliveries and track trip status</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" /> New Trip
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground max-w-lg">
                        <DialogHeader><DialogTitle>New Trip Form</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">Select Vehicle</Label>
                                <Select value={form.vehicleId} onValueChange={v => setForm({ ...form, vehicleId: v })}>
                                    <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue placeholder="Choose a vehicle" /></SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {availableVehicles.map(v => (<SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate}) - {v.maxCapacity}kg</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Cargo Weight (kg)</Label>
                                <Input type="number" value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} className="bg-muted border-border text-foreground" placeholder="15000" required />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Select Driver</Label>
                                <Select value={form.driverId} onValueChange={v => setForm({ ...form, driverId: v })}>
                                    <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue placeholder="Choose a driver" /></SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {availableDrivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Origin</Label>
                                    <Input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className="bg-muted border-border text-foreground" placeholder="Mumbai" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Destination</Label>
                                    <Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="bg-muted border-border text-foreground" placeholder="Pune" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Est. Fuel Cost (₹)</Label>
                                    <Input type="number" value={form.estimatedFuelCost} onChange={e => setForm({ ...form, estimatedFuelCost: e.target.value })} className="bg-muted border-border text-foreground" placeholder="4500" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Revenue (₹)</Label>
                                    <Input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value })} className="bg-muted border-border text-foreground" placeholder="25000" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Confirm & Dispatch Trip</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips..." className="pl-10 bg-muted border-border text-foreground" />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Trip</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fleet Type</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Origin</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Destination</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map(trip => (
                                    <tr key={trip.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="py-3 px-4"><p className="text-foreground font-medium">{trip.vehicle.name}</p><p className="text-xs text-muted-foreground">{trip.driver.name} • {trip.cargoWeight.toLocaleString()}kg</p></td>
                                        <td className="py-3 px-4 text-muted-foreground">{trip.vehicle.licensePlate}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{trip.origin}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{trip.destination}</td>
                                        <td className="py-3 px-4"><StatusBadge status={trip.status} /></td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                {trip.status === "DRAFT" && (<Button variant="ghost" size="sm" onClick={() => handleAction(trip.id, "dispatch")} className="text-foreground hover:bg-accent text-xs gap-1"><Play className="w-3 h-3" /> Dispatch</Button>)}
                                                {trip.status === "DISPATCHED" && (<Button variant="ghost" size="sm" onClick={() => { setSelectedTrip(trip); setCompleteDialogOpen(true); }} className="text-foreground hover:bg-accent text-xs gap-1"><CheckCircle className="w-3 h-3" /> Complete</Button>)}
                                                {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (<Button variant="ghost" size="sm" onClick={() => handleAction(trip.id, "cancel")} className="text-destructive hover:bg-destructive/10 text-xs gap-1"><XCircle className="w-3 h-3" /> Cancel</Button>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {trips.length === 0 && (<div className="text-center py-12 text-muted-foreground"><Route className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No trips found</p></div>)}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                <DialogContent className="bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>Complete Trip</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); if (selectedTrip) handleAction(selectedTrip.id, "complete", completeForm); }} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Final Odometer Reading</Label>
                            <Input type="number" value={completeForm.finalOdometer} onChange={e => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} className="bg-muted border-border text-foreground" placeholder="km" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">Distance (km)</Label>
                                <Input type="number" value={completeForm.distance} onChange={e => setCompleteForm({ ...completeForm, distance: e.target.value })} className="bg-muted border-border text-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Actual Fuel Cost (₹)</Label>
                                <Input type="number" value={completeForm.actualFuelCost} onChange={e => setCompleteForm({ ...completeForm, actualFuelCost: e.target.value })} className="bg-muted border-border text-foreground" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Complete Trip</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
