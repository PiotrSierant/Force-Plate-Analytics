import { Activity, ArrowRight, Footprints, GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Hero Section */}
				<div className="text-center mb-16 pt-8">
					<div className="flex justify-center mb-6">
						<div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
							<Activity className="h-16 w-16 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
						Force Plate Analytics
					</h1>
					<p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
						Zaawansowana analiza danych z platform dynamometrycznych. Porównuj próby i analizuj
						wyniki w czasie rzeczywistym.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
					{/* Comparison Card */}
					<Link
						href="/comparison"
						className="group p-8 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
					>
						<div className="flex items-start gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
								<GitCompareArrows className="h-8 w-8 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
									Porównanie L/P
									<ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
								</h2>
								<p className="text-zinc-600 dark:text-zinc-400">
									Porównaj dane z lewej i prawej platformy dynamometrycznej. Analizuj różnice między
									próbami i identyfikuj asymetrie.
								</p>
							</div>
						</div>
					</Link>

					{/* Combined Card */}
					<Link
						href="/combined"
						className="group p-8 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all"
					>
						<div className="flex items-start gap-4">
							<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
								<Footprints className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
									Połączone nogi
									<ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
								</h2>
								<p className="text-zinc-600 dark:text-zinc-400">
									Analizuj połączone dane z obu platform. Obliczaj całkowitą siłę reakcji podłoża i
									środek nacisku.
								</p>
							</div>
						</div>
					</Link>
				</div>

				{/* Quick Start */}
				<div className="mt-16 text-center">
					<p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
						Wybierz tryb analizy, aby rozpocząć
					</p>
					<div className="flex gap-4 justify-center">
						<Button asChild>
							<Link href="/comparison">
								<GitCompareArrows className="mr-2 h-4 w-4" />
								Porównanie L/P
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/combined">
								<Footprints className="mr-2 h-4 w-4" />
								Połączone nogi
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
