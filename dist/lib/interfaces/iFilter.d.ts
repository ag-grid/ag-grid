// Type definitions for ag-grid v6.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
import { ColDef } from "../entities/colDef";
import { IRowModel } from "./iRowModel";
import { RowNode } from "../entities/rowNode";
export interface IFilter {
    /** The init(params) method is called on the filter once. See below for details on the parameters. */
    init(params: IFilterParams): void;
    /** Returns the GUI for this filter. The GUI can be a) a string of html or b) a DOM element or node. */
    getGui(): any;
    /** This is used to show the filter icon in the header. If true, the filter icon will be shown. */
    isFilterActive(): boolean;
    /** The grid will ask each active filter, in turn, whether each row in the grid passes. If any
     filter fails, then the row will be excluded from the final set. The method is provided a
     params object with attributes node (the rodNode the grid creates that wraps the data) and data
     (the data object that you provided to the grid for that row). */
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    /** Gets the filter state for storing */
    getModel(): any;
    /** Restores the filter state. */
    setModel(model: any): void;
    /** Gets called every time the popup is shown, after the gui returned in getGui is attached to the DOM.
     If the filter popup is closed and reopened, this method is called each time the filter is shown.
     This is useful for any
     logic that requires attachment before executing, such as putting focus on a particular DOM
     element. The params has one callback method 'hidePopup', which you can call at any later
     point to hide the popup - good if you have an 'Apply' button and you want to hide the popup
     after it is pressed. */
    afterGuiAttached?(params: IAfterFilterGuiAttachedParams): void;
    /** Gets called when new rows are inserted into the grid. If the filter needs to change it's state
     after rows are loaded, it can do it here. */
    onNewRowsLoaded?(): void;
    /** Gets called when the grid is destroyed. If your custom filter needs to do
     any resource cleaning up, do it here. A filter is NOT destroyed when it is
     made 'not visible', as the gui is kept to be shown again if the user selects
     that filter again. The filter is destroyed when the grid is destroyed. */
    destroy?(): void;
    /** If using React or Angular 2, returns the underlying component instance, so you can call methods
     * on it if you want. */
    getFrameworkComponentInstance?(): any;
}
export interface IDoesFilterPassParams {
    node: RowNode;
    data: any;
}
export interface IFilterParams {
    column: Column;
    colDef: ColDef;
    rowModel: IRowModel;
    filterChangedCallback: () => void;
    filterModifiedCallback: () => void;
    valueGetter: (rowNode: RowNode) => any;
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;
    context: any;
    $scope: any;
}
export interface IAfterFilterGuiAttachedParams {
    hidePopup?: (event?: any) => void;
}
