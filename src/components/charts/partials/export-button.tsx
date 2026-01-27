import { Download } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
	format: "png" | "jpg" | "svg";
	onClick?: () => void;
	disabled?: boolean;
}

export const ExportButton = memo(function ExportButton({
	format,
	onClick,
	disabled = false,
}: ExportButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"group flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground",
				disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
			)}
		>
			<Download className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
			<span className="font-medium uppercase tracking-wide">{format}</span>
		</button>
	);
});
