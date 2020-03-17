export declare class ResizeObserverService {
    private gridOptionsWrapper;
    private frameworkOverrides;
    observeResize(element: HTMLElement, callback: () => void, debounceDelay?: number): () => void;
}
