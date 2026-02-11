export type ChartToolbarMode = "select" | "zoom" | "pan";

export interface DatasetLabels {
	trial1: string;
	trial2: string;
}

export interface ChartToolbarProps {
	title: string;
	subtitle: string;
	variant?: "comparison" | "selection";
	ownerLabel?: string;
	onOwnerLabelSave?: (label: string) => void;
	datasetLabels?: DatasetLabels;
	onDatasetLabelsSave?: (labels: DatasetLabels) => void;
	mode?: ChartToolbarMode;
	onModeChange?: (mode: ChartToolbarMode) => void;
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	onReset?: () => void;
	onExport?: (format: "png" | "jpg") => void;
	disabledModes?: Partial<Record<ChartToolbarMode, boolean>>;
	zoomControlsDisabled?: boolean;
	resetDisabled?: boolean;
	exportDisabled?: boolean;
	renderMenu?: React.ReactNode;
}
