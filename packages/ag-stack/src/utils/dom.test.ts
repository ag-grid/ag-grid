import { AgAbstractBean } from '../core/agAbstractBean';
import { _isFocusableFormField, _throttleToFrame } from './dom';

/** No document override, so `_getWindow` falls back to the global window whose frames the tests capture. */
class ThrottledBean extends AgAbstractBean<any, any, any, any> {
    constructor() {
        super();
        this.beans = { gos: { get: () => undefined } };
    }

    public throttle(callback: () => void): () => void {
        return _throttleToFrame(this, () => this.beans, callback);
    }
}

describe('_isFocusableFormField', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => container.remove());

    /** Creates an element inside the container, so the visibility check sees it in the document. */
    function render(tag: string, cssClass?: string): HTMLElement {
        const element = document.createElement(tag);
        if (cssClass) {
            element.className = cssClass;
        }
        container.appendChild(element);
        return element;
    }

    /** Creates a form field nested inside a wrapper carrying `wrapperClass`. */
    function renderNested(wrapperClass: string): HTMLElement {
        const input = document.createElement('input');
        render('div', wrapperClass).appendChild(input);
        return input;
    }

    test('accepts a visible form field', () => {
        expect(_isFocusableFormField(render('input'))).toBe(true);
        expect(_isFocusableFormField(render('select'))).toBe(true);
        expect(_isFocusableFormField(render('button'))).toBe(true);
        expect(_isFocusableFormField(render('textarea'))).toBe(true);
    });

    test('rejects a missing element or anything that is not a form field', () => {
        expect(_isFocusableFormField(null)).toBe(false);

        // focusable in the tab-order sense, but not a form field the browser should keep focus on
        const div = render('div');
        div.tabIndex = 0;
        expect(_isFocusableFormField(div)).toBe(false);

        const anchor = render('a');
        anchor.setAttribute('href', '#');
        expect(_isFocusableFormField(anchor)).toBe(false);
    });

    test('rejects disabled fields and fields inside a disabled subtree', () => {
        const disabled = render('input') as HTMLInputElement;
        disabled.disabled = true;
        expect(_isFocusableFormField(disabled)).toBe(false);

        expect(_isFocusableFormField(render('input', 'ag-disabled'))).toBe(false);
        expect(_isFocusableFormField(renderNested('ag-disabled'))).toBe(false);
    });

    test('accepts a disabled-styled button, which opts out of the ag-disabled exclusion', () => {
        expect(_isFocusableFormField(render('button', 'ag-disabled ag-button'))).toBe(true);
    });

    test('rejects fields hidden by ag-hidden, even without the CSS that hides them', () => {
        // no stylesheet here, so these are "visible" to the visibility check — the class alone must exclude them
        expect(_isFocusableFormField(render('input', 'ag-hidden'))).toBe(false);
        expect(_isFocusableFormField(renderNested('ag-hidden'))).toBe(false);
    });

    test('rejects a field that is not in the document', () => {
        expect(_isFocusableFormField(document.createElement('input'))).toBe(false);
    });
});

describe('_throttleToFrame', () => {
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
        const bean = new ThrottledBean();
        return { bean, schedule: bean.throttle(callback) };
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
    // thing standing between a queued callback and a destroyed bean.
    test('does not run a callback queued before the bean was destroyed', () => {
        let runs = 0;
        const { bean, schedule } = createScheduler(() => ++runs);

        schedule();
        bean.destroy();
        runFrames();

        expect(runs, 'callback runs after destroy').toBe(0);
    });

    test('queues no further frames once destroyed', () => {
        let runs = 0;
        const { bean, schedule } = createScheduler(() => ++runs);

        bean.destroy();
        schedule();
        runFrames();
        schedule();

        expect(runs).toBe(0);
        expect(requestAnimationFrame, 'frames requested after destroy').toHaveBeenCalledTimes(1);
    });
});
