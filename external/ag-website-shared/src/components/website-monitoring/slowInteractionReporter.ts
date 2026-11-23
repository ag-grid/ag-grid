import { withoutQuery } from '@ag-website-shared/components/website-monitoring/cspViolationReporter';

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
// Long animation frames and iframe entries older than this cannot match an interaction still being collected
const RETENTION_MS = 30_000;
// Script URLs whose remainder can be the script itself, or identify the visitor, e.g. an extension's id
const OPAQUE_SCRIPT_URL = /^(data|blob|javascript):/i;
const OTHER_SCRIPT_URL = /^([a-z][a-z\d+.-]*):\/\//i;

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

interface DocumentObservers {
    // Holds the document, if it is an iframe's, so its observers can be let go of once it is removed
    iframe?: HTMLIFrameElement;
    // Collects the entries that have been queued but not yet delivered
    takeRecords: () => void;
    disconnect: () => void;
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

// A script's source or invoker without its query: only the scheme of a URL other than http(s), and
// labels such as 'TimerHandler:setTimeout' as they are
function describeScript(value: string): string {
    if (/^https?:/i.test(value)) {
        return withoutQuery(value).split('?')[0].slice(0, MAX_SCRIPT_LABEL_LENGTH);
    }
    const scheme = (OPAQUE_SCRIPT_URL.exec(value) ?? OTHER_SCRIPT_URL.exec(value))?.[1];
    return scheme ? `${scheme.toLowerCase()}:` : value.split('?')[0].slice(0, MAX_SCRIPT_LABEL_LENGTH);
}

/**
 * Reports each interaction that takes `SLOW_INTERACTION_MS` or longer to paint, with its target,
 * timing, load state and the scripts in the long animation frames it overlapped, up to `MAX_REPORTS`.
 *
 * @returns a function that stops reporting
 */
export function startSlowInteractionReporting(
    send: (attributes: InteractionAttributes) => void,
    topWindow: typeof window = window
): () => void {
    const topDocument = topWindow.document;
    const now = () => topWindow.performance.timeOrigin + topWindow.performance.now();

    // From the top page, which Chromium also reports same-origin iframes' long animation frames to
    const animationFrames: AnimationFrame[] = [];
    const navigations: Navigation[] = [{ isInitial: true, start: topWindow.performance.timeOrigin }];
    const pending = new Map<string, PendingInteraction>();
    const reported = new Set<string>();
    // The slow entries collected from iframes, by absolute start time
    const iframeEntries: Array<{ start: number; collectedAt: number }> = [];
    const observedDocuments = new WeakSet<Document>();
    const observers = new Set<DocumentObservers>();
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
        // Broken down from the paint of the longest event, which sets the duration. A press and a release
        // can be painted separately.
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

    // Chromium also reports an iframe tap to the top page, whose copy is only a fallback
    const isReportedByIframe = ({ targetsObservedIframe, timeOrigin, entries }: PendingInteraction) =>
        targetsObservedIframe &&
        entries.some((entry) =>
            iframeEntries.some(
                (iframeEntry) => Math.abs(iframeEntry.start - (timeOrigin + entry.startTime)) <= SAME_PAINT_MS
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
        const cutoff = now() - RETENTION_MS;
        while (animationFrames.length && animationFrames[0].end < cutoff) {
            animationFrames.shift();
        }
    };

    const recordIframeEntry = (start: number) => {
        const collectedAt = now();
        while (iframeEntries.length && iframeEntries[0].collectedAt < collectedAt - RETENTION_MS) {
            iframeEntries.shift();
        }
        iframeEntries.push({ start, collectedAt });
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
                recordIframeEntry(win.performance.timeOrigin + entry.startTime);
            }
        }
        scheduleFlush();
    };

    // The top page sees only part of a tap inside an iframe, and none of its processing, so the page's
    // own same-origin iframes are observed too, such as the docs examples
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

        const animationFrameObserver =
            !iframe && supportsAnimationFrames(win)
                ? new win.PerformanceObserver((list) =>
                      recordAnimationFrames(timeOrigin, list.getEntries() as LongAnimationFrameTiming[])
                  )
                : undefined;
        animationFrameObserver?.observe({ type: 'long-animation-frame', buffered: true });

        const documentObservers: DocumentObservers = {
            iframe,
            takeRecords: () => {
                recordAnimationFrames(
                    timeOrigin,
                    (animationFrameObserver?.takeRecords() ?? []) as LongAnimationFrameTiming[]
                );
                recordInteractions(observed, interactionObserver.takeRecords() as InteractionTiming[]);
            },
            disconnect: () => {
                interactionObserver.disconnect();
                animationFrameObserver?.disconnect();
                win.removeEventListener('pagehide', onPageHide);
                observers.delete(documentObservers);
            },
        };
        // Its observers go with the document, so let go of them when the frame navigates away. A
        // document kept in the back/forward cache comes back with its observers still running.
        const onPageHide = (event: PageTransitionEvent) => {
            if (!event.persisted) {
                documentObservers.takeRecords();
                documentObservers.disconnect();
            }
        };
        observers.add(documentObservers);
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
        observers.forEach(({ iframe, disconnect }) => {
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
    // The page may not run again once hidden, so send everything, including entries not yet delivered
    const sendAll = () => {
        observers.forEach(({ takeRecords }) => takeRecords());
        flush(true);
    };
    const onVisibilityChange = () => {
        if (topDocument.visibilityState === 'hidden') {
            sendAll();
        }
    };

    // Discards anything not yet sent
    const dispose = () => {
        clearTimeout(flushTimeout);
        flushTimeout = undefined;
        observers.forEach(({ disconnect }) => disconnect());
        topDocument.removeEventListener('load', onLoad, true);
        topDocument.removeEventListener('astro:before-preparation', onBeforePreparation);
        topDocument.removeEventListener('astro:page-load', onPageLoad);
        topDocument.removeEventListener('visibilitychange', onVisibilityChange);
        topWindow.removeEventListener('pagehide', sendAll);
    };

    if (!supportsInteractions(topWindow)) {
        return dispose;
    }

    topDocument.addEventListener('load', onLoad, true);
    topDocument.addEventListener('astro:before-preparation', onBeforePreparation);
    topDocument.addEventListener('astro:page-load', onPageLoad);
    topDocument.addEventListener('visibilitychange', onVisibilityChange);
    // A tab can be closed without a visibility change
    topWindow.addEventListener('pagehide', sendAll);

    observeWindow(topWindow);
    topDocument.querySelectorAll('iframe').forEach(observeIframe);

    return dispose;
}
