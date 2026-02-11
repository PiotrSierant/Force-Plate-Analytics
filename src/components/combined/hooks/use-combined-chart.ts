import type { ChartData, Chart as ChartJS, ChartOptions, Plugin } from "chart.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChartZoomPlugin } from "@/components/charts/hooks/use-chart-zoom-plugin";
import type { ChartToolbarMode } from "@/components/charts/types";
import {
	type CombinedSelection,
	getSelectionColor,
} from "@/components/combined/hooks/use-combined-selections";
import { downsampleData, type ParsedForceData } from "@/lib/csvParser";

type InteractionMode = "selection" | "zoom" | "pan";

type DragMode = "none" | "create" | "resize-start" | "resize-end";

const EDGE_THRESHOLD = 6;

interface UseCombinedChartOptions {
	data?: ParsedForceData;
	selections: CombinedSelection[];
	onSelectionAdd: (startTime: number, endTime: number, timeValues: number[]) => void;
	onSelectionRemove: (id: string) => void;
	onSelectionUpdate: (id: string, startTime: number, endTime: number, timeValues: number[]) => void;
}

const CHART_COLORS = {
	left: { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)" },
	right: { border: "#ef4444", bg: "rgba(239, 68, 68, 0.08)" },
	combined: { border: "#22c55e", bg: "rgba(34, 197, 94, 0.12)" },
} as const;

