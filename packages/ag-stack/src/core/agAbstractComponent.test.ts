import { AgAbstractComponent } from './agAbstractComponent';

/** No document override, so `_getWindow` falls back to the global window whose frames the tests capture. */
class ThrottledComponent extends AgAbstractComponent<any, any, any, any, any, any> {
    constructor() {
        super();
        this.beans = { gos: { get: () => undefined } };
    }

    public throttle(callback: () => void): () => void {
        return this.throttleToFrame(callback);
    }
}

describe('AgAbstractComponent.throttleToFrame', () => {
    let frames: (() => void)[];
    let requestAnimationFrame: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        frames = [];
        requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: any) => {
            frames.push(callback);
            return frames.length;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const runFrames = (): void => {
        const queued = frames;
        frames = [];
        for (const frame of queued) {
            frame();
        }
    };

    const createScheduler = (callback: () => void) => {
        const component = new ThrottledComponent();
        return { component, schedule: component.throttle(callback) };
    };

    test('runs the callback once however many times it is scheduled in one frame', () => {
        let runs = 0;
        const { schedule } = createScheduler(() => ++runs);

        schedule();
        schedule();
        schedule();

        expect(requestAnimationFrame, 'frames requested for three calls').toHaveBeenCalledTimes(1);
        expect(runs, 'runs before the frame').toBe(0);
        runFrames();
        expect(runs).toBe(1);
    });

    test('schedules again for the next frame', () => {
        let runs = 0;
        const { schedule } = createScheduler(() => ++runs);

        schedule();
        runFrames();
        schedule();
        runFrames();

        expect(runs).toBe(2);
        expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    // Separates clearing the flag before the callback from clearing it after.
    test('a callback that reschedules itself books the next frame', () => {
        let runs = 0;
        const { schedule } = createScheduler(() => {
            ++runs;
            if (runs === 1) {
                schedule();
            }
        });

        schedule();
        runFrames();

        expect(runs, 'the first frame ran').toBe(1);
        expect(requestAnimationFrame, 'the reschedule from inside the callback booked a frame').toHaveBeenCalledTimes(
            2
        );
        runFrames();
        expect(runs).toBe(2);
    });

    // `_requestAnimationFrame` cannot be cancelled, so the liveness check inside the frame is the only
    // thing standing between a queued callback and a destroyed component.
    test('does not run a callback queued before the component was destroyed', () => {
        let runs = 0;
        const { component, schedule } = createScheduler(() => ++runs);

        schedule();
        component.destroy();
        runFrames();

        expect(runs, 'callback runs after destroy').toBe(0);
    });

    test('queues no further frames once destroyed', () => {
        let runs = 0;
        const { component, schedule } = createScheduler(() => ++runs);

        component.destroy();
        schedule();
        runFrames();
        schedule();

        expect(runs).toBe(0);
        expect(requestAnimationFrame, 'frames requested after destroy').toHaveBeenCalledTimes(1);
    });
});
