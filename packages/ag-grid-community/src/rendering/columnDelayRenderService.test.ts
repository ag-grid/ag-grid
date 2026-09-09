import { ColumnDelayRenderService } from './columnDelayRenderService';

const HIDE_CLASS = 'ag-delay-render';
const MAX_RETRIES = 5;
const FAILSAFE_MS = 1000;

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
    const warn = vi.fn();

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
        warn,
    });

    return { service, eGridBody, areHeaderCellsRendered, warn };
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
            vi.advanceTimersToNextTimer();
        }

        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);
        vi.advanceTimersToNextTimer();

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
        vi.advanceTimersToNextTimer();

        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);
        expect(areHeaderCellsRendered).toHaveBeenCalledTimes(2);
        expect(vi.getTimerCount()).toBe(0);
    });
});

describe('ColumnDelayRenderService reveal failsafe', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('reveals and warns when a requester never releases its hide', () => {
        const { service, eGridBody, warn } = createService(() => true);

        service.hideColumns('fitCellContents');
        service.hideColumns('colFlex');
        service.revealColumns('colFlex');
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);

        vi.advanceTimersByTime(FAILSAFE_MS - 1);
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(true);

        vi.advanceTimersByTime(1);
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);
        // Only the still-outstanding requester is named.
        expect(warn).toHaveBeenCalledWith(334, { requesters: ['fitCellContents'] });
        expect(vi.getTimerCount()).toBe(0);
    });

    test('does not fire once the columns were revealed normally', () => {
        const { service, eGridBody, warn } = createService(() => true);

        service.hideColumns('colFlex');
        service.revealColumns('colFlex');
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);

        vi.advanceTimersByTime(FAILSAFE_MS);
        expect(warn).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    test('a late hide after the failsafe reveal is ignored', () => {
        const { service, eGridBody } = createService(() => true);

        service.hideColumns('colFlex');
        vi.advanceTimersByTime(FAILSAFE_MS);
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);

        service.hideColumns('columnState');
        expect(eGridBody.classList.contains(HIDE_CLASS)).toBe(false);
    });
});
