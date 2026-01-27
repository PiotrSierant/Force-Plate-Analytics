import { RangeSelector } from "@/components/charts/range-selector";
import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";

interface ComparisonRangeSectionProps {
	trial?: ParsedForceData;
	trialName: string;
	chartColor: string;
	onRangeSelected: (range: SelectedRange) => void;
	onRangeCleared?: () => void;
}

export function ComparisonRangeSection({
	trial,
	trialName,
	chartColor,
	onRangeSelected,
	onRangeCleared,
}: ComparisonRangeSectionProps) {
	if (!trial) {
		return null;
	}

	return (
		<div className="mb-8">
			<RangeSelector
				trial={trial}
				trialName={trialName}
				chartColor={chartColor}
				onRangeSelected={onRangeSelected}
				onRangeCleared={onRangeCleared}
			/>
		</div>
	);
}
