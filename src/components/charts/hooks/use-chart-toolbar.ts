import { useCallback, useState } from "react";
import type { ChartToolbarMode } from "../chart-toolbar";

interface UseChartToolbarProps {
	mode?: ChartToolbarMode;
	onModeChange?: (mode: ChartToolbarMode) => void;
	disabledModes?: Partial<Record<ChartToolbarMode, boolean>>;
	defaultMode?: ChartToolbarMode;
}

export function useChartToolbar({
	mode,
	onModeChange,
	disabledModes,
	defaultMode = "zoom",
}: UseChartToolbarProps) {
	const [internalMode, setInternalMode] = useState<ChartToolbarMode>(defaultMode);
	const activeMode = mode ?? internalMode;

	const handleModeChange = useCallback(
		(nextMode: ChartToolbarMode) => {
			if (disabledModes?.[nextMode]) return;

			if (mode === undefined) {
				setInternalMode(nextMode);
			}
			onModeChange?.(nextMode);
		},
		[mode, onModeChange, disabledModes],
	);

	return {
		activeMode,
		handleModeChange,
	};
}
