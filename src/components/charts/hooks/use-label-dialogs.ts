import { useCallback, useState } from "react";
import type { DatasetLabels } from "../types";

interface UseLabelDialogsProps {
	ownerLabel: string;
	onOwnerLabelSave: (label: string) => void;
	datasetLabels?: DatasetLabels;
	onDatasetLabelsSave?: (labels: DatasetLabels) => void;
}

export function useLabelDialogs({
	ownerLabel,
	onOwnerLabelSave,
	datasetLabels,
	onDatasetLabelsSave,
}: UseLabelDialogsProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [datasetsDialogOpen, setDatasetsDialogOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [draftLabel, setDraftLabel] = useState("");
	const [draftTrial1, setDraftTrial1] = useState("");
	const [draftTrial2, setDraftTrial2] = useState("");

	const openDialog = useCallback(() => {
		setDraftLabel(ownerLabel);
		setDialogOpen(true);
	}, [ownerLabel]);

	const handleSave = useCallback(() => {
		onOwnerLabelSave(draftLabel.trim());
		setDialogOpen(false);
		setMenuOpen(false);
	}, [draftLabel, onOwnerLabelSave]);

	const openDatasetsDialog = useCallback(() => {
		setDraftTrial1(datasetLabels?.trial1 ?? "Próba 1");
		setDraftTrial2(datasetLabels?.trial2 ?? "Próba 2");
		setDatasetsDialogOpen(true);
	}, [datasetLabels]);

	const handleSaveDatasets = useCallback(() => {
		onDatasetLabelsSave?.({
			trial1: draftTrial1.trim() || "Próba 1",
			trial2: draftTrial2.trim() || "Próba 2",
		});
		setDatasetsDialogOpen(false);
		setMenuOpen(false);
	}, [draftTrial1, draftTrial2, onDatasetLabelsSave]);

	const handleDialogOpenChange = useCallback(
		(open: boolean) => {
			setDialogOpen(open);
			if (open) {
				setDraftLabel(ownerLabel);
			}
		},
		[ownerLabel],
	);

	const handleDatasetsDialogOpenChange = useCallback(
		(open: boolean) => {
			setDatasetsDialogOpen(open);
			if (open) {
				setDraftTrial1(datasetLabels?.trial1 ?? "Próba 1");
				setDraftTrial2(datasetLabels?.trial2 ?? "Próba 2");
			}
		},
		[datasetLabels],
	);

	return {
		dialogOpen,
		datasetsDialogOpen,
		menuOpen,
		draftLabel,
		draftTrial1,
		draftTrial2,
		setMenuOpen,
		setDraftLabel,
		setDraftTrial1,
		setDraftTrial2,
		openDialog,
		handleSave,
		openDatasetsDialog,
		handleSaveDatasets,
		handleDialogOpenChange,
		handleDatasetsDialogOpenChange,
	};
}
