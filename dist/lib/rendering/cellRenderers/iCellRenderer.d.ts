// Type definitions for ag-grid v5.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export interface ICellRenderer {
    /** Params for rendering. The same params that are passed to the cellRenderer function.
     */
    init?(params: any): void;
    /** Return the DOM element of your editor, this is what the grid puts into the DOM */
    getGui(): HTMLElement;
    /** Gets called once by grid after editing is finished - if your editor needs to do any cleanup, do it here */
    destroy?(): void;
    /** Get the cell to refresh. If this method is not provided, then when refresh is needed, the grid
     * will remove the component from the DOM and create a new component in it's place with the new values. */
    refresh?(params: any): void;
}
export interface ICellRendererFunc {
    (params: any): HTMLElement | string;
}