export function useCombinedChart({
	data,
	selections,
	onSelectionAdd,
	onSelectionRemove,
	onSelectionUpdate,
}: UseCombinedChartOptions) {
	const chartRef = useRef<ChartJS<"line">>(null);
	const chartWrapperRef = useRef<HTMLDivElement>(null);
	const [interactionMode, setInteractionMode] = useState<InteractionMode>("selection");
	const [isZoomed, setIsZoomed] = useState(false);
	const zoomReady = useChartZoomPlugin();

	// Selection drag state
	const [isSelecting, setIsSelecting] = useState(false);
	const selectionRef = useRef<{ start: number | null; end: number | null }>({
		start: null,
		end: null,
	});
	const clearButtonsRef = useRef<Array<{ id: string; x: number; y: number; radius: number }>>([]);

	// Drag & resize state
	const dragModeRef = useRef<DragMode>("none");
	const resizeInfoRef = useRef<{ selectionId: string } | null>(null);

	// Hover states for cursor
	const [hoverClearButton, setHoverClearButton] = useState(false);
	const [hoverEdge, setHoverEdge] = useState(false);

	const timeValues = useMemo(() => data?.data.map((p) => p.time) ?? [], [data]);

	const chartData: ChartData<"line"> = useMemo(() => {
		if (!data) return { datasets: [] };

		const downsampled = downsampleData(data.data, 2000);

		return {
			datasets: [
				{
					label: "Lewa noga",
					data: downsampled.map((p) => ({ x: p.time, y: p.left })),
					borderColor: CHART_COLORS.left.border,
					backgroundColor: CHART_COLORS.left.bg,
					borderWidth: 1.5,
					pointRadius: 0,
					tension: 0.2,
					order: 2,
					hidden: true,
				},
				{
					label: "Prawa noga",
					data: downsampled.map((p) => ({ x: p.time, y: p.right })),
					borderColor: CHART_COLORS.right.border,
					backgroundColor: CHART_COLORS.right.bg,
					borderWidth: 1.5,
					pointRadius: 0,
					tension: 0.2,
					order: 2,
					hidden: true,
				},
				{
					label: "Siła wypadkowa (L+P)",
					data: downsampled.map((p) => ({ x: p.time, y: p.left + p.right })),
					borderColor: CHART_COLORS.combined.border,
					backgroundColor: CHART_COLORS.combined.bg,
					borderWidth: 2.5,
					pointRadius: 0,
					tension: 0.2,
					fill: true,
					order: 1,
				},
			],
		};
	}, [data]);

	// Stabilize refs for plugin access
	const selectionsRef = useRef(selections);
	selectionsRef.current = selections;
	const onSelectionRemoveRef = useRef(onSelectionRemove);
	onSelectionRemoveRef.current = onSelectionRemove;
	const onSelectionUpdateRef = useRef(onSelectionUpdate);
	onSelectionUpdateRef.current = onSelectionUpdate;

	const selectionOverlayPlugin = useMemo<Plugin<"line">>(
		() => ({
			id: "combinedSelectionOverlay",
			afterDraw: (chart) => {
				const scale = chart.scales.x;
				if (!scale) return;
				const { ctx, chartArea } = chart;
				ctx.save();

				const buttons: Array<{ id: string; x: number; y: number; radius: number }> = [];

				// Draw committed selections
				const currentSelections = selectionsRef.current;
				for (let i = 0; i < currentSelections.length; i++) {
					const sel = currentSelections[i];
					const color = getSelectionColor(i);
					const x1 = scale.getPixelForValue(sel.startTime);
					const x2 = scale.getPixelForValue(sel.endTime);

					ctx.fillStyle = color.bg;
					ctx.strokeStyle = color.border;
					ctx.lineWidth = 2;
					ctx.fillRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);
					ctx.strokeRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);

					// Selection label
					ctx.fillStyle = color.border;
					ctx.font = "bold 11px sans-serif";
					ctx.textAlign = "center";
					ctx.fillText(`#${i + 1}`, (x1 + x2) / 2, chartArea.top + 14);

					// Close button
					const btnRadius = 8;
					const btnX = x2;
					const btnY = chartArea.top;

					buttons.push({ id: sel.id, x: btnX, y: btnY, radius: btnRadius * 1.5 });

					ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
					ctx.shadowBlur = 4;
					ctx.shadowOffsetX = 1;
					ctx.shadowOffsetY = 1;

					ctx.beginPath();
					ctx.arc(btnX, btnY, btnRadius, 0, 2 * Math.PI);
					ctx.fillStyle = "#fff";
					ctx.fill();

					ctx.shadowColor = "transparent";
					ctx.shadowBlur = 0;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;

					ctx.strokeStyle = color.border;
					ctx.lineWidth = 1.5;
					ctx.stroke();

					ctx.strokeStyle = color.border;
					ctx.lineWidth = 1.5;
					ctx.lineCap = "round";
					const crossSize = 4;
					ctx.beginPath();
					ctx.moveTo(btnX - crossSize, btnY - crossSize);
					ctx.lineTo(btnX + crossSize, btnY + crossSize);
					ctx.moveTo(btnX + crossSize, btnY - crossSize);
					ctx.lineTo(btnX - crossSize, btnY + crossSize);
					ctx.stroke();
				}

				clearButtonsRef.current = buttons;

				// Draw current in-progress selection (dashed)
				const draft = selectionRef.current;
				if (draft.start !== null && draft.end !== null) {
					const x1 = scale.getPixelForValue(Math.min(draft.start, draft.end));
					const x2 = scale.getPixelForValue(Math.max(draft.start, draft.end));

					ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
					ctx.strokeStyle = "#22c55e";
					ctx.lineWidth = 2;
					ctx.setLineDash([6, 3]);
					ctx.fillRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);
					ctx.strokeRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);
					ctx.setLineDash([]);
				}

				ctx.restore();
			},
		}),
		[],
	);

	// Sync zoom plugin modes via imperative update
	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;
		const zoomOpts = chart.options.plugins?.zoom;
		if (!zoomOpts?.zoom || !zoomOpts.pan) return;
		if (!zoomOpts.zoom.wheel || !zoomOpts.zoom.drag) return;

		const zoomEnabled = zoomReady && interactionMode === "zoom";
		const panEnabled = zoomReady && interactionMode === "pan";

		zoomOpts.zoom.wheel.enabled = zoomEnabled;
		zoomOpts.zoom.drag.enabled = zoomEnabled;
		zoomOpts.pan.enabled = panEnabled;

		chart.update("none");
	}, [interactionMode, zoomReady]);

	const options: ChartOptions<"line"> = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			resizeDelay: 100,
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
						text: "Czas (s)",
						font: { size: 13, weight: "bold" as const },
					},
					ticks: { maxTicksLimit: 20 },
				},
				y: {
					title: {
						display: true,
						text: "Siła (N)",
						font: { size: 13, weight: "bold" as const },
					},
				},
			},
			plugins: {
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
						label: (item) => `${item.dataset.label}: ${(item.parsed.y ?? 0).toFixed(2)} N`,
					},
				},
				decimation: {
					enabled: true,
					algorithm: "lttb" as const,
					samples: 2000,
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
		[],
	);

	// --- Edge detection for resize ---
	const getEdgeHit = useCallback(
		(mouseX: number, mouseY: number): { selectionId: string; edge: "start" | "end" } | null => {
			const chart = chartRef.current;
			if (!chart) return null;
			const scale = chart.scales.x;
			if (!scale) return null;
			const { top, bottom } = chart.chartArea;
			if (mouseY < top - 5 || mouseY > bottom + 5) return null;

			for (const sel of selectionsRef.current) {
				const x1 = scale.getPixelForValue(sel.startTime);
				const x2 = scale.getPixelForValue(sel.endTime);

				if (Math.abs(mouseX - x1) <= EDGE_THRESHOLD) {
					return { selectionId: sel.id, edge: "start" };
				}
				if (Math.abs(mouseX - x2) <= EDGE_THRESHOLD) {
					return { selectionId: sel.id, edge: "end" };
				}
			}
			return null;
		},
		[],
	);

	// --- Mouse handlers for selection ---
	const getMousePos = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
		const chart = chartRef.current;
		if (!chart) return null;
		const rect = chart.canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}, []);

	const getChartXValue = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
		const chart = chartRef.current;
		if (!chart) return undefined;
		const rect = chart.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		return chart.scales.x?.getValueForPixel(x);
	}, []);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			if (interactionMode !== "selection") return;

			const pos = getMousePos(event);
			if (!pos) return;

			// Check close button clicks
			for (const btn of clearButtonsRef.current) {
				const distance = Math.sqrt((pos.x - btn.x) ** 2 + (pos.y - btn.y) ** 2);
				if (distance <= btn.radius) {
					onSelectionRemoveRef.current(btn.id);
					return;
				}
			}

			// Check edge hit for resize
			const edgeHit = getEdgeHit(pos.x, pos.y);
			if (edgeHit) {
				dragModeRef.current = edgeHit.edge === "start" ? "resize-start" : "resize-end";
				resizeInfoRef.current = { selectionId: edgeHit.selectionId };
				setIsSelecting(true);
				return;
			}

			// Start new selection
			const xValue = getChartXValue(event);
			if (xValue === undefined || Number.isNaN(xValue)) return;

			dragModeRef.current = "create";
			selectionRef.current = { start: xValue, end: xValue };
			setIsSelecting(true);
			chartRef.current?.draw();
		},
		[getMousePos, getChartXValue, getEdgeHit, interactionMode],
	);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			if (interactionMode !== "selection") return;

			const pos = getMousePos(event);

			if (isSelecting) {
				const xValue = getChartXValue(event);
				if (xValue === undefined || Number.isNaN(xValue)) return;

				if (dragModeRef.current === "create") {
					// Update draft selection
					selectionRef.current = { ...selectionRef.current, end: xValue };
					chartRef.current?.draw();
				} else if (
					(dragModeRef.current === "resize-start" || dragModeRef.current === "resize-end") &&
					resizeInfoRef.current
				) {
					// Resize: update selectionsRef directly for immediate visual feedback
					const selId = resizeInfoRef.current.selectionId;
					const field = dragModeRef.current === "resize-start" ? "startTime" : "endTime";
					selectionsRef.current = selectionsRef.current.map((s) =>
						s.id === selId ? { ...s, [field]: xValue } : s,
					);
					chartRef.current?.draw();
				}
			} else if (pos) {
				// Not dragging: check hover states for cursor
				let overClear = false;
				for (const btn of clearButtonsRef.current) {
					const distance = Math.sqrt((pos.x - btn.x) ** 2 + (pos.y - btn.y) ** 2);
					if (distance <= btn.radius) {
						overClear = true;
						break;
					}
				}
				setHoverClearButton(overClear);

				if (!overClear) {
					const edgeHit = getEdgeHit(pos.x, pos.y);
					setHoverEdge(edgeHit !== null);
				} else {
					setHoverEdge(false);
				}
			}
		},
		[getMousePos, getChartXValue, getEdgeHit, interactionMode, isSelecting],
	);

	const handleMouseUp = useCallback(() => {
		if (interactionMode !== "selection" || !isSelecting) return;
		setIsSelecting(false);

		if (dragModeRef.current === "create") {
			const { start, end } = selectionRef.current;
			if (start !== null && end !== null && Math.abs(start - end) > 0.001) {
				onSelectionAdd(Math.min(start, end), Math.max(start, end), timeValues);
			}
			selectionRef.current = { start: null, end: null };
		} else if (
			(dragModeRef.current === "resize-start" || dragModeRef.current === "resize-end") &&
			resizeInfoRef.current
		) {
			// Commit resized selection to state
			const selId = resizeInfoRef.current.selectionId;
			const updated = selectionsRef.current.find((s) => s.id === selId);
			if (updated) {
				onSelectionUpdateRef.current(
					selId,
					Math.min(updated.startTime, updated.endTime),
					Math.max(updated.startTime, updated.endTime),
					timeValues,
				);
			}
		}

		dragModeRef.current = "none";
		resizeInfoRef.current = null;
		chartRef.current?.draw();
	}, [interactionMode, isSelecting, onSelectionAdd, timeValues]);

	// --- Toolbar ---
	const toolbarMode: ChartToolbarMode = useMemo(() => {
		return interactionMode === "selection" ? "select" : interactionMode;
	}, [interactionMode]);

	const handleModeChange = useCallback((mode: ChartToolbarMode) => {
		if (mode === "select") {
			setInteractionMode("selection");
		} else if (mode === "zoom" || mode === "pan") {
			setInteractionMode(mode);
		}
	}, []);

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
			if (hoverEdge) return "ew-resize";
			return "crosshair";
		}
		if (interactionMode === "zoom") return zoomReady ? "zoom-in" : "default";
		return zoomReady ? "grab" : "default";
	}, [interactionMode, zoomReady, hoverClearButton, hoverEdge]);

	const chartPlugins = useMemo(() => [selectionOverlayPlugin], [selectionOverlayPlugin]);

	return {
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
	};
}
