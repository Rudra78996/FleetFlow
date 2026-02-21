import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    AVAILABLE: { label: "Available", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    ON_TRIP: { label: "On Trip", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    IN_SHOP: { label: "In Shop", className: "bg-red-500/15 text-red-400 border-red-500/30" },
    RETIRED: { label: "Retired", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
    ON_DUTY: { label: "On Duty", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    OFF_DUTY: { label: "Off Duty", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    SUSPENDED: { label: "Suspended", className: "bg-red-500/15 text-red-400 border-red-500/30" },
    DRAFT: { label: "Draft", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    DISPATCHED: { label: "Dispatched", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    COMPLETED: { label: "Completed", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    CANCELLED: { label: "Cancelled", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
    IN_PROGRESS: { label: "In Progress", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || { label: status, className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
    return (
        <Badge variant="outline" className={cn("font-medium text-xs border", config.className, className)}>
            {config.label}
        </Badge>
    );
}
