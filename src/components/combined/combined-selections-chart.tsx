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
import { useCallback, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { ChartToolbar } from "@/components/charts/chart-toolbar";
import { useChartExport } from "@/components/charts/hooks/use-chart-export";
import { useChartZoomPlugin } from "@/components/charts/hooks/use-chart-zoom-plugin";
import { OptimizedChartContainer } from "@/components/charts/optimized-chart-container";
import type { ChartToolbarMode } from "@/components/charts/types";
import { ownerLabelPlugin } from "@/components/charts/utils/owner-label-plugin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ParsedForceData } from "@/lib/csvParser";
import { type CombinedSelection, getSelectionColor } from "./hooks/use-combined-selections";
import { SelectionLabelMenu } from "./selection-label-menu";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, Legend, Filler, Decimation);

interface CombinedSelectionsChartProps {
	data: ParsedForceData;
	selections: CombinedSelection[];
	fileName?: string;
	selectionLabels: Map<string, string>;
	onSelectionLabelsSave: (labels: Map<string, string>) => void;
}

export function CombinedSelectionsChart({
	data,
	selections,
	fileName,
	selectionLabels,
	onSelectionLabelsSave,
}: CombinedSelectionsChartProps) {
	const chartRef = useRef<ChartJS<"line">>(null);
	const zoomReady = useChartZoomPlugin();
	const [isZoomed, setIsZoomed] = useState(false);
	const { exportChart } = useChartExport({
		filename: fileName ? `${fileName}-zaznaczenia` : "zaznaczenia",
	});

	// Owner label
	const [ownerLabel, setOwnerLabel] = useState("");

	const chartData = useMemo(() => {
		const datasets = selections.map((sel, i) => {
			const color = getSelectionColor(i);
			const startTime = data.data[sel.startIndex]?.time ?? 0;
			const customLabel = selectionLabels.get(sel.id);

			const points = data.data.slice(sel.startIndex, sel.endIndex + 1).map((p) => ({
				x: p.time - startTime,
				y: p.left + p.right,
			}));

			return {
				label: customLabel || `Zaznaczenie #${i + 1}`,
				data: points,
				borderColor: color.border,
				backgroundColor: color.bg,
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.2,
				fill: true,
			};
		});

		return { datasets };
	}, [data, selections, selectionLabels]);

	const options = useMemo<import("chart.js").ChartOptions<"line">>(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			animation: { duration: 300 },
			interaction: {
				mode: "index" as const,
				intersect: false,
			},
			scales: {
				x: {
					type: "linear" as const,
					title: {
						display: true,
						text: "Czas (s, od początku zaznaczenia)",
						font: { size: 13, weight: "bold" as const },
					},
					ticks: { maxTicksLimit: 20 },
				},
				y: {
					title: {
						display: true,
						text: "Siła wypadkowa (N)",
						font: { size: 13, weight: "bold" as const },
					},
				},
			},
			plugins: {
				ownerLabel: {
					text: ownerLabel.trim(),
				},
				legend: {
					position: "top" as const,
					labels: {
						usePointStyle: true,
						padding: 16,
						font: { size: 12 },
					},
				},
				tooltip: {
					mode: "index" as const,
					intersect: false,
					callbacks: {
						title: (items) => {
							const x = items[0]?.parsed?.x;
							return x != null ? `Czas: ${x.toFixed(3)} s` : "";
						},
						label: (item) =>
							`${item.dataset.label}: ${((item.parsed.y as number) ?? 0).toFixed(2)} N`,
					},
				},
				zoom: {
					zoom: {
						wheel: { enabled: false },
						drag: {
							enabled: false,
							backgroundColor: "rgba(59, 130, 246, 0.1)",
							borderColor: "rgba(59, 130, 246, 0.3)",
							borderWidth: 1,
						},
						mode: "x" as const,
						onZoomComplete: () => setIsZoomed(true),
					},
					pan: {
						enabled: false,
						mode: "x" as const,
						onPanComplete: () => setIsZoomed(true),
					},
					limits: {
						x: { min: "original" as const, max: "original" as const },
					},
				},
			},
		}),
		[ownerLabel],
	);

	// --- Toolbar handlers ---
	const [toolbarMode, setToolbarMode] = useState<ChartToolbarMode>("zoom");

	const handleModeChange = useCallback(
		(mode: ChartToolbarMode) => {
			setToolbarMode(mode);

			const chart = chartRef.current;
			if (!chart) return;
			const zoomOpts = chart.options.plugins?.zoom;
			if (!zoomOpts?.zoom || !zoomOpts.pan) return;
			if (!zoomOpts.zoom.wheel || !zoomOpts.zoom.drag) return;

			const zoomEnabled = zoomReady && mode === "zoom";
			const panEnabled = zoomReady && mode === "pan";

			zoomOpts.zoom.wheel.enabled = zoomEnabled;
			zoomOpts.zoom.drag.enabled = zoomEnabled;
			zoomOpts.pan.enabled = panEnabled;
			chart.update("none");
		},
		[zoomReady],
	);

	const handleZoomIn = useCallback(() => {
		chartRef.current?.zoom(1.2);
		setIsZoomed(true);
	}, []);

	const handleZoomOut = useCallback(() => {
		chartRef.current?.zoom(0.8);
	}, []);

	const handleResetZoom = useCallback(() => {
		chartRef.current?.resetZoom();
		setIsZoomed(false);
	}, []);

	const handleExport = useCallback(
		(format: "png" | "jpg") => {
			exportChart(chartRef, format);
		},
		[exportChart],
	);

	return (
		<Card className="mt-8">
			<CardHeader className="p-0">
				<ChartToolbar
					title="Porównanie zaznaczonych zakresów"
					subtitle={`${selections.length} ${selections.length === 1 ? "zaznaczenie" : selections.length < 5 ? "zaznaczenia" : "zaznaczeń"} — Siła wypadkowa (L+P)`}
					variant="comparison"
					mode={toolbarMode}
					onModeChange={handleModeChange}
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onReset={handleResetZoom}
					onExport={handleExport}
					disabledModes={{
						zoom: !zoomReady,
						pan: !zoomReady,
						select: true,
					}}
					zoomControlsDisabled={!zoomReady}
					resetDisabled={!zoomReady || !isZoomed}
					renderMenu={
						<SelectionLabelMenu
							ownerLabel={ownerLabel}
							onOwnerLabelSave={setOwnerLabel}
							selections={selections}
							selectionLabels={selectionLabels}
							onSelectionLabelsSave={onSelectionLabelsSave}
						/>
					}
				/>
			</CardHeader>
			<CardContent className="pt-4">
				<OptimizedChartContainer className="h-100 w-full max-w-full overflow-hidden">
					<Line ref={chartRef} data={chartData} plugins={[ownerLabelPlugin]} options={options} />
				</OptimizedChartContainer>
			</CardContent>
		</Card>
	);
}
