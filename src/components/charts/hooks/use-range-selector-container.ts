import { useCallback, useMemo } from "react";
import { useRangeSelectorChart } from "@/components/charts/hooks/use-range-selector-chart";
import type { ChartToolbarMode } from "@/components/charts/types";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

interface UseRangeSelectorContainerOptions {
	trial: ParsedForceData;
	trialName: string;
	chartColor: string;
	onRangeSelected: (range: SelectedRange) => void;
	onRangeCleared?: () => void;
}

export function useRangeSelectorContainer({
	trial,
	trialName,
	chartColor,
	onRangeSelected,
	onRangeCleared,
}: UseRangeSelectorContainerOptions) {
	const {
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		selectionOverlayPlugin,
		interactionMode,
		setInteractionMode,
		isZoomed,
		zoomReady,
		dragMode,
		hoverEdge,
		hoverClearButton,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
	} = useRangeSelectorChart({
		trial,
		trialName,
		chartColor,
		onRangeSelected,
		onRangeCleared,
	});

	const toolbarMode: ChartToolbarMode = useMemo(() => {
		return interactionMode === "selection" ? "select" : interactionMode;
	}, [interactionMode]);

	const subtitle = useMemo(() => {
		if (interactionMode === "selection") {
			return "Tryb Zaznaczenia: Przeciągnij aby zaznaczyć zakres danych";
		}
		if (interactionMode === "zoom") {
			return "Tryb Zoom: Użyj kółka lub przeciągnij aby przybliżyć";
		}
		return "Tryb Panning: Przeciągnij aby przesunąć widok";
	}, [interactionMode]);

	const cursor = useMemo(() => {
		if (interactionMode === "selection") {
			if (hoverClearButton) return "pointer";
			if (dragMode !== "none" || hoverEdge !== "none") return "ew-resize";
			return "crosshair";
		}
		if (interactionMode === "zoom") {
			return zoomReady ? "zoom-in" : "default";
		}
		return zoomReady ? "grab" : "default";
	}, [interactionMode, hoverClearButton, dragMode, hoverEdge, zoomReady]);

	const chartPlugins = useMemo(() => [selectionOverlayPlugin], [selectionOverlayPlugin]);

	const handleModeChange = useCallback(
		(mode: ChartToolbarMode) => {
			if (mode === "select") {
				setInteractionMode("selection");
				return;
			}
			setInteractionMode(mode);
		},
		[setInteractionMode],
	);

	const title = `${trialName} - Wybierz zakres do analizy`;

	return {
		// Dane wykresu
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		chartPlugins,
		// UI state
		title,
		subtitle,
		cursor,
		toolbarMode,
		// Zoom
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		// Mode
		handleModeChange,
		// Mouse handlers
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	};
}
