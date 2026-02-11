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
				const canvas = chart.canvas;
				const ctx = canvas.getContext("2d");
				if (!ctx) return;

				// Draw white background behind chart content
				ctx.save();
				ctx.globalCompositeOperation = "destination-over";
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();

				const base64Image = canvas.toDataURL(
					format === "png" ? "image/png" : "image/jpeg",
					format === "jpg" ? 0.95 : 1,
				);

				const link = document.createElement("a");
				link.href = base64Image;
				link.download = `${filename}.${format}`;
				link.click();

				// Redraw chart to restore original transparent background
				chart.draw();
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
