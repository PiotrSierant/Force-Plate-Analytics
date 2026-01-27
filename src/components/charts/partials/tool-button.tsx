import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolButtonProps {
	active?: boolean;
	onClick?: () => void;
	disabled?: boolean;
	children: ReactNode;
	className?: string;
}

export const ToolButton = memo(function ToolButton({
	active = false,
	onClick,
	disabled = false,
	children,
	className,
}: ToolButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"relative flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all duration-200",
				active
					? "bg-foreground text-background shadow-[0_0_12px_rgba(255,255,255,0.15)]"
					: "text-muted-foreground hover:bg-secondary hover:text-foreground",
				disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
				className,
			)}
		>
			{children}
		</button>
	);
});
