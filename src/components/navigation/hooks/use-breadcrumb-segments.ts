import { usePathname } from "next/navigation";
import { useMemo } from "react";

const ROUTE_LABELS: Record<string, string> = {
	"": "Strona główna",
	comparison: "Porównanie L/P",
	combined: "Połączone nogi",
};

export interface BreadcrumbSegment {
	label: string;
	href: string;
	isLast: boolean;
}

export function useBreadcrumbSegments() {
	const pathname = usePathname();

	const segments = useMemo((): BreadcrumbSegment[] => {
		const pathSegments = pathname.split("/").filter(Boolean);

		// Home page - show single breadcrumb
		if (pathSegments.length === 0) {
			return [
				{
					label: ROUTE_LABELS[""],
					href: "/",
					isLast: true,
				},
			];
		}

		// Build breadcrumb chain
		const result: BreadcrumbSegment[] = [
			{
				label: ROUTE_LABELS[""],
				href: "/",
				isLast: false,
			},
		];

		pathSegments.forEach((segment, index) => {
			const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
			const isLast = index === pathSegments.length - 1;
			const label = ROUTE_LABELS[segment] ?? segment;

			result.push({
				label,
				href,
				isLast,
			});
		});

		return result;
	}, [pathname]);

	return segments;
}
