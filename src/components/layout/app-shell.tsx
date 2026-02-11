import { type JSX, Suspense } from "react";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/navigation/dynamic-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

type AppShellProps = {
	children: React.ReactNode;
};

function SidebarFallback() {
	return (
		<div
			className="group peer text-sidebar-foreground hidden md:block"
			data-state="expanded"
			data-collapsible="offcanvas"
			data-variant="inset"
			data-side="left"
			data-slot="sidebar"
		>
			<div data-slot="sidebar-gap" className="relative w-(--sidebar-width) bg-transparent" />
			<div
				data-slot="sidebar-container"
				className="fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) md:flex"
			>
				<div className="bg-sidebar border-sidebar-border/60 h-full w-full border-r" />
			</div>
		</div>
	);
}

function AppShellSidebar() {
	return (
		<Suspense fallback={<SidebarFallback />}>
			<AppSidebar />
		</Suspense>
	);
}

function AppShellHeader() {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
				<Suspense fallback={<Skeleton className="h-4 w-36" />}>
					<DynamicBreadcrumbs />
				</Suspense>
			</div>
		</header>
	);
}

function AppShellContent({ children }: AppShellProps) {
	return <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>;
}

type AppShellComponent = {
	(props: AppShellProps): JSX.Element;
	Sidebar: typeof AppShellSidebar;
	Header: typeof AppShellHeader;
	Content: typeof AppShellContent;
};

const AppShell: AppShellComponent = ({ children }) => {
	return <SidebarProvider>{children}</SidebarProvider>;
};

AppShell.Sidebar = AppShellSidebar;
AppShell.Header = AppShellHeader;
AppShell.Content = AppShellContent;

export { AppShell };
