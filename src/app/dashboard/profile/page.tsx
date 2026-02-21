"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User, Mail, Shield, Calendar, Pencil, Save, X, Key, Check } from "lucide-react";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [form, setForm] = useState({ name: "", email: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [saving, setSaving] = useState(false);
    const api = useApi();
    const { login, user, token } = useAuthStore();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await api.get("/api/auth/me");
            setProfile(data.user);
            setForm({ name: data.user.name, email: data.user.email });
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Name and email are required");
            return;
        }
        setSaving(true);
        try {
            const data = await api.put("/api/auth/me", { name: form.name, email: form.email });
            setProfile(data.user);
            // Update auth store with new name
            if (user && token) {
                login({ ...user, name: data.user.name, email: data.user.email }, token);
            }
            setEditing(false);
            toast.success("Profile updated successfully");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error("Please fill in all password fields");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setSaving(true);
        try {
            await api.put("/api/auth/me", { 
                currentPassword: passwordForm.currentPassword, 
                newPassword: passwordForm.newPassword 
            });
            setChangingPassword(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            toast.success("Password changed successfully");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        if (profile) {
            setForm({ name: profile.name, email: profile.email });
        }
    };

    const roleLabel = (role: string) => {
        const labels: Record<string, string> = {
            FLEET_MANAGER: "Fleet Manager",
            DISPATCHER: "Dispatcher",
            SAFETY_OFFICER: "Safety Officer",
            FINANCIAL_ANALYST: "Financial Analyst",
        };
        return labels[role] || role;
    };

    const roleDescription = (role: string) => {
        const descriptions: Record<string, string> = {
            FLEET_MANAGER: "Full access to fleet management, vehicles, drivers, and analytics",
            DISPATCHER: "Manage trips, assign drivers, and track deliveries",
            SAFETY_OFFICER: "Monitor driver compliance, safety scores, and maintenance",
            FINANCIAL_ANALYST: "Access to expenses, fuel costs, and financial reports",
        };
        return descriptions[role] || "Standard user access";
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-2xl">
                <Skeleton className="h-8 w-48 bg-muted" />
                <Skeleton className="h-64 bg-muted rounded-2xl" />
                <Skeleton className="h-48 bg-muted rounded-2xl" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your account information and preferences</p>
            </div>

            {/* Profile Card */}
            <Card className="bg-card border-border rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                    </div>
                </div>
                <CardContent className="p-6">
                    {editing ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" /> Full Name
                                </Label>
                                <Input 
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value })} 
                                    className="bg-muted border-border text-foreground" 
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                                </Label>
                                <Input 
                                    type="email"
                                    value={form.email} 
                                    onChange={e => setForm({ ...form, email: e.target.value })} 
                                    className="bg-muted border-border text-foreground" 
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button 
                                    onClick={handleSaveProfile} 
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {saving ? (
                                        <>Saving...</>
                                    ) : (
                                        <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={cancelEdit}
                                    className="border-border text-foreground hover:bg-accent"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Full Name</p>
                                        <p className="text-sm font-medium text-foreground">{profile.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email Address</p>
                                        <p className="text-sm font-medium text-foreground">{profile.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Member Since</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(profile.createdAt).toLocaleDateString("en-US", { 
                                                month: "long", 
                                                day: "numeric", 
                                                year: "numeric" 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setEditing(true)} 
                                variant="outline"
                                className="w-full border-border text-foreground hover:bg-accent mt-2"
                            >
                                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role Card */}
            <Card className="bg-card border-border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> Role & Permissions
                    </CardTitle>
                    <CardDescription>Your access level in the system</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{roleLabel(profile.role)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{roleDescription(profile.role)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="bg-card border-border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" /> Security
                    </CardTitle>
                    <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {changingPassword ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">Current Password</Label>
                                <Input 
                                    type="password"
                                    value={passwordForm.currentPassword} 
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                                    className="bg-muted border-border text-foreground" 
                                    placeholder="Enter current password"
                                />
                            </div>
                            <Separator className="bg-border" />
                            <div className="space-y-2">
                                <Label className="text-foreground">New Password</Label>
                                <Input 
                                    type="password"
                                    value={passwordForm.newPassword} 
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                                    className="bg-muted border-border text-foreground" 
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Confirm New Password</Label>
                                <Input 
                                    type="password"
                                    value={passwordForm.confirmPassword} 
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                                    className="bg-muted border-border text-foreground" 
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button 
                                    onClick={handleChangePassword} 
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {saving ? (
                                        <>Saving...</>
                                    ) : (
                                        <><Check className="w-4 h-4 mr-2" /> Update Password</>
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                    }}
                                    className="border-border text-foreground hover:bg-accent"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            onClick={() => setChangingPassword(true)} 
                            variant="outline"
                            className="w-full border-border text-foreground hover:bg-accent"
                        >
                            <Key className="w-4 h-4 mr-2" /> Change Password
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
