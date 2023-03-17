// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class CssClassManager {
    private getGui;
    private cssClassStates;
    constructor(getGui: () => HTMLElement);
    addCssClass(className: string): void;
    removeCssClass(className: string): void;
    containsCssClass(className: string): boolean;
    addOrRemoveCssClass(className: string, addOrRemove: boolean): void;
}
