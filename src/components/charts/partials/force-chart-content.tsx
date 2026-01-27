import type { ChartData, Chart as ChartJS, ChartOptions } from "chart.js";
import type { MutableRefObject } from "react";
import { Line } from "react-chartjs-2";
import { ChartToolbar } from "@/components/charts/chart-toolbar";
import { RangeControls } from "@/components/charts/force-chart-range-controls";
import type { ChartToolbarMode, DatasetLabels } from "@/components/charts/types";
import { ownerLabelPlugin } from "@/components/charts/utils/owner-label-plugin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ParsedForceData } from "@/lib/csvParser";

interface ForceChartContentProps {
	chartRef: MutableRefObject<ChartJS<"line"> | null>;
	chartWrapperRef: MutableRefObject<HTMLDivElement | null>;
	chartData: ChartData<"line">;
	options: ChartOptions<"line">;
	chartTitle: string;
	interactionMode: "zoom" | "pan";
	onModeChange: (mode: ChartToolbarMode) => void;
	ownerLabel: string;
	onOwnerLabelSave: (label: string) => void;
	datasetLabels: DatasetLabels;
	onDatasetLabelsSave: (labels: DatasetLabels) => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
	onExport: (format: "png" | "jpg") => void;
	zoomReady: boolean;
	isZoomed: boolean;
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	adjustRangeStart: (trialNumber: 1 | 2, delta: number) => void;
	adjustRangeEnd: (trialNumber: 1 | 2, delta: number) => void;
	shiftRange: (trialNumber: 1 | 2, delta: number) => void;
}

export function ForceChartContent({
	chartRef,
	chartWrapperRef,
	chartData,
	options,
	chartTitle,
	interactionMode,
	onModeChange,
	ownerLabel,
	onOwnerLabelSave,
	datasetLabels,
	onDatasetLabelsSave,
	onZoomIn,
	onZoomOut,
	onReset,
	onExport,
	zoomReady,
	isZoomed,
	trial1,
	trial2,
	adjustRangeStart,
	adjustRangeEnd,
	shiftRange,
}: ForceChartContentProps) {
	const subtitle =
		interactionMode === "zoom"
			? "Tryb Zoom: Użyj kółka lub przeciągnij aby przybliżyć"
			: "Tryb Panning: Przeciągnij aby przesunąć widok";

	return (
		<Card>
			<CardHeader className="p-0">
				<ChartToolbar
					title={chartTitle}
					subtitle={subtitle}
					variant="comparison"
					ownerLabel={ownerLabel}
					onOwnerLabelSave={onOwnerLabelSave}
					datasetLabels={datasetLabels}
					onDatasetLabelsSave={onDatasetLabelsSave}
					mode={interactionMode}
					onModeChange={onModeChange}
					onZoomIn={onZoomIn}
					onZoomOut={onZoomOut}
					onReset={onReset}
					onExport={onExport}
					disabledModes={{
						zoom: !zoomReady,
						pan: !zoomReady,
					}}
					zoomControlsDisabled={!zoomReady}
					resetDisabled={!zoomReady || !isZoomed}
				/>
			</CardHeader>
			<CardContent className="pt-4">
				<div ref={chartWrapperRef} className="h-150 w-full max-w-full overflow-hidden">
					<Line ref={chartRef} data={chartData} plugins={[ownerLabelPlugin]} options={options} />
				</div>
				<div className="mt-6 space-y-4">
					{trial1?.selectedRange && (
						<RangeControls
							trial={trial1}
							trialNumber={1}
							color="#3b82f6"
							onAdjustStart={(delta) => adjustRangeStart(1, delta)}
							onAdjustEnd={(delta) => adjustRangeEnd(1, delta)}
							onShiftRange={(delta) => shiftRange(1, delta)}
						/>
					)}
					{trial2?.selectedRange && (
						<RangeControls
							trial={trial2}
							trialNumber={2}
							color="#ef4444"
							onAdjustStart={(delta) => adjustRangeStart(2, delta)}
							onAdjustEnd={(delta) => adjustRangeEnd(2, delta)}
							onShiftRange={(delta) => shiftRange(2, delta)}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
