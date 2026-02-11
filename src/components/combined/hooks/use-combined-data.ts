import { useCallback, useState } from "react";
import { type ParsedForceData, parseFile } from "@/lib/csvParser";

interface UseCombinedDataResult {
	data: ParsedForceData | undefined;
	fileName: string | undefined;
	loading: boolean;
	error: string | undefined;
	handleFileSelect: (file: File) => void;
}

export function useCombinedData(): UseCombinedDataResult {
	const [data, setData] = useState<ParsedForceData | undefined>();
	const [fileName, setFileName] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const handleFileSelect = useCallback(async (file: File) => {
		setLoading(true);
		setError(undefined);

		try {
			const parsedData = await parseFile(file);
			setData(parsedData);
			setFileName(file.name);
		} catch (err) {
			setError(
				`Błąd podczas wczytywania pliku: ${err instanceof Error ? err.message : "Nieznany błąd"}`,
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	return { data, fileName, loading, error, handleFileSelect };
}
