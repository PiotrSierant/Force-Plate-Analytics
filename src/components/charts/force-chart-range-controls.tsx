"use client";

import type { ParsedForceData } from "@/lib/csvParser";
import { cn } from "@/lib/utils";
import { useRangeControls } from "./hooks/use-range-controls";
import { RangeControlsEnd } from "./partials/range-controls-end";
import { RangeControlsHeader } from "./partials/range-controls-header";
import { RangeControlsShift } from "./partials/range-controls-shift";
import { RangeControlsStart } from "./partials/range-controls-start";

interface RangeControlsProps {
	trial: ParsedForceData;
	trialNumber: 1 | 2;
	color: string;
	onAdjustStart: (delta: number) => void;
	onAdjustEnd: (delta: number) => void;
	onShiftRange: (delta: number) => void;
}

export function RangeControls({
	trial,
	trialNumber,
	color,
	onAdjustStart,
	onAdjustEnd,
	onShiftRange,
}: RangeControlsProps) {
	const {
		accent,
		accentBadge,
		canShift,
		canShiftEnd,
		canShiftStart,
		endInput,
		endShiftInput,
		endTime,
		handleEndCommit,
		handleEndInputChange,
		handleEndInputKeyDown,
		handleFineEndLeft,
		handleFineEndRight,
		handleShiftEndLeft,
		handleShiftEndRight,
		handleShiftLeft,
		handleShiftRight,
		handleShiftStartLeft,
		handleShiftStartRight,
		handleStartCommit,
		handleStartInputChange,
		handleStartInputKeyDown,
		handleFineStartLeft,
		handleFineStartRight,
		handleShiftInputChange,
		handleStartShiftInputChange,
		handleEndShiftInputChange,
		hasRange,
		sampleCount,
		shiftInput,
		startInput,
		startShiftInput,
		startTime,
	} = useRangeControls({
		trial,
		trialNumber,
		onAdjustStart,
		onAdjustEnd,
		onShiftRange,
	});

	if (!hasRange) return null;

	return (
		<div className="group relative">
			<div
				className={cn(
					"pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100",
				)}
			/>
			<div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-colors hover:border-border overflow-hidden">
				<RangeControlsHeader
					trialNumber={trialNumber}
					color={color}
					startTime={startTime}
					endTime={endTime}
					sampleCount={sampleCount}
					accentBadge={accentBadge}
				/>

				<div className="grid gap-px bg-border/40 md:grid-cols-3">
					<RangeControlsStart
						startInput={startInput}
						startShiftInput={startShiftInput}
						accent={accent}
						canShiftStart={canShiftStart}
						onStartInputChange={handleStartInputChange}
						onStartInputBlur={handleStartCommit}
						onStartInputKeyDown={handleStartInputKeyDown}
						onStartShiftInputChange={handleStartShiftInputChange}
						onFineStartLeft={handleFineStartLeft}
						onFineStartRight={handleFineStartRight}
						onShiftStartLeft={handleShiftStartLeft}
						onShiftStartRight={handleShiftStartRight}
					/>

					<RangeControlsShift
						shiftInput={shiftInput}
						accent={accent}
						canShift={canShift}
						onShiftInputChange={handleShiftInputChange}
						onShiftLeft={handleShiftLeft}
						onShiftRight={handleShiftRight}
					/>

					<RangeControlsEnd
						endInput={endInput}
						endShiftInput={endShiftInput}
						accent={accent}
						canShiftEnd={canShiftEnd}
						onEndInputChange={handleEndInputChange}
						onEndInputBlur={handleEndCommit}
						onEndInputKeyDown={handleEndInputKeyDown}
						onEndShiftInputChange={handleEndShiftInputChange}
						onFineEndLeft={handleFineEndLeft}
						onFineEndRight={handleFineEndRight}
						onShiftEndLeft={handleShiftEndLeft}
						onShiftEndRight={handleShiftEndRight}
					/>
				</div>
			</div>
		</div>
	);
}
