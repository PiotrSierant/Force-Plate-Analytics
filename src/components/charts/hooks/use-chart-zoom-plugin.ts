import { Chart as ChartJS } from "chart.js";
import { useEffect, useState } from "react";

export function useChartZoomPlugin() {
	const [zoomReady, setZoomReady] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const registerZoom = async () => {
			if (typeof window === "undefined") return;

			const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
			ChartJS.register(zoomPlugin);
			if (isMounted) {
				setZoomReady(true);
			}
		};

		registerZoom();

		return () => {
			isMounted = false;
		};
	}, []);

	return zoomReady;
}
