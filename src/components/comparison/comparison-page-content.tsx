"use client";

import { ComparisonChartSection } from "@/components/comparison/comparison-chart-section";
import { ComparisonFileSection } from "@/components/comparison/comparison-file-section";
import { ComparisonHeader } from "@/components/comparison/comparison-header";
import { ComparisonRangeSection } from "@/components/comparison/comparison-range-section";
import { ComparisonStatus } from "@/components/comparison/comparison-status";
import { useComparisonData } from "@/components/comparison/hooks/use-comparison-data";

export function ComparisonPageContent() {
	const {
		trial1,
		trial2,
		file1Name,
		file2Name,
		loading,
		error,
		handleFileSelect,
		setRange1,
		setRange2,
		clearRange1,
		clearRange2,
	} = useComparisonData();

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<ComparisonHeader />
				<ComparisonFileSection
					onFileSelect={handleFileSelect}
					file1Name={file1Name}
					file2Name={file2Name}
				/>
				<ComparisonStatus error={error} loading={loading} />
				<ComparisonRangeSection
					trial={trial1}
					trialName="Próba 1"
					chartColor="#3b82f6"
					onRangeSelected={setRange1}
					onRangeCleared={clearRange1}
				/>
				<ComparisonRangeSection
					trial={trial2}
					trialName="Próba 2"
					chartColor="#ef4444"
					onRangeSelected={setRange2}
					onRangeCleared={clearRange2}
				/>
				<ComparisonChartSection
					trial1={trial1}
					trial2={trial2}
					onUpdateRange1={setRange1}
					onUpdateRange2={setRange2}
				/>
			</div>
		</div>
	);
}
