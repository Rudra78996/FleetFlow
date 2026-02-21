"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router, mounted]);

    if (!mounted || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
                <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPath={pathname} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                    <main className="flex-1 overflow-auto p-6 bg-slate-950">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}
