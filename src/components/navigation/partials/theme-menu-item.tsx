import { memo } from "react";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

interface ThemeMenuItemProps {
	value: string;
	label: string;
	icon: React.ElementType;
}

export const ThemeMenuItem = memo(function ThemeMenuItem({
	value,
	label,
	icon: Icon,
}: ThemeMenuItemProps) {
	return (
		<DropdownMenuRadioItem value={value}>
			<Icon className="size-4 text-muted-foreground" />
			{label}
		</DropdownMenuRadioItem>
	);
});
