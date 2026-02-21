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
                "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 relative",
                collapsed ? "w-[70px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-border">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-[36px] h-9 bg-primary rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold text-foreground whitespace-nowrap tracking-tight">
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
                                    ? "bg-accent text-foreground border border-border"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon
                                className={cn(
                                    "min-w-[20px] h-5 transition-colors",
                                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
                className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    );
}
