type InteractionAttributes = Record<string, string | number | boolean>;

// Search Console's boundary between a good INP and one that needs improvement
export const SLOW_INTERACTION_MS = 200;
// Long enough for the long animation frame that paints an interaction to be reported as well
export const FLUSH_DELAY_MS = 1000;
// Bounds what one document sends, across every frame it observes and every client-side navigation
export const MAX_REPORTS = 20;
// Event durations are rounded to 8ms, so events whose ends are this close were painted in the same frame
const SAME_PAINT_MS = 8;
const MAX_TARGET_DEPTH = 3;
const MAX_SCRIPTS = 3;
const MAX_SCRIPT_LABEL_LENGTH = 120;
// Long animation frames older than this cannot overlap an interaction that is still being collected
const ANIMATION_FRAME_RETENTION_MS = 30_000;
// URL schemes whose remainder can be the script itself
const OPAQUE_SCRIPT_URL = /^(data|blob|javascript):/i;

// Not in TypeScript's DOM lib yet: https://w3c.github.io/event-timing/#dom-performanceeventtiming-interactionid
interface InteractionTiming extends PerformanceEventTiming {
    interactionId: number;
}

// Not in TypeScript's DOM lib yet: https://w3c.github.io/long-animation-frames/
interface LongAnimationFrameTiming extends PerformanceEntry {
    styleAndLayoutStart: number;
    scripts: Array<{ sourceURL: string; invoker: string; invokerType: string; duration: number }>;
}

interface ScriptTiming {
    source: string;
    invoker: string;
    invokerType: string;
    duration: number;
}

// Times are absolute (time origin + timestamp), since every frame has its own time origin
interface AnimationFrame {
    start: number;
    end: number;
    styleAndLayoutStart: number;
    scripts: ScriptTiming[];
}

interface Navigation {
    isInitial: boolean;
    start: number;
    end?: number;
}

interface ObservedDocument {
    win: typeof window;
    doc: Document;
    // Interaction ids are only unique within a document
    id: number;
    frame: 'top' | 'iframe';
    framePath?: string;
}

interface PendingInteraction {
    frame: ObservedDocument['frame'];
    framePath?: string;
    timeOrigin: number;
    loadState: string;
    // When it was first seen, which starts its time to collect the long animation frames that painted it
    collectedAt: number;
    // A tap inside an observed iframe, which that iframe reports itself if its own entries are slow too
    targetsObservedIframe: boolean;
    entries: InteractionTiming[];
}

function supportsInteractions(win: typeof window): boolean {
    return 'PerformanceEventTiming' in win && 'interactionId' in win.PerformanceEventTiming.prototype;
}

function supportsAnimationFrames(win: typeof window): boolean {
    return win.PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame') ?? false;
}

// The same states as web-vitals' INP attribution, from the frame's own navigation timing
function getLoadState(win: typeof window, timestamp: number): string {
    const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    // Each milestone is 0 until it is reached
    if (!navigation || navigation.domInteractive === 0 || timestamp < navigation.domInteractive) {
        return 'loading';
    }
    if (navigation.domContentLoadedEventStart === 0 || timestamp < navigation.domContentLoadedEventStart) {
        return 'dom-interactive';
    }
    if (navigation.domComplete === 0 || timestamp < navigation.domComplete) {
        return 'dom-content-loaded';
    }
    return 'complete';
}

// Tag, id and the first two classes of the target and its nearest ancestors. Never its content.
function describeTarget(node: Node | null | undefined): string {
    const parts: string[] = [];
    let element = node?.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node?.parentElement ?? null);
    while (element && parts.length < MAX_TARGET_DEPTH && element.localName !== 'body' && element.localName !== 'html') {
        const id = element.id ? `#${element.id}` : '';
        const classes = Array.from(element.classList)
            .slice(0, 2)
            .map((className) => `.${className}`)
            .join('');
        parts.unshift(element.localName + id + classes);
        element = element.parentElement;
    }
    return parts.join(' > ');
}

/**
 * A script's source URL or invoker, in a form safe to send: origin and path for an http(s) URL, only
 * the scheme for a URL that can hold the script itself, such as data:, and otherwise the label without
 * any query, e.g. 'BUTTON#sort.onclick' or 'TimerHandler:setTimeout'.
 */
