"use client";

import { EllipsisVertical } from "lucide-react";
import { memo, useCallback, useState } from "react";
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
import { type CombinedSelection, getSelectionColor } from "./hooks/use-combined-selections";

interface SelectionLabelMenuProps {
	ownerLabel: string;
	onOwnerLabelSave: (label: string) => void;
	selections: CombinedSelection[];
	selectionLabels: Map<string, string>;
	onSelectionLabelsSave: (labels: Map<string, string>) => void;
}

export const SelectionLabelMenu = memo(function SelectionLabelMenu({
	ownerLabel,
	onOwnerLabelSave,
	selections,
	selectionLabels,
	onSelectionLabelsSave,
}: SelectionLabelMenuProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	// Owner label dialog
	const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
	const [draftOwnerLabel, setDraftOwnerLabel] = useState("");

	// Selection labels dialog
	const [labelsDialogOpen, setLabelsDialogOpen] = useState(false);
	const [draftLabels, setDraftLabels] = useState<Map<string, string>>(new Map());

	const openOwnerDialog = useCallback(() => {
		setDraftOwnerLabel(ownerLabel);
		setOwnerDialogOpen(true);
	}, [ownerLabel]);

	const handleSaveOwner = useCallback(() => {
		onOwnerLabelSave(draftOwnerLabel.trim());
		setOwnerDialogOpen(false);
	}, [draftOwnerLabel, onOwnerLabelSave]);

	const handleOwnerDialogOpenChange = useCallback(
		(open: boolean) => {
			setOwnerDialogOpen(open);
			if (open) {
				setDraftOwnerLabel(ownerLabel);
			}
		},
		[ownerLabel],
	);

	const openLabelsDialog = useCallback(() => {
		const draft = new Map<string, string>();
		for (const sel of selections) {
			const idx = selections.indexOf(sel);
			draft.set(sel.id, selectionLabels.get(sel.id) ?? `Zaznaczenie #${idx + 1}`);
		}
		setDraftLabels(draft);
		setLabelsDialogOpen(true);
	}, [selections, selectionLabels]);

	const handleSaveLabels = useCallback(() => {
		const result = new Map<string, string>();
		for (const [id, label] of draftLabels) {
			const idx = selections.findIndex((s) => s.id === id);
			const trimmed = label.trim();
			result.set(id, trimmed || `Zaznaczenie #${idx + 1}`);
		}
		onSelectionLabelsSave(result);
		setLabelsDialogOpen(false);
	}, [draftLabels, selections, onSelectionLabelsSave]);

	const handleLabelsDialogOpenChange = useCallback(
		(open: boolean) => {
			setLabelsDialogOpen(open);
			if (open) {
				const draft = new Map<string, string>();
				for (const sel of selections) {
					const idx = selections.indexOf(sel);
					draft.set(sel.id, selectionLabels.get(sel.id) ?? `Zaznaczenie #${idx + 1}`);
				}
				setDraftLabels(draft);
			}
		},
		[selections, selectionLabels],
	);

	const updateDraftLabel = useCallback((id: string, value: string) => {
		setDraftLabels((prev) => {
			const next = new Map(prev);
			next.set(id, value);
			return next;
		});
	}, []);

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
							openOwnerDialog();
						}}
					>
						Ustaw etykiete
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(event) => {
							event.preventDefault();
							setMenuOpen(false);
							openLabelsDialog();
						}}
					>
						Edytuj etykiety zaznaczeń
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Owner label dialog */}
			<Dialog open={ownerDialogOpen} onOpenChange={handleOwnerDialogOpenChange}>
				<DialogContent>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleSaveOwner();
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
								value={draftOwnerLabel}
								onChange={(event) => setDraftOwnerLabel(event.target.value)}
								placeholder="np. Jan Kowalski"
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOwnerDialogOpenChange(false)}
							>
								Anuluj
							</Button>
							<Button type="submit">Zapisz</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Selection labels dialog */}
			<Dialog open={labelsDialogOpen} onOpenChange={handleLabelsDialogOpenChange}>
				<DialogContent>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleSaveLabels();
						}}
						className="grid gap-4"
					>
						<DialogHeader>
							<DialogTitle>Etykiety zaznaczeń</DialogTitle>
							<DialogDescription>Zmień nazwy w legendzie wykresu.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-3 max-h-80 overflow-y-auto pr-1">
							{selections.map((sel, i) => {
								const color = getSelectionColor(i);
								return (
									<div key={sel.id} className="grid gap-2">
										<div className="flex items-center gap-2">
											<span
												className="h-2.5 w-2.5 rounded-full shrink-0"
												style={{ backgroundColor: color.border }}
											/>
											<span className="text-sm font-medium">Zaznaczenie #{i + 1}</span>
										</div>
										<Input
											value={draftLabels.get(sel.id) ?? ""}
											onChange={(event) => updateDraftLabel(sel.id, event.target.value)}
											placeholder={`np. Skok #${i + 1}`}
										/>
									</div>
								);
							})}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleLabelsDialogOpenChange(false)}
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
