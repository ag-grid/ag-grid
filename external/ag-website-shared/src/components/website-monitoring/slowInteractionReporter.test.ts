// @vitest-environment jsdom
import { vi } from 'vitest';

import { FLUSH_DELAY_MS, MAX_REPORTS, startSlowInteractionReporting } from './slowInteractionReporter';

const NOW = 100_000;
const TOP_TIME_ORIGIN = 90_000;

// Loaded at 300ms, DOMContentLoaded at 400ms, complete at 900ms
const NAVIGATION_TIMING = { domInteractive: 300, domContentLoadedEventStart: 400, domComplete: 900 };

interface FakeFrame {
    win: typeof window;
    emit: (type: 'event' | 'long-animation-frame', entries: object[]) => void;
    dispatch: (type: string) => void;
}

// jsdom has no Event Timing or Long Animation Frames, so fake the parts of a frame the reporter reads
function createFakeFrame({
    path = '/',
    timeOrigin = TOP_TIME_ORIGIN,
    document,
    supportsInteractions = true,
}: { path?: string; timeOrigin?: number; document?: Document; supportsInteractions?: boolean } = {}): FakeFrame {
    const callbacks = new Map<string, (entries: object[]) => void>();

    class FakePerformanceObserver {
        static supportedEntryTypes = ['event', 'long-animation-frame'];
        private type = '';

        constructor(private readonly callback: (list: { getEntries: () => object[] }) => void) {}

        observe({ type }: PerformanceObserverInit) {
            this.type = type!;
            callbacks.set(this.type, (entries) => this.callback({ getEntries: () => entries }));
        }

        disconnect() {
            callbacks.delete(this.type);
        }
    }

    class FakePerformanceEventTiming {
        get interactionId() {
            return 0;
        }
    }

    const events = new EventTarget();
    const win = {
        PerformanceObserver: FakePerformanceObserver,
        ...(supportsInteractions && { PerformanceEventTiming: FakePerformanceEventTiming }),
        performance: {
            timeOrigin,
            now: () => Date.now() - timeOrigin,
            getEntriesByType: () => [NAVIGATION_TIMING],
        },
        document: document ?? { URL: `https://www.ag-grid.com${path}` },
        location: { pathname: path },
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
    };

    return {
        win: win as unknown as typeof window,
        emit: (type, entries) => callbacks.get(type)?.(entries),
        dispatch: (type) => events.dispatchEvent(new Event(type)),
    };
}

function interaction(overrides: Record<string, unknown> = {}) {
    return {
        name: 'pointerdown',
        interactionId: 1,
        startTime: 500,
        duration: 240,
        processingStart: 600,
        processingEnd: 680,
        target: null,
        ...overrides,
    };
}

function addIframe(win: typeof window) {
    const iframe = document.createElement('iframe');
    let contentWindow = win;
    Object.defineProperty(iframe, 'contentWindow', { get: () => contentWindow });
    document.body.appendChild(iframe);
    return {
        load: (nextWindow: typeof window = contentWindow) => {
            contentWindow = nextWindow;
            iframe.dispatchEvent(new Event('load'));
        },
    };
}

