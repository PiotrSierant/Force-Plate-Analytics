import { EllipsisVertical } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLabelDialogs } from "../hooks/use-label-dialogs";
import type { DatasetLabels } from "../types";

interface OwnerLabelMenuProps {
	ownerLabel: string;
	onOwnerLabelSave: (label: string) => void;
	datasetLabels?: DatasetLabels;
	onDatasetLabelsSave?: (labels: DatasetLabels) => void;
}

export const OwnerLabelMenu = memo(function OwnerLabelMenu({
	ownerLabel,
	onOwnerLabelSave,
	datasetLabels,
	onDatasetLabelsSave,
}: OwnerLabelMenuProps) {
	const {
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
	} = useLabelDialogs({
		ownerLabel,
		onOwnerLabelSave,
		datasetLabels,
		onDatasetLabelsSave,
	});

	return (
		<>
			<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						size="icon"
						variant="ghost"
						className="h-9 w-9 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
					>
						<EllipsisVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onSelect={(event) => {
							event.preventDefault();
							setMenuOpen(false);
							openDialog();
						}}
					>
						Ustaw etykiete
					</DropdownMenuItem>
					{onDatasetLabelsSave ? (
						<DropdownMenuItem
							onSelect={(event) => {
								event.preventDefault();
								setMenuOpen(false);
								openDatasetsDialog();
							}}
						>
							Edytuj etykiety prób
						</DropdownMenuItem>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
				<DialogContent>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleSave();
						}}
						className="grid gap-4"
					>
						<DialogHeader>
							<DialogTitle>Etykieta wykresu</DialogTitle>
							<DialogDescription>
								Dodaj opis osoby lub zespolu, do ktorego nalezy proba.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2">
							<span className="text-sm font-medium">Nalezy do</span>
							<Input
								value={draftLabel}
								onChange={(event) => setDraftLabel(event.target.value)}
								placeholder="np. Jan Kowalski"
							/>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
								Anuluj
							</Button>
							<Button type="submit">Zapisz</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={datasetsDialogOpen} onOpenChange={handleDatasetsDialogOpenChange}>
				<DialogContent>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleSaveDatasets();
						}}
						className="grid gap-4"
					>
						<DialogHeader>
							<DialogTitle>Etykiety prób</DialogTitle>
							<DialogDescription>Zmien nazwy w legendzie wykresu.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-3">
							<div className="grid gap-2">
								<span className="text-sm font-medium">Próba 1</span>
								<Input
									value={draftTrial1}
									onChange={(event) => setDraftTrial1(event.target.value)}
									placeholder="np. Zawodnik A"
								/>
							</div>
							<div className="grid gap-2">
								<span className="text-sm font-medium">Próba 2</span>
								<Input
									value={draftTrial2}
									onChange={(event) => setDraftTrial2(event.target.value)}
									placeholder="np. Zawodnik B"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleDatasetsDialogOpenChange(false)}
							>
								Anuluj
							</Button>
							<Button type="submit">Zapisz</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
});
