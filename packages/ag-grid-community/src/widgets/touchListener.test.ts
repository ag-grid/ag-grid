import { TouchListener } from './touchListener';

function createTouch(target: Element, identifier: number): Touch {
    return { identifier, target, clientX: 5, clientY: 5 } as unknown as Touch;
}

function dispatchTouchEvent(target: EventTarget, type: 'touchstart' | 'touchend', touch: Touch): void {
    const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
    const active = type === 'touchstart';
    Object.defineProperties(event, {
        touches: { value: active ? [touch] : [] },
        targetTouches: { value: active ? [touch] : [] },
        changedTouches: { value: [touch] },
    });
    target.dispatchEvent(event);
}

function tap(element: HTMLElement, identifier: number): void {
    const touch = createTouch(element, identifier);
    dispatchTouchEvent(element, 'touchstart', touch);
    dispatchTouchEvent(document, 'touchend', touch);
}

describe('TouchListener', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('emits doubleTap only when consecutive taps are within 500ms', () => {
        const element = document.createElement('button');
        const listener = new TouchListener(element);
        const onDoubleTap = vi.fn();
        listener.addEventListener('doubleTap', onDoubleTap);

        let now = 1_000;
        vi.spyOn(Date, 'now').mockImplementation(() => now);

        tap(element, 1);
        now += 200;
        tap(element, 2);
        expect(onDoubleTap).toHaveBeenCalledTimes(1);

        now += 1_000;
        tap(element, 3);
        now += 501;
        tap(element, 4);
        expect(onDoubleTap).toHaveBeenCalledTimes(1);

        listener.destroy();
    });

    test('gives a nested long press to the deepest eligible listener', () => {
        vi.useFakeTimers();
        const outer = document.createElement('div');
        const inner = document.createElement('button');
        outer.appendChild(inner);
        document.body.appendChild(outer);

        const owners: string[] = [];
        const outerListener = new TouchListener(outer, { capture: true });
        const innerListener = new TouchListener(inner, { capture: true });
        outerListener.addEventListener('longTap', () => owners.push('outer'));
        innerListener.addEventListener('longTap', () => owners.push('inner'));

        const touch = createTouch(inner, 1);
        dispatchTouchEvent(inner, 'touchstart', touch);
        vi.advanceTimersByTime(550);

        expect(owners).toEqual(['inner']);

        dispatchTouchEvent(document, 'touchend', touch);
        outerListener.destroy();
        innerListener.destroy();
        outer.remove();
    });

    test('a yielding listener cedes the long press to any competing listener', () => {
        vi.useFakeTimers();
        const outer = document.createElement('div');
        const inner = document.createElement('button');
        outer.appendChild(inner);
        document.body.appendChild(outer);

        const owners: string[] = [];
        const yieldingListener = new TouchListener(inner, { capture: true, yieldsLongTap: true });
        const outerListener = new TouchListener(outer);
        yieldingListener.addEventListener('longTap', () => owners.push('yielding'));
        outerListener.addEventListener('longTap', () => owners.push('outer'));

        const touch = createTouch(inner, 1);
        dispatchTouchEvent(inner, 'touchstart', touch);
        vi.advanceTimersByTime(550);
        expect(owners).toEqual(['outer']);
        dispatchTouchEvent(document, 'touchend', touch);

        const secondTouch = createTouch(inner, 2);
        outerListener.destroy();
        dispatchTouchEvent(inner, 'touchstart', secondTouch);
        vi.advanceTimersByTime(550);
        expect(owners).toEqual(['outer', 'yielding']);
        dispatchTouchEvent(document, 'touchend', secondTouch);

        yieldingListener.destroy();
        outer.remove();
    });

    test('does not emit a nested tap after an ancestor handles the long press', () => {
        vi.useFakeTimers();
        const outer = document.createElement('div');
        const inner = document.createElement('button');
        outer.appendChild(inner);
        document.body.appendChild(outer);

        const outerListener = new TouchListener(outer, { capture: true });
        const innerListener = new TouchListener(inner);
        const onLongTap = vi.fn();
        const onTap = vi.fn();
        outerListener.addEventListener('longTap', onLongTap);
        innerListener.addEventListener('tap', onTap);

        const touch = createTouch(inner, 1);
        dispatchTouchEvent(inner, 'touchstart', touch);
        vi.advanceTimersByTime(550);
        dispatchTouchEvent(document, 'touchend', touch);

        expect(onLongTap).toHaveBeenCalledOnce();
        expect(onTap).not.toHaveBeenCalled();

        outerListener.destroy();
        innerListener.destroy();
        outer.remove();
    });
});
