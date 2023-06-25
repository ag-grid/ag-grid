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
    static init(): void;
    private static checkSize;
    static observe(element: HTMLElement, cb: OnSizeChange): void;
    static unobserve(element: HTMLElement): void;
    static checkClientSize(element: HTMLElement, entry: Entry): void;
}
export {};
