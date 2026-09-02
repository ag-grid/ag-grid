import { ColumnDelayRenderService } from './columnDelayRenderService';

const HIDE_CLASS = 'ag-delay-render';
const MAX_RETRIES = 5;

/**
 * The reveal waits for React to mount the header cells, retrying on a timer up to a fixed cap and
 * then revealing anyway. Driving that from a behavioural test is not possible: it needs the header
 * cells to stay unrendered across several ticks, and `renderStatus` is a bean supplied by the React
 * wrapper rather than anything reachable through grid options.
 */
function createService(headerCellsRendered: () => boolean) {
    const eGridBody = document.createElement('div');
    const gridBodyCtrl = { eGridBody };
    const areHeaderCellsRendered = vi.fn(headerCellsRendered);

    const service: ColumnDelayRenderService = Object.assign(Object.create(ColumnDelayRenderService.prototype), {
        beans: {
            // Reveal on this path is synchronous once ready, which is what every framework except
            // React 19 does — see `IFrameworkOverrides.runWhenReadyAsync`.
            ctrlsSvc: {
                whenReady: (_caller: unknown, callback: (p: { gridBodyCtrl: unknown }) => void) =>
                    callback({ gridBodyCtrl }),
                getGridBodyCtrl: () => gridBodyCtrl,
            },
            renderStatus: { areHeaderCellsRendered },
        },
        hideRequested: false,
        alreadyRevealed: false,
        timesRetried: 0,
        requesters: new Set<string>(),
        addDestroyFunc: vi.fn(),
        isAlive: () => true,
    });

    return { service, eGridBody, areHeaderCellsRendered };
}

describe('ColumnDelayRenderService reveal retries', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('retries while the header cells are unrendered, then reveals once the cap is reached', () => {
        const { service, eGridBody, areHeaderCellsRendered } = createService(() => false);

        service.hideColumns('colFlex');
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);

        service.revealColumns('colFlex');

        // Each pending timer is one retry. The grid must stay hidden for all of them, otherwise the
        // reveal outruns the header render and the anti-flicker hide achieves nothing.
        for (let i = 0; i < MAX_RETRIES - 1; i++) {
            expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);
            vi.runOnlyPendingTimers();
        }

        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);
        vi.runOnlyPendingTimers();

        // The cap is a fail safe: the grid reveals even though the header cells never rendered.
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);
        expect(areHeaderCellsRendered).toHaveBeenCalledTimes(MAX_RETRIES + 1);
        // No further work is queued, so the loop terminates rather than retrying forever.
        expect(vi.getTimerCount()).toBe(0);
    });

    test('reveals as soon as the header cells render, without exhausting the retries', () => {
        let rendered = false;
        const { service, eGridBody, areHeaderCellsRendered } = createService(() => rendered);

        service.hideColumns('colFlex');
        service.revealColumns('colFlex');

        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);

        rendered = true;
        vi.runOnlyPendingTimers();

        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);
        expect(areHeaderCellsRendered).toHaveBeenCalledTimes(2);
        expect(vi.getTimerCount()).toBe(0);
    });
});
