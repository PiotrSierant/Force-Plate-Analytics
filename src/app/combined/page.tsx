import { Construction } from "lucide-react";

export default function CombinedPage() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
						Połączone nogi
					</h1>
					<p className="text-lg text-zinc-600 dark:text-zinc-400">
						Analiza połączonych danych z obu platform dynamometrycznych
					</p>
				</div>

				<div className="flex flex-col items-center justify-center py-16 text-center">
					<Construction className="h-16 w-16 text-zinc-400 mb-4" />
					<h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">W budowie</h2>
					<p className="text-zinc-500 dark:text-zinc-400 max-w-md">
						Ta funkcjonalność jest obecnie w trakcie rozwoju. Wkrótce będzie można analizować
						połączone dane z obu nóg.
					</p>
				</div>
			</div>
		</div>
	);
}
