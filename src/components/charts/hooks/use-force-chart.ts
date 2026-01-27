import type { ChartData, Chart as ChartJS, ChartOptions } from "chart.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChartZoomPlugin } from "@/components/charts/hooks/use-chart-zoom-plugin";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

type InteractionMode = "zoom" | "pan";

interface UseForceChartOptions {
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	ownerLabel?: string;
	datasetLabels?: {
		trial1: string;
		trial2: string;
	};
	onUpdateRange1?: (range: SelectedRange) => void;
	onUpdateRange2?: (range: SelectedRange) => void;
}

export function useForceChart({
	trial1,
	trial2,
	ownerLabel,
	datasetLabels,
	onUpdateRange1,
	onUpdateRange2,
}: UseForceChartOptions) {
	const chartRef = useRef<ChartJS<"line">>(null);
	const chartWrapperRef = useRef<HTMLDivElement>(null);
	const [interactionMode, setInteractionMode] = useState<InteractionMode>("zoom");
	const [isZoomed, setIsZoomed] = useState(false);
	const zoomBoundsRef = useRef<{
		min: number;
		max: number;
	} | null>(null);
	const zoomReady = useChartZoomPlugin();
	const chartData = useMemo(() => {
		const label1 = datasetLabels?.trial1 || "Próba 1";
		const label2 = datasetLabels?.trial2 || "Próba 2";
		const datasets: ChartData<"line">["datasets"] = [];

		const buildSeries = (trial: ParsedForceData) => {
			const range = trial.selectedRange;
			if (!range) return [];

			const { startIndex, endIndex } = range;
			const startTime = trial.data[startIndex]?.time ?? 0;

			return trial.data.slice(startIndex, endIndex + 1).map((point, idx) => ({
				x: point.time - startTime,
				y: trial.activeForce[startIndex + idx],
			}));
		};

		if (trial1?.selectedRange) {
			datasets.push({
				label: label1,
				data: buildSeries(trial1),
				borderColor: "#3b82f6",
				backgroundColor: "rgba(59, 130, 246, 0.15)",
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.25,
			});
		}

		if (trial2?.selectedRange) {
			datasets.push({
				label: label2,
				data: buildSeries(trial2),
				borderColor: "#ef4444",
				backgroundColor: "rgba(239, 68, 68, 0.15)",
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.25,
			});
		}

		return {
			datasets,
		};
	}, [datasetLabels, trial1, trial2]);

	const handleZoomComplete = useCallback(() => {
		const chart = chartRef.current;
		const scale = chart?.scales?.x;
		if (!scale) return;
		zoomBoundsRef.current = {
			min: scale.min,
			max: scale.max,
		};
		setIsZoomed(true);
	}, []);

	const handlePanComplete = useCallback(() => {
		const chart = chartRef.current;
		const scale = chart?.scales?.x;
		if (!scale) return;
		zoomBoundsRef.current = {
			min: scale.min,
			max: scale.max,
		};
		setIsZoomed(true);
	}, []);

	const options = useMemo<ChartOptions<"line">>(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
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
					display: true,
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
						onZoomComplete: handleZoomComplete,
					},
					pan: {
						enabled: false,
						mode: "x",
						onPanComplete: handlePanComplete,
					},
					limits: {
						x: {
							min: "original",
							max: "original",
						},
					},
				},
				ownerLabel: {
					text: ownerLabel?.trim() ?? "",
				},
			},
		}),
		[handlePanComplete, handleZoomComplete, ownerLabel],
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

	useEffect(() => {
		if (!isZoomed) {
			zoomBoundsRef.current = null;
			return;
		}

		const bounds = zoomBoundsRef.current;
		if (!bounds) return;

		const chart = chartRef.current;
		if (!chart) return;

		const xScaleOptions = chart.options.scales?.x;
		if (!xScaleOptions) return;

		xScaleOptions.min = bounds.min;
		xScaleOptions.max = bounds.max;
		chart.update("none");
	}, [isZoomed]);

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
		zoomBoundsRef.current = null;
		setIsZoomed(false);
	}, [zoomReady]);

	const adjustRangeStart = useCallback(
		(trialNumber: 1 | 2, delta: number) => {
			const trial = trialNumber === 1 ? trial1 : trial2;
			const onUpdate = trialNumber === 1 ? onUpdateRange1 : onUpdateRange2;

			if (!trial?.selectedRange || !onUpdate) return;

			const newStartIndex = Math.max(0, trial.selectedRange.startIndex + delta);
			if (newStartIndex < trial.selectedRange.endIndex) {
				onUpdate({
					startIndex: newStartIndex,
					endIndex: trial.selectedRange.endIndex,
				});
			}
		},
		[onUpdateRange1, onUpdateRange2, trial1, trial2],
	);

	const adjustRangeEnd = useCallback(
		(trialNumber: 1 | 2, delta: number) => {
			const trial = trialNumber === 1 ? trial1 : trial2;
			const onUpdate = trialNumber === 1 ? onUpdateRange1 : onUpdateRange2;

			if (!trial?.selectedRange || !onUpdate) return;

			const newEndIndex = Math.min(trial.data.length - 1, trial.selectedRange.endIndex + delta);
			if (newEndIndex > trial.selectedRange.startIndex) {
				onUpdate({
					startIndex: trial.selectedRange.startIndex,
					endIndex: newEndIndex,
				});
			}
		},
		[onUpdateRange1, onUpdateRange2, trial1, trial2],
	);

	const shiftRange = useCallback(
		(trialNumber: 1 | 2, delta: number) => {
			const trial = trialNumber === 1 ? trial1 : trial2;
			const onUpdate = trialNumber === 1 ? onUpdateRange1 : onUpdateRange2;

			if (!trial?.selectedRange || !onUpdate || delta === 0) return;

			const { startIndex, endIndex } = trial.selectedRange;
			const rangeLength = endIndex - startIndex;
			const maxStart = Math.max(0, trial.data.length - 1 - rangeLength);
			const desiredStart = startIndex + delta;
			const newStart = Math.min(Math.max(0, desiredStart), maxStart);
			const newEnd = newStart + rangeLength;

			if (newStart === startIndex && newEnd === endIndex) return;

			onUpdate({
				startIndex: newStart,
				endIndex: newEnd,
			});
		},
		[onUpdateRange1, onUpdateRange2, trial1, trial2],
	);

	const chartTitle = useMemo(() => {
		if (trial1 && trial2) {
			return "Porównanie Wybranych Zakresów";
		}
		if (trial1) {
			return "Analiza Siły - Próba 1";
		}
		return "Analiza Siły - Próba 2";
	}, [trial1, trial2]);

	const hasSelections = Boolean(trial1?.selectedRange || trial2?.selectedRange);

	return {
		chartRef,
		chartWrapperRef,
		chartData,
		options,
		interactionMode,
		setInteractionMode,
		isZoomed,
		zoomReady,
		handleZoomIn,
		handleZoomOut,
		handleResetZoom,
		adjustRangeStart,
		adjustRangeEnd,
		shiftRange,
		chartTitle,
		hasSelections,
	};
}
