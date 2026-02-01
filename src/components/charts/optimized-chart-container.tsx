"use client";

import type { ReactNode } from "react";
import { useSidebarTransition } from "@/hooks/use-sidebar-transition";
import { cn } from "@/lib/utils";

interface OptimizedChartContainerProps {
	children: ReactNode;
	className?: string;
}

/**
 * Optimized container for Chart.js charts.
 *
 * During sidebar animations:
 * 1. Hides chart canvas (opacity: 0) to prevent expensive repaints
 * 2. After animation ends, shows chart with fade-in effect
 *
 * Works with Chart.js `resizeDelay` option for debounced resize.
 */
export function OptimizedChartContainer({ children, className }: OptimizedChartContainerProps) {
	const isTransitioning = useSidebarTransition();

	return (
		<div
			className={cn(
				"relative",
				// CSS containment for rendering optimization
				"contain-[layout_paint]",
				// Smooth fade transition when showing/hiding
				"transition-opacity duration-150",
				// Hide during sidebar animation to prevent expensive canvas repaints
				isTransitioning ? "opacity-0" : "opacity-100",
				className,
			)}
		>
			{children}
		</div>
	);
}
