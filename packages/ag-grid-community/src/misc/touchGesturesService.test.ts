import { TouchGesturesService } from './touchGesturesService';

const dispatchPointerEvent = (
    target: EventTarget,
    type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
    init: Partial<PointerEventInit> = {}
): PointerEvent => {
    const event = new Event(type, { bubbles: true, cancelable: true, composed: true }) as PointerEvent;
    Object.defineProperties(event, {
        pointerId: { value: init.pointerId ?? 1 },
        pointerType: { value: init.pointerType ?? 'touch' },
        isPrimary: { value: init.isPrimary ?? true },
        button: { value: init.button ?? 0 },
        clientX: { value: init.clientX ?? 5 },
        clientY: { value: init.clientY ?? 5 },
    });
    target.dispatchEvent(event);
    return event;
};

describe('TouchGesturesService', () => {
    let root: HTMLElement;
    let service: TouchGesturesService;
    let suppressTouch: boolean;

    beforeEach(() => {
        vi.useFakeTimers();
        suppressTouch = false;
        root = document.createElement('div');
        document.body.appendChild(root);

        service = new TouchGesturesService();
        const gos = {
            get: (property: string) => (property === 'suppressTouch' ? suppressTouch : undefined),
            isElementInThisInstance: (element: HTMLElement) => root.contains(element),
        };
        Object.assign(service as any, {
            beans: { eRootDiv: root, gos },
            gos,
        });
        service.postConstruct();
    });

    afterEach(() => {
        service.destroy();
        root.remove();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('chooses the deepest normal-priority long press registration', () => {
        const outer = document.createElement('div');
        const inner = document.createElement('button');
        outer.appendChild(inner);
        root.appendChild(outer);
        const owners: string[] = [];

        service.registerLongPress({ element: outer, onLongPress: () => owners.push('outer') });
        service.registerLongPress({ element: inner, onLongPress: () => owners.push('inner') });

        dispatchPointerEvent(inner, 'pointerdown');
        vi.advanceTimersByTime(550);

        expect(owners).toEqual(['inner']);
    });

    test('normal priority takes precedence over a deeper fallback registration', () => {
        const outer = document.createElement('div');
        const inner = document.createElement('button');
        outer.appendChild(inner);
        root.appendChild(outer);
        const owners: string[] = [];

        const unregisterNormal = service.registerLongPress({
            element: outer,
            onLongPress: () => owners.push('normal'),
        });
        service.registerLongPress({
            element: inner,
            priority: 'fallback',
            onLongPress: () => owners.push('fallback'),
        });

        dispatchPointerEvent(inner, 'pointerdown');
        vi.advanceTimersByTime(550);
        dispatchPointerEvent(document, 'pointerup');
        expect(owners).toEqual(['normal']);

        unregisterNormal();
        dispatchPointerEvent(inner, 'pointerdown', { pointerId: 2 });
        vi.advanceTimersByTime(550);
        expect(owners).toEqual(['normal', 'fallback']);
    });

    test('cancels when the pointer moves beyond the threshold or is cancelled', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onLongPress = vi.fn();
        service.registerLongPress({ element: target, onLongPress });

        dispatchPointerEvent(target, 'pointerdown');
        dispatchPointerEvent(document, 'pointermove', { clientX: 10 });
        vi.advanceTimersByTime(550);

        dispatchPointerEvent(target, 'pointerdown', { pointerId: 2 });
        dispatchPointerEvent(document, 'pointercancel', { pointerId: 2 });
        vi.advanceTimersByTime(550);

        expect(onLongPress).not.toHaveBeenCalled();
    });

    test('ignores mouse, secondary touch pointers, and suppressed touch support', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onLongPress = vi.fn();
        service.registerLongPress({ element: target, onLongPress });

        dispatchPointerEvent(target, 'pointerdown', { pointerType: 'mouse' });
        dispatchPointerEvent(target, 'pointerdown', { pointerId: 2, isPrimary: false });
        suppressTouch = true;
        dispatchPointerEvent(target, 'pointerdown', { pointerId: 3 });
        vi.advanceTimersByTime(550);

        expect(onLongPress).not.toHaveBeenCalled();
    });

    test('uses an eligible fallback when normal registrations are disabled', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const owners: string[] = [];
        service.registerLongPress({
            element: target,
            isEnabled: () => false,
            onLongPress: () => owners.push('normal'),
        });
        service.registerLongPress({
            element: target,
            priority: 'fallback',
            onLongPress: () => owners.push('fallback'),
        });

        dispatchPointerEvent(target, 'pointerdown');
        vi.advanceTimersByTime(550);

        expect(owners).toEqual(['fallback']);
    });

    test('intercepts a native context menu and fires the long press once', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onLongPress = vi.fn();
        const onDomContextMenu = vi.fn();
        target.addEventListener('contextmenu', onDomContextMenu);
        service.registerLongPress({ element: target, onLongPress });

        dispatchPointerEvent(target, 'pointerdown');
        const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        target.dispatchEvent(contextMenuEvent);
        vi.advanceTimersByTime(550);

        expect(contextMenuEvent.defaultPrevented).toBe(true);
        expect(onLongPress).toHaveBeenCalledOnce();
        expect(onDomContextMenu).not.toHaveBeenCalled();
    });

    test('a fallback winner suppresses the browser menu but not the grid contextmenu listeners', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onLongPress = vi.fn();
        const onDomContextMenu = vi.fn();
        target.addEventListener('contextmenu', onDomContextMenu);
        service.registerLongPress({ element: target, priority: 'fallback', onLongPress });

        dispatchPointerEvent(target, 'pointerdown');
        const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        target.dispatchEvent(contextMenuEvent);

        expect(contextMenuEvent.defaultPrevented).toBe(true);
        expect(onLongPress).toHaveBeenCalledOnce();
        expect(onDomContextMenu).toHaveBeenCalledOnce();
    });

    test('suppresses the browser menu during a gesture even when no registration is eligible', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onLongPress = vi.fn();
        service.registerLongPress({ element: target, isEnabled: () => false, onLongPress });

        dispatchPointerEvent(target, 'pointerdown');
        const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        target.dispatchEvent(contextMenuEvent);
        vi.advanceTimersByTime(550);

        expect(contextMenuEvent.defaultPrevented).toBe(true);
        expect(onLongPress).not.toHaveBeenCalled();
    });

    test('suppresses compatibility mouse events and the click after a long press', () => {
        const target = document.createElement('button');
        root.appendChild(target);
        const events: string[] = [];
        for (const type of ['mousedown', 'mouseup', 'click']) {
            target.addEventListener(type, () => events.push(type));
        }
        service.registerLongPress({ element: target, onLongPress: vi.fn() });

        dispatchPointerEvent(target, 'pointerdown');
        vi.advanceTimersByTime(550);
        target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(events).toEqual([]);

        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(events).toEqual(['click']);
    });

    test('suppresses the release click of a press held longer than the suppression window', () => {
        const target = document.createElement('button');
        root.appendChild(target);
        const onClick = vi.fn();
        target.addEventListener('click', onClick);
        service.registerLongPress({ element: target, onLongPress: vi.fn() });

        dispatchPointerEvent(target, 'pointerdown');
        vi.advanceTimersByTime(2_000); // long press fires at 550ms; the finger stays down past 800ms
        dispatchPointerEvent(document, 'pointerup');
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(onClick).not.toHaveBeenCalled();
    });

    test('fires a double tap only for two quick taps on the registered element', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onDoubleTap = vi.fn();
        let now = 1_000;
        vi.spyOn(Date, 'now').mockImplementation(() => now);
        service.registerDoubleTap({ element: target, onDoubleTap });

        const tap = (pointerId: number) => {
            dispatchPointerEvent(target, 'pointerdown', { pointerId });
            dispatchPointerEvent(document, 'pointerup', { pointerId });
        };

        tap(1);
        now += 200;
        tap(2);
        expect(onDoubleTap).toHaveBeenCalledOnce();

        now += 1_000;
        tap(3);
        now += 501;
        tap(4);
        expect(onDoubleTap).toHaveBeenCalledOnce();
    });

    test('a moved or cancelled pointer does not count towards a double tap', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onDoubleTap = vi.fn();
        let now = 1_000;
        vi.spyOn(Date, 'now').mockImplementation(() => now);
        service.registerDoubleTap({ element: target, onDoubleTap });

        dispatchPointerEvent(target, 'pointerdown', { pointerId: 1 });
        dispatchPointerEvent(document, 'pointerup', { pointerId: 1 });
        now += 100;
        dispatchPointerEvent(target, 'pointerdown', { pointerId: 2 });
        dispatchPointerEvent(document, 'pointermove', { pointerId: 2, clientX: 50 });
        dispatchPointerEvent(document, 'pointerup', { pointerId: 2 });

        expect(onDoubleTap).not.toHaveBeenCalled();
    });

    test('does not suppress a new pointer interaction after a long press', () => {
        const container = document.createElement('div');
        const firstTarget = document.createElement('button');
        const nextTarget = document.createElement('button');
        container.append(firstTarget, nextTarget);
        root.appendChild(container);
        const onNextClick = vi.fn();
        nextTarget.addEventListener('click', onNextClick);
        service.registerLongPress({ element: container, onLongPress: vi.fn() });

        dispatchPointerEvent(firstTarget, 'pointerdown');
        vi.advanceTimersByTime(550);

        dispatchPointerEvent(nextTarget, 'pointerdown', { pointerId: 2 });
        nextTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(onNextClick).toHaveBeenCalledOnce();
    });

    test('does not handle an event owned by a nested grid', () => {
        const target = document.createElement('div');
        root.appendChild(target);
        const onLongPress = vi.fn();
        service.registerLongPress({ element: target, onLongPress });
        (service as any).gos.isElementInThisInstance = () => false;

        dispatchPointerEvent(target, 'pointerdown');
        vi.advanceTimersByTime(550);

        expect(onLongPress).not.toHaveBeenCalled();
    });
});
