"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("FLEET_MANAGER");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const body = isLogin ? { email, password } : { name, email, password, role };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            login(
                { userId: data.user.id, email: data.user.email, role: data.user.role, name: data.user.name },
                data.token
            );

            router.push("/dashboard");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md relative z-10 bg-card border-border shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                        <Truck className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-foreground">FleetFlow</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {isLogin ? "Sign in to your account" : "Create your account"}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@fleetflow.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-foreground">Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="bg-muted border-border text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                                        <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                                        <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
                                        <SelectItem value="FINANCIAL_ANALYST">Financial Analyst</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    {isLogin ? "Signing in..." : "Creating account..."}
                                </div>
                            ) : (
                                isLogin ? "Sign In" : "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
                        </button>
                    </div>

                    {isLogin && (
                        <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
                            <p className="text-xs text-muted-foreground text-center mb-1">Demo Credentials</p>
                            <p className="text-xs text-muted-foreground/70 text-center">admin@fleetflow.com / password123</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
