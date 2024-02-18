type Size = {
    width: number;
    height: number;
};
type OnSizeChange = (size: Size, element: HTMLElement) => void;
type Entry = {
    cb: OnSizeChange;
    size?: Size;
};
export declare class SizeMonitor {
    private static elements;
    private static resizeObserver;
    private static ready;
    private static documentReady;
    private static ownerDocument?;
    private static queuedObserveRequests;
    static init(document: Document): void;
    static onContentLoaded: EventListener;
    private static destroy;
    private static checkSize;
    static observe(element: HTMLElement, cb: OnSizeChange): void;
    static unobserve(element: HTMLElement): void;
    static removeFromQueue(element: HTMLElement): void;
    static checkClientSize(element: HTMLElement, entry: Entry): void;
}
export {};
