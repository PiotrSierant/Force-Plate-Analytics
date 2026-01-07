"use client";

import { toJpeg, toPng, toSvg } from "html-to-image";
import { Download, Hand, ZoomIn } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceArea,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

interface ForceChartProps {
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	onUpdateRange1?: (range: SelectedRange) => void;
	onUpdateRange2?: (range: SelectedRange) => void;
}

interface AlignedDataPoint {
	time: number;
	trial1?: number;
	trial2?: number;
}

type InteractionMode = "selection" | "zoom" | "pan";

export function ForceChart({
	trial1,
	trial2,
	onUpdateRange1,
	onUpdateRange2,
}: ForceChartProps) {
	const [interactionMode, setInteractionMode] =
		useState<InteractionMode>("zoom");
	const [zoomStart, setZoomStart] = useState<number | null>(null);
	const [zoomEnd, setZoomEnd] = useState<number | null>(null);
	const [zoomAreaStart, setZoomAreaStart] = useState<number | null>(null);
	const [zoomAreaEnd, setZoomAreaEnd] = useState<number | null>(null);
	const [panStart, setPanStart] = useState<number | null>(null);
	const [isInteracting, setIsInteracting] = useState(false);
	const chartRef = useRef<HTMLDivElement>(null);
	const lastTouchDistanceRef = useRef<number>(0);

	// Align data from both trials starting from their selected ranges
	const fullAlignedData = alignTrialData(trial1, trial2);

	// Apply zoom filter
	const alignedData = useMemo(() => {
		if (zoomStart === null || zoomEnd === null) {
			return fullAlignedData;
		}
		const start = Math.min(zoomStart, zoomEnd);
		const end = Math.max(zoomStart, zoomEnd);
		return fullAlignedData.filter((d) => d.time >= start && d.time <= end);
	}, [fullAlignedData, zoomStart, zoomEnd]);

	if (!trial1?.selectedRange && !trial2?.selectedRange) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Porównanie Wybranych Zakresów</CardTitle>
					<CardDescription>
						Zaznacz zakresy na wykresach powyżej aby porównać dane
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-100 items-center justify-center text-zinc-500">
						Zaznacz zakresy w obu próbach aby zobaczyć porównanie
					</div>
				</CardContent>
			</Card>
		);
	}

	const handleZoom = (e: React.WheelEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!fullAlignedData.length || !chartRef.current) return;

		const currentStart = zoomStart ?? fullAlignedData[0].time;
		const currentEnd =
			zoomEnd ?? fullAlignedData[fullAlignedData.length - 1].time;
		const currentRange = currentEnd - currentStart;

		// Shift+Scroll = panning (przewijanie)
		if (e.shiftKey) {
			const panFactor = 0.1;
			const direction = e.deltaY < 0 ? -1 : 1;
			const panAmount = currentRange * panFactor * direction;

			const minTime = fullAlignedData[0].time;
			const maxTime = fullAlignedData[fullAlignedData.length - 1].time;

			let newStart = currentStart + panAmount;
			let newEnd = currentEnd + panAmount;

			if (newStart < minTime) {
				newEnd = newEnd - (newStart - minTime);
				newStart = minTime;
			}
			if (newEnd > maxTime) {
				newStart = newStart - (newEnd - maxTime);
				newEnd = maxTime;
			}

			if (newStart >= minTime && newEnd <= maxTime) {
				setZoomStart(newStart);
				setZoomEnd(newEnd);
			}
			return;
		}

		// Ctrl+Scroll = zoom (dla touchpada z pinch gesture)
		const zoomFactor = e.ctrlKey ? 0.05 : 0.1;
		const direction = e.deltaY < 0 ? 1 : -1;
		const zoomAmount = currentRange * zoomFactor * direction;

		const chartRect = chartRef.current.getBoundingClientRect();
		const mouseX = e.clientX - chartRect.left;
		const chartWidth = chartRect.width;
		const mousePercentage = mouseX / chartWidth;

		const newStart = currentStart + zoomAmount * mousePercentage;
		const newEnd = currentEnd - zoomAmount * (1 - mousePercentage);

		const minTime = fullAlignedData[0].time;
		const maxTime = fullAlignedData[fullAlignedData.length - 1].time;

		if (newStart >= minTime && newEnd <= maxTime && newEnd > newStart) {
			setZoomStart(newStart);
			setZoomEnd(newEnd);
		}
	};

	const handleMouseDown = (e: unknown) => {
		if (
			e &&
			typeof e === "object" &&
			"activeLabel" in e &&
			e.activeLabel !== undefined &&
			typeof e.activeLabel === "number"
		) {
			const clickX = e.activeLabel as number;

			if (interactionMode === "zoom") {
				setZoomAreaStart(clickX);
				setZoomAreaEnd(null);
				setIsInteracting(true);
				return;
			}

			if (interactionMode === "pan") {
				setPanStart(clickX);
				setIsInteracting(true);
				return;
			}
		}
	};

	const handleMouseMove = (e: unknown) => {
		if (
			!e ||
			typeof e !== "object" ||
			!("activeLabel" in e) ||
			e.activeLabel === undefined ||
			typeof e.activeLabel !== "number"
		)
			return;

		const currentX = e.activeLabel as number;

		if (interactionMode === "zoom" && isInteracting && zoomAreaStart !== null) {
			setZoomAreaEnd(currentX);
			return;
		}

		if (interactionMode === "pan" && isInteracting && panStart !== null) {
			const delta = currentX - panStart;
			const currentStart = zoomStart ?? fullAlignedData[0].time;
			const currentEnd =
				zoomEnd ?? fullAlignedData[fullAlignedData.length - 1].time;
			const minTime = fullAlignedData[0].time;
			const maxTime = fullAlignedData[fullAlignedData.length - 1].time;

			const range = currentEnd - currentStart;
			const newStart = Math.max(minTime, currentStart - delta);
			const newEnd = Math.min(maxTime, currentEnd - delta);

			if (newStart >= minTime && newEnd <= maxTime) {
				setZoomStart(newStart);
				setZoomEnd(newStart + range);
				setPanStart(currentX);
			}
			return;
		}
	};

	const handleMouseUp = () => {
		if (
			interactionMode === "zoom" &&
			zoomAreaStart !== null &&
			zoomAreaEnd !== null
		) {
			const start = Math.min(zoomAreaStart, zoomAreaEnd);
			const end = Math.max(zoomAreaStart, zoomAreaEnd);
			setZoomStart(start);
			setZoomEnd(end);
			setZoomAreaStart(null);
			setZoomAreaEnd(null);
			setIsInteracting(false);
			return;
		}

		if (interactionMode === "pan") {
			setPanStart(null);
			setIsInteracting(false);
			return;
		}

		setIsInteracting(false);
	};

	const handleZoomIn = () => {
		if (!fullAlignedData.length) return;

		const currentStart = zoomStart ?? fullAlignedData[0].time;
		const currentEnd =
			zoomEnd ?? fullAlignedData[fullAlignedData.length - 1].time;
		const currentRange = currentEnd - currentStart;
		const zoomAmount = currentRange * 0.2;

		const newStart = currentStart + zoomAmount / 2;
		const newEnd = currentEnd - zoomAmount / 2;

		if (newEnd > newStart) {
			setZoomStart(newStart);
			setZoomEnd(newEnd);
		}
	};

	const handleZoomOut = () => {
		if (!fullAlignedData.length) return;

		const currentStart = zoomStart ?? fullAlignedData[0].time;
		const currentEnd =
			zoomEnd ?? fullAlignedData[fullAlignedData.length - 1].time;
		const currentRange = currentEnd - currentStart;
		const zoomAmount = currentRange * 0.25;

		const minTime = fullAlignedData[0].time;
		const maxTime = fullAlignedData[fullAlignedData.length - 1].time;

		const newStart = Math.max(minTime, currentStart - zoomAmount / 2);
		const newEnd = Math.min(maxTime, currentEnd + zoomAmount / 2);

		setZoomStart(newStart);
		setZoomEnd(newEnd);
	};

	const getCursorStyle = () => {
		if (interactionMode === "zoom")
			return isInteracting ? "crosshair" : "zoom-in";
		if (interactionMode === "pan") return isInteracting ? "grabbing" : "grab";
		return "default";
	};

	const handleResetZoom = () => {
		setZoomStart(null);
		setZoomEnd(null);
	};

	const adjustRangeStart = (trialNumber: 1 | 2, delta: number) => {
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
	};

	const adjustRangeEnd = (trialNumber: 1 | 2, delta: number) => {
		const trial = trialNumber === 1 ? trial1 : trial2;
		const onUpdate = trialNumber === 1 ? onUpdateRange1 : onUpdateRange2;

		if (!trial?.selectedRange || !onUpdate) return;

		const newEndIndex = Math.min(
			trial.data.length - 1,
			trial.selectedRange.endIndex + delta,
		);
		if (newEndIndex > trial.selectedRange.startIndex) {
			onUpdate({
				startIndex: trial.selectedRange.startIndex,
				endIndex: newEndIndex,
			});
		}
	};

	const exportChartAsImage = async (format: "png" | "jpg" | "svg") => {
		if (!chartRef.current) return;

		try {
			const node = chartRef.current;

			const options = {
				backgroundColor: "#ffffff",
				pixelRatio: 2,
				cacheBust: true,
				style: {
					transform: "scale(1)",
					transformOrigin: "top left",
				},
			};

			let dataUrl: string;

			if (format === "svg") {
				dataUrl = await toSvg(node, options);
			} else if (format === "png") {
				dataUrl = await toPng(node, options);
			} else {
				dataUrl = await toJpeg(node, { ...options, quality: 0.95 });
			}

			// Download the image
			const link = document.createElement("a");
			link.download = `force-comparison-${new Date().toISOString().slice(0, 10)}.${format}`;
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error("Error exporting chart:", error);
			alert(`Błąd podczas eksportu: ${(error as Error).message}`);
		}
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.touches.length !== 2 || !fullAlignedData.length || !chartRef.current)
			return;

		const touch1 = e.touches[0];
		const touch2 = e.touches[1];
		const currentDistance = Math.hypot(
			touch1.clientX - touch2.clientX,
			touch1.clientY - touch2.clientY,
		);

		if (lastTouchDistanceRef.current > 0) {
			const distanceDiff = currentDistance - lastTouchDistanceRef.current;
			const zoomFactor = 0.01;
			const direction = distanceDiff > 0 ? 1 : -1;

			const currentStart = zoomStart ?? fullAlignedData[0].time;
			const currentEnd =
				zoomEnd ?? fullAlignedData[fullAlignedData.length - 1].time;
			const currentRange = currentEnd - currentStart;
			const zoomAmount =
				(currentRange * zoomFactor * direction * Math.abs(distanceDiff)) / 10;

			const chartRect = chartRef.current.getBoundingClientRect();
			const centerX = (touch1.clientX + touch2.clientX) / 2 - chartRect.left;
			const chartWidth = chartRect.width;
			const centerPercentage = centerX / chartWidth;

			const newStart = currentStart + zoomAmount * centerPercentage;
			const newEnd = currentEnd - zoomAmount * (1 - centerPercentage);

			const minTime = fullAlignedData[0].time;
			const maxTime = fullAlignedData[fullAlignedData.length - 1].time;

			if (newStart >= minTime && newEnd <= maxTime && newEnd > newStart) {
				setZoomStart(newStart);
				setZoomEnd(newEnd);
			}
		}

		lastTouchDistanceRef.current = currentDistance;
	};

	const handleTouchEnd = () => {
		lastTouchDistanceRef.current = 0;
	};

	const isZoomed = zoomStart !== null || zoomEnd !== null;

	// Determine chart title based on active legs
	const getChartTitle = () => {
		if (trial1 && trial2) {
			return `Porównanie Wybranych Zakresów`;
		}
		if (trial1) {
			return `Analiza Siły - Próba 1`;
		}
		return `Analiza Siły - Próba 2`;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-start gap-4">
					<div className="flex-1">
						<CardTitle>{getChartTitle()}</CardTitle>
						<CardDescription>
							{interactionMode === "zoom" &&
								"Tryb Zoom: Przeciągnij aby przybliżyć do obszaru"}
							{interactionMode === "pan" &&
								"Tryb Panning: Przeciągnij aby przesunąć widok"}
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button
							variant={interactionMode === "zoom" ? "default" : "outline"}
							onClick={() => setInteractionMode("zoom")}
							size="sm"
							title="Tryb Zoom"
						>
							<ZoomIn className="h-4 w-4" />
						</Button>
						<Button
							variant={interactionMode === "pan" ? "default" : "outline"}
							onClick={() => setInteractionMode("pan")}
							size="sm"
							title="Tryb Panning"
						>
							<Hand className="h-4 w-4" />
						</Button>
						<div className="border-l mx-1"></div>
						<Button
							variant="outline"
							onClick={handleZoomIn}
							size="sm"
							title="Przybliż"
						>
							+
						</Button>
						<Button
							variant="outline"
							onClick={handleZoomOut}
							size="sm"
							title="Oddal"
						>
							-
						</Button>
						<Button
							variant="outline"
							onClick={handleResetZoom}
							disabled={!isZoomed}
							size="sm"
							title="Reset Zoom"
						>
							Reset
						</Button>
						<div className="border-l mx-1"></div>
						<Button
							variant="outline"
							onClick={() => exportChartAsImage("png")}
							size="sm"
							title="Zapisz jako PNG"
						>
							<Download className="h-4 w-4 mr-1" />
							PNG
						</Button>
						<Button
							variant="outline"
							onClick={() => exportChartAsImage("jpg")}
							size="sm"
							title="Zapisz jako JPG"
						>
							<Download className="h-4 w-4 mr-1" />
							JPG
						</Button>
						<Button
							variant="outline"
							onClick={() => exportChartAsImage("svg")}
							size="sm"
							title="Zapisz jako SVG"
						>
							<Download className="h-4 w-4 mr-1" />
							SVG
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div
					ref={chartRef}
					onWheel={handleZoom}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					style={{ touchAction: "none" }}
				>
					<ResponsiveContainer width="100%" height={600}>
						<LineChart
							data={alignedData}
							margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							style={{ cursor: getCursorStyle() }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								className="stroke-zinc-200 dark:stroke-zinc-800"
							/>
							<XAxis
								dataKey="time"
								label={{
									value: "Czas (s)",
									position: "insideBottom",
									offset: -5,
								}}
								className="text-xs"
							/>
							<YAxis
								label={{
									value: "Siła (N)",
									angle: -90,
									position: "insideLeft",
								}}
								className="text-xs"
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(255, 255, 255, 0.95)",
									border: "1px solid #e4e4e7",
									borderRadius: "8px",
								}}
								labelFormatter={(value) => `Czas: ${Number(value).toFixed(3)}s`}
								formatter={(value) =>
									typeof value === "number" ? [`${value.toFixed(2)} N`] : ["-"]
								}
							/>
							<Legend />
							<ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

							{/* Zoom area selection */}
							{interactionMode === "zoom" && zoomAreaStart !== null && (
								<ReferenceArea
									x1={Math.min(zoomAreaStart, zoomAreaEnd ?? zoomAreaStart)}
									x2={Math.max(zoomAreaStart, zoomAreaEnd ?? zoomAreaStart)}
									strokeOpacity={0.3}
									fill="#10b981"
									fillOpacity={0.2}
								/>
							)}

							{trial1?.selectedRange && (
								<Line
									type="monotone"
									dataKey="trial1"
									stroke="#3b82f6"
									name={`Próba 1`}
									dot={false}
									strokeWidth={2.5}
									connectNulls
								/>
							)}

							{trial2?.selectedRange && (
								<Line
									type="monotone"
									dataKey="trial2"
									stroke="#ef4444"
									name={`Próba 2`}
									dot={false}
									strokeWidth={2.5}
									connectNulls
								/>
							)}
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Range Information and Controls */}
				<div className="mt-6 space-y-4">
					{trial1?.selectedRange && (
						<div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: "#3b82f6" }}
									></div>
									<span className="font-semibold text-blue-900 dark:text-blue-100">
										Próba 1
									</span>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">
											Start:
										</span>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeStart(1, -10)}
												className="h-7 px-2"
											>
												-
											</Button>
											<span className="text-sm font-mono w-24 text-center">
												{trial1.data[
													trial1.selectedRange.startIndex
												].time.toFixed(3)}
												s
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeStart(1, 10)}
												className="h-7 px-2"
											>
												+
											</Button>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">
											Stop:
										</span>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeEnd(1, -10)}
												className="h-7 px-2"
											>
												-
											</Button>
											<span className="text-sm font-mono w-24 text-center">
												{trial1.data[
													trial1.selectedRange.endIndex
												].time.toFixed(3)}
												s
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeEnd(1, 10)}
												className="h-7 px-2"
											>
												+
											</Button>
										</div>
									</div>
									<div className="text-sm text-zinc-600 dark:text-zinc-400">
										Długość:{" "}
										{trial1.selectedRange.endIndex -
											trial1.selectedRange.startIndex}{" "}
										próbek
									</div>
								</div>
							</div>
						</div>
					)}

					{trial2?.selectedRange && (
						<div className="p-4 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: "#ef4444" }}
									></div>
									<span className="font-semibold text-red-900 dark:text-red-100">
										Próba 2
									</span>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">
											Start:
										</span>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeStart(2, -10)}
												className="h-7 px-2"
											>
												-
											</Button>
											<span className="text-sm font-mono w-24 text-center">
												{trial2.data[
													trial2.selectedRange.startIndex
												].time.toFixed(3)}
												s
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeStart(2, 10)}
												className="h-7 px-2"
											>
												+
											</Button>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">
											Stop:
										</span>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeEnd(2, -10)}
												className="h-7 px-2"
											>
												-
											</Button>
											<span className="text-sm font-mono w-24 text-center">
												{trial2.data[
													trial2.selectedRange.endIndex
												].time.toFixed(3)}
												s
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => adjustRangeEnd(2, 10)}
												className="h-7 px-2"
											>
												+
											</Button>
										</div>
									</div>
									<div className="text-sm text-zinc-600 dark:text-zinc-400">
										Długość:{" "}
										{trial2.selectedRange.endIndex -
											trial2.selectedRange.startIndex}{" "}
										próbek
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Aligns data from two trials starting from their selected ranges.
 * Time is reset to 0 at the start of each selected range.
 * Data is also downsampled for better performance.
 * Uses only the active leg data from each trial.
 */
