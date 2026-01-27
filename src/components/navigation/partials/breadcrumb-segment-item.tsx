import Link from "next/link";
import { memo } from "react";
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import type { BreadcrumbSegment } from "../hooks/use-breadcrumb-segments";

interface BreadcrumbSegmentItemProps {
	segment: BreadcrumbSegment;
}

export const BreadcrumbSegmentItem = memo(function BreadcrumbSegmentItem({
	segment,
}: BreadcrumbSegmentItemProps) {
	return (
		<BreadcrumbItem>
			{segment.isLast ? (
				<BreadcrumbPage>{segment.label}</BreadcrumbPage>
			) : (
				<BreadcrumbLink asChild>
					<Link href={segment.href}>{segment.label}</Link>
				</BreadcrumbLink>
			)}
		</BreadcrumbItem>
	);
});
