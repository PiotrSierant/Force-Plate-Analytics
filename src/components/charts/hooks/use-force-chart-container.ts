import { useCallback, useState } from "react";
import { useChartExport } from "@/components/charts/hooks/use-chart-export";
import { useForceChart } from "@/components/charts/hooks/use-force-chart";
import type { ChartToolbarMode } from "@/components/charts/types";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

interface UseForceChartContainerOptions {
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	onUpdateRange1?: (range: SelectedRange) => void;
	onUpdateRange2?: (range: SelectedRange) => void;
}

export function useForceChartContainer({
	trial1,
	trial2,
	onUpdateRange1,
	onUpdateRange2,
}: UseForceChartContainerOptions) {
	const [ownerLabel, setOwnerLabel] = useState("");
	const [datasetLabels, setDatasetLabels] = useState({
		trial1: "Próba 1",
		trial2: "Próba 2",
	});

	const { exportChart } = useChartExport({
		filename: "force-comparison",
	});

	const {
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		interactionMode,
		setInteractionMode,
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		adjustRangeStart,
		adjustRangeEnd,
		shiftRange,
		chartTitle,
		hasSelections,
	} = useForceChart({
		trial1,
		trial2,
		ownerLabel,
		datasetLabels,
		onUpdateRange1,
		onUpdateRange2,
	});

	const handleModeChange = useCallback(
		(mode: ChartToolbarMode) => {
			if (mode === "zoom" || mode === "pan") {
				setInteractionMode(mode);
			}
		},
		[setInteractionMode],
	);

	const handleExport = useCallback(
		(format: "png" | "jpg") => {
			exportChart(chartRef, format);
		},
		[chartRef, exportChart],
	);

	return {
		// Stan
		ownerLabel,
		setOwnerLabel,
		datasetLabels,
		setDatasetLabels,
		// Dane wykresu
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		chartTitle,
		// Tryb interakcji
		interactionMode,
		handleModeChange,
		// Zoom
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		// Range controls
		adjustRangeStart,
		adjustRangeEnd,
		shiftRange,
		// Export
		handleExport,
		// Status
		hasSelections,
	};
}
