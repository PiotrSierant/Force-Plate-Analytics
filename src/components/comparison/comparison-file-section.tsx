import { FileUploader } from "@/components/forms/file-uploader";

interface ComparisonFileSectionProps {
	onFileSelect: (file: File, fileNumber: 1 | 2) => void;
	file1Name?: string;
	file2Name?: string;
}

export function ComparisonFileSection({
	onFileSelect,
	file1Name,
	file2Name,
}: ComparisonFileSectionProps) {
	return (
		<div className="mb-8">
			<FileUploader onFileSelect={onFileSelect} file1Name={file1Name} file2Name={file2Name} />
		</div>
	);
}
