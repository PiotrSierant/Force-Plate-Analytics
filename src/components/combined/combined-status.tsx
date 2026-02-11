"use client";

import { AlertCircle, Loader2 } from "lucide-react";

interface CombinedStatusProps {
	error?: string;
	loading: boolean;
}

export function CombinedStatus({ error, loading }: CombinedStatusProps) {
	if (!error && !loading) return null;

	return (
		<div className="mb-8">
			{loading && (
				<div className="flex items-center gap-2 text-zinc-500">
					<Loader2 className="h-4 w-4 animate-spin" />
					Wczytywanie danych...
				</div>
			)}
			{error && (
				<div className="flex items-center gap-2 text-red-500" role="alert">
					<AlertCircle className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}
		</div>
	);
}
