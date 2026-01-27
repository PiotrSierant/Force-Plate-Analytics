import Papa from "papaparse";

export interface ForceDataPoint {
	time: number;
	left: number;
	right: number;
}

export type ActiveLeg = "left" | "right";

export interface SelectedRange {
	startIndex: number;
	endIndex: number;
}

export interface ParsedForceData {
	metadata: {
		weight?: string;
		frequency?: number;
		recordingDate?: string;
		athleteId?: string;
	};
	data: ForceDataPoint[];
	activeLeg: ActiveLeg;
	activeForce: number[];
	selectedRange?: SelectedRange; // User-selected range for comparison
}

export function parseCSV(csvText: string): Promise<ParsedForceData> {
	return new Promise((resolve, reject) => {
		const lines = csvText.split("\n");
		const metadata: ParsedForceData["metadata"] = {};

		// Parse metadata from header lines
		for (let i = 0; i < Math.min(10, lines.length); i++) {
			const line = lines[i];
			if (line.includes("Weight,")) {
				metadata.weight = line.split(",")[1]?.replace(/"/g, "");
			} else if (line.includes("Frequency,")) {
				metadata.frequency = Number.parseInt(line.split(",")[1] || "0", 10);
			} else if (line.includes("Recording Date,")) {
				metadata.recordingDate = line.split(",")[1]?.replace(/"/g, "");
			} else if (line.includes("AthleteId,")) {
				metadata.athleteId = line.split(",")[1]?.replace(/"/g, "");
			}
		}

		// Find where the actual data starts (after "Time,Left,Right" header)
		const dataStartIndex = lines.findIndex(
			(line) =>
				line.toLowerCase().includes("time") &&
				line.toLowerCase().includes("left") &&
				line.toLowerCase().includes("right"),
		);

		if (dataStartIndex === -1) {
			reject(new Error("Nie znaleziono nagłówka danych (Time,Left,Right)"));
			return;
		}

		// Parse data from the CSV starting after the header
		const dataCSV = lines.slice(dataStartIndex).join("\n");

		Papa.parse<{
			Time: string;
			Left: string;
			Right: string;
		}>(dataCSV, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const data: ForceDataPoint[] = results.data
					.map((row) => {
						// Handle Polish decimal format (comma instead of dot)
						const parsePolishNumber = (str: string) => {
							if (!str) return 0;
							return Number.parseFloat(str.replace(",", "."));
						};

						return {
							time: parsePolishNumber(row.Time),
							left: parsePolishNumber(row.Left),
							right: parsePolishNumber(row.Right),
						};
					})
					.filter((point) => !Number.isNaN(point.time));

				// Detect which leg was active (being tested)
				const activeLeg = detectActiveLeg(data);

				// Extract force data from active leg only
				const activeForce = data.map((point) => (activeLeg === "left" ? point.left : point.right));

				resolve({
					metadata,
					data,
					activeLeg,
					activeForce,
				});
			},
			error: (error: Error) => {
				reject(error);
			},
		});
	});
}

/**
 * Detects which leg was actively tested (performing the movement).
 * The active leg will show greater force variation and range compared to the resting leg.
 */
function detectActiveLeg(data: ForceDataPoint[]): ActiveLeg {
	if (data.length < 100) return "left"; // Default fallback

	// Analyze a representative sample of the data (skip first 10% and last 10%)
	const startIndex = Math.floor(data.length * 0.1);
	const endIndex = Math.floor(data.length * 0.9);
	const sampleData = data.slice(startIndex, endIndex);

	// Calculate statistics for each leg
	const leftForces = sampleData.map((p) => p.left);
	const rightForces = sampleData.map((p) => p.right);

	// Calculate range (max - min) for each leg
	const leftRange = Math.max(...leftForces) - Math.min(...leftForces);
	const rightRange = Math.max(...rightForces) - Math.min(...rightForces);

	// Calculate standard deviation for each leg
	const leftMean = leftForces.reduce((sum, f) => sum + f, 0) / leftForces.length;
	const rightMean = rightForces.reduce((sum, f) => sum + f, 0) / rightForces.length;

	const leftVariance =
		leftForces.reduce((sum, f) => sum + (f - leftMean) ** 2, 0) / leftForces.length;
	const rightVariance =
		rightForces.reduce((sum, f) => sum + (f - rightMean) ** 2, 0) / rightForces.length;

	const leftStdDev = Math.sqrt(leftVariance);
	const rightStdDev = Math.sqrt(rightVariance);

	// Calculate combined score: range + standard deviation
	// The active leg should have both higher range and higher variability
	const leftScore = leftRange + leftStdDev * 10;
	const rightScore = rightRange + rightStdDev * 10;

	// Return the leg with higher score (more activity)
	return leftScore > rightScore ? "left" : "right";
}

/**
 * Downsamples force data using Largest Triangle Three Buckets (LTTB) algorithm.
 * This preserves the visual characteristics of the data while reducing point count.
 *
 * @param data - Original data points
 * @param threshold - Target number of points (default: 1000)
 * @returns Downsampled data maintaining visual fidelity
 */
export function downsampleData(data: ForceDataPoint[], threshold = 1000): ForceDataPoint[] {
	if (data.length <= threshold) {
		return data; // No downsampling needed
	}

	const sampled: ForceDataPoint[] = [];
	const bucketSize = (data.length - 2) / (threshold - 2);

	// Always keep first point
	sampled[0] = data[0];

	let sampledIndex = 0;

	for (let i = 0; i < threshold - 2; i++) {
		// Calculate bucket range
		const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
		const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
		const avgRangeLength = avgRangeEnd - avgRangeStart;

		// Calculate average point in next bucket
		let avgTime = 0;
		let avgLeft = 0;
		let avgRight = 0;

		for (let j = avgRangeStart; j < avgRangeEnd && j < data.length; j++) {
			avgTime += data[j].time;
			avgLeft += data[j].left;
			avgRight += data[j].right;
		}

		avgTime /= avgRangeLength;
		avgLeft /= avgRangeLength;
		avgRight /= avgRangeLength;

		// Get current bucket range
		const rangeStart = Math.floor(i * bucketSize) + 1;
		const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

		// Previous selected point
		const pointATime = sampled[sampledIndex].time;
		const pointALeft = sampled[sampledIndex].left;
		const pointARight = sampled[sampledIndex].right;

		let maxArea = -1;
		let maxAreaPoint = 0;

		// Find point with largest triangle area
		for (let j = rangeStart; j < rangeEnd && j < data.length; j++) {
			// Calculate triangle area
			const area =
				Math.abs(
					(pointATime - avgTime) * (data[j].left - pointALeft) -
						(pointATime - data[j].time) * (avgLeft - pointALeft),
				) +
				Math.abs(
					(pointATime - avgTime) * (data[j].right - pointARight) -
						(pointATime - data[j].time) * (avgRight - pointARight),
				);

			if (area > maxArea) {
				maxArea = area;
				maxAreaPoint = j;
			}
		}

		sampled[++sampledIndex] = data[maxAreaPoint];
	}

	// Always keep last point
	sampled[++sampledIndex] = data[data.length - 1];

	return sampled;
}

export async function parseFile(file: File): Promise<ParsedForceData> {
	const text = await file.text();
	return parseCSV(text);
}
