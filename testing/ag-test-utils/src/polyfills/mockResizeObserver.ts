// happy-dom's `ResizeObserver` never delivers: this one reports the sizes `mockGridLayout` gives, as a browser would.

/** "w,h" before an element's first report: as a browser, an element first measuring 0 by 0 is not reported. */
const UNREPORTED_SIZE = '0,0';

const layoutObservers = new Set<LayoutResizeObserver>();
/** The `requestAnimationFrame` the pending check is scheduled with: a fake clock swapped out drops its frames. */
let layoutCheckScheduledWith: typeof window.requestAnimationFrame | null = null;

/** happy-dom's observer never delivers; this one reports as a browser does: each observed element's size once it
 *  is rendered, then each change, checked a frame after a DOM change. An element not rendered measures 0 by 0. */
class LayoutResizeObserver implements ResizeObserver {
    private readonly reported = new Map<Element, string>();

    constructor(private readonly callback: ResizeObserverCallback) {}

    public observe(target: Element): void {
        if (this.reported.has(target)) {
            return;
        }
        this.reported.set(target, UNREPORTED_SIZE);
        layoutObservers.add(this);
        scheduleLayoutCheck();
    }

    public unobserve(target: Element): void {
        this.reported.delete(target);
        if (this.reported.size === 0) {
            layoutObservers.delete(this);
        }
    }

    public disconnect(): void {
        this.reported.clear();
        layoutObservers.delete(this);
    }

    /** `forced`: those targets (`true`: every one) are reported whether or not their size changed. */
    public deliver(forced: Element | boolean): void {
        let entries: ResizeObserverEntry[] | null = null;
        for (const [target, last] of this.reported) {
            const rendered = target instanceof HTMLElement && target.offsetParent != null;
            const rect = rendered ? target.getBoundingClientRect() : new DOMRect(0, 0, 0, 0);
            const size = `${rect.width},${rect.height}`;
            if (size !== last || forced === true || forced === target) {
                this.reported.set(target, size);
                const boxSize = [{ inlineSize: rect.width, blockSize: rect.height }];
                entries ??= [];
                entries.push({
                    target,
                    contentRect: rect,
                    borderBoxSize: boxSize,
                    contentBoxSize: boxSize,
                    devicePixelContentBoxSize: boxSize,
                });
            }
        }
        if (entries !== null) {
            this.callback(entries, this);
        }
    }
}

function scheduleLayoutCheck(): void {
    const requestFrame = window.requestAnimationFrame;
    if (layoutCheckScheduledWith === requestFrame || layoutObservers.size === 0) {
        return;
    }
    layoutCheckScheduledWith = requestFrame;
    requestFrame(() => {
        layoutCheckScheduledWith = null;
        // copied: a callback may observe or disconnect
        for (const observer of Array.from(layoutObservers)) {
            observer.deliver(false);
        }
    });
}

let layoutObserverInstalled = false;

/** Installed once per window by `mockGridLayout.init`, whose mocked sizes it reports. */
export function installLayoutResizeObserver(): void {
    if (layoutObserverInstalled) {
        return;
    }
    layoutObserverInstalled = true;
    window.ResizeObserver = LayoutResizeObserver;
    new MutationObserver(scheduleLayoutCheck).observe(document, { subtree: true, childList: true, attributes: true });
}

/** Drops every observer: one a grid left alive (its creation threw) must not see a later file's resizes. */
export function resetLayoutObservers(): void {
    layoutObservers.clear();
}

/** Reports `target` (every observed element, without one) resized now, whatever its size, with any other pending
 *  size change: one the mock cannot see, such as a `mockGridLayout` size set by a test. */
export function triggerResizeObservers(target?: Element): void {
    // copied: a callback may observe or disconnect
    for (const observer of Array.from(layoutObservers)) {
        observer.deliver(target ?? true);
    }
}
