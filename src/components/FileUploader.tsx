"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface FileUploaderProps {
	onFileSelect: (file: File, fileNumber: 1 | 2) => void;
	file1Name?: string;
	file2Name?: string;
}

export function FileUploader({
	onFileSelect,
	file1Name,
	file2Name,
}: FileUploaderProps) {
	const file1Ref = useRef<HTMLInputElement>(null);
	const file2Ref = useRef<HTMLInputElement>(null);

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		fileNumber: 1 | 2,
	) => {
		const file = e.target.files?.[0];
		if (file && file.type === "text/csv") {
			onFileSelect(file, fileNumber);
		}
	};

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Próba 1</CardTitle>
					<CardDescription>
						Wybierz pierwszy plik CSV z danymi force plate
					</CardDescription>
				</CardHeader>
				<CardContent>
					<input
						ref={file1Ref}
						type="file"
						accept=".csv"
						onChange={(e) => handleFileChange(e, 1)}
						className="hidden"
					/>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => file1Ref.current?.click()}
					>
						<Upload className="mr-2 h-4 w-4" />
						{file1Name || "Wybierz plik CSV"}
					</Button>
					{file1Name && (
						<p className="mt-2 text-sm text-zinc-500 truncate">{file1Name}</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Próba 2</CardTitle>
					<CardDescription>
						Wybierz drugi plik CSV z danymi force plate
					</CardDescription>
				</CardHeader>
				<CardContent>
					<input
						ref={file2Ref}
						type="file"
						accept=".csv"
						onChange={(e) => handleFileChange(e, 2)}
						className="hidden"
					/>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => file2Ref.current?.click()}
					>
						<Upload className="mr-2 h-4 w-4" />
						{file2Name || "Wybierz plik CSV"}
					</Button>
					{file2Name && (
						<p className="mt-2 text-sm text-zinc-500 truncate">{file2Name}</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