function alignTrialData(
	trial1?: ParsedForceData,
	trial2?: ParsedForceData,
): AlignedDataPoint[] {
	const result: AlignedDataPoint[] = [];

	// Create data points from active leg force for selected range
	const createTrialPoints = (trial: ParsedForceData) => {
		if (!trial.selectedRange) return [];

		const { startIndex, endIndex } = trial.selectedRange;
		const startTime = trial.data[startIndex].time;
		const activeForceSlice = trial.activeForce.slice(startIndex, endIndex + 1);
		const timeSlice = trial.data
			.slice(startIndex, endIndex + 1)
			.map((p) => p.time - startTime);

		return activeForceSlice.map((force, i) => ({
			time: timeSlice[i],
			force: force,
		}));
	};

	const trial1Points = trial1 ? createTrialPoints(trial1) : [];
	const trial2Points = trial2 ? createTrialPoints(trial2) : [];

	// Merge both datasets based on time alignment
	const allTimes = new Set<number>();
	trial1Points.forEach((d) => {
		allTimes.add(Number(d.time.toFixed(4)));
	});
	trial2Points.forEach((d) => {
		allTimes.add(Number(d.time.toFixed(4)));
	});

	const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);

	// For each time point, find the closest data point from each trial
	for (const time of sortedTimes) {
		const point: AlignedDataPoint = { time };

		// Find closest trial1 data point
		if (trial1Points.length > 0) {
			const closest1 = trial1Points.reduce((prev, curr) =>
				Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev,
			);
			if (Math.abs(closest1.time - time) < 0.01) {
				// Within 10ms
				point.trial1 = closest1.force;
			}
		}

		// Find closest trial2 data point
		if (trial2Points.length > 0) {
			const closest2 = trial2Points.reduce((prev, curr) =>
				Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev,
			);
			if (Math.abs(closest2.time - time) < 0.01) {
				// Within 10ms
				point.trial2 = closest2.force;
			}
		}

		result.push(point);
	}

	return result;
}
