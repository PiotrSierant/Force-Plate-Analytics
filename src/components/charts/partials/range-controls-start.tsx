"use client";

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RangeControlsStartProps {
	startInput: string;
	startShiftInput: string;
	accent: "blue" | "rose";
	canShiftStart: boolean;
	onStartInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onStartInputBlur: () => void;
	onStartInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
	onStartShiftInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onFineStartLeft: () => void;
	onFineStartRight: () => void;
	onShiftStartLeft: () => void;
	onShiftStartRight: () => void;
}

export function RangeControlsStart({
	startInput,
	startShiftInput,
	accent,
	canShiftStart,
	onStartInputChange,
	onStartInputBlur,
	onStartInputKeyDown,
	onStartShiftInputChange,
	onFineStartLeft,
	onFineStartRight,
	onShiftStartLeft,
	onShiftStartRight,
}: RangeControlsStartProps) {
	return (
		<div className="bg-card/80 p-5">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Początek
				</span>
			</div>

			<div className="mb-3 flex items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={onFineStartLeft}
					className="h-9 w-9 rounded-l-md rounded-r-none border-border/70 bg-secondary/30 px-0"
				>
					<Minus className="h-4 w-4" />
				</Button>
				<div className="flex h-9 flex-1 items-center gap-2 border-y border-border/70 bg-background/50 px-3">
					<Input
						value={startInput}
						onChange={onStartInputChange}
						onBlur={onStartInputBlur}
						onKeyDown={onStartInputKeyDown}
						inputMode="decimal"
						className="h-7 border-0 bg-transparent px-0 text-center font-mono text-sm tabular-nums shadow-none focus-visible:ring-0"
						aria-label="Wartość początku w sekundach"
					/>
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">s</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={onFineStartRight}
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
					value={startShiftInput}
					onChange={onStartShiftInputChange}
					placeholder="krok"
					className="h-8 w-20 text-center font-mono text-xs"
					aria-label="Krok dla początku"
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={onShiftStartLeft}
					disabled={!canShiftStart}
					className={cn(
						"h-8 w-8 px-0",
						accent === "blue"
							? "border-blue-500/30 text-blue-500"
							: "border-rose-500/30 text-rose-500",
					)}
					title="Przesuń początek w lewo"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onShiftStartRight}
					disabled={!canShiftStart}
					className={cn(
						"h-8 w-8 px-0",
						accent === "blue"
							? "border-blue-500/30 text-blue-500"
							: "border-rose-500/30 text-rose-500",
					)}
					title="Przesuń początek w prawo"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
