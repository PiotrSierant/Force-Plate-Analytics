"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Upload } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const csvFileSchema = z.object({
	csvFile: z
		.custom<FileList>((val) => typeof FileList !== "undefined" && val instanceof FileList, {
			message: "Wybierz plik CSV",
		})
		.refine((files) => files.length > 0, "Wybierz plik CSV")
		.refine(
			(files) => files[0]?.name.toLowerCase().endsWith(".csv"),
			"Plik musi być w formacie CSV",
		),
});

type CsvFileFormData = z.infer<typeof csvFileSchema>;

interface CombinedFileInputProps {
	onFileSelect: (file: File) => void;
	fileName?: string;
}

export function CombinedFileInput({ onFileSelect, fileName }: CombinedFileInputProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CsvFileFormData>({
		resolver: zodResolver(csvFileSchema),
		defaultValues: { csvFile: undefined as unknown as FileList },
	});

	const onSubmit = useCallback(
		(formData: CsvFileFormData) => {
			const file = formData.csvFile[0];
			if (file) onFileSelect(file);
		},
		[onFileSelect],
	);

	const { ref, onChange, ...restRegister } = register("csvFile");

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e);
			handleSubmit(onSubmit)();
		},
		[onChange, handleSubmit, onSubmit],
	);

	return (
		<div className="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Plik pomiarowy</CardTitle>
					<CardDescription>
						Wybierz plik CSV z danymi z obu platform (lewa + prawa noga)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<input
							type="file"
							accept=".csv"
							className="hidden"
							id="csv-file-input"
							ref={ref}
							onChange={handleChange}
							{...restRegister}
						/>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => document.getElementById("csv-file-input")?.click()}
						>
							<Upload className="mr-2 h-4 w-4" />
							{fileName || "Wybierz plik CSV"}
						</Button>
						{errors.csvFile && (
							<p className="mt-2 flex items-center gap-1.5 text-sm text-red-500" role="alert">
								<AlertCircle className="h-4 w-4 shrink-0" />
								{errors.csvFile.message}
							</p>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
