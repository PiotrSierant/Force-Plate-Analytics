import { useCallback, useState } from "react";

export interface CombinedSelection {
	id: string;
	startTime: number;
	endTime: number;
	startIndex: number;
	endIndex: number;
}

const SELECTION_COLORS = [
	{ border: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" },
	{ border: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
	{ border: "#ec4899", bg: "rgba(236, 72, 153, 0.15)" },
	{ border: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)" },
	{ border: "#f97316", bg: "rgba(249, 115, 22, 0.15)" },
	{ border: "#14b8a6", bg: "rgba(20, 184, 166, 0.15)" },
] as const;

export function getSelectionColor(index: number) {
	return SELECTION_COLORS[index % SELECTION_COLORS.length];
}

let selectionCounter = 0;

export function useCombinedSelections() {
	const [selections, setSelections] = useState<CombinedSelection[]>([]);

	const addSelection = useCallback((startTime: number, endTime: number, timeValues: number[]) => {
		const startIndex = findClosestIndex(timeValues, Math.min(startTime, endTime));
		const endIndex = findClosestIndex(timeValues, Math.max(startTime, endTime));

		if (startIndex === endIndex) return;

		selectionCounter++;
		const newSelection: CombinedSelection = {
			id: `sel-${selectionCounter}`,
			startTime: timeValues[startIndex],
			endTime: timeValues[endIndex],
			startIndex,
			endIndex,
		};

		setSelections((prev) => [...prev, newSelection]);
	}, []);

	const updateSelection = useCallback(
		(id: string, startTime: number, endTime: number, timeValues: number[]) => {
			const startIndex = findClosestIndex(timeValues, Math.min(startTime, endTime));
			const endIndex = findClosestIndex(timeValues, Math.max(startTime, endTime));

			if (startIndex === endIndex) return;

			setSelections((prev) =>
				prev.map((s) =>
					s.id === id
						? {
								...s,
								startTime: timeValues[startIndex],
								endTime: timeValues[endIndex],
								startIndex,
								endIndex,
							}
						: s,
				),
			);
		},
		[],
	);

	const removeSelection = useCallback((id: string) => {
		setSelections((prev) => prev.filter((s) => s.id !== id));
	}, []);

	const clearSelections = useCallback(() => {
		setSelections([]);
	}, []);

	return { selections, addSelection, updateSelection, removeSelection, clearSelections };
}

function findClosestIndex(sorted: number[], value: number) {
	if (sorted.length === 0) return 0;

	let low = 0;
	let high = sorted.length - 1;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (sorted[mid] < value) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	if (low === 0) return 0;
	const prev = low - 1;
	return Math.abs(sorted[low] - value) < Math.abs(sorted[prev] - value) ? low : prev;
}
