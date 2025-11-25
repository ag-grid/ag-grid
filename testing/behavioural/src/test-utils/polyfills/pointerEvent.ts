type TouchListConstructor = new (touches?: readonly Touch[]) => TouchList;

class TouchListPolyfill extends Array<Touch> implements TouchList {
    constructor(touches: readonly Touch[] = []) {
        super(...touches);
        Object.setPrototypeOf(this, TouchListPolyfill.prototype);
    }

    public item(index: number): Touch | null {
        return this[index] ?? null;
    }
}

class TouchPolyfill implements Touch {
    public readonly identifier: number;
    public readonly target: EventTarget;
    public readonly screenX: number;
    public readonly screenY: number;
    public readonly clientX: number;
    public readonly clientY: number;
    public readonly pageX: number;
    public readonly pageY: number;
    public readonly radiusX: number;
    public readonly radiusY: number;
    public readonly rotationAngle: number;
    public readonly force: number;
    public readonly altitudeAngle: number;
    public readonly azimuthAngle: number;
    public readonly touchType: TouchType;

    constructor(init: TouchInit) {
        if (!init.target) {
            throw new Error('Touch target is required');
        }

        this.identifier = init.identifier ?? 0;
        this.target = init.target;
        this.screenX = init.screenX ?? 0;
        this.screenY = init.screenY ?? 0;
        this.clientX = init.clientX ?? 0;
        this.clientY = init.clientY ?? 0;
        this.pageX = init.pageX ?? this.clientX;
        this.pageY = init.pageY ?? this.clientY;
        this.radiusX = init.radiusX ?? 1;
        this.radiusY = init.radiusY ?? 1;
        this.rotationAngle = init.rotationAngle ?? 0;
        this.force = init.force ?? 1;
        this.altitudeAngle = init.altitudeAngle ?? Math.PI / 2;
        this.azimuthAngle = init.azimuthAngle ?? 0;
        this.touchType = init.touchType ?? 'direct';
    }
}

class TouchEventPolyfill extends Event implements TouchEvent {
    public readonly touches: TouchList;
    public readonly targetTouches: TouchList;
    public readonly changedTouches: TouchList;
    public readonly altKey: boolean;
    public readonly metaKey: boolean;
    public readonly ctrlKey: boolean;
    public readonly shiftKey: boolean;
    public readonly detail: number;
    public readonly view: Window | null;
    public readonly which: number;

    constructor(type: string, eventInitDict: TouchEventInit = {}) {
        super(type, eventInitDict);

        const touches = toTouchArray(eventInitDict.touches);
        const targetTouches = toTouchArray(eventInitDict.targetTouches);
        const changedTouches = toTouchArray(eventInitDict.changedTouches ?? touches);

        const makeList = getTouchListConstructor();
        this.touches = new makeList(touches);
        this.targetTouches = new makeList(targetTouches);
        this.changedTouches = new makeList(changedTouches);

        this.altKey = eventInitDict.altKey ?? false;
        this.metaKey = eventInitDict.metaKey ?? false;
        this.ctrlKey = eventInitDict.ctrlKey ?? false;
        this.shiftKey = eventInitDict.shiftKey ?? false;
        this.detail = (eventInitDict as UIEventInit).detail ?? 0;
        this.view = (eventInitDict as UIEventInit).view ?? null;
        this.which = 0;
    }

    public initTouchEvent(): void {
        // No-op: legacy initializer not required for tests.
    }

    public initUIEvent(): void {
        // No-op: legacy initializer not required for tests.
    }
}

class PointerEventPolyfill extends MouseEvent implements PointerEvent {
    public pointerId: number;
    public width: number;
    public height: number;
    public pressure: number;
    public tiltX: number;
    public tiltY: number;
    public twist: number;
    public tangentialPressure: number;
    public pointerType: string;
    public isPrimary: boolean;

    constructor(type: string, eventInitDict: PointerEventInit = {}) {
        const mouseInit: MouseEventInit = {
            bubbles: true,
            cancelable: true,
            ...eventInitDict,
        };
        super(type, mouseInit);

        this.pointerId = eventInitDict.pointerId ?? 1;
        this.width = eventInitDict.width ?? 1;
        this.height = eventInitDict.height ?? 1;
        this.pressure = eventInitDict.pressure ?? (mouseInit.buttons ? 0.5 : 0);
        this.tiltX = eventInitDict.tiltX ?? 0;
        this.tiltY = eventInitDict.tiltY ?? 0;
        this.twist = eventInitDict.twist ?? 0;
        this.tangentialPressure = eventInitDict.tangentialPressure ?? 0;
        this.pointerType = eventInitDict.pointerType ?? 'mouse';
        this.isPrimary = eventInitDict.isPrimary ?? true;
    }

    public getCoalescedEvents(): PointerEvent[] {
        return [this];
    }

    public getPredictedEvents(): PointerEvent[] {
        return [];
    }
}

function toTouchArray(input?: TouchList | readonly Touch[]): Touch[] {
    if (!input) {
        return [];
    }
    return Array.from(input as readonly Touch[]);
}

function getTouchListConstructor(): TouchListConstructor {
    return (globalThis.TouchList as unknown as TouchListConstructor) ?? TouchListPolyfill;
}

function ensurePointerEvent(): void {
    if (typeof (globalThis as any).PointerEvent !== 'function') {
        Object.defineProperty(globalThis, 'PointerEvent', {
            configurable: true,
            writable: true,
            value: PointerEventPolyfill,
        });
    }
}

function ensureTouch(): void {
    if (typeof (globalThis as any).Touch !== 'function') {
        Object.defineProperty(globalThis, 'Touch', {
            configurable: true,
            writable: true,
            value: TouchPolyfill,
        });
    }

    if (typeof (globalThis as any).TouchList !== 'function') {
        Object.defineProperty(globalThis, 'TouchList', {
            configurable: true,
            writable: true,
            value: TouchListPolyfill,
        });
    }

    if (typeof (globalThis as any).TouchEvent !== 'function') {
        Object.defineProperty(globalThis, 'TouchEvent', {
            configurable: true,
            writable: true,
            value: TouchEventPolyfill,
        });
    }
}

export function initPointerEventPolyfill(): void {
    ensureTouch();
    ensurePointerEvent();
}
