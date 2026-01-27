"use client";

import {
	Chart as ChartJS,
	Decimation,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from "chart.js";
import { useForceChartContainer } from "@/components/charts/hooks/use-force-chart-container";
import { ForceChartContent } from "@/components/charts/partials/force-chart-content";
import { ForceChartEmpty } from "@/components/charts/partials/force-chart-empty";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, Legend, Filler, Decimation);

interface ForceChartProps {
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	onUpdateRange1?: (range: SelectedRange) => void;
	onUpdateRange2?: (range: SelectedRange) => void;
}

export function ForceChart({ trial1, trial2, onUpdateRange1, onUpdateRange2 }: ForceChartProps) {
	const {
		ownerLabel,
		setOwnerLabel,
		datasetLabels,
		setDatasetLabels,
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		chartTitle,
		interactionMode,
		handleModeChange,
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		adjustRangeStart,
		adjustRangeEnd,
		shiftRange,
		handleExport,
		hasSelections,
	} = useForceChartContainer({
		trial1,
		trial2,
		onUpdateRange1,
		onUpdateRange2,
	});

	const commonProps = {
		ownerLabel,
		onOwnerLabelSave: setOwnerLabel,
		datasetLabels,
		onDatasetLabelsSave: setDatasetLabels,
		interactionMode,
		onModeChange: handleModeChange,
		onZoomIn: handleZoomIn,
		onZoomOut: handleZoomOut,
		onReset: handleResetZoom,
		onExport: handleExport,
		zoomReady,
		isZoomed,
	};

	if (!hasSelections) {
		return <ForceChartEmpty {...commonProps} />;
	}

	return (
		<ForceChartContent
			{...commonProps}
			chartRef={chartRef}
			chartWrapperRef={chartWrapperRef}
			chartData={chartData}
			options={options}
			chartTitle={chartTitle}
			trial1={trial1}
			trial2={trial2}
			adjustRangeStart={adjustRangeStart}
			adjustRangeEnd={adjustRangeEnd}
			shiftRange={shiftRange}
		/>
	);
}
