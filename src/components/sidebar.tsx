"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Truck,
    Route,
    Wrench,
    DollarSign,
    Users,
    BarChart3,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/vehicles", label: "Vehicle Registry", icon: Truck },
    { href: "/dashboard/trips", label: "Trip Dispatcher", icon: Route },
    { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/dashboard/expenses", label: "Trips & Expenses", icon: DollarSign },
    { href: "/dashboard/drivers", label: "Drivers", icon: Users },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    currentPath: string;
}

export function Sidebar({ collapsed, onToggle, currentPath }: SidebarProps) {
    return (
        <aside
            className={cn(
                "h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-all duration-300 relative",
                collapsed ? "w-[70px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-[36px] h-9 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                            FleetFlow
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = currentPath === item.href ||
                        (item.href !== "/dashboard" && currentPath.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-gradient-to-r from-emerald-500/15 to-blue-500/15 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon
                                className={cn(
                                    "min-w-[20px] h-5 transition-colors",
                                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    );
}