function describeScript(value: string): string {
    const opaque = OPAQUE_SCRIPT_URL.exec(value);
    if (opaque) {
        return `${opaque[1].toLowerCase()}:`;
    }
    let described = value.split('?')[0];
    if (/^https?:/i.test(value)) {
        try {
            const url = new URL(value);
            described = url.origin + url.pathname;
        } catch {
            // Keep the label without its query
        }
    }
    return described.slice(0, MAX_SCRIPT_LABEL_LENGTH);
}

/**
 * Reports each interaction that takes `SLOW_INTERACTION_MS` or longer to paint, with what was
 * interacted with, where the time went, how far the page had loaded, and the scripts running in the
 * long animation frames it overlapped.
 *
 * The SDK reports INP as a number, from the top-level page's Event Timing. Search Console's INP also
 * counts interactions inside iframes, of which the top page sees part at most: a tap's pointer events
 * but not its click, and none of its processing time. So this also observes the page's own
 * same-origin iframes directly, such as the docs examples, though not iframes nested inside them.
 *
 * Observers are buffered, so interactions from before monitoring started are still reported. Stops
 * observing once `MAX_REPORTS` have been sent.
 *
 * @returns a function that stops reporting
 */
export function startSlowInteractionReporting(
    send: (attributes: InteractionAttributes) => void,
    topWindow: typeof window = window
): () => void {
    const topDocument = topWindow.document;
    const now = () => topWindow.performance.timeOrigin + topWindow.performance.now();

    // From every observed document. They share one main thread, so a long frame in one example delays
    // a tap in another, and Chromium reports a same-origin iframe's long animation frames to the top
    // page rather than to the iframe.
    const animationFrames: AnimationFrame[] = [];
    const navigations: Navigation[] = [{ isInitial: true, start: topWindow.performance.timeOrigin }];
    const pending = new Map<string, PendingInteraction>();
    const reported = new Set<string>();
    // Absolute start times of the slow entries collected from iframes
    const iframeEntryStarts: number[] = [];
    const observedDocuments = new WeakSet<Document>();
    // The iframe that holds each observed document, if any, so it can be let go of once removed
    const observers = new Map<() => void, HTMLIFrameElement | undefined>();
    let nextDocumentId = 0;
    let reportCount = 0;
    let flushTimeout: ReturnType<typeof setTimeout> | undefined;

    // The navigation the page was on at the given time
    const getNavigationAt = (time: number): Navigation => {
        for (let i = navigations.length - 1; i > 0; i--) {
            if (navigations[i].start <= time) {
                return navigations[i];
            }
        }
        return navigations[0];
    };

    const describeInteraction = ({
        frame,
        framePath,
        timeOrigin,
        loadState,
        entries,
    }: PendingInteraction): InteractionAttributes => {
        // The interaction's duration is its longest event's, so the breakdown and long animation frames
        // come from that event's paint and the events painted with it. A press and a release can be
        // painted separately, with the pointer held in between.
        const longest = entries.reduce((a, b) => (b.duration > a.duration ? b : a));
        const startTime = longest.startTime;
        const endTime = longest.startTime + longest.duration;
        const painted = entries.filter(
            (entry) => Math.abs(entry.startTime + entry.duration - endTime) <= SAME_PAINT_MS
        );
        const processingStart = Math.min(...painted.map((entry) => entry.processingStart));
        const processingEnd = Math.max(...painted.map((entry) => entry.processingEnd));
        const start = timeOrigin + startTime;
        const end = timeOrigin + endTime;

        const overlapping = animationFrames.filter(
            (animationFrame) => animationFrame.start < end && animationFrame.end > start
        );
        const scripts = overlapping
            .flatMap((animationFrame) => animationFrame.scripts)
            .sort((a, b) => b.duration - a.duration);
        const navigation = getNavigationAt(start);

        const attributes: InteractionAttributes = {
            frame,
            eventType: longest.name,
            interactionType: longest.name.startsWith('key') ? 'keyboard' : 'pointer',
            target: describeTarget(entries.find((entry) => entry.target)?.target),
            duration: Math.round(longest.duration),
            inputDelay: Math.round(processingStart - startTime),
            processingDuration: Math.round(processingEnd - processingStart),
            presentationDelay: Math.round(Math.max(0, endTime - processingEnd)),
            loadState,
            msSinceDocumentStart: Math.round(startTime),
            navigation: navigation.isInitial ? 'initial' : 'client-side',
            msSinceNavigation: Math.round(start - navigation.start),
            animationFrameCount: overlapping.length,
            scriptDuration: Math.round(scripts.reduce((total, script) => total + script.duration, 0)),
            styleAndLayoutDuration: Math.round(
                overlapping.reduce(
                    (total, animationFrame) =>
                        total +
                        (animationFrame.styleAndLayoutStart
                            ? animationFrame.end - animationFrame.styleAndLayoutStart
                            : 0),
                    0
                )
            ),
        };
        if (framePath) {
            attributes.framePath = framePath;
        }
        if (!navigation.isInitial) {
            attributes.navigationComplete = navigation.end !== undefined && start >= navigation.end;
        }
        scripts.slice(0, MAX_SCRIPTS).forEach((script, index) => {
            const prefix = `script${index + 1}`;
            attributes[`${prefix}Source`] = script.source;
            attributes[`${prefix}Invoker`] = script.invoker;
            attributes[`${prefix}InvokerType`] = script.invokerType;
            attributes[`${prefix}Duration`] = Math.round(script.duration);
        });
        return attributes;
    };

    // Chromium reports a tap inside a same-origin iframe to the top page as well. The iframe's own
    // report can tell its processing apart from the time to paint, so the top page's is only a fallback.
    const isReportedByIframe = ({ targetsObservedIframe, timeOrigin, entries }: PendingInteraction) =>
        targetsObservedIframe &&
        entries.some((entry) =>
            iframeEntryStarts.some(
                (iframeStart) => Math.abs(iframeStart - (timeOrigin + entry.startTime)) <= SAME_PAINT_MS
            )
        );

    const scheduleFlush = () => {
        if (flushTimeout || !pending.size) {
            return;
        }
        const firstCollected = Math.min(...Array.from(pending.values(), (interaction) => interaction.collectedAt));
        flushTimeout = setTimeout(() => flush(), Math.max(0, firstCollected + FLUSH_DELAY_MS - now()));
    };

    // Sends each interaction once it has had `FLUSH_DELAY_MS` to collect its long animation frames,
    // or every interaction collected so far when `all` is set
    const flush = (all = false) => {
        clearTimeout(flushTimeout);
        flushTimeout = undefined;
        const collectedBy = now() - FLUSH_DELAY_MS;
        for (const [key, interaction] of pending) {
            if (!all && interaction.collectedAt > collectedBy) {
                continue;
            }
            pending.delete(key);
            reported.add(key);
            if (reportCount < MAX_REPORTS && !isReportedByIframe(interaction)) {
                reportCount++;
                send(describeInteraction(interaction));
            }
        }
        if (reportCount >= MAX_REPORTS) {
            dispose();
            return;
        }
        scheduleFlush();
    };

    const recordAnimationFrames = (timeOrigin: number, entries: LongAnimationFrameTiming[]) => {
        for (const entry of entries) {
            animationFrames.push({
                start: timeOrigin + entry.startTime,
                end: timeOrigin + entry.startTime + entry.duration,
                styleAndLayoutStart: entry.styleAndLayoutStart ? timeOrigin + entry.styleAndLayoutStart : 0,
                scripts: entry.scripts.map((script) => ({
                    source: describeScript(script.sourceURL),
                    invoker: describeScript(script.invoker),
                    invokerType: script.invokerType,
                    duration: script.duration,
                })),
            });
        }
        const cutoff = now() - ANIMATION_FRAME_RETENTION_MS;
        while (animationFrames.length && animationFrames[0].end < cutoff) {
            animationFrames.shift();
        }
    };

    const recordInteractions = (observed: ObservedDocument, entries: InteractionTiming[]) => {
        const { win, doc, id, frame, framePath } = observed;
        for (const entry of entries) {
            const key = `${id}:${entry.interactionId}`;
            if (!entry.interactionId || entry.duration < SLOW_INTERACTION_MS || reported.has(key)) {
                continue;
            }
            let interaction = pending.get(key);
            if (!interaction) {
                const ownerDocument = entry.target?.ownerDocument;
                interaction = {
                    frame,
                    framePath,
                    timeOrigin: win.performance.timeOrigin,
                    loadState: getLoadState(win, entry.startTime),
                    collectedAt: now(),
                    targetsObservedIframe:
                        !!ownerDocument && ownerDocument !== doc && observedDocuments.has(ownerDocument),
                    entries: [],
                };
                pending.set(key, interaction);
            }
            interaction.entries.push(entry);
            if (frame === 'iframe') {
                iframeEntryStarts.push(win.performance.timeOrigin + entry.startTime);
            }
        }
        scheduleFlush();
    };

    const observeWindow = (win: typeof window, iframe?: HTMLIFrameElement) => {
        let doc: Document;
        try {
            doc = win.document;
        } catch {
            // A cross-origin frame, which the Event Timing API does not expose
            return;
        }
        if (observedDocuments.has(doc) || doc.URL === 'about:blank' || !supportsInteractions(win)) {
            return;
        }
        observedDocuments.add(doc);

        const timeOrigin = win.performance.timeOrigin;
        const frame = iframe ? 'iframe' : 'top';
        const observed: ObservedDocument = {
            win,
            doc,
            id: nextDocumentId++,
            frame,
            framePath: iframe ? win.location.pathname : undefined,
        };

        const interactionObserver = new win.PerformanceObserver((list) =>
            recordInteractions(observed, list.getEntries() as InteractionTiming[])
        );
        // durationThreshold is not in TypeScript's DOM lib yet
        interactionObserver.observe({
            type: 'event',
            buffered: true,
            durationThreshold: SLOW_INTERACTION_MS,
        } as PerformanceObserverInit);

        const animationFrameObserver = supportsAnimationFrames(win)
            ? new win.PerformanceObserver((list) =>
                  recordAnimationFrames(timeOrigin, list.getEntries() as LongAnimationFrameTiming[])
              )
            : undefined;
        animationFrameObserver?.observe({ type: 'long-animation-frame', buffered: true });

        // Its observers go with the document, so let go of them when the frame navigates away. A
        // document kept in the back/forward cache comes back with its observers still running.
        const onPageHide = (event: PageTransitionEvent) => {
            if (!event.persisted) {
                disconnect();
            }
        };
        const disconnect = () => {
            interactionObserver.disconnect();
            animationFrameObserver?.disconnect();
            win.removeEventListener('pagehide', onPageHide);
            observers.delete(disconnect);
        };
        observers.set(disconnect, iframe);
        if (iframe) {
            win.addEventListener('pagehide', onPageHide);
        }
    };

    const observeIframe = (iframe: HTMLIFrameElement) => {
        if (iframe.contentWindow) {
            observeWindow(iframe.contentWindow as typeof window, iframe);
        }
    };

    // An iframe removed from the page, such as an example on the page navigated away from, does not
    // always fire pagehide
    const disconnectRemovedIframes = () => {
        observers.forEach((iframe, disconnect) => {
            if (iframe && !iframe.isConnected) {
                disconnect();
            }
        });
    };

    // An iframe's load event does not bubble, but a capturing listener still sees it
    const onLoad = (event: Event) => {
        const target = event.target as Element | null;
        if (target?.localName === 'iframe') {
            disconnectRemovedIframes();
            observeIframe(target as HTMLIFrameElement);
        }
    };
    const onBeforePreparation = () => navigations.push({ isInitial: false, start: now() });
    const onPageLoad = () => {
        disconnectRemovedIframes();
        const navigation = navigations[navigations.length - 1];
        if (!navigation.isInitial && navigation.end === undefined) {
            navigation.end = now();
        }
    };
    const onVisibilityChange = () => {
        if (topDocument.visibilityState === 'hidden') {
            flush(true);
        }
    };

    const dispose = () => {
        clearTimeout(flushTimeout);
        flushTimeout = undefined;
        observers.forEach((_iframe, disconnect) => disconnect());
        topDocument.removeEventListener('load', onLoad, true);
        topDocument.removeEventListener('astro:before-preparation', onBeforePreparation);
        topDocument.removeEventListener('astro:page-load', onPageLoad);
        topDocument.removeEventListener('visibilitychange', onVisibilityChange);
    };

    if (!supportsInteractions(topWindow)) {
        return dispose;
    }

    topDocument.addEventListener('load', onLoad, true);
    topDocument.addEventListener('astro:before-preparation', onBeforePreparation);
    topDocument.addEventListener('astro:page-load', onPageLoad);
    topDocument.addEventListener('visibilitychange', onVisibilityChange);

    observeWindow(topWindow);
    topDocument.querySelectorAll('iframe').forEach(observeIframe);

    return dispose;
}
