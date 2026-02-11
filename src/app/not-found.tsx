import { Home, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-linear-to-br from-background via-background to-muted/40 px-6 py-16">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--border))_0,transparent_60%)] opacity-40" />
			<section className="relative w-full max-w-2xl">
				<div className="bg-card/80 border-border/70 rounded-3xl border shadow-[0_24px_70px_-45px_hsl(var(--foreground)/0.35)] backdrop-blur">
					<div className="flex flex-col gap-6 p-6 sm:p-10">
						<div className="flex items-start gap-4">
							<div className="text-muted-foreground ring-border/60 bg-muted/60 flex size-12 items-center justify-center rounded-2xl ring-1">
								<SearchX className="size-6" />
							</div>
							<div className="space-y-2">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">404</p>
								<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
									Nie znaleziono strony
								</h1>
								<p className="text-muted-foreground text-sm sm:text-base">
									Adres, którego szukasz, nie istnieje lub został przeniesiony.
								</p>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild>
								<Link href="/">
									<Home />
									Wróć na stronę główną
								</Link>
							</Button>
						</div>
					</div>
					<div className="border-border/60 border-t px-6 py-4 text-xs text-muted-foreground sm:px-10">
						Sprawdź adres URL lub skorzystaj z nawigacji, aby kontynuować.
					</div>
				</div>
			</section>
		</main>
	);
}
