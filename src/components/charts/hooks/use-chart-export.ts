import type { Chart as ChartJS } from "chart.js";
import type { RefObject } from "react";
import { useCallback } from "react";

interface UseChartExportProps {
	filename: string;
}

export function useChartExport({ filename }: UseChartExportProps) {
	const exportChart = useCallback(
		(chartRef: RefObject<ChartJS | null>, format: "png" | "jpg") => {
			const chart = chartRef.current;
			if (!chart) return;

			try {
				chart.draw();
				const base64Image = chart.toBase64Image(
					format === "png" ? "image/png" : "image/jpeg",
					format === "jpg" ? 0.95 : 1,
				);

				const link = document.createElement("a");
				link.href = base64Image;
				link.download = `${filename}.${format}`;
				link.click();
			} catch (error) {
				console.error("Błąd podczas eksportu wykresu:", error);
			}
		},
		[filename],
	);

	return {
		exportChart,
	};
}
