// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../gridOptionsWrapper";
export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    hideWhenNoChildren?: boolean;
    body?: boolean;
}
/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export declare class RowContainerComponent {
    gridOptionsWrapper: GridOptionsWrapper;
    private eContainer;
    private eViewport;
    private body;
    private hideWhenNoChildren;
    private childCount;
    private visible;
    private rowTemplatesToAdd;
    private afterGuiAttachedCallbacks;
    private domOrder;
    private lastPlacedElement;
    constructor(params: RowContainerComponentParams);
    private postConstruct();
    getRowElement(compId: number): HTMLElement;
    setHeight(height: number): void;
    flushRowTemplates(): void;
    appendRowTemplate(rowTemplate: string, callback: () => void): void;
    ensureDomOrder(eRow: HTMLElement): void;
    removeRowElement(eRow: HTMLElement): void;
    private checkVisibility();
}
