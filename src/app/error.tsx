"use client";

import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-linear-to-br from-background via-background to-muted/40 px-6 py-16">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--border))_0,transparent_60%)] opacity-40" />
			<section className="relative w-full max-w-2xl">
				<div className="bg-card/80 border-border/70 rounded-3xl border shadow-[0_24px_70px_-45px_hsl(var(--foreground)/0.35)] backdrop-blur">
					<div className="flex flex-col gap-6 p-6 sm:p-10">
						<div className="flex items-start gap-4">
							<div className="text-destructive ring-destructive/30 bg-destructive/10 flex size-12 items-center justify-center rounded-2xl ring-1">
								<TriangleAlert className="size-6" />
							</div>
							<div className="space-y-2">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
									Błąd aplikacji
								</p>
								<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
									Coś poszło nie tak
								</h1>
								<p className="text-muted-foreground text-sm sm:text-base">
									Wystąpił nieoczekiwany problem. Spróbuj ponownie lub wróć do strony głównej.
								</p>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button onClick={() => reset()}>
								<RotateCcw />
								Spróbuj ponownie
							</Button>
							<Button variant="outline" asChild>
								<Link href="/">
									<Home />
									Wróć na stronę główną
								</Link>
							</Button>
						</div>
					</div>
					<div className="border-border/60 border-t px-6 py-4 text-xs text-muted-foreground sm:px-10">
						Jeśli problem się powtarza, odśwież stronę lub spróbuj ponownie później.
					</div>
				</div>
			</section>
		</main>
	);
}
