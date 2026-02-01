import type { ChartData, Chart as ChartJS, ChartOptions, Plugin } from "chart.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChartZoomPlugin } from "@/components/charts/hooks/use-chart-zoom-plugin";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";
import { findClosestIndex } from "../utils/range-controls";

type InteractionMode = "selection" | "zoom" | "pan";

interface UseRangeSelectorChartOptions {
	trial: ParsedForceData;
	trialName: string;
	chartColor: string;
	onRangeSelected: (range: SelectedRange) => void;
	onRangeCleared?: () => void;
}

export function useRangeSelectorChart({
	trial,
	trialName,
	chartColor,
	onRangeSelected,
	onRangeCleared,
}: UseRangeSelectorChartOptions) {
	const chartRef = useRef<ChartJS<"line">>(null);
	const chartWrapperRef = useRef<HTMLDivElement>(null);
	const [interactionMode, setInteractionMode] = useState<InteractionMode>("selection");
	const [isZoomed, setIsZoomed] = useState(false);
	const zoomReady = useChartZoomPlugin();
	const [selectionStart, setSelectionStart] = useState<number | null>(null);
	const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [dragMode, setDragMode] = useState<"none" | "start" | "end">("none");
	const [hoverEdge, setHoverEdge] = useState<"none" | "start" | "end">("none");
	const [hoverClearButton, setHoverClearButton] = useState(false);
	const selectionRef = useRef<{
		start: number | null;
		end: number | null;
	}>({
		start: null,
		end: null,
	});
	const lastSyncedRangeRef = useRef<SelectedRange | null>(null);

	const timeValues = useMemo(() => trial.data.map((point) => point.time), [trial.data]);

	useEffect(() => {
		if (!trial.selectedRange) {
			if (
				lastSyncedRangeRef.current ||
				selectionRef.current.start !== null ||
				selectionRef.current.end !== null
			) {
				lastSyncedRangeRef.current = null;
				selectionRef.current = {
					start: null,
					end: null,
				};
				setSelectionStart(null);
				setSelectionEnd(null);
				chartRef.current?.draw();
			}
			return;
		}

		const { startIndex, endIndex } = trial.selectedRange;
		const lastSynced = lastSyncedRangeRef.current;
		if (lastSynced && lastSynced.startIndex === startIndex && lastSynced.endIndex === endIndex) {
			return;
		}

		const startTime = trial.data[startIndex]?.time;
		const endTime = trial.data[endIndex]?.time;

		if (startTime !== undefined && endTime !== undefined) {
			lastSyncedRangeRef.current = {
				startIndex,
				endIndex,
			};
			selectionRef.current = {
				start: startTime,
				end: endTime,
			};
			setSelectionStart(startTime);
			setSelectionEnd(endTime);
			chartRef.current?.draw();
		}
	}, [trial.selectedRange, trial.data]);

	const chartData = useMemo<ChartData<"line">>(
		() => ({
			datasets: [
				{
					label: trialName,
					data: trial.data.map((point, idx) => ({
						x: point.time,
						y: trial.activeForce[idx],
					})),
					borderColor: chartColor,
					backgroundColor: `${chartColor}33`,
					borderWidth: 2,
					pointRadius: 0,
					tension: 0.2,
				},
			],
		}),
		[trial.data, trial.activeForce, trialName, chartColor],
	);

	const options = useMemo<ChartOptions<"line">>(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			// Debounce resize events - prevents lag during sidebar animation (200ms)
			resizeDelay: 250,
			animation: false,
			normalized: true,
			parsing: false,
			interaction: {
				mode: "nearest",
				intersect: false,
			},
			scales: {
				x: {
					type: "linear",
					title: {
						display: true,
						text: "Czas (s)",
					},
					grid: {
						color: "rgba(148, 163, 184, 0.2)",
					},
				},
				y: {
					title: {
						display: true,
						text: "Siła (N)",
					},
					grid: {
						color: "rgba(148, 163, 184, 0.2)",
					},
				},
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					callbacks: {
						title: (items) =>
							items.length > 0 ? `Czas: ${Number(items[0].parsed.x ?? 0).toFixed(3)}s` : "",
						label: (item) => {
							const value = item.parsed.y;
							if (typeof value !== "number") {
								return "Siła: -";
							}
							return `Siła: ${value.toFixed(2)} N`;
						},
					},
				},
				decimation: {
					enabled: true,
					algorithm: "lttb",
					samples: 1500,
				},
				zoom: {
					zoom: {
						wheel: {
							enabled: false,
						},
						pinch: {
							enabled: false,
						},
						drag: {
							enabled: false,
						},
						mode: "x",
						onZoomComplete: () => setIsZoomed(true),
					},
					pan: {
						enabled: false,
						mode: "x",
						onPanComplete: () => setIsZoomed(true),
					},
					limits: {
						x: {
							min: "original",
							max: "original",
						},
					},
				},
			},
		}),
		[],
	);

	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;

		const zoomOptions = chart.options.plugins?.zoom;
		if (!zoomOptions?.zoom || !zoomOptions.pan) return;
		if (!zoomOptions.zoom.wheel || !zoomOptions.zoom.pinch || !zoomOptions.zoom.drag) return;

		const zoomEnabled = zoomReady && interactionMode === "zoom";
		const panEnabled = zoomReady && interactionMode === "pan";

		zoomOptions.zoom.wheel.enabled = zoomEnabled;
		zoomOptions.zoom.pinch.enabled = zoomEnabled;
		zoomOptions.zoom.drag.enabled = zoomEnabled;
		zoomOptions.pan.enabled = panEnabled;

		chart.update("none");
	}, [interactionMode, zoomReady]);

	const clearButtonRef = useRef<{
		x: number;
		y: number;
		radius: number;
	} | null>(null);

	const selectionOverlayPlugin = useMemo<Plugin<"line">>(
		() => ({
			id: "rangeSelectionOverlay",
			afterDraw: (chart) => {
				const start = selectionRef.current.start;
				if (start === null) return;

				const scale = chart.scales.x;
				if (!scale) return;

				const end = selectionRef.current.end ?? start;
				const x1 = scale.getPixelForValue(Math.min(start, end));
				const x2 = scale.getPixelForValue(Math.max(start, end));

				const { ctx, chartArea } = chart;
				ctx.save();

				ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
				ctx.strokeStyle = "#22c55e";
				ctx.lineWidth = 2;
				ctx.fillRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);
				ctx.strokeRect(x1, chartArea.top, x2 - x1, chartArea.bottom - chartArea.top);

				if (end !== start) {
					const buttonRadius = 8;
					const buttonX = x2;
					const buttonY = chartArea.top;

					clearButtonRef.current = {
						x: buttonX,
						y: buttonY,
						radius: buttonRadius * 1.5,
					};

					ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
					ctx.shadowBlur = 4;
					ctx.shadowOffsetX = 1;
					ctx.shadowOffsetY = 1;

					ctx.beginPath();
					ctx.arc(buttonX, buttonY, buttonRadius, 0, 2 * Math.PI);
					ctx.fillStyle = "#fff";
					ctx.fill();

					ctx.shadowColor = "transparent";
					ctx.shadowBlur = 0;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;

					ctx.strokeStyle = "#22c55e";
					ctx.lineWidth = 1.5;
					ctx.stroke();

					ctx.strokeStyle = "#22c55e";
					ctx.lineWidth = 1.5;
					ctx.lineCap = "round";
					const crossSize = 4;

					ctx.beginPath();
					ctx.moveTo(buttonX - crossSize, buttonY - crossSize);
					ctx.lineTo(buttonX + crossSize, buttonY + crossSize);
					ctx.moveTo(buttonX + crossSize, buttonY - crossSize);
					ctx.lineTo(buttonX - crossSize, buttonY + crossSize);
					ctx.stroke();
				} else {
					clearButtonRef.current = null;
				}

				ctx.restore();
			},
		}),
		[],
	);

	const getChartXValue = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
		const chart = chartRef.current;
		if (!chart) return undefined;

		const rect = chart.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		return chart.scales.x.getValueForPixel(x);
	}, []);

	const getChartPixelX = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
		const chart = chartRef.current;
		if (!chart) return undefined;

		const rect = chart.canvas.getBoundingClientRect();
		return event.clientX - rect.left;
	}, []);

	const getEdgeHit = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			const start = selectionRef.current.start;
			const end = selectionRef.current.end;
			if (start === null || end === null) return "none";

			const chart = chartRef.current;
			if (!chart) return "none";

			const pixelX = getChartPixelX(event);
			if (pixelX === undefined) return "none";

			const scale = chart.scales.x;
			const x1Value = Math.min(start, end);
			const x2Value = Math.max(start, end);
			const x1Pixel = scale.getPixelForValue(x1Value);
			const x2Pixel = scale.getPixelForValue(x2Value);
			const hitbox = 8;

			if (Math.abs(pixelX - x1Pixel) <= hitbox) return "start";
			if (Math.abs(pixelX - x2Pixel) <= hitbox) return "end";
			return "none";
		},
		[getChartPixelX],
	);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			if (interactionMode !== "selection") return;

			const chart = chartRef.current;
			if (chart && clearButtonRef.current) {
				const rect = chart.canvas.getBoundingClientRect();
				const clickX = event.clientX - rect.left;
				const clickY = event.clientY - rect.top;

				const { x, y, radius } = clearButtonRef.current;
				const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);

				if (distance <= radius) {
					setSelectionStart(null);
					setSelectionEnd(null);
					selectionRef.current = {
						start: null,
						end: null,
					};
					lastSyncedRangeRef.current = null;
					setHoverEdge("none");
					clearButtonRef.current = null;
					chartRef.current?.draw();
					onRangeCleared?.();
					return;
				}
			}

			const edgeHit = getEdgeHit(event);
			if (edgeHit !== "none") {
				setDragMode(edgeHit);
				setIsSelecting(true);
				setHoverEdge("none");
				return;
			}

			const xValue = getChartXValue(event);
			if (xValue === undefined || Number.isNaN(xValue)) return;

			setSelectionStart(xValue);
			setSelectionEnd(xValue);
			selectionRef.current = {
				start: xValue,
				end: xValue,
			};
			setIsSelecting(true);
			setHoverEdge("none");
			setHoverClearButton(false);
			chartRef.current?.draw();
		},
		[getChartXValue, getEdgeHit, interactionMode, onRangeCleared],
	);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			if (interactionMode !== "selection") return;

			const chart = chartRef.current;
			if (chart && clearButtonRef.current) {
				const rect = chart.canvas.getBoundingClientRect();
				const mouseX = event.clientX - rect.left;
				const mouseY = event.clientY - rect.top;

				const { x, y, radius } = clearButtonRef.current;
				const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

				setHoverClearButton(distance <= radius);
			} else {
				setHoverClearButton(false);
			}

			if (!isSelecting) {
				setHoverEdge(getEdgeHit(event));
				return;
			}

			const xValue = getChartXValue(event);
			if (xValue === undefined || Number.isNaN(xValue)) return;

			if (dragMode === "start") {
				selectionRef.current = {
					start: xValue,
					end: selectionRef.current.end,
				};
				setSelectionStart(xValue);
				chartRef.current?.draw();
				return;
			}

			if (dragMode === "end") {
				selectionRef.current = {
					start: selectionRef.current.start,
					end: xValue,
				};
				setSelectionEnd(xValue);
				chartRef.current?.draw();
				return;
			}

			setSelectionEnd(xValue);
			selectionRef.current = {
				start: selectionRef.current.start,
				end: xValue,
			};
			chartRef.current?.draw();
		},
		[dragMode, getChartXValue, getEdgeHit, interactionMode, isSelecting],
	);

	const handleMouseUp = useCallback(() => {
		if (interactionMode !== "selection") return;
		setIsSelecting(false);
		setDragMode("none");
		setHoverEdge("none");
		setHoverClearButton(false);

		if (selectionStart !== null && selectionEnd !== null) {
			const rangeStart = Math.min(selectionStart, selectionEnd);
			const rangeEnd = Math.max(selectionStart, selectionEnd);

			const startIndex = findClosestIndex(timeValues, rangeStart);
			const endIndex = findClosestIndex(timeValues, rangeEnd);
			const normalizedStart = Math.min(startIndex, endIndex);
			const normalizedEnd = Math.max(startIndex, endIndex);

			if (normalizedStart !== normalizedEnd) {
				onRangeSelected({
					startIndex: normalizedStart,
					endIndex: normalizedEnd,
				});
			}
		}
	}, [interactionMode, selectionStart, selectionEnd, timeValues, onRangeSelected]);

	const handleZoomIn = useCallback(() => {
		if (!zoomReady) return;
		const zoomChart = chartRef.current as
			| (ChartJS<"line"> & {
					zoom: (amount: number) => void;
			  })
			| null;
		if (!zoomChart?.zoom) return;
		zoomChart.zoom(1.2);
		setIsZoomed(true);
	}, [zoomReady]);

	const handleZoomOut = useCallback(() => {
		if (!zoomReady) return;
		const zoomChart = chartRef.current as
			| (ChartJS<"line"> & {
					zoom: (amount: number) => void;
			  })
			| null;
		if (!zoomChart?.zoom) return;
		zoomChart.zoom(0.8);
		setIsZoomed(true);
	}, [zoomReady]);

	const handleResetZoom = useCallback(() => {
		if (!zoomReady) return;
		const zoomChart = chartRef.current as
			| (ChartJS<"line"> & {
					resetZoom: () => void;
			  })
			| null;
		zoomChart?.resetZoom();
		setIsZoomed(false);
	}, [zoomReady]);

	return {
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		selectionOverlayPlugin,
		interactionMode,
		setInteractionMode,
		isZoomed,
		zoomReady,
		selectionStart,
		selectionEnd,
		dragMode,
		hoverEdge,
		hoverClearButton,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
	};
}
