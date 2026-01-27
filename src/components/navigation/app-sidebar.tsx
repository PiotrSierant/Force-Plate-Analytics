"use client";

import { Activity, Footprints, GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { ThemeMenu } from "./theme-menu";

// TODO: Uncomment when adding new project groups
// import { NavProjects } from "./nav-projects"

const navItems = [
	{
		title: "Porównanie L/P",
		url: "/comparison",
		icon: GitCompareArrows,
	},
	{
		title: "Połączone nogi",
		url: "/combined",
		icon: Footprints,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Activity className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Force Plate</span>
									<span className="truncate text-xs">Analytics</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Analiza</SidebarGroupLabel>
					<SidebarMenu>
						{navItems.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild isActive={pathname === item.url}>
									<Link href={item.url}>
										<item.icon />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Ustawienia</SidebarGroupLabel>
					<ThemeMenu />
				</SidebarGroup>
				{/*
        TODO: Uncomment when adding new project groups
        <NavProjects
          projects={[
            { name: "Project 1", url: "/project-1", icon: Folder },
            { name: "Project 2", url: "/project-2", icon: Folder },
          ]}
        />
        */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: "Gość",
						email: "Niezalogowany",
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
