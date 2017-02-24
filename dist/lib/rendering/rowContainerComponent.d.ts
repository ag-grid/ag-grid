// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    hideWhenNoChildren?: boolean;
    useDocumentFragment?: boolean;
}
/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export declare class RowContainerComponent {
    private eContainer;
    private eDocumentFragment;
    private eViewport;
    private hideWhenNoChildren;
    private childCount;
    private visible;
    constructor(params: RowContainerComponentParams);
    setupDocumentFragment(): void;
    setHeight(height: number): void;
    appendRowElement(eRow: HTMLElement): void;
    removeRowElement(eRow: HTMLElement): void;
    flushDocumentFragment(): void;
    private checkVisibility();
}
