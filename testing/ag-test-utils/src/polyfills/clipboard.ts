type ClipboardItemStub = {
    types: string[];
    getType: (type: string) => Promise<Blob>;
};

type ClipboardState = {
    text: string;
    items: ClipboardItemStub[];
};

const createClipboardItem = (text: string, type = 'text/plain'): ClipboardItemStub => ({
    types: [type],
    getType: async (requestedType: string) => new Blob([text], { type: requestedType }),
});

const eventTarget = new EventTarget();
let clipboardState: ClipboardState = { text: '', items: [] };

const emitClipboardChange = (): void => {
    eventTarget.dispatchEvent(new Event('clipboardchange'));
};

const setClipboardState = (text: string, items?: ClipboardItemStub[]): void => {
    const value = String(text ?? '');
    clipboardState = {
        text: value,
        items: items ?? (value ? [createClipboardItem(value)] : []),
    };
};

const getClipboardStub = (target: EventTarget): Clipboard => ({
    readText: async () => clipboardState.text,
    writeText: async (data: string) => {
        setClipboardState(data);
        emitClipboardChange();
    },
    read: async () => clipboardState.items.map((item) => item as unknown as ClipboardItem),
    write: async (items: ClipboardItem[]) => {
        if (!items?.length) {
            setClipboardState('');
            emitClipboardChange();
            return;
        }

        const stubs = items.map((item) => item as unknown as ClipboardItemStub);
        const firstItem = items[0];
        if (firstItem.types?.includes('text/plain')) {
            const blob = await firstItem.getType('text/plain');
            const text = await blob.text();
            setClipboardState(text, stubs);
        } else {
            setClipboardState('', stubs);
        }

        emitClipboardChange();
    },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
});

const clipboardStub = getClipboardStub(eventTarget);

let initialised = false;

export const clipboardUtils = {
    isInitialised(): boolean {
        return initialised;
    },
    init(): boolean {
        if (typeof navigator === 'undefined') {
            return false;
        }

        if (navigator.clipboard !== clipboardStub) {
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: clipboardStub,
            });
        }

        setClipboardState('');

        initialised = true;
        return true;
    },
    reset(): void {
        setClipboardState('', []);
    },
    setText(value: string): void {
        setClipboardState(value);
    },
    getText() {
        return clipboardState.text;
    },
    getItems() {
        return [...clipboardState.items];
    },
};
