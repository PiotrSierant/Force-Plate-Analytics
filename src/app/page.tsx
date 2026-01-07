"use client";

import { Activity } from "lucide-react";
import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ForceChart } from "@/components/ForceChart";
import { RangeSelector } from "@/components/RangeSelector";
import {
	type ParsedForceData,
	parseFile,
	type SelectedRange,
} from "@/lib/csvParser";

export default function Home() {
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

	const handleRange1Selected = (range: SelectedRange) => {
		if (trial1) {
			setTrial1({
				...trial1,
				selectedRange: range,
			});
		}
	};

	const handleRange2Selected = (range: SelectedRange) => {
		if (trial2) {
			setTrial2({
				...trial2,
				selectedRange: range,
			});
		}
	};

	const updateRange1 = (range: SelectedRange) => {
		if (trial1) {
			setTrial1({
				...trial1,
				selectedRange: range,
			});
		}
	};

	const updateRange2 = (range: SelectedRange) => {
		if (trial2) {
			setTrial2({
				...trial2,
				selectedRange: range,
			});
		}
	};

	const canShowComparison = trial1?.selectedRange && trial2?.selectedRange;

	return (
		<div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<Activity className="h-8 w-8 text-blue-600" />
						<h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
							Force Plate Analytics
						</h1>
					</div>
					<p className="text-lg text-zinc-600 dark:text-zinc-400">
						Analiza danych z platform dynamometrycznych - porównanie prób
					</p>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
						{error}
					</div>
				)}

				{/* Loading Indicator */}
				{loading && (
					<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
						Wczytywanie pliku...
					</div>
				)}

				{/* File Upload Section */}
				<div className="mb-8">
					<FileUploader
						onFileSelect={handleFileSelect}
						file1Name={file1Name}
						file2Name={file2Name}
					/>
				</div>

				{/* Range Selection */}
				{trial1 && (
					<div className="mb-8">
						<RangeSelector
							trial={trial1}
							trialName="Próba 1"
							chartColor="#3b82f6"
							onRangeSelected={handleRange1Selected}
						/>
					</div>
				)}

				{trial2 && (
					<div className="mb-8">
						<RangeSelector
							trial={trial2}
							trialName="Próba 2"
							chartColor="#ef4444"
							onRangeSelected={handleRange2Selected}
						/>
					</div>
				)}

				{/* Comparison Chart */}
				{canShowComparison && (
					<div className="mb-8">
						<ForceChart
							trial1={trial1}
							trial2={trial2}
							onUpdateRange1={updateRange1}
							onUpdateRange2={updateRange2}
						/>
					</div>
				)}

				{/* Metadata Display */}
				{(trial1 || trial2) && (
					<div className="grid gap-4 md:grid-cols-2">
						{trial1 && (
							<div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow">
								<h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-50">
									Próba 1 - Informacje
								</h3>
								<dl className="space-y-2 text-sm">
									{trial1.metadata.weight && (
										<div className="flex justify-between">
											<dt className="text-zinc-600 dark:text-zinc-400">
												Waga:
											</dt>
											<dd className="font-medium text-zinc-900 dark:text-zinc-50">
												{trial1.metadata.weight} kg
											</dd>
										</div>
									)}
									{trial1.metadata.frequency && (
										<div className="flex justify-between">
											<dt className="text-zinc-600 dark:text-zinc-400">
												Częstotliwość:
											</dt>
											<dd className="font-medium text-zinc-900 dark:text-zinc-50">
												{trial1.metadata.frequency} Hz
											</dd>
										</div>
									)}
									<div className="flex justify-between">
										<dt className="text-zinc-600 dark:text-zinc-400">
											Punkty danych:
										</dt>
										<dd className="font-medium text-zinc-900 dark:text-zinc-50">
											{trial1.data.length.toLocaleString()}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-zinc-600 dark:text-zinc-400">
											Aktywna noga:
										</dt>
										<dd className="font-medium text-zinc-900 dark:text-zinc-50">
											{trial1.activeLeg === "left" ? "Lewa" : "Prawa"}
										</dd>
									</div>
								</dl>
							</div>
						)}

						{trial2 && (
							<div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow">
								<h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-50">
									Próba 2 - Informacje
								</h3>
								<dl className="space-y-2 text-sm">
									{trial2.metadata.weight && (
										<div className="flex justify-between">
											<dt className="text-zinc-600 dark:text-zinc-400">
												Waga:
											</dt>
											<dd className="font-medium text-zinc-900 dark:text-zinc-50">
												{trial2.metadata.weight} kg
											</dd>
										</div>
									)}
									{trial2.metadata.frequency && (
										<div className="flex justify-between">
											<dt className="text-zinc-600 dark:text-zinc-400">
												Częstotliwość:
											</dt>
											<dd className="font-medium text-zinc-900 dark:text-zinc-50">
												{trial2.metadata.frequency} Hz
											</dd>
										</div>
									)}
									<div className="flex justify-between">
										<dt className="text-zinc-600 dark:text-zinc-400">
											Punkty danych:
										</dt>
										<dd className="font-medium text-zinc-900 dark:text-zinc-50">
											{trial2.data.length.toLocaleString()}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-zinc-600 dark:text-zinc-400">
											Aktywna noga:
										</dt>
										<dd className="font-medium text-zinc-900 dark:text-zinc-50">
											{trial2.activeLeg === "left" ? "Lewa" : "Prawa"}
										</dd>
									</div>
								</dl>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
