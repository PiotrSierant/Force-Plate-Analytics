import { useState } from "react";
import { type ParsedForceData, parseFile, type SelectedRange } from "@/lib/csvParser";

interface UseComparisonDataResult {
	trial1?: ParsedForceData;
	trial2?: ParsedForceData;
	file1Name?: string;
	file2Name?: string;
	loading: boolean;
	error?: string;
	handleFileSelect: (file: File, fileNumber: 1 | 2) => Promise<void>;
	setRange1: (range: SelectedRange) => void;
	setRange2: (range: SelectedRange) => void;
	clearRange1: () => void;
	clearRange2: () => void;
}

export function useComparisonData(): UseComparisonDataResult {
	const [trial1, setTrial1] = useState<ParsedForceData | undefined>();
	const [trial2, setTrial2] = useState<ParsedForceData | undefined>();
	const [file1Name, setFile1Name] = useState<string>();
	const [file2Name, setFile2Name] = useState<string>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>();

	const handleFileSelect = async (file: File, fileNumber: 1 | 2) => {
		setLoading(true);
		setError(undefined);

		try {
			const parsedData = await parseFile(file);

			if (fileNumber === 1) {
				setTrial1(parsedData);
				setFile1Name(file.name);
			} else {
				setTrial2(parsedData);
				setFile2Name(file.name);
			}
		} catch (err) {
			setError(
				`Błąd podczas wczytywania pliku: ${err instanceof Error ? err.message : "Nieznany błąd"}`,
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const setRange1 = (range: SelectedRange) => {
		setTrial1((current) =>
			current
				? {
						...current,
						selectedRange: range,
					}
				: current,
		);
	};

	const setRange2 = (range: SelectedRange) => {
		setTrial2((current) =>
			current
				? {
						...current,
						selectedRange: range,
					}
				: current,
		);
	};

	const clearRange1 = () => {
		setTrial1((current) =>
			current
				? {
						...current,
						selectedRange: undefined,
					}
				: current,
		);
	};

	const clearRange2 = () => {
		setTrial2((current) =>
			current
				? {
						...current,
						selectedRange: undefined,
					}
				: current,
		);
	};

	return {
		trial1,
		trial2,
		file1Name,
		file2Name,
		loading,
		error,
		handleFileSelect,
		setRange1,
		setRange2,
		clearRange1,
		clearRange2,
	};
}
