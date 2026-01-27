import { memo } from "react";

export const ToolbarDivider = memo(function ToolbarDivider() {
	return <div className="mx-2 hidden h-5 w-px bg-border sm:block" />;
});
