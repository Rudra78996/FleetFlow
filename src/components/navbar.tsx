"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Bell, Sun, Moon } from "lucide-react";

interface NavbarProps {
    onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        router.push("/login");
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

    return (
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="md:hidden text-muted-foreground hover:text-foreground"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-sm font-medium text-foreground">Welcome back,</h2>
                    <p className="text-xs text-muted-foreground">{user?.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                    <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-foreground rounded-full" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 hover:bg-accent px-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{roleLabel(user?.role || "")}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="text-foreground focus:bg-accent focus:text-foreground cursor-pointer">
                            <User className="w-4 h-4 mr-2" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
