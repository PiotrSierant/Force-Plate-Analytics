import type { Plugin } from "chart.js";

type OwnerLabelOptions = {
	text?: string;
};

export const ownerLabelPlugin: Plugin<"line"> = {
	id: "ownerLabel",
	afterDraw: (chart, _args, options) => {
		const label = (options as OwnerLabelOptions)?.text?.trim();
		if (!label) return;

		const { ctx, chartArea } = chart;
		if (!chartArea) return;

		const resolveColor = (varName: string, alpha: number, fallback: string) => {
			const root = chart.canvas?.ownerDocument?.documentElement;
			if (!root) return fallback;
			const value = getComputedStyle(root).getPropertyValue(varName).trim();
			if (!value) return fallback;
			return `hsl(${value} / ${alpha})`;
		};
		const resolveFont = () => {
			const root = chart.canvas?.ownerDocument?.documentElement;
			if (!root) return "ui-sans-serif";
			const value = getComputedStyle(root).getPropertyValue("--font-sans").trim();
			return value || "ui-sans-serif";
		};

		const text = `${label}`;
		const paddingX = 12;
		const paddingY = 6;
		const boxHeight = 30;
		const radius = 10;
		const maxWidth = chartArea.right - chartArea.left - 8;

		ctx.save();
		ctx.font = `500 16px ${resolveFont()}`;

		let displayText = text;
		if (ctx.measureText(displayText).width > maxWidth) {
			const ellipsis = "...";
			const available = Math.max(0, maxWidth - ctx.measureText(ellipsis).width);
			let trimmed = "";
			for (const char of text) {
				const next = trimmed + char;
				if (ctx.measureText(next).width > available) {
					break;
				}
				trimmed = next;
			}
			displayText = `${trimmed}${ellipsis}`;
		}

		const textWidth = ctx.measureText(displayText).width;
		const boxWidth = textWidth + paddingX * 2;
		const x = chartArea.right - boxWidth - 6;
		const y = chartArea.top + 6;

		ctx.fillStyle = resolveColor("--muted", 0.4, "rgba(148, 163, 184, 0.18)");
		ctx.strokeStyle = resolveColor("--border", 0.6, "rgba(148, 163, 184, 0.35)");
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + boxWidth - radius, y);
		ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
		ctx.lineTo(x + boxWidth, y + boxHeight - radius);
		ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - radius, y + boxHeight);
		ctx.lineTo(x + radius, y + boxHeight);
		ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText(displayText, x + paddingX, y + boxHeight / 2 + paddingY / 4);
		ctx.restore();
	},
};
