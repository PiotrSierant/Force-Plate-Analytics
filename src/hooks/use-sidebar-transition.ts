"use client";

import { useSyncExternalStore } from "react";

const SIDEBAR_TRANSITION_DURATION = 200; // ms - matches sidebar CSS transition

type TransitionState = "idle" | "transitioning";

// Module-level state for cross-component synchronization
let transitionState: TransitionState = "idle";
let transitionTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
	listeners.add(callback);
	return () => listeners.delete(callback);
}

function getSnapshot() {
	return transitionState;
}

function notifyListeners() {
	for (const listener of listeners) {
		listener();
	}
}

/**
 * Notify that sidebar transition has started.
 * Call this when sidebar toggle happens.
 */
export function notifySidebarTransition() {
	if (transitionTimeout) {
		clearTimeout(transitionTimeout);
	}

	transitionState = "transitioning";
	notifyListeners();

	transitionTimeout = setTimeout(() => {
		transitionState = "idle";
		transitionTimeout = null;
		notifyListeners();
	}, SIDEBAR_TRANSITION_DURATION + 50); // Small buffer for safety
}

/**
 * Hook that tracks sidebar transition state.
 * Returns true when sidebar is actively animating.
 */
export function useSidebarTransition() {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot) === "transitioning";
}
