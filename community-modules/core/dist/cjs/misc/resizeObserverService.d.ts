// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class ResizeObserverService {
    private gridOptionsWrapper;
    private frameworkOverrides;
    observeResize(element: HTMLElement, callback: () => void, debounceDelay?: number): () => void;
}
