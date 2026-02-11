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
import { OptimizedChartContainer } from "@/components/charts/optimized-chart-container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ParsedForceData } from "@/lib/csvParser";
import { useCombinedChart } from "./hooks/use-combined-chart";
import type { CombinedSelection } from "./hooks/use-combined-selections";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, Legend, Filler, Decimation);

interface CombinedChartProps {
	data: ParsedForceData;
	selections: CombinedSelection[];
	onSelectionAdd: (startTime: number, endTime: number, timeValues: number[]) => void;
	onSelectionRemove: (id: string) => void;
	onSelectionUpdate: (id: string, startTime: number, endTime: number, timeValues: number[]) => void;
}

export function CombinedChart({
	data,
	selections,
	onSelectionAdd,
	onSelectionRemove,
	onSelectionUpdate,
}: CombinedChartProps) {
	const {
		chartRef,
		chartWrapperRef,
		chartData,
		chartPlugins,
		options,
		subtitle,
		cursor,
		toolbarMode,
		handleModeChange,
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	} = useCombinedChart({ data, selections, onSelectionAdd, onSelectionRemove, onSelectionUpdate });

	return (
		<Card>
			<CardHeader className="p-0">
				<ChartToolbar
					title="Siła wypadkowa — Vertical Force"
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
				<OptimizedChartContainer className="h-150 w-full max-w-full overflow-hidden">
					<div ref={chartWrapperRef} className="h-full w-full">
						<Line
							ref={chartRef}
							data={chartData}
							plugins={chartPlugins}
							options={options}
							style={{ cursor }}
							redraw={false}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={handleMouseUp}
						/>
					</div>
				</OptimizedChartContainer>
			</CardContent>
		</Card>
	);
}
