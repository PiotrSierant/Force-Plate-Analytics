import { memo, useCallback } from "react";
import { ExportButton } from "./export-button";

interface ExportButtonsProps {
	onExport?: (format: "png" | "jpg") => void;
	disabled?: boolean;
}

export const ExportButtons = memo(function ExportButtons({
	onExport,
	disabled = false,
}: ExportButtonsProps) {
	const handlePngExport = useCallback(() => onExport?.("png"), [onExport]);
	const handleJpgExport = useCallback(() => onExport?.("jpg"), [onExport]);

	return (
		<div className="flex items-center rounded-lg bg-secondary/50">
			<ExportButton format="png" onClick={handlePngExport} disabled={disabled} />
			<ExportButton format="jpg" onClick={handleJpgExport} disabled={disabled} />
		</div>
	);
});
