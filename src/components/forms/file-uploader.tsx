"use client";

import { FileUploadCard } from "./partials/file-upload-card";

interface FileUploaderProps {
	onFileSelect: (file: File, fileNumber: 1 | 2) => void;
	file1Name?: string;
	file2Name?: string;
}

export function FileUploader({ onFileSelect, file1Name, file2Name }: FileUploaderProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<FileUploadCard fileNumber={1} fileName={file1Name} onFileSelect={onFileSelect} />
			<FileUploadCard fileNumber={2} fileName={file2Name} onFileSelect={onFileSelect} />
		</div>
	);
}
