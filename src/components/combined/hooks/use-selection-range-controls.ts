"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	findClosestIndex,
	formatTime,
	parseTimeInput,
} from "@/components/charts/utils/range-controls";
import type { ParsedForceData } from "@/lib/csvParser";
import type { CombinedSelection } from "./use-combined-selections";

interface UseSelectionRangeControlsProps {
	data: ParsedForceData;
	selections: CombinedSelection[];
	onSelectionUpdate: (id: string, startTime: number, endTime: number, timeValues: number[]) => void;
}

interface SelectionControlState {
	startInput: string;
	endInput: string;
	shiftInput: string;
	startShiftInput: string;
	endShiftInput: string;
}

export function useSelectionRangeControls({
	data,
	selections,
	onSelectionUpdate,
}: UseSelectionRangeControlsProps) {
	const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
	const [controlStates, setControlStates] = useState<Map<string, SelectionControlState>>(new Map());

	const timeValues = useMemo(() => data.data.map((p) => p.time), [data.data]);

	// Track known IDs to auto-activate new selections
	const knownIdsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		const currentIds = new Set(selections.map((s) => s.id));

		// Auto-activate newly added selections
		setActiveIds((prev) => {
			const next = new Set(prev);
			for (const id of currentIds) {
				if (!knownIdsRef.current.has(id)) {
					next.add(id);
				}
			}
			// Remove stale IDs
			for (const id of next) {
				if (!currentIds.has(id)) {
					next.delete(id);
				}
			}
			return next;
		});

		// Sync control state inputs
		setControlStates((prev) => {
			const next = new Map(prev);
			for (const sel of selections) {
				const existing = next.get(sel.id);
				if (!existing) {
					next.set(sel.id, {
						startInput: formatTime(sel.startTime),
						endInput: formatTime(sel.endTime),
						shiftInput: "25",
						startShiftInput: "10",
						endShiftInput: "10",
					});
				} else {
					next.set(sel.id, {
						...existing,
						startInput: formatTime(sel.startTime),
						endInput: formatTime(sel.endTime),
					});
				}
			}
			// Remove stale
			for (const id of next.keys()) {
				if (!currentIds.has(id)) {
					next.delete(id);
				}
			}
			return next;
		});

		knownIdsRef.current = currentIds;
	}, [selections]);

	const toggleSelection = useCallback((id: string) => {
		setActiveIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const activeSelections = useMemo(
		() => selections.filter((s) => activeIds.has(s.id)),
		[selections, activeIds],
	);

	// --- Control handlers factory ---
	const updateControlField = useCallback(
		(id: string, field: keyof SelectionControlState, value: string) => {
			setControlStates((prev) => {
				const next = new Map(prev);
				const current = next.get(id);
				if (current) {
					next.set(id, { ...current, [field]: value });
				}
				return next;
			});
		},
		[],
	);

	const adjustStart = useCallback(
		(selId: string, delta: number) => {
			const sel = selections.find((s) => s.id === selId);
			if (!sel) return;

			const newStartIndex = Math.max(0, Math.min(sel.startIndex + delta, sel.endIndex - 1));
			const newStartTime = data.data[newStartIndex]?.time ?? sel.startTime;

			onSelectionUpdate(selId, newStartTime, sel.endTime, timeValues);
		},
		[selections, data.data, onSelectionUpdate, timeValues],
	);

	const adjustEnd = useCallback(
		(selId: string, delta: number) => {
			const sel = selections.find((s) => s.id === selId);
			if (!sel) return;

			const newEndIndex = Math.min(
				data.data.length - 1,
				Math.max(sel.endIndex + delta, sel.startIndex + 1),
			);
			const newEndTime = data.data[newEndIndex]?.time ?? sel.endTime;

			onSelectionUpdate(selId, sel.startTime, newEndTime, timeValues);
		},
		[selections, data.data, onSelectionUpdate, timeValues],
	);

	const shiftRange = useCallback(
		(selId: string, delta: number) => {
			const sel = selections.find((s) => s.id === selId);
			if (!sel) return;

			const newStartIndex = Math.max(0, Math.min(sel.startIndex + delta, data.data.length - 1));
			const newEndIndex = Math.max(0, Math.min(sel.endIndex + delta, data.data.length - 1));

			if (newStartIndex >= newEndIndex) return;

			const newStartTime = data.data[newStartIndex]?.time ?? sel.startTime;
			const newEndTime = data.data[newEndIndex]?.time ?? sel.endTime;

			onSelectionUpdate(selId, newStartTime, newEndTime, timeValues);
		},
		[selections, data.data, onSelectionUpdate, timeValues],
	);

	const commitStartInput = useCallback(
		(selId: string) => {
			const sel = selections.find((s) => s.id === selId);
			const state = controlStates.get(selId);
			if (!sel || !state) return;

			const parsed = parseTimeInput(state.startInput);
			if (parsed === null) {
				updateControlField(selId, "startInput", formatTime(sel.startTime));
				return;
			}

			const newIndex = Math.min(
				findClosestIndex(timeValues, parsed),
				Math.max(0, sel.endIndex - 1),
			);
			const newTime = data.data[newIndex]?.time ?? sel.startTime;

			onSelectionUpdate(selId, newTime, sel.endTime, timeValues);
		},
		[selections, controlStates, timeValues, data.data, onSelectionUpdate, updateControlField],
	);

	const commitEndInput = useCallback(
		(selId: string) => {
			const sel = selections.find((s) => s.id === selId);
			const state = controlStates.get(selId);
			if (!sel || !state) return;

			const parsed = parseTimeInput(state.endInput);
			if (parsed === null) {
				updateControlField(selId, "endInput", formatTime(sel.endTime));
				return;
			}

			const newIndex = Math.max(
				findClosestIndex(timeValues, parsed),
				Math.min(data.data.length - 1, sel.startIndex + 1),
			);
			const newTime = data.data[newIndex]?.time ?? sel.endTime;

			onSelectionUpdate(selId, sel.startTime, newTime, timeValues);
		},
		[selections, controlStates, timeValues, data.data, onSelectionUpdate, updateControlField],
	);

	return {
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
	};
}
