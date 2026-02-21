"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Bell } from "lucide-react";

interface NavbarProps {
    onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();

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
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="md:hidden text-slate-400 hover:text-white"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-sm font-medium text-slate-300">Welcome back,</h2>
                    <p className="text-xs text-slate-500">{user?.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 hover:bg-slate-800 px-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                                <p className="text-xs text-slate-500">{roleLabel(user?.role || "")}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer">
                            <User className="w-4 h-4 mr-2" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
