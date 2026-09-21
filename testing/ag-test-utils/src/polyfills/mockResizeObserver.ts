// happy-dom's `ResizeObserver` drops the callback and never delivers, so every container-resize path in
// the grid is observed and then never runs. This records the registrations and lets a test fire them.

type Registration = {
    readonly callback: ResizeObserverCallback;
    readonly observer: ResizeObserver;
    readonly elements: Set<Element>;
};

const registrations: Registration[] = [];

let originalImpl: typeof ResizeObserver | undefined;
let installed = false;

class MockResizeObserver implements ResizeObserver {
    private readonly registration: Registration;

    constructor(callback: ResizeObserverCallback) {
        this.registration = { callback, observer: this, elements: new Set() };
        registrations.push(this.registration);
    }

    public observe(element: Element): void {
        this.registration.elements.add(element);
    }

    public unobserve(element: Element): void {
        this.registration.elements.delete(element);
    }

    public disconnect(): void {
        this.registration.elements.clear();
    }
}

/**
 * Install before creating the grid, which observes during construction, and call the returned uninstaller
 * in `finally`. Deliberately silent on `observe`, unlike a real observer: delivering there would start the
 * container-resize paths in every suite that has never run them.
 */
export function installMockResizeObserver(): () => void {
    if (installed) {
        throw new Error('mock ResizeObserver already installed: the first uninstall would undo both');
    }
    originalImpl = window.ResizeObserver;
    window.ResizeObserver = MockResizeObserver;
    registrations.length = 0;
    installed = true;

    return () => {
        window.ResizeObserver = originalImpl!;
        originalImpl = undefined;
        registrations.length = 0;
        installed = false;
    };
}

/** The grid throttles these callbacks to an animation frame, so poll the assertion rather than reading it
 *  straight back. Entries are empty because no `_observeResize` callback reads them. */
export function triggerResizeObservers(): void {
    // Copied: a callback may observe or disconnect, which would otherwise mutate the list mid-iteration.
    for (const registration of registrations.slice()) {
        const { elements, observer } = registration;
        if (elements.size) {
            registration.callback([], observer);
        }
    }
}
