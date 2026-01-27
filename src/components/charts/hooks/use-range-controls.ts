"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { ParsedForceData } from "@/lib/csvParser";
import { findClosestIndex, formatTime, parseStep, parseTimeInput } from "../utils/range-controls";

interface UseRangeControlsProps {
	trial: ParsedForceData;
	trialNumber: 1 | 2;
	onAdjustStart: (delta: number) => void;
	onAdjustEnd: (delta: number) => void;
	onShiftRange: (delta: number) => void;
}

export function useRangeControls({
	trial,
	trialNumber,
	onAdjustStart,
	onAdjustEnd,
	onShiftRange,
}: UseRangeControlsProps) {
	const [shiftInput, setShiftInput] = useState("25");
	const [startShiftInput, setStartShiftInput] = useState("10");
	const [endShiftInput, setEndShiftInput] = useState("10");
	const [startInput, setStartInput] = useState("0");
	const [endInput, setEndInput] = useState("0");

	const hasRange = Boolean(trial.selectedRange);
	const accent: "blue" | "rose" = trialNumber === 1 ? "blue" : "rose";
	const accentBadge =
		trialNumber === 1 ? "bg-blue-500/10 text-blue-500" : "bg-rose-500/10 text-rose-500";

	const startIndex = trial.selectedRange?.startIndex ?? 0;
	const endIndex = trial.selectedRange?.endIndex ?? 0;
	const startTime = trial.data[startIndex]?.time ?? 0;
	const endTime = trial.data[endIndex]?.time ?? 0;
	const sampleCount = hasRange ? endIndex - startIndex : 0;

	const timeValues = useMemo(() => trial.data.map((point) => point.time), [trial.data]);

	useEffect(() => {
		setStartInput(formatTime(startTime));
		setEndInput(formatTime(endTime));
	}, [startTime, endTime]);

	const shiftStep = parseStep(shiftInput);
	const startStep = parseStep(startShiftInput);
	const endStep = parseStep(endShiftInput);

	const canShift = shiftStep > 0;
	const canShiftStart = startStep > 0;
	const canShiftEnd = endStep > 0;
	const fineStep = 1;

	const handleStartCommit = () => {
		if (!hasRange) return;
		const parsed = parseTimeInput(startInput);
		if (parsed === null) {
			setStartInput(formatTime(startTime));
			return;
		}
		const newIndex = Math.min(findClosestIndex(timeValues, parsed), Math.max(0, endIndex - 1));
		if (newIndex !== startIndex) {
			onAdjustStart(newIndex - startIndex);
		}
		setStartInput(formatTime(trial.data[newIndex]?.time ?? startTime));
	};

	const handleEndCommit = () => {
		if (!hasRange) return;
		const parsed = parseTimeInput(endInput);
		if (parsed === null) {
			setEndInput(formatTime(endTime));
			return;
		}
		const newIndex = Math.max(
			findClosestIndex(timeValues, parsed),
			Math.min(trial.data.length - 1, startIndex + 1),
		);
		if (newIndex !== endIndex) {
			onAdjustEnd(newIndex - endIndex);
		}
		setEndInput(formatTime(trial.data[newIndex]?.time ?? endTime));
	};

	const handleStartInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") handleStartCommit();
		if (event.key === "Escape") setStartInput(formatTime(startTime));
	};

	const handleEndInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") handleEndCommit();
		if (event.key === "Escape") setEndInput(formatTime(endTime));
	};

	const handleStartInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStartInput(event.target.value);
	};

	const handleEndInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEndInput(event.target.value);
	};

	const handleShiftInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setShiftInput(event.target.value);
	};

	const handleStartShiftInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStartShiftInput(event.target.value);
	};

	const handleEndShiftInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEndShiftInput(event.target.value);
	};

	const handleShiftLeft = () => {
		if (!hasRange || !canShift) return;
		onShiftRange(-shiftStep);
	};

	const handleShiftRight = () => {
		if (!hasRange || !canShift) return;
		onShiftRange(shiftStep);
	};

	const handleShiftStartLeft = () => {
		if (!hasRange || !canShiftStart) return;
		onAdjustStart(-startStep);
	};

	const handleShiftStartRight = () => {
		if (!hasRange || !canShiftStart) return;
		onAdjustStart(startStep);
	};

	const handleShiftEndLeft = () => {
		if (!hasRange || !canShiftEnd) return;
		onAdjustEnd(-endStep);
	};

	const handleShiftEndRight = () => {
		if (!hasRange || !canShiftEnd) return;
		onAdjustEnd(endStep);
	};

	const handleFineStartLeft = () => {
		if (!hasRange) return;
		onAdjustStart(-fineStep);
	};

	const handleFineStartRight = () => {
		if (!hasRange) return;
		onAdjustStart(fineStep);
	};

	const handleFineEndLeft = () => {
		if (!hasRange) return;
		onAdjustEnd(-fineStep);
	};

	const handleFineEndRight = () => {
		if (!hasRange) return;
		onAdjustEnd(fineStep);
	};

	return {
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
	};
}
