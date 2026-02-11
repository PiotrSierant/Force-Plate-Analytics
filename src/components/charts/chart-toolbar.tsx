"use client";

import { useChartToolbar } from "./hooks/use-chart-toolbar";
import { ExportButtons } from "./partials/export-buttons";
import { ModeSelector } from "./partials/mode-selector";
import { OwnerLabelMenu } from "./partials/owner-label-menu";
import { ResetButton } from "./partials/reset-button";
import { ToolbarDivider } from "./partials/toolbar-divider";
import { ToolbarHeader } from "./partials/toolbar-header";
import { ZoomControls } from "./partials/zoom-controls";
import type { ChartToolbarProps } from "./types";

export type { ChartToolbarMode } from "./types";

export function ChartToolbar({
	title,
	subtitle,
	variant = "comparison",
	ownerLabel,
	onOwnerLabelSave,
	datasetLabels,
	onDatasetLabelsSave,
	mode,
	onModeChange,
	onZoomIn,
	onZoomOut,
	onReset,
	onExport,
	disabledModes,
	zoomControlsDisabled = false,
	resetDisabled = false,
	exportDisabled = false,
	renderMenu,
}: ChartToolbarProps) {
	const { activeMode, handleModeChange } = useChartToolbar({
		mode,
		onModeChange,
		disabledModes,
		defaultMode: variant === "comparison" ? "zoom" : "select",
	});

	return (
		<div className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70">
			<div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
				<ToolbarHeader title={title} subtitle={subtitle} />

				<div className="flex flex-wrap items-center gap-1">
					<ModeSelector
						variant={variant}
						activeMode={activeMode}
						onModeChange={handleModeChange}
						disabledModes={disabledModes}
					/>

					<ToolbarDivider />

					<ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} disabled={zoomControlsDisabled} />

					<ResetButton onClick={onReset} disabled={resetDisabled} />

					{variant === "comparison" && (
						<>
							<ToolbarDivider />
							<ExportButtons onExport={onExport} disabled={exportDisabled} />
							{renderMenu ? (
								renderMenu
							) : onOwnerLabelSave && ownerLabel !== undefined ? (
								<OwnerLabelMenu
									ownerLabel={ownerLabel}
									onOwnerLabelSave={onOwnerLabelSave}
									datasetLabels={datasetLabels}
									onDatasetLabelsSave={onDatasetLabelsSave}
								/>
							) : null}
						</>
					)}
				</div>
			</div>
			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
		</div>
	);
}
