"use client";

import { Laptop, Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ThemeMenuItem } from "./partials/theme-menu-item";

type ThemeOption = "system" | "light" | "dark";

const themeOptions: Array<{
	value: ThemeOption;
	label: string;
	icon: React.ElementType;
}> = [
	{
		value: "system",
		label: "System",
		icon: Laptop,
	},
	{
		value: "light",
		label: "Jasny",
		icon: Sun,
	},
	{
		value: "dark",
		label: "Ciemny",
		icon: Moon,
	},
];

export function ThemeMenu() {
	const { theme, setTheme } = useTheme();

	// const themeLabel = themeOptions.find(
	// 	(option) => option.value === theme,
	// )?.label;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							<SunMoon className="size-4" />
							<span>Motyw</span>
							{/* <span className="ml-auto text-xs text-muted-foreground">
								{themeLabel}
							</span> */}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="right" align="start" className="min-w-44">
						<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
							{themeOptions.map((option) => (
								<ThemeMenuItem
									key={option.value}
									value={option.value}
									label={option.label}
									icon={option.icon}
								/>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
