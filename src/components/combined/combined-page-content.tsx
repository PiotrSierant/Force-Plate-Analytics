"use client";

import { useState } from "react";
import { CombinedChart } from "@/components/combined/combined-chart";
import { CombinedFileInput } from "@/components/combined/combined-file-input";
import { CombinedHeader } from "@/components/combined/combined-header";
import { CombinedSelectionsChart } from "@/components/combined/combined-selections-chart";
import { CombinedStatus } from "@/components/combined/combined-status";
import { useCombinedData } from "@/components/combined/hooks/use-combined-data";
import { useCombinedSelections } from "@/components/combined/hooks/use-combined-selections";
import { SelectionRangeControls } from "@/components/combined/selection-range-controls";

export function CombinedPageContent() {
	const { data, fileName, loading, error, handleFileSelect } = useCombinedData();
	const { selections, addSelection, updateSelection, removeSelection } = useCombinedSelections();
	const [selectionLabels, setSelectionLabels] = useState<Map<string, string>>(new Map());

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<CombinedHeader />
				<CombinedFileInput onFileSelect={handleFileSelect} fileName={fileName} />
				<CombinedStatus error={error} loading={loading} />
				{data && (
					<>
						<CombinedChart
							data={data}
							selections={selections}
							onSelectionAdd={addSelection}
							onSelectionRemove={removeSelection}
							onSelectionUpdate={updateSelection}
						/>
						{selections.length > 0 && (
							<>
								<CombinedSelectionsChart
									data={data}
									selections={selections}
									fileName={fileName}
									selectionLabels={selectionLabels}
									onSelectionLabelsSave={setSelectionLabels}
								/>
								<SelectionRangeControls
									data={data}
									selections={selections}
									onSelectionUpdate={updateSelection}
									selectionLabels={selectionLabels}
								/>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}
