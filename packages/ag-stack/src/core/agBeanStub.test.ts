import { AgBeanStub } from './agBeanStub';

/** Exposes the protected scheduler. The fake `gos` returns no document override, so `_getWindow` falls
 *  back to the global one, whose `requestAnimationFrame` the tests capture. */
class ThrottledBean extends AgBeanStub<any, any, any, any, any> {
    public runs = 0;
    public readonly schedule = this.throttleToFrame(() => ++this.runs);

    constructor() {
        super();
        this.beans = { gos: { get: () => undefined } };
    }
}

/** Reschedules itself from inside its own frame, which is the case that separates clearing the flag
 *  before the callback from clearing it after. */
class ReschedulingBean extends AgBeanStub<any, any, any, any, any> {
    public runs = 0;
    private rescheduled = false;
    public readonly schedule = this.throttleToFrame(() => {
        ++this.runs;
        if (!this.rescheduled) {
            this.rescheduled = true;
            this.schedule();
        }
    });

    constructor() {
        super();
        this.beans = { gos: { get: () => undefined } };
    }
}

describe('AgBeanStub.throttleToFrame', () => {
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

    test('runs the callback once however many times it is scheduled in one frame', () => {
        const bean = new ThrottledBean();

        bean.schedule();
        bean.schedule();
        bean.schedule();

        expect(requestAnimationFrame, 'frames requested for three calls').toHaveBeenCalledTimes(1);
        expect(bean.runs, 'runs before the frame').toBe(0);

        runFrames();
        expect(bean.runs).toBe(1);
        bean.destroy();
    });

    test('schedules again for the next frame', () => {
        const bean = new ThrottledBean();

        bean.schedule();
        runFrames();
        bean.schedule();
        runFrames();

        expect(bean.runs).toBe(2);
        expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
        bean.destroy();
    });

    test('a callback that reschedules itself books the next frame', () => {
        const bean = new ReschedulingBean();

        bean.schedule();
        runFrames();

        expect(bean.runs, 'the first frame ran').toBe(1);
        expect(requestAnimationFrame, 'the reschedule from inside the callback booked a frame').toHaveBeenCalledTimes(
            2
        );

        runFrames();
        expect(bean.runs).toBe(2);
        bean.destroy();
    });

    // `_requestAnimationFrame` cannot be cancelled, so the liveness check inside the frame is the only
    // thing standing between a queued callback and a destroyed bean.
    test('does not run a callback queued before the bean was destroyed', () => {
        const bean = new ThrottledBean();

        bean.schedule();
        bean.destroy();
        runFrames();

        expect(bean.runs, 'callback runs after destroy').toBe(0);
    });

    // The flag is deliberately left set once destroyed, so nothing queues another frame either.
    test('queues no further frames once destroyed', () => {
        const bean = new ThrottledBean();

        bean.destroy();
        bean.schedule();
        runFrames();
        bean.schedule();

        expect(bean.runs).toBe(0);
        expect(requestAnimationFrame, 'frames requested after destroy').toHaveBeenCalledTimes(1);
    });
});
