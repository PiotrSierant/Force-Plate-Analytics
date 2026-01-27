"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RangeControlsShiftProps {
	shiftInput: string;
	accent: "blue" | "rose";
	canShift: boolean;
	onShiftInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onShiftLeft: () => void;
	onShiftRight: () => void;
}

export function RangeControlsShift({
	shiftInput,
	accent,
	canShift,
	onShiftInputChange,
	onShiftLeft,
	onShiftRight,
}: RangeControlsShiftProps) {
	return (
		<div className="bg-card/80 p-5">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Przesuń cały zakres
				</span>
			</div>

			<div className="mb-3 flex items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={onShiftLeft}
					disabled={!canShift}
					className={cn(
						"h-9 w-9 rounded-l-md rounded-r-none border px-0",
						accent === "blue"
							? "border-blue-500/30 text-blue-500"
							: "border-rose-500/30 text-rose-500",
					)}
					title="Przesuń zakres w lewo"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<Input
					type="number"
					min={1}
					step={1}
					value={shiftInput}
					onChange={onShiftInputChange}
					placeholder="np. 25"
					className="h-9 flex-1 rounded-none border-y border-border/70 bg-background/50 text-center font-mono text-sm tabular-nums"
					aria-label="Przesunięcie całego zakresu w próbkach"
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={onShiftRight}
					disabled={!canShift}
					className={cn(
						"h-9 w-9 rounded-l-none rounded-r-md border px-0",
						accent === "blue"
							? "border-blue-500/30 text-blue-500"
							: "border-rose-500/30 text-rose-500",
					)}
					title="Przesuń zakres w prawo"
				>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
				próbki
			</div>
		</div>
	);
}
