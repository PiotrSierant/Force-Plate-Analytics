"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "../utils/range-controls";

interface RangeControlsHeaderProps {
	trialNumber: 1 | 2;
	color: string;
	startTime: number;
	endTime: number;
	sampleCount: number;
	accentBadge: string;
}

export function RangeControlsHeader({
	trialNumber,
	color,
	startTime,
	endTime,
	sampleCount,
	accentBadge,
}: RangeControlsHeaderProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
			<div className="flex items-center gap-3">
				<span className="relative flex h-2.5 w-2.5">
					<span className="absolute inset-0 rounded-full opacity-70 blur-sm" />
					<span
						className="relative h-2.5 w-2.5 rounded-full"
						style={{
							backgroundColor: color,
						}}
					/>
				</span>
				<span className="text-sm font-semibold text-foreground">Próbka {trialNumber}</span>
			</div>
			<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
				<div className="flex items-center gap-2">
					<span>Zakres</span>
					<span className="font-mono text-foreground">{formatTime(startTime)}s</span>
					<span className="text-muted-foreground/60">-</span>
					<span className="font-mono text-foreground">{formatTime(endTime)}s</span>
				</div>
				<span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", accentBadge)}>
					{sampleCount.toLocaleString()} próbek
				</span>
			</div>
		</div>
	);
}
