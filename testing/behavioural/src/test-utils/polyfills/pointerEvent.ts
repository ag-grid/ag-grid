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

class DataTransferItemMock implements DataTransferItem {
    constructor(
        public kind: 'string' | 'file' = 'string',
        public type: string = 'text/plain',
        public value: string | File = ''
    ) {}

    getAsFile(): File | null {
        return this.kind === 'file' && this.value instanceof File ? this.value : null;
    }

    getAsString(callback: (data: string) => void): void {
        if (this.kind === 'string' && typeof this.value === 'string') {
            callback(this.value);
        } else {
            const file = this.getAsFile();
            if (file) {
                void file.text().then((text) => callback(text));
            }
        }
    }

    webkitGetAsEntry(): any {
        return null;
    }
}

class DataTransferItemListMock extends Array<DataTransferItemMock> implements DataTransferItemList {
    add(data: string | File, type?: string): DataTransferItemMock | null {
        const item = new DataTransferItemMock(
            typeof data === 'string' ? 'string' : 'file',
            type || (typeof data === 'string' ? 'text/plain' : data.type),
            data
        );
        this.push(item);
        return item;
    }

    remove(index: number): void {
        this.splice(index, 1);
    }

    clear(): void {
        this.length = 0;
    }
}

class FileListMock extends Array<File> implements FileList {
    constructor(files: File[] = []) {
        super(...files);
    }

    item(index: number): File | null {
        return this[index] || null;
    }

    [Symbol.hasInstance](instance: any): boolean {
        return instance instanceof FileListMock || super[Symbol.hasInstance](instance);
    }
}

class DataTransferMock implements DataTransfer {
    data: Record<string, string> = {};
    dropEffect: DataTransfer['dropEffect'] = 'none';
    effectAllowed: DataTransfer['effectAllowed'] = 'all';
    files = new FileListMock();
    items = new DataTransferItemListMock();
    types: string[] = [];

    setData(format: string, data: string) {
        this.data[format] = data;
        if (!this.types.includes(format)) {
            this.types.push(format);
        }
    }

    getData(format: string) {
        return this.data[format] || '';
    }

    clearData(format?: string) {
        if (format) {
            delete this.data[format];
            this.types = this.types.filter((type) => type !== format);
        } else {
            this.data = {};
            this.types = [];
        }
    }

    setDragImage(_image: Element, _x: number, _y: number): void {}
}

class DragEventPolyfill extends MouseEvent implements DragEvent {
    public readonly dataTransfer: DataTransfer | null;

    constructor(type: string, eventInitDict: DragEventInit = {}) {
        super(type, eventInitDict);
        this.dataTransfer = eventInitDict.dataTransfer ?? null;
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

function ensureDragEvent(): void {
    if (typeof (globalThis as any).DragEvent !== 'function') {
        Object.defineProperty(globalThis, 'DragEvent', {
            configurable: true,
            writable: true,
            value: DragEventPolyfill,
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
    window.DataTransferItem ??= DataTransferItemMock;
    window.DataTransferItemList ??= DataTransferItemListMock;
    window.DataTransfer ??= DataTransferMock;
    ensureTouch();
    ensurePointerEvent();
    ensureDragEvent();
}
