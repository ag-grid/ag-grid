import type { Context } from 'ag-grid-community';

/**
 * Observes an element's parent to detect when the element is removed from the DOM.
 */
function observeElementRemoval(element: HTMLElement, onRemoved: () => void): () => void {
    const parent = element.parentElement;
    if (!parent) {
        return () => {};
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const removedNode of mutation.removedNodes) {
                if (removedNode === element) {
                    onRemoved();
                    observer.disconnect();
                    return;
                }
            }
        }
    });

    observer.observe(parent, { childList: true });

    return () => observer.disconnect();
}

interface GridContextEntry {
    context: Context;
    destroyFuncs: (() => void)[];
    disconnect: () => void;
}

/**
 * External store that manages grid context lifecycle by watching DOM elements directly.
 * This decouples cleanup from React's lifecycle, handling StrictMode, Activity, etc.
 */
class GridContextStore {
    private contexts = new Map<HTMLElement, GridContextEntry>();
    private pendingChecks = new Map<HTMLElement, ReturnType<typeof setInterval>>();

    /**
     * Register a grid context for an element. Sets up DOM observation for cleanup.
     */
    register(element: HTMLElement, context: Context, destroyFuncs: (() => void)[]): void {
        const disconnect = observeElementRemoval(element, () => this.cleanup(element));
        this.contexts.set(element, { context, destroyFuncs, disconnect });
    }

    /**
     * Get an existing context for an element (used for StrictMode reuse).
     */
    get(element: HTMLElement): GridContextEntry | undefined {
        return this.contexts.get(element);
    }

    /**
     * Called when React signals unmount (setRef(null)).
     * Starts periodic check for ancestor removal (MutationObserver only catches direct removal).
     */
    scheduleCleanupCheck(element: HTMLElement): void {
        if (this.pendingChecks.has(element)) {
            return;
        }

        const intervalId = setInterval(() => {
            if (!element.isConnected) {
                this.cleanup(element);
            }
        }, 100);

        this.pendingChecks.set(element, intervalId);
    }

    /**
     * Called when React remounts (StrictMode). Cancels the pending cleanup check.
     */
    cancelCleanupCheck(element: HTMLElement): void {
        const intervalId = this.pendingChecks.get(element);
        if (intervalId) {
            clearInterval(intervalId);
            this.pendingChecks.delete(element);
        }
    }

    /**
     * Clean up a grid context and its resources.
     */
    cleanup(element: HTMLElement): void {
        const data = this.contexts.get(element);
        if (data) {
            data.disconnect();
            for (const f of data.destroyFuncs) {
                f();
            }
            this.contexts.delete(element);
        }

        // Also clear any pending check
        const intervalId = this.pendingChecks.get(element);
        if (intervalId) {
            clearInterval(intervalId);
            this.pendingChecks.delete(element);
        }
    }
}

export const gridContextStore = new GridContextStore();
