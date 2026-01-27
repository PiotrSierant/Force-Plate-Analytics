import { Hand, MousePointer2, ZoomIn } from "lucide-react";
import { memo } from "react";
import type { ChartToolbarMode } from "../chart-toolbar";
import { ToolButton } from "./tool-button";

interface ModeSelectorProps {
	variant: "comparison" | "selection";
	activeMode: ChartToolbarMode;
	onModeChange: (mode: ChartToolbarMode) => void;
	disabledModes?: Partial<Record<ChartToolbarMode, boolean>>;
}

export const ModeSelector = memo(function ModeSelector({
	variant,
	activeMode,
	onModeChange,
	disabledModes,
}: ModeSelectorProps) {
	return (
		<div className="flex items-center rounded-lg bg-secondary/50">
			{variant === "selection" && (
				<ToolButton
					active={activeMode === "select"}
					onClick={() => onModeChange("select")}
					disabled={disabledModes?.select}
				>
					<MousePointer2 className="h-4 w-4" />
				</ToolButton>
			)}
			<ToolButton
				active={activeMode === "zoom"}
				onClick={() => onModeChange("zoom")}
				disabled={disabledModes?.zoom}
			>
				<ZoomIn className="h-4 w-4" />
			</ToolButton>
			<ToolButton
				active={activeMode === "pan"}
				onClick={() => onModeChange("pan")}
				disabled={disabledModes?.pan}
			>
				<Hand className="h-4 w-4" />
			</ToolButton>
		</div>
	);
});
