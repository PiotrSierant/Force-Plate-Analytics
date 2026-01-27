import { ChartToolbar } from "@/components/charts/chart-toolbar";
import type { ChartToolbarMode, DatasetLabels } from "@/components/charts/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ForceChartEmptyProps {
	ownerLabel: string;
	onOwnerLabelSave: (label: string) => void;
	datasetLabels: DatasetLabels;
	onDatasetLabelsSave: (labels: DatasetLabels) => void;
	interactionMode: "zoom" | "pan";
	onModeChange: (mode: ChartToolbarMode) => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
	onExport: (format: "png" | "jpg") => void;
	zoomReady: boolean;
	isZoomed: boolean;
}

export function ForceChartEmpty({
	ownerLabel,
	onOwnerLabelSave,
	datasetLabels,
	onDatasetLabelsSave,
	interactionMode,
	onModeChange,
	onZoomIn,
	onZoomOut,
	onReset,
	onExport,
	zoomReady,
	isZoomed,
}: ForceChartEmptyProps) {
	return (
		<Card>
			<CardHeader className="p-0">
				<ChartToolbar
					title="Porównanie Wybranych Zakresów"
					subtitle="Zaznacz zakres w co najmniej jednej próbie aby zobaczyć wykres"
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
				<div className="flex h-100 items-center justify-center text-zinc-500">
					Zaznacz zakres w co najmniej jednej próbie aby zobaczyć wykres
				</div>
			</CardContent>
		</Card>
	);
}
