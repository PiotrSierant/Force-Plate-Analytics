import { RotateCcw } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface ResetButtonProps {
	onClick?: () => void;
	disabled?: boolean;
}

export const ResetButton = memo(function ResetButton({
	onClick,
	disabled = false,
}: ResetButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"ml-1 flex h-9 items-center gap-1.5 rounded-lg bg-secondary/50 px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground",
				disabled && "cursor-not-allowed opacity-50 hover:bg-secondary/50",
			)}
		>
			<RotateCcw className="h-3.5 w-3.5" />
			<span className="font-medium">Reset</span>
		</button>
	);
});
