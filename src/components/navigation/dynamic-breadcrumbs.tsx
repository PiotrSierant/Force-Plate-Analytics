"use client";

import { Fragment } from "react";
import { Breadcrumb, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useBreadcrumbSegments } from "./hooks/use-breadcrumb-segments";
import { BreadcrumbSegmentItem } from "./partials/breadcrumb-segment-item";

export function DynamicBreadcrumbs() {
	const segments = useBreadcrumbSegments();

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{segments.map((segment, index) => (
					<Fragment key={segment.href}>
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbSegmentItem segment={segment} />
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
