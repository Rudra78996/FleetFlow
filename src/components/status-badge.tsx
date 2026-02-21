import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    AVAILABLE: { label: "Available", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400" },
    ON_TRIP: { label: "On Trip", className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400" },
    IN_SHOP: { label: "In Shop", className: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400" },
    RETIRED: { label: "Retired", className: "bg-neutral-500/15 text-neutral-600 border-neutral-500/30 dark:text-neutral-400" },
    ON_DUTY: { label: "On Duty", className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400" },
    OFF_DUTY: { label: "Off Duty", className: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400" },
    SUSPENDED: { label: "Suspended", className: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400" },
    DRAFT: { label: "Draft", className: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400" },
    DISPATCHED: { label: "Dispatched", className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400" },
    COMPLETED: { label: "Completed", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400" },
    CANCELLED: { label: "Cancelled", className: "bg-neutral-500/15 text-neutral-600 border-neutral-500/30 dark:text-neutral-400" },
    IN_PROGRESS: { label: "In Progress", className: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || { label: status, className: "bg-neutral-500/15 text-neutral-600 border-neutral-500/30 dark:text-neutral-400" };
    return (
        <Badge variant="outline" className={cn("font-medium text-xs border", config.className, className)}>
            {config.label}
        </Badge>
    );
}
