"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";

interface Vehicle {
    id: string;
    name: string;
    model: string;
    licensePlate: string;
    type: string;
    maxCapacity: number;
    odometer: number;
    acquisitionCost: number;
    status: string;
    region: string;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Vehicle | null>(null);
    const [form, setForm] = useState({
        name: "", model: "", licensePlate: "", type: "TRUCK", maxCapacity: "",
        odometer: "", acquisitionCost: "", region: "Default",
    });
    const api = useApi();

    const fetchVehicles = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (typeFilter !== "all") params.set("type", typeFilter);
            if (statusFilter !== "all") params.set("status", statusFilter);
            const data = await api.get(`/api/vehicles?${params}`);
            setVehicles(data.vehicles);
        } catch (err) {
            toast.error("Failed to fetch vehicles");
        } finally {
            setLoading(false);
        }
    }, [search, typeFilter, statusFilter]);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/api/vehicles/${editing.id}`, form);
                toast.success("Vehicle updated successfully");
            } else {
                await api.post("/api/vehicles", form);
                toast.success("Vehicle added successfully");
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            fetchVehicles();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to save vehicle");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await api.del(`/api/vehicles/${id}`);
            toast.success("Vehicle deleted");
            fetchVehicles();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to delete vehicle");
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditing(vehicle);
        setForm({
            name: vehicle.name, model: vehicle.model, licensePlate: vehicle.licensePlate,
            type: vehicle.type, maxCapacity: String(vehicle.maxCapacity),
            odometer: String(vehicle.odometer), acquisitionCost: String(vehicle.acquisitionCost),
            region: vehicle.region,
        });
        setDialogOpen(true);
    };

    const handleToggleStatus = async (vehicle: Vehicle) => {
        try {
            const newStatus = vehicle.status === "AVAILABLE" ? "RETIRED" : "AVAILABLE";
            await api.put(`/api/vehicles/${vehicle.id}`, { status: newStatus });
            toast.success(`Vehicle marked as ${newStatus}`);
            fetchVehicles();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to update status");
        }
    };

    const resetForm = () => {
        setForm({ name: "", model: "", licensePlate: "", type: "TRUCK", maxCapacity: "", odometer: "", acquisitionCost: "", region: "Default" });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-muted" />
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-muted rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Vehicle Registry</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your fleet vehicles</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); resetForm(); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editing ? "Edit Vehicle" : "New Vehicle Registration"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Vehicle Name</Label>
                                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                        className="bg-muted border-border text-foreground" placeholder="Volvo FH16" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Model</Label>
                                    <Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}
                                        className="bg-muted border-border text-foreground" placeholder="FH16 2024" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">License Plate</Label>
                                    <Input value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} required
                                        className="bg-muted border-border text-foreground" placeholder="FL-1001" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Type</Label>
                                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                        <SelectTrigger className="bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="TRUCK">Truck</SelectItem>
                                            <SelectItem value="VAN">Van</SelectItem>
                                            <SelectItem value="BIKE">Bike</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Max Capacity (kg)</Label>
                                    <Input type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })}
                                        className="bg-muted border-border text-foreground" placeholder="25000" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Odometer (km)</Label>
                                    <Input type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })}
                                        className="bg-muted border-border text-foreground" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Acquisition Cost</Label>
                                    <Input type="number" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })}
                                        className="bg-muted border-border text-foreground" placeholder="85000" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                                    {editing ? "Update" : "Save"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                                    className="border-border text-foreground hover:bg-accent">Cancel</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles..."
                                className="pl-10 bg-muted border-border text-foreground" />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[140px] bg-muted border-border text-foreground"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="TRUCK">Truck</SelectItem>
                                <SelectItem value="VAN">Van</SelectItem>
                                <SelectItem value="BIKE">Bike</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] bg-muted border-border text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="ON_TRIP">On Trip</SelectItem>
                                <SelectItem value="IN_SHOP">In Shop</SelectItem>
                                <SelectItem value="RETIRED">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Table */}
            <Card className="bg-card border-border rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name/Model</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Capacity</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Odometer</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((v) => (
                                    <tr key={v.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{v.licensePlate}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                                    <Truck className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-foreground font-medium">{v.name}</p>
                                                    <p className="text-xs text-muted-foreground">{v.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">{v.type}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{v.maxCapacity.toLocaleString()} kg</td>
                                        <td className="py-3 px-4 text-muted-foreground">{v.odometer.toLocaleString()} km</td>
                                        <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(v)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent" title={v.status === "AVAILABLE" ? "Retire" : "Activate"}>
                                                    <Truck className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {vehicles.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No vehicles found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
