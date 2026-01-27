export const parseStep = (value: string) => {
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed)) return 0;
	return Math.abs(parsed);
};

export const parseTimeInput = (value: string) => {
	const normalized = value.replace(",", ".");
	const parsed = Number.parseFloat(normalized);
	return Number.isNaN(parsed) ? null : parsed;
};

export const formatTime = (time: number) => time.toFixed(3);

export const findClosestIndex = (sorted: number[], value: number) => {
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
};
