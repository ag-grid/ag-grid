/**
 * Polyfill to simulate Shadow DOM event retargeting in jsdom.
 *
 * In browsers, `event.target` is retargeted to the shadow host when events bubble
 * out of a shadow root, but `composedPath()[0]` returns the actual target.
 * jsdom doesn't implement this, so we patch dispatchEvent to simulate it.
 */

let initialized = false;
let originalDispatchEvent: typeof HTMLElement.prototype.dispatchEvent | null = null;

function findShadowHost(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Node)) {
        return null;
    }
    const root = target.getRootNode();
    return root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
}

export function initShadowDomEventRetargeting(): void {
    if (initialized) {
        return;
    }
    initialized = true;
    originalDispatchEvent = HTMLElement.prototype.dispatchEvent;

    HTMLElement.prototype.dispatchEvent = function (this: HTMLElement, event: Event): boolean {
        const shadowHost = findShadowHost(this);

        if (!shadowHost) {
            return originalDispatchEvent!.call(this, event);
        }

        const originalTarget = this;
        const originalComposedPath = event.composedPath.bind(event);
        const fullPath = [originalTarget, ...originalComposedPath()];

        // Override target to return shadow host (simulating browser retargeting)
        Object.defineProperty(event, 'target', {
            get: () => shadowHost,
            configurable: true,
        });

        // composedPath() returns the full path including the actual original target
        Object.defineProperty(event, 'composedPath', {
            value: () => fullPath,
            configurable: true,
        });

        try {
            return originalDispatchEvent!.call(this, event);
        } finally {
            delete (event as any).target;
            delete (event as any).composedPath;
        }
    };
}

export function cleanupShadowDomEventRetargeting(): void {
    if (!initialized || !originalDispatchEvent) {
        return;
    }
    HTMLElement.prototype.dispatchEvent = originalDispatchEvent;
    originalDispatchEvent = null;
    initialized = false;
}
