import { Minus, Plus } from "lucide-react";
import { memo } from "react";
import { ToolButton } from "./tool-button";

interface ZoomControlsProps {
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	disabled?: boolean;
}

export const ZoomControls = memo(function ZoomControls({
	onZoomIn,
	onZoomOut,
	disabled = false,
}: ZoomControlsProps) {
	return (
		<div className="flex items-center rounded-lg bg-secondary/50">
			<ToolButton onClick={onZoomIn} disabled={disabled}>
				<Plus className="h-4 w-4" />
			</ToolButton>
			<ToolButton onClick={onZoomOut} disabled={disabled}>
				<Minus className="h-4 w-4" />
			</ToolButton>
		</div>
	);
});
