"use client";

import { Hand, MousePointer2, ZoomIn } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
	CartesianGrid,
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

interface RangeSelectorProps {
	trial: ParsedForceData;
	trialName: string;
	chartColor: string;
	onRangeSelected: (range: SelectedRange) => void;
}

interface ChartDataPoint {
	time: number;
	force: number;
}

type InteractionMode = "selection" | "zoom" | "pan";

export function RangeSelector({
	trial,
	trialName,
	chartColor,
	onRangeSelected,
}: RangeSelectorProps) {
	const [interactionMode, setInteractionMode] =
		useState<InteractionMode>("selection");
	const [selectionStart, setSelectionStart] = useState<number | null>(null);
	const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [dragMode, setDragMode] = useState<"none" | "start" | "end" | "move">(
		"none",
	);
	const [dragStartValue, setDragStartValue] = useState<number>(0);
	const [initialStart, setInitialStart] = useState<number>(0);
	const [initialEnd, setInitialEnd] = useState<number>(0);
	const [zoomStart, setZoomStart] = useState<number | null>(null);
	const [zoomEnd, setZoomEnd] = useState<number | null>(null);
	const [zoomAreaStart, setZoomAreaStart] = useState<number | null>(null);
	const [zoomAreaEnd, setZoomAreaEnd] = useState<number | null>(null);
	const [panStart, setPanStart] = useState<number | null>(null);
	const chartRef = useRef<HTMLDivElement>(null);
	const lastTouchDistanceRef = useRef<number>(0);

	const chartData: ChartDataPoint[] = trial.data.map((point, idx) => ({
		time: point.time,
		force: trial.activeForce[idx],
	}));

	const displayData = useMemo(() => {
		if (zoomStart === null || zoomEnd === null) {
			return chartData;
		}
		const start = Math.min(zoomStart, zoomEnd);
		const end = Math.max(zoomStart, zoomEnd);
		return chartData.filter(
			(d: ChartDataPoint) => d.time >= start && d.time <= end,
		);
	}, [chartData, zoomStart, zoomEnd]);

	const handleConfirmSelection = useCallback(() => {
		if (selectionStart !== null && selectionEnd !== null) {
			const startTime = Math.min(selectionStart, selectionEnd);
			const endTime = Math.max(selectionStart, selectionEnd);

			let startIndex = 0;
			let endIndex = trial.data.length - 1;

			for (let i = 0; i < trial.data.length; i++) {
				if (trial.data[i].time >= startTime) {
					startIndex = i;
					break;
				}
			}

			for (let i = trial.data.length - 1; i >= 0; i--) {
				if (trial.data[i].time <= endTime) {
					endIndex = i;
					break;
				}
			}

			onRangeSelected({ startIndex, endIndex });
		}
	}, [selectionStart, selectionEnd, trial.data, onRangeSelected]);

	const handleMouseDown = useCallback(
		(e: unknown) => {
			if (
				e &&
				typeof e === "object" &&
				"activeLabel" in e &&
				e.activeLabel !== undefined &&
				typeof e.activeLabel === "number"
			) {
				const clickX = e.activeLabel as number;

				// Tryb Zoom - zaznacz obszar do przybliżenia
				if (interactionMode === "zoom") {
					setZoomAreaStart(clickX);
					setZoomAreaEnd(null);
					setIsSelecting(true);
					return;
				}

				// Tryb Panning - rozpocznij przesuwanie
				if (interactionMode === "pan") {
					setPanStart(clickX);
					setIsSelecting(true);
					return;
				}

				// Tryb Selection - obsługa zaznaczenia i manipulacji
				if (selectionStart !== null && selectionEnd !== null) {
					const start = Math.min(selectionStart, selectionEnd);
					const end = Math.max(selectionStart, selectionEnd);
					const range = end - start;
					const handleSize = range * 0.05;
					const middleStart = start + range * 0.2;
					const middleEnd = end - range * 0.2;

					if (
						Math.abs(clickX - start) <= handleSize ||
						(clickX >= start && clickX <= start + handleSize)
					) {
						setDragMode("start");
						setDragStartValue(clickX);
						setInitialStart(start);
						setInitialEnd(end);
						return;
					}

					if (
						Math.abs(clickX - end) <= handleSize ||
						(clickX >= end - handleSize && clickX <= end)
					) {
						setDragMode("end");
						setDragStartValue(clickX);
						setInitialStart(start);
						setInitialEnd(end);
						return;
					}

					if (clickX >= middleStart && clickX <= middleEnd) {
						setDragMode("move");
						setDragStartValue(clickX);
						setInitialStart(start);
						setInitialEnd(end);
						return;
					}
				}

				setSelectionStart(clickX);
				setSelectionEnd(null);
				setIsSelecting(true);
				setDragMode("none");
			}
		},
		[selectionStart, selectionEnd, interactionMode],
	);

	const handleMouseMove = useCallback(
		(e: unknown) => {
			if (
				!e ||
				typeof e !== "object" ||
				!("activeLabel" in e) ||
				e.activeLabel === undefined ||
				typeof e.activeLabel !== "number"
			)
				return;

			const currentX = e.activeLabel as number;

			// Tryb Zoom - rysuj obszar do przybliżenia
			if (interactionMode === "zoom" && isSelecting && zoomAreaStart !== null) {
				setZoomAreaEnd(currentX);
				return;
			}

			// Tryb Panning - przesuń widok
			if (interactionMode === "pan" && isSelecting && panStart !== null) {
				const delta = currentX - panStart;
				const currentStart = zoomStart ?? chartData[0].time;
				const currentEnd = zoomEnd ?? chartData[chartData.length - 1].time;
				const minTime = chartData[0].time;
				const maxTime = chartData[chartData.length - 1].time;

				const newStart = Math.max(minTime, currentStart - delta);
				const newEnd = Math.min(maxTime, currentEnd - delta);

				// Zapewnij że zakres się nie zmienia podczas przesuwania
				const range = currentEnd - currentStart;
				if (newStart >= minTime && newEnd <= maxTime) {
					setZoomStart(newStart);
					setZoomEnd(newStart + range);
					setPanStart(currentX);
				}
				return;
			}

			// Tryb Selection - standardowa obsługa
			if (isSelecting) {
				setSelectionEnd(currentX);
				return;
			}

			if (dragMode === "start") {
				setSelectionStart(currentX);
				setSelectionEnd(initialEnd);
				return;
			}

			if (dragMode === "end") {
				setSelectionStart(initialStart);
				setSelectionEnd(currentX);
				return;
			}

			if (dragMode === "move") {
				const delta = currentX - dragStartValue;
				setSelectionStart(initialStart + delta);
				setSelectionEnd(initialEnd + delta);
				return;
			}
		},
		[
			isSelecting,
			dragMode,
			dragStartValue,
			initialStart,
			initialEnd,
			interactionMode,
			zoomAreaStart,
			panStart,
			zoomStart,
			zoomEnd,
			chartData,
		],
	);

	const handleMouseUp = useCallback(() => {
		// Tryb Zoom - zastosuj przybliżenie do zaznaczonego obszaru
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
			setIsSelecting(false);
			return;
		}

		// Tryb Panning - zakończ przesuwanie
		if (interactionMode === "pan") {
			setPanStart(null);
			setIsSelecting(false);
			return;
		}

		// Tryb Selection - standardowa obsługa
		setIsSelecting(false);

		if (
			dragMode !== "none" &&
			selectionStart !== null &&
			selectionEnd !== null
		) {
			handleConfirmSelection();
		}

		setDragMode("none");
	}, [
		dragMode,
		selectionStart,
		selectionEnd,
		handleConfirmSelection,
		interactionMode,
		zoomAreaStart,
		zoomAreaEnd,
	]);

	const handleClearSelection = useCallback(() => {
		setSelectionStart(null);
		setSelectionEnd(null);
		setIsSelecting(false);
	}, []);

	const handleZoomIn = useCallback(() => {
		if (!chartData.length) return;

		const currentStart = zoomStart ?? chartData[0].time;
		const currentEnd = zoomEnd ?? chartData[chartData.length - 1].time;
		const currentRange = currentEnd - currentStart;
		const zoomAmount = currentRange * 0.2;

		const newStart = currentStart + zoomAmount / 2;
		const newEnd = currentEnd - zoomAmount / 2;

		if (newEnd > newStart) {
			setZoomStart(newStart);
			setZoomEnd(newEnd);
		}
	}, [zoomStart, zoomEnd, chartData]);

	const handleZoomOut = useCallback(() => {
		if (!chartData.length) return;

		const currentStart = zoomStart ?? chartData[0].time;
		const currentEnd = zoomEnd ?? chartData[chartData.length - 1].time;
		const currentRange = currentEnd - currentStart;
		const zoomAmount = currentRange * 0.25;

		const minTime = chartData[0].time;
		const maxTime = chartData[chartData.length - 1].time;

		const newStart = Math.max(minTime, currentStart - zoomAmount / 2);
		const newEnd = Math.min(maxTime, currentEnd + zoomAmount / 2);

		setZoomStart(newStart);
		setZoomEnd(newEnd);
	}, [zoomStart, zoomEnd, chartData]);

	const getRefAreaProps = () => {
		// Tryb zoom - pokaż obszar do przybliżenia
		if (interactionMode === "zoom" && zoomAreaStart !== null) {
			const x1 = zoomAreaStart;
			const x2 = zoomAreaEnd ?? zoomAreaStart;
			return {
				x1: Math.min(x1, x2),
				x2: Math.max(x1, x2),
				fill: "#10b981",
				fillOpacity: 0.2,
			};
		}

		// Tryb selection - pokaż zaznaczony zakres
		if (interactionMode === "selection" && selectionStart !== null) {
			const x1 = selectionStart;
			const x2 = selectionEnd ?? selectionStart;
			return {
				x1: Math.min(x1, x2),
				x2: Math.max(x1, x2),
				fill: chartColor,
				fillOpacity: 0.2,
			};
		}

		return null;
	};

	const refAreaProps = getRefAreaProps();

	const getCursorStyle = () => {
		if (interactionMode === "zoom")
			return isSelecting ? "crosshair" : "zoom-in";
		if (interactionMode === "pan") return isSelecting ? "grabbing" : "grab";
		if (isSelecting || dragMode !== "none") return "grabbing";
		if (selectionStart !== null && selectionEnd !== null) return "grab";
		return "crosshair";
	};

	const handleZoom = (e: React.WheelEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!chartData.length || !chartRef.current) return;

		const currentStart = zoomStart ?? chartData[0].time;
		const currentEnd = zoomEnd ?? chartData[chartData.length - 1].time;
		const currentRange = currentEnd - currentStart;

		// Shift+Scroll = panning (przewijanie)
		if (e.shiftKey) {
			const panFactor = 0.1;
			const direction = e.deltaY < 0 ? -1 : 1;
			const panAmount = currentRange * panFactor * direction;

			const minTime = chartData[0].time;
			const maxTime = chartData[chartData.length - 1].time;

			let newStart = currentStart + panAmount;
			let newEnd = currentEnd + panAmount;

			// Ogranicz panning do granic danych
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
		// Normalne scroll = zoom
		const zoomFactor = e.ctrlKey ? 0.05 : 0.1; // Touchpad pinch jest często z Ctrl
		const direction = e.deltaY < 0 ? 1 : -1;
		const zoomAmount = currentRange * zoomFactor * direction;

		const chartRect = chartRef.current.getBoundingClientRect();
		const mouseX = e.clientX - chartRect.left;
		const chartWidth = chartRect.width;
		const mousePercentage = mouseX / chartWidth;

		const newStart = currentStart + zoomAmount * mousePercentage;
		const newEnd = currentEnd - zoomAmount * (1 - mousePercentage);

		const minTime = chartData[0].time;
		const maxTime = chartData[chartData.length - 1].time;

		if (newStart >= minTime && newEnd <= maxTime && newEnd > newStart) {
			setZoomStart(newStart);
			setZoomEnd(newEnd);
		}
	};

	const handleResetZoom = () => {
		setZoomStart(null);
		setZoomEnd(null);
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.touches.length !== 2 || !chartData.length || !chartRef.current)
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

			const currentStart = zoomStart ?? chartData[0].time;
			const currentEnd = zoomEnd ?? chartData[chartData.length - 1].time;
			const currentRange = currentEnd - currentStart;
			const zoomAmount =
				(currentRange * zoomFactor * direction * Math.abs(distanceDiff)) / 10;

			const chartRect = chartRef.current.getBoundingClientRect();
			const centerX = (touch1.clientX + touch2.clientX) / 2 - chartRect.left;
			const chartWidth = chartRect.width;
			const centerPercentage = centerX / chartWidth;

			const newStart = currentStart + zoomAmount * centerPercentage;
			const newEnd = currentEnd - zoomAmount * (1 - centerPercentage);

			const minTime = chartData[0].time;
			const maxTime = chartData[chartData.length - 1].time;

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

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-start gap-4">
					<div className="flex-1">
						<CardTitle>{trialName} - Wybierz zakres do analizy</CardTitle>
						<CardDescription>
							{interactionMode === "selection" &&
								"Tryb Zaznaczenia: Przeciągnij aby zaznaczyć zakres danych"}
							{interactionMode === "zoom" &&
								"Tryb Zoom: Przeciągnij aby przybliżyć do obszaru"}
							{interactionMode === "pan" &&
								"Tryb Panning: Przeciągnij aby przesunąć widok"}
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button
							variant={interactionMode === "selection" ? "default" : "outline"}
							onClick={() => setInteractionMode("selection")}
							size="sm"
							title="Tryb Zaznaczenia"
						>
							<MousePointer2 className="h-4 w-4" />
						</Button>
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
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div
						ref={chartRef}
						onWheel={handleZoom}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						style={{ touchAction: "none" }}
					>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart
								data={displayData}
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
								onMouseUp={handleMouseUp}
								style={{ cursor: getCursorStyle() }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="time"
									label={{
										value: "Czas (s)",
										position: "insideBottom",
										offset: -5,
									}}
									type="number"
									domain={["dataMin", "dataMax"]}
								/>
								<YAxis
									label={{
										value: "Siła (N)",
										angle: -90,
										position: "insideLeft",
									}}
								/>
								<Tooltip
									formatter={(value: unknown) => {
										if (typeof value === "number") {
											return [`${value.toFixed(1)} N`, "Siła"];
										}
										return [String(value), "Siła"];
									}}
									labelFormatter={(label) =>
										`Czas: ${Number(label).toFixed(3)}s`
									}
								/>
								<Line
									type="monotone"
									dataKey="force"
									stroke={chartColor}
									strokeWidth={2}
									dot={false}
									isAnimationActive={false}
								/>
								{refAreaProps && (
									<>
										<ReferenceArea
											x1={refAreaProps.x1}
											x2={refAreaProps.x2}
											strokeOpacity={0.3}
											fill={refAreaProps.fill || chartColor}
											fillOpacity={refAreaProps.fillOpacity || 0.2}
										/>
										{interactionMode === "selection" &&
											selectionStart !== null &&
											selectionEnd !== null && (
												<>
													<ReferenceLine
														x={refAreaProps.x1}
														stroke={chartColor}
														strokeWidth={3}
														label={{
															value: "◄",
															position: "insideTopLeft",
															fill: chartColor,
															fontSize: 16,
														}}
													/>
													<ReferenceLine
														x={refAreaProps.x2}
														stroke={chartColor}
														strokeWidth={3}
														label={{
															value: "►",
															position: "insideTopRight",
															fill: chartColor,
															fontSize: 16,
														}}
													/>
												</>
											)}
									</>
								)}
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className="flex gap-2 justify-end">
						{selectionStart !== null && (
							<>
								<Button variant="outline" onClick={handleClearSelection}>
									Wyczyść zaznaczenie
								</Button>
								<Button
									onClick={handleConfirmSelection}
									disabled={selectionEnd === null}
								>
									Potwierdź zakres
								</Button>
							</>
						)}
					</div>

					{trial.selectedRange && (
						<div className="text-sm text-muted-foreground">
							Wybrany zakres:{" "}
							{trial.data[trial.selectedRange.startIndex].time.toFixed(3)}s -{" "}
							{trial.data[trial.selectedRange.endIndex].time.toFixed(3)}s
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
