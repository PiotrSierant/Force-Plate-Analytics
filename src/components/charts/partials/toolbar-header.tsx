import { memo } from "react";

interface ToolbarHeaderProps {
	title: string;
	subtitle: string;
	actions?: React.ReactNode;
}

export const ToolbarHeader = memo(function ToolbarHeader({
	title,
	subtitle,
	actions,
}: ToolbarHeaderProps) {
	return (
		<div className="flex min-w-0 flex-1 items-start justify-between gap-3">
			<div className="min-w-0">
				<h3 className="truncate text-[15px] font-medium tracking-tight text-foreground">{title}</h3>
				<p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
			</div>
			{actions && <div className="shrink-0">{actions}</div>}
		</div>
	);
});
