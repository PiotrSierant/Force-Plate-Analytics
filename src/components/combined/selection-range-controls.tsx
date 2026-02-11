"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback } from "react";
import { formatTime } from "@/components/charts/utils/range-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ParsedForceData } from "@/lib/csvParser";
import { cn } from "@/lib/utils";
import { type CombinedSelection, getSelectionColor } from "./hooks/use-combined-selections";
import { useSelectionRangeControls } from "./hooks/use-selection-range-controls";

interface SelectionRangeControlsProps {
	data: ParsedForceData;
	selections: CombinedSelection[];
	onSelectionUpdate: (id: string, startTime: number, endTime: number, timeValues: number[]) => void;
	selectionLabels?: Map<string, string>;
}

export function SelectionRangeControls({
	data,
	selections,
	onSelectionUpdate,
	selectionLabels,
}: SelectionRangeControlsProps) {
	const {
		activeIds,
		activeSelections,
		controlStates,
		toggleSelection,
		updateControlField,
		adjustStart,
		adjustEnd,
		shiftRange,
		commitStartInput,
		commitEndInput,
	} = useSelectionRangeControls({ data, selections, onSelectionUpdate });

	if (selections.length === 0) return null;

	return (
		<div className="mt-6 space-y-4">
			{/* Badge list */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-xs font-medium text-muted-foreground mr-1">Zaznaczenia:</span>
				{selections.map((sel, i) => {
					const color = getSelectionColor(i);
					const active = activeIds.has(sel.id);
					return (
						<button
							key={sel.id}
							type="button"
							onClick={() => toggleSelection(sel.id)}
							className={cn(
								"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
								active
									? "border-current/20 bg-current/8 shadow-sm"
									: "border-border/50 bg-muted/30 text-muted-foreground opacity-60 hover:opacity-80",
							)}
							style={active ? { color: color.border, borderColor: `${color.border}30` } : undefined}
						>
							<span className="relative flex h-2 w-2">
								{active && (
									<span
										className="absolute inset-0 animate-ping rounded-full opacity-40"
										style={{ backgroundColor: color.border }}
									/>
								)}
								<span
									className={cn(
										"relative h-2 w-2 rounded-full",
										!active && "bg-muted-foreground/40",
									)}
									style={active ? { backgroundColor: color.border } : undefined}
								/>
							</span>
							{selectionLabels?.get(sel.id) || `#${i + 1}`}
						</button>
					);
				})}
			</div>

			{/* Range controls for active selections */}
			{activeSelections.map((sel, _i) => {
				const selIndex = selections.findIndex((s) => s.id === sel.id);
				const color = getSelectionColor(selIndex);
				const state = controlStates.get(sel.id);
				if (!state) return null;

				return (
					<SelectionRangePanel
						key={sel.id}
						selection={sel}
						selIndex={selIndex}
						label={selectionLabels?.get(sel.id) || `Zaznaczenie #${selIndex + 1}`}
						color={color}
						state={state}
						onStartInputChange={(value) => updateControlField(sel.id, "startInput", value)}
						onStartCommit={() => commitStartInput(sel.id)}
						onEndInputChange={(value) => updateControlField(sel.id, "endInput", value)}
						onEndCommit={() => commitEndInput(sel.id)}
						onStartShiftInputChange={(value) =>
							updateControlField(sel.id, "startShiftInput", value)
						}
						onEndShiftInputChange={(value) => updateControlField(sel.id, "endShiftInput", value)}
						onShiftInputChange={(value) => updateControlField(sel.id, "shiftInput", value)}
						onAdjustStart={(delta) => adjustStart(sel.id, delta)}
						onAdjustEnd={(delta) => adjustEnd(sel.id, delta)}
						onShiftRange={(delta) => shiftRange(sel.id, delta)}
					/>
				);
			})}
		</div>
	);
}

// --- Panel for a single selection ---

interface PanelState {
	startInput: string;
	endInput: string;
	shiftInput: string;
	startShiftInput: string;
	endShiftInput: string;
}

interface SelectionRangePanelProps {
	selection: CombinedSelection;
	selIndex: number;
	label: string;
	color: { border: string; bg: string };
	state: PanelState;
	onStartInputChange: (value: string) => void;
	onStartCommit: () => void;
	onEndInputChange: (value: string) => void;
	onEndCommit: () => void;
	onStartShiftInputChange: (value: string) => void;
	onEndShiftInputChange: (value: string) => void;
	onShiftInputChange: (value: string) => void;
	onAdjustStart: (delta: number) => void;
	onAdjustEnd: (delta: number) => void;
	onShiftRange: (delta: number) => void;
}

function SelectionRangePanel({
	selection,
	label,
	color,
	state,
	onStartInputChange,
	onStartCommit,
	onEndInputChange,
	onEndCommit,
	onStartShiftInputChange,
	onEndShiftInputChange,
	onShiftInputChange,
	onAdjustStart,
	onAdjustEnd,
	onShiftRange,
}: SelectionRangePanelProps) {
	const sampleCount = selection.endIndex - selection.startIndex;

	const shiftStep = parsePositiveInt(state.shiftInput);
	const startStep = parsePositiveInt(state.startShiftInput);
	const endStep = parsePositiveInt(state.endShiftInput);

	const handleStartKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") onStartCommit();
			if (e.key === "Escape") onStartInputChange(formatTime(selection.startTime));
		},
		[onStartCommit, onStartInputChange, selection.startTime],
	);

	const handleEndKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") onEndCommit();
			if (e.key === "Escape") onEndInputChange(formatTime(selection.endTime));
		},
		[onEndCommit, onEndInputChange, selection.endTime],
	);

	const accentStyle = { borderColor: `${color.border}30`, color: color.border };

	return (
		<div className="group relative">
			<div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-colors hover:border-border overflow-hidden">
				{/* Header */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
					<div className="flex items-center gap-3">
						<span className="relative flex h-2.5 w-2.5">
							<span
								className="absolute inset-0 rounded-full opacity-70 blur-sm"
								style={{ backgroundColor: color.border }}
							/>
							<span
								className="relative h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: color.border }}
							/>
						</span>
						<span className="text-sm font-semibold text-foreground">{label}</span>
					</div>
					<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
						<div className="flex items-center gap-2">
							<span>Zakres</span>
							<span className="font-mono text-foreground">{formatTime(selection.startTime)}s</span>
							<span className="text-muted-foreground/60">-</span>
							<span className="font-mono text-foreground">{formatTime(selection.endTime)}s</span>
						</div>
						<span
							className="rounded-full px-2.5 py-1 text-xs font-semibold"
							style={{
								backgroundColor: `${color.border}15`,
								color: color.border,
							}}
						>
							{sampleCount.toLocaleString()} próbek
						</span>
					</div>
				</div>

				{/* Controls grid */}
				<div className="grid gap-px bg-border/40 md:grid-cols-3">
					{/* Start */}
					<div className="bg-card/80 p-5">
						<div className="mb-3">
							<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
								Początek
							</span>
						</div>
						<div className="mb-3 flex items-center">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onAdjustStart(-1)}
								className="h-9 w-9 rounded-l-md rounded-r-none border-border/70 bg-secondary/30 px-0"
							>
								<Minus className="h-4 w-4" />
							</Button>
							<div className="flex h-9 flex-1 items-center gap-2 border-y border-border/70 bg-background/50 px-3">
								<Input
									value={state.startInput}
									onChange={(e: ChangeEvent<HTMLInputElement>) =>
										onStartInputChange(e.target.value)
									}
									onBlur={onStartCommit}
									onKeyDown={handleStartKeyDown}
									inputMode="decimal"
									className="h-7 border-0 bg-transparent px-0 text-center font-mono text-sm tabular-nums shadow-none focus-visible:ring-0"
									aria-label="Wartość początku w sekundach"
								/>
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">s</span>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onAdjustStart(1)}
								className="h-9 w-9 rounded-l-none rounded-r-md border-border/70 bg-secondary/30 px-0"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min={1}
								step={1}
								value={state.startShiftInput}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									onStartShiftInputChange(e.target.value)
								}
								placeholder="krok"
								className="h-8 w-20 text-center font-mono text-xs"
								aria-label="Krok dla początku"
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={() => startStep > 0 && onAdjustStart(-startStep)}
								disabled={startStep <= 0}
								className="h-8 w-8 px-0"
								style={accentStyle}
								title="Przesuń początek w lewo"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => startStep > 0 && onAdjustStart(startStep)}
								disabled={startStep <= 0}
								className="h-8 w-8 px-0"
								style={accentStyle}
								title="Przesuń początek w prawo"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Shift */}
					<div className="bg-card/80 p-5">
						<div className="mb-3">
							<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
								Przesuń cały zakres
							</span>
						</div>
						<div className="mb-3 flex items-center">
							<Button
								variant="outline"
								size="sm"
								onClick={() => shiftStep > 0 && onShiftRange(-shiftStep)}
								disabled={shiftStep <= 0}
								className="h-9 w-9 rounded-l-md rounded-r-none border px-0"
								style={accentStyle}
								title="Przesuń zakres w lewo"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<Input
								type="number"
								min={1}
								step={1}
								value={state.shiftInput}
								onChange={(e: ChangeEvent<HTMLInputElement>) => onShiftInputChange(e.target.value)}
								placeholder="np. 25"
								className="h-9 flex-1 rounded-none border-y border-border/70 bg-background/50 text-center font-mono text-sm tabular-nums"
								aria-label="Przesunięcie całego zakresu w próbkach"
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={() => shiftStep > 0 && onShiftRange(shiftStep)}
								disabled={shiftStep <= 0}
								className="h-9 w-9 rounded-l-none rounded-r-md border px-0"
								style={accentStyle}
								title="Przesuń zakres w prawo"
							>
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
							próbki
						</div>
					</div>

					{/* End */}
					<div className="bg-card/80 p-5">
						<div className="mb-3">
							<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
								Koniec
							</span>
						</div>
						<div className="mb-3 flex items-center">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onAdjustEnd(-1)}
								className="h-9 w-9 rounded-l-md rounded-r-none border-border/70 bg-secondary/30 px-0"
							>
								<Minus className="h-4 w-4" />
							</Button>
							<div className="flex h-9 flex-1 items-center gap-2 border-y border-border/70 bg-background/50 px-3">
								<Input
									value={state.endInput}
									onChange={(e: ChangeEvent<HTMLInputElement>) => onEndInputChange(e.target.value)}
									onBlur={onEndCommit}
									onKeyDown={handleEndKeyDown}
									inputMode="decimal"
									className="h-7 border-0 bg-transparent px-0 text-center font-mono text-sm tabular-nums shadow-none focus-visible:ring-0"
									aria-label="Wartość końca w sekundach"
								/>
								<span className="text-[10px] uppercase tracking-wide text-muted-foreground">s</span>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onAdjustEnd(1)}
								className="h-9 w-9 rounded-l-none rounded-r-md border-border/70 bg-secondary/30 px-0"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min={1}
								step={1}
								value={state.endShiftInput}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									onEndShiftInputChange(e.target.value)
								}
								placeholder="krok"
								className="h-8 w-20 text-center font-mono text-xs"
								aria-label="Krok dla końca"
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={() => endStep > 0 && onAdjustEnd(-endStep)}
								disabled={endStep <= 0}
								className="h-8 w-8 px-0"
								style={accentStyle}
								title="Przesuń koniec w lewo"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => endStep > 0 && onAdjustEnd(endStep)}
								disabled={endStep <= 0}
								className="h-8 w-8 px-0"
								style={accentStyle}
								title="Przesuń koniec w prawo"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function parsePositiveInt(value: string) {
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed)) return 0;
	return Math.abs(parsed);
}
