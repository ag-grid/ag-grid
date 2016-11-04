// ag-grid-ng2 v6.2.0
import { IFilterParams, IDoesFilterPassParams, IAfterFilterGuiAttachedParams } from 'ag-grid/main';
import { AgFrameworkComponent } from "./agFrameworkComponent";
export interface AgFilterComponent extends AgFrameworkComponent<IFilterParams> {
    /** The aginit(params) method is called on the filter once. */
    agInit(params: IFilterParams): void;
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
    /** returns the underlying component instance, so you can call methods
     * on it if you want. */
    getFrameworkComponentInstance?(): any;
}
