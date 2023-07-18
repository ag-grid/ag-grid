declare type Size = {
    width: number;
    height: number;
};
declare type OnSizeChange = (size: Size, element: HTMLElement) => void;
declare type Entry = {
    cb: OnSizeChange;
    size?: Size;
};
export declare class SizeMonitor {
    private static elements;
    private static resizeObserver;
    private static ready;
    private static pollerHandler?;
    static init(): void;
    private static destroy;
    private static checkSize;
    static observe(element: HTMLElement, cb: OnSizeChange): void;
    static unobserve(element: HTMLElement, cleanup?: boolean): void;
    static checkClientSize(element: HTMLElement, entry: Entry): void;
}
export {};
//# sourceMappingURL=sizeMonitor.d.ts.map