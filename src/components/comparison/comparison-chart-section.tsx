import type { ParsedForceData, SelectedRange } from "@/lib/csvParser";
import { ForceChart } from "../charts/force-chart";

interface ComparisonChartSectionProps {
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	onUpdateRange1: (range: SelectedRange) => void;
	onUpdateRange2: (range: SelectedRange) => void;
}

export function ComparisonChartSection({
	trial1,
	trial2,
	onUpdateRange1,
	onUpdateRange2,
}: ComparisonChartSectionProps) {
	// Wyświetl wykres gdy przynajmniej jedna próba ma zaznaczony zakres
	if (!trial1?.selectedRange && !trial2?.selectedRange) {
		return null;
	}

	return (
		<div className="mb-8">
			<ForceChart
				trial1={trial1}
				trial2={trial2}
				onUpdateRange1={onUpdateRange1}
				onUpdateRange2={onUpdateRange2}
			/>
		</div>
	);
}
