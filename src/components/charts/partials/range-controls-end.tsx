"use client";

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RangeControlsEndProps {
	endInput: string;
	endShiftInput: string;
	accent: "blue" | "rose";
	canShiftEnd: boolean;
	onEndInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onEndInputBlur: () => void;
	onEndInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
	onEndShiftInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onFineEndLeft: () => void;
	onFineEndRight: () => void;
	onShiftEndLeft: () => void;
	onShiftEndRight: () => void;
}

export function RangeControlsEnd({
	endInput,
	endShiftInput,
	accent,
	canShiftEnd,
	onEndInputChange,
	onEndInputBlur,
	onEndInputKeyDown,
	onEndShiftInputChange,
	onFineEndLeft,
	onFineEndRight,
	onShiftEndLeft,
	onShiftEndRight,
}: RangeControlsEndProps) {
	return (
		<div className="bg-card/80 p-5">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Koniec
				</span>
			</div>

			<div className="mb-3 flex items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={onFineEndLeft}
					className="h-9 w-9 rounded-l-md rounded-r-none border-border/70 bg-secondary/30 px-0"
				>
					<Minus className="h-4 w-4" />
				</Button>
				<div className="flex h-9 flex-1 items-center gap-2 border-y border-border/70 bg-background/50 px-3">
					<Input
						value={endInput}
						onChange={onEndInputChange}
						onBlur={onEndInputBlur}
						onKeyDown={onEndInputKeyDown}
						inputMode="decimal"
						className="h-7 border-0 bg-transparent px-0 text-center font-mono text-sm tabular-nums shadow-none focus-visible:ring-0"
						aria-label="Wartość końca w sekundach"
					/>
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">s</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={onFineEndRight}
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
					value={endShiftInput}
					onChange={onEndShiftInputChange}
					placeholder="krok"
					className="h-8 w-20 text-center font-mono text-xs"
					aria-label="Krok dla końca"
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={onShiftEndLeft}
					disabled={!canShiftEnd}
					className={cn(
						"h-8 w-8 px-0",
						accent === "blue"
							? "border-blue-500/30 text-blue-500"
							: "border-rose-500/30 text-rose-500",
					)}
					title="Przesuń koniec w lewo"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onShiftEndRight}
					disabled={!canShiftEnd}
					className={cn(
						"h-8 w-8 px-0",
						accent === "blue"
							? "border-blue-500/30 text-blue-500"
							: "border-rose-500/30 text-rose-500",
					)}
					title="Przesuń koniec w prawo"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
