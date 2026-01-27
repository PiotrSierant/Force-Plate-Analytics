interface ComparisonStatusProps {
	error?: string;
	loading: boolean;
}

export function ComparisonStatus({ error, loading }: ComparisonStatusProps) {
	if (!error && !loading) {
		return null;
	}

	return (
		<>
			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
					{error}
				</div>
			)}
			{loading && (
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
					Wczytywanie pliku...
				</div>
			)}
		</>
	);
}
