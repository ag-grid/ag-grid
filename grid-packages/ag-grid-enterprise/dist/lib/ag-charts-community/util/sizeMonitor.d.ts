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
    private static readyEventFn?;
    private static queuedObserveRequests;
    private static pollerHandler?;
    static init(document: Document): void;
    private static destroy;
    private static checkSize;
    static observe(element: HTMLElement, cb: OnSizeChange): void;
    static unobserve(element: HTMLElement, cleanup?: boolean): void;
    static checkClientSize(element: HTMLElement, entry: Entry): void;
}
export {};
