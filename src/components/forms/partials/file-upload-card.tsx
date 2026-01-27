import { Upload } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileUpload } from "../hooks/use-file-upload";

interface FileUploadCardProps {
	fileNumber: 1 | 2;
	fileName?: string;
	onFileSelect: (file: File, fileNumber: 1 | 2) => void;
}

// Statyczne dane dla każdej próby (rendering-hoist-jsx)
const TRIAL_DATA = {
	1: {
		title: "Próba 1",
		description: "Wybierz pierwszy plik CSV z danymi force plate",
	},
	2: {
		title: "Próba 2",
		description: "Wybierz drugi plik CSV z danymi force plate",
	},
} as const;

export const FileUploadCard = memo(function FileUploadCard({
	fileNumber,
	fileName,
	onFileSelect,
}: FileUploadCardProps) {
	const { inputRef, handleFileChange, triggerFileInput } = useFileUpload({
		fileNumber,
		onFileSelect,
	});

	const trialData = TRIAL_DATA[fileNumber];

	return (
		<Card>
			<CardHeader>
				<CardTitle>{trialData.title}</CardTitle>
				<CardDescription>{trialData.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<input
					ref={inputRef}
					type="file"
					accept=".csv"
					onChange={handleFileChange}
					className="hidden"
				/>
				<Button type="button" variant="outline" className="w-full" onClick={triggerFileInput}>
					<Upload className="mr-2 h-4 w-4" />
					{fileName || "Wybierz plik CSV"}
				</Button>
			</CardContent>
		</Card>
	);
});
