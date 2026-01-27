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
import { Line } from "react-chartjs-2";
import { ChartToolbar } from "@/components/charts/chart-toolbar";
import { useRangeSelectorContainer } from "@/components/charts/hooks/use-range-selector-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, Legend, Filler, Decimation);

interface RangeSelectorProps {
	trial: ParsedForceData;
	trialName: string;
	chartColor: string;
	onRangeSelected: (range: SelectedRange) => void;
	onRangeCleared?: () => void;
}

export function RangeSelector({
	trial,
	trialName,
	chartColor,
	onRangeSelected,
	onRangeCleared,
}: RangeSelectorProps) {
	const {
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		chartPlugins,
		title,
		subtitle,
		cursor,
		toolbarMode,
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		handleModeChange,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	} = useRangeSelectorContainer({
		trial,
		trialName,
		chartColor,
		onRangeSelected,
		onRangeCleared,
	});

	return (
		<Card>
			<CardHeader className="p-0">
				<ChartToolbar
					title={title}
					subtitle={subtitle}
					variant="selection"
					mode={toolbarMode}
					onModeChange={handleModeChange}
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onReset={handleResetZoom}
					disabledModes={{
						zoom: !zoomReady,
						pan: !zoomReady,
					}}
					zoomControlsDisabled={!zoomReady}
					resetDisabled={!zoomReady || !isZoomed}
				/>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="space-y-4">
					<div ref={chartWrapperRef} className="h-80 w-full max-w-full overflow-hidden">
						<Line
							ref={chartRef}
							data={chartData}
							options={options}
							plugins={chartPlugins}
							style={{
								cursor,
							}}
							redraw={false}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={handleMouseUp}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
