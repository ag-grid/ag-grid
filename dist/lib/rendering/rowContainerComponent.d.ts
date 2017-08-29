// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { GridOptionsWrapper } from "../gridOptionsWrapper";
export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    hideWhenNoChildren?: boolean;
}
/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export declare class RowContainerComponent {
    private eContainer;
    private eViewport;
    private hideWhenNoChildren;
    private childCount;
    private visible;
    gridOptionsWrapper: GridOptionsWrapper;
    constructor(params: RowContainerComponentParams);
    setHeight(height: number): void;
    appendRowElement(eRow: HTMLElement, eRowBefore: HTMLElement, ensureDomOrder: boolean): void;
    ensureDomOrder(eRow: HTMLElement, eRowBefore: HTMLElement): void;
    removeRowElement(eRow: HTMLElement): void;
    private checkVisibility();
}
