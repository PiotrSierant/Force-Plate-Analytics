import { useCallback, useRef } from "react";

interface UseFileUploadProps {
	fileNumber: 1 | 2;
	onFileSelect: (file: File, fileNumber: 1 | 2) => void;
}

export function useFileUpload({ fileNumber, onFileSelect }: UseFileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				// Sprawdź rozszerzenie - Firefox często zwraca pusty file.type dla CSV
				const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

				if (isCSV) {
					onFileSelect(file, fileNumber);
				}
			}
		},
		[onFileSelect, fileNumber],
	);

	const triggerFileInput = useCallback(() => {
		inputRef.current?.click();
	}, []);

	return {
		inputRef,
		handleFileChange,
		triggerFileInput,
	};
}