describe('startSlowInteractionReporting', () => {
    const send = vi.fn();
    let top: FakeFrame;
    let stop: (() => void) | undefined;

    const start = () => {
        stop = startSlowInteractionReporting(send, top.win);
    };

    beforeEach(() => {
        vi.useFakeTimers({ now: NOW });
        send.mockClear();
        top = createFakeFrame({ document });
    });

    afterEach(() => {
        stop?.();
        stop = undefined;
        document.body.innerHTML = '';
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('reports a slow interaction with its timing, target and load state', () => {
        document.body.innerHTML =
            '<main><div id="grid" class="a b c"><button class="btn primary">Sort</button></div></main>';
        start();

        top.emit('event', [interaction({ target: document.querySelector('button') })]);
        expect(send).not.toHaveBeenCalled();
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith({
            frame: 'top',
            eventType: 'pointerdown',
            interactionType: 'pointer',
            target: 'main > div#grid.a.b > button.btn.primary',
            duration: 240,
            inputDelay: 100,
            processingDuration: 80,
            presentationDelay: 60,
            loadState: 'dom-content-loaded',
            msSinceDocumentStart: 500,
            navigation: 'initial',
            msSinceNavigation: 500,
            animationFrameCount: 0,
            scriptDuration: 0,
            styleAndLayoutDuration: 0,
        });
    });

    test.each([
        [100, 'loading'],
        [350, 'dom-interactive'],
        [950, 'complete'],
    ])('reports an interaction at %ims as %s', (startTime, loadState) => {
        start();

        top.emit('event', [interaction({ startTime, processingStart: startTime, processingEnd: startTime })]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).toHaveBeenCalledWith(expect.objectContaining({ loadState }));
    });

    test('ignores fast interactions, and events that are not interactions', () => {
        start();

        top.emit('event', [interaction({ duration: 192 }), interaction({ interactionId: 0, duration: 400 })]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).not.toHaveBeenCalled();
    });

    test('sends one report per interaction, spanning all of its events', () => {
        start();

        top.emit('event', [
            interaction({ name: 'pointerdown', duration: 216, processingStart: 600, processingEnd: 620 }),
            interaction({ name: 'click', startTime: 560, duration: 248, processingStart: 640, processingEnd: 700 }),
        ]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);
        top.emit('event', [interaction({ name: 'pointerup' })]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'click',
                duration: 248,
                inputDelay: 100,
                processingDuration: 100,
                presentationDelay: 108,
            })
        );
    });

    test('attributes the scripts in the long animation frames the interaction overlapped', () => {
        start();

        top.emit('long-animation-frame', [
            {
                startTime: 450,
                duration: 200,
                styleAndLayoutStart: 630,
                scripts: [
                    {
                        sourceURL: 'https://www.ag-grid.com/_astro/Header.js',
                        invoker: 'BUTTON.onclick',
                        invokerType: 'event-listener',
                        duration: 30,
                    },
                    {
                        sourceURL: 'https://app.enzuzo.com/scripts/cookiebar/abc?site=1',
                        invoker: 'https://app.enzuzo.com/scripts/cookiebar/abc?site=1',
                        invokerType: 'classic-script',
                        duration: 150,
                    },
                ],
            },
            // Ends before the interaction starts
            { startTime: 200, duration: 100, styleAndLayoutStart: 0, scripts: [] },
            // Starts after the interaction has painted
            {
                startTime: 800,
                duration: 100,
                styleAndLayoutStart: 0,
                scripts: [
                    { sourceURL: 'https://x.test/late.js', invoker: 'x', invokerType: 'user-callback', duration: 90 },
                ],
            },
        ]);
        top.emit('event', [interaction()]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        const attributes = send.mock.calls[0][0];
        expect(attributes).toEqual(
            expect.objectContaining({
                animationFrameCount: 1,
                scriptDuration: 180,
                styleAndLayoutDuration: 20,
                script1Source: 'https://app.enzuzo.com/scripts/cookiebar/abc',
                script1Invoker: 'https://app.enzuzo.com/scripts/cookiebar/abc',
                script1InvokerType: 'classic-script',
                script1Duration: 150,
                script2Source: 'https://www.ag-grid.com/_astro/Header.js',
                script2Invoker: 'BUTTON.onclick',
                script2InvokerType: 'event-listener',
                script2Duration: 30,
            })
        );
        expect(attributes).not.toHaveProperty('script3Source');
    });

    describe('iframes', () => {
        const EXAMPLE_PATH = '/examples/filtering/default/index.html';

        test('reports interactions inside a same-origin iframe that loads after reporting starts', () => {
            // A new iframe holds an about:blank document until its example loads
            const blank = createFakeFrame({ document: { URL: 'about:blank' } as Document });
            const example = createFakeFrame({ path: EXAMPLE_PATH, timeOrigin: TOP_TIME_ORIGIN + 2_000 });
            const iframe = addIframe(blank.win);
            start();

            blank.emit('event', [interaction()]);
            iframe.load(example.win);
            example.emit('event', [interaction({ startTime: 1_000, processingStart: 1_050, processingEnd: 1_100 })]);
            vi.advanceTimersByTime(FLUSH_DELAY_MS);

            expect(send).toHaveBeenCalledWith(
                expect.objectContaining({
                    frame: 'iframe',
                    framePath: EXAMPLE_PATH,
                    loadState: 'complete',
                    msSinceDocumentStart: 1_000,
                    msSinceNavigation: 3_000,
                })
            );
        });

        test('reports interactions inside an iframe that had already loaded', () => {
            const example = createFakeFrame({ path: EXAMPLE_PATH });
            addIframe(example.win);
            start();

            example.emit('event', [interaction()]);
            vi.advanceTimersByTime(FLUSH_DELAY_MS);

            expect(send).toHaveBeenCalledWith(expect.objectContaining({ frame: 'iframe' }));
        });

        test('keeps interactions from different frames apart, though they share an interaction id', () => {
            const example = createFakeFrame({ path: EXAMPLE_PATH });
            addIframe(example.win);
            start();

            top.emit('event', [interaction()]);
            example.emit('event', [interaction()]);
            vi.advanceTimersByTime(FLUSH_DELAY_MS);

            expect(send).toHaveBeenCalledTimes(2);
        });

        test('follows an iframe to the next document it loads', () => {
            const first = createFakeFrame({ path: EXAMPLE_PATH });
            const iframe = addIframe(first.win);
            start();

            first.dispatch('pagehide');
            const second = createFakeFrame({ path: '/examples/filtering/set/index.html' });
            iframe.load(second.win);
            first.emit('event', [interaction()]);
            second.emit('event', [interaction()]);
            vi.advanceTimersByTime(FLUSH_DELAY_MS);

            expect(send).toHaveBeenCalledTimes(1);
            expect(send).toHaveBeenCalledWith(
                expect.objectContaining({ framePath: '/examples/filtering/set/index.html' })
            );
        });

        test('leaves a tap inside an observed iframe to that frame, though the top page sees it too', () => {
            const example = createFakeFrame({ path: EXAMPLE_PATH });
            addIframe(example.win);
            start();

            // Chromium reports it to the top page with the target in the iframe's document
            const targetInExample = { ownerDocument: example.win.document };
            top.emit('event', [interaction({ target: targetInExample })]);
            example.emit('event', [interaction({ target: targetInExample })]);
            vi.advanceTimersByTime(FLUSH_DELAY_MS);

            expect(send).toHaveBeenCalledTimes(1);
            expect(send).toHaveBeenCalledWith(expect.objectContaining({ frame: 'iframe' }));
        });

        test('skips cross-origin iframes', () => {
            const crossOrigin = {
                get document(): Document {
                    throw new DOMException('Blocked a frame with origin', 'SecurityError');
                },
            };
            const iframe = addIframe(crossOrigin as unknown as typeof window);

            expect(() => {
                start();
                iframe.load();
            }).not.toThrow();
        });
    });

    test('tells interactions during and after a client-side navigation apart', () => {
        start();

        // Clicked at NOW, swapped in 300ms later
        document.dispatchEvent(new Event('astro:before-preparation'));
        vi.advanceTimersByTime(300);
        document.dispatchEvent(new Event('astro:page-load'));
        const sinceTimeOrigin = NOW - TOP_TIME_ORIGIN;
        top.emit('event', [
            interaction({ interactionId: 1, startTime: sinceTimeOrigin + 100 }),
            interaction({ interactionId: 2, startTime: sinceTimeOrigin + 500 }),
        ]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ navigation: 'client-side', msSinceNavigation: 100, navigationComplete: false })
        );
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ navigation: 'client-side', msSinceNavigation: 500, navigationComplete: true })
        );
    });

    test('sends what it has collected when the page is hidden', () => {
        start();
        top.emit('event', [interaction()]);

        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
        document.dispatchEvent(new Event('visibilitychange'));

        expect(send).toHaveBeenCalledTimes(1);
    });

    test(`stops after ${MAX_REPORTS} reports`, () => {
        start();

        const interactions = Array.from({ length: MAX_REPORTS + 5 }, (_, i) => interaction({ interactionId: i + 1 }));
        top.emit('event', interactions);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);
        top.emit('event', [interaction({ interactionId: 1_000 })]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).toHaveBeenCalledTimes(MAX_REPORTS);
    });

    test('does nothing in a browser without interaction timing', () => {
        top = createFakeFrame({ document, supportsInteractions: false });
        start();

        top.emit('event', [interaction()]);
        vi.advanceTimersByTime(FLUSH_DELAY_MS);

        expect(send).not.toHaveBeenCalled();
    });
});
