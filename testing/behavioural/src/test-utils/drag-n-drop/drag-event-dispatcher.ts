import { asyncSetTimeout } from '../utils';

export type InteractionEventOptions = MouseEventInit | PointerEventInit | TouchEventInit;

export type FireInteractionEventFn = (
    element: Element | Document,
    eventType: string,
    options?: InteractionEventOptions
) => Promise<void>;

const POINTER_COMPATIBILITY_MOUSE_EVENTS: Record<string, string> = {
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointercancel: 'mouseup',
};

export class DragEventDispatcher {
    public readonly dataTransfer: DataTransfer;
    private readonly pointerDefaults: PointerEventInit;

    public constructor(pointerDefaults: PointerEventInit) {
        this.pointerDefaults = pointerDefaults;
        const dataTransfer = new DataTransfer();
        dataTransfer.effectAllowed = 'all';
        this.dataTransfer = dataTransfer;
    }

    public readonly fire: FireInteractionEventFn = async (element, eventType, options = {}) => {
        element.dispatchEvent(this.createInteractionEvent(element, eventType, options));

        const compatibilityMouseEventName = POINTER_COMPATIBILITY_MOUSE_EVENTS[eventType];
        if (compatibilityMouseEventName) {
            element.dispatchEvent(this.createInteractionEvent(element, compatibilityMouseEventName, options));
        }

        await asyncSetTimeout(0);
    };

    public async fireESC(rootEventTarget: EventTarget) {
        rootEventTarget.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true })
        );
        await asyncSetTimeout(0);
    }

    private createInteractionEvent(
        element: Element | Document,
        eventName: string,
        options: InteractionEventOptions | undefined
    ): Event {
        const sanitized = sanitizeEventInit(options);
        const isDragEvent = eventName.startsWith('drag') || eventName === 'drop';

        if (isDragEvent) {
            const dragEventInit: DragEventInit = {
                bubbles: true,
                cancelable: true,
                ...(sanitized as DragEventInit),
                dataTransfer: this.dataTransfer,
            };
            const dragEvent = new DragEvent(eventName, dragEventInit);
            Object.defineProperty(dragEvent, 'dataTransfer', {
                configurable: true,
                writable: false,
                value: dragEventInit.dataTransfer,
            });
            return dragEvent;
        }

        if (eventName.startsWith('touch')) {
            const isEnd = eventName === 'touchend' || eventName === 'touchcancel';
            const touchEventInit: TouchEventInit = {
                bubbles: true,
                cancelable: true,
                touches: buildTouchList(element, options, !isEnd),
                targetTouches: buildTouchList(element, options, !isEnd),
                changedTouches: buildTouchList(element, options, true),
                ...(sanitized as TouchEventInit),
            };
            return new TouchEvent(eventName, touchEventInit);
        }

        if (eventName.startsWith('pointer')) {
            const pointerInit: PointerEventInit = {
                bubbles: true,
                cancelable: true,
                ...this.pointerDefaults,
                ...(sanitized as PointerEventInit),
            };
            return new PointerEvent(eventName, pointerInit);
        }

        return new MouseEvent(eventName, {
            bubbles: true,
            cancelable: true,
            ...(sanitized as MouseEventInit),
        });
    }
}

function buildTouchList(
    element: Element | Document,
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined,
    includeTouch: boolean
): Touch[] {
    return includeTouch ? [buildSyntheticTouch(element, options)] : [];
}

function sanitizeEventInit(options: InteractionEventOptions | undefined): Record<string, unknown> {
    if (!options) {
        return {};
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(options)) {
        if (key !== 'dataTransfer') {
            sanitized[key] = value as unknown;
        }
    }

    return sanitized;
}

function buildSyntheticTouch(
    element: Element | Document,
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined
): Touch {
    const clientX = getClientCoordinate(options, 'clientX');
    const clientY = getClientCoordinate(options, 'clientY');
    const touchTarget = element as unknown as EventTarget;
    return new Touch({
        identifier: 0,
        target: touchTarget,
        clientX,
        clientY,
        pageX: clientX,
        pageY: clientY,
        screenX: clientX,
        screenY: clientY,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 1,
        altitudeAngle: Math.PI / 2,
        azimuthAngle: 0,
        touchType: 'direct',
    });
}

function getClientCoordinate(
    options: MouseEventInit | PointerEventInit | TouchEventInit | undefined,
    key: 'clientX' | 'clientY'
): number {
    if (!options) {
        return 0;
    }

    const value = (options as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : 0;
}
