[[only-react]]
|## Custom Filter Interface
|
|The interface for a custom filter component is as follows:
|
|```ts
|interface IFilterReactComp {
|    // Return true if the filter is active. If active then 1) the grid will show the filter icon in the column
|    // header and 2) the filter will be included in the filtering of the data.
|    isFilterActive(): boolean;
|
|    // The grid will ask each active filter, in turn, whether each row in the grid passes. If any
|    // filter fails, then the row will be excluded from the final set. A params object is supplied
|    // containing attributes of node (the rowNode the grid creates that wraps the data) and data (the data
|    // object that you provided to the grid for that row).
|    doesFilterPass(params: IDoesFilterPassParams): boolean;
|
|    // Gets the filter state. If filter is not active, then should return null/undefined.
|    // The grid calls getModel() on all active filters when gridApi.getFilterModel() is called.
|    getModel(): any;
|
|    // Restores the filter state. Called by the grid after gridApi.setFilterModel(model) is called.
|    // The grid will pass undefined/null to clear the filter.
|    setModel(model: any): void;
|
|    // Optional methods
|
|    // Gets called when new rows are inserted into the grid. If the filter needs to change its
|    // state after rows are loaded, it can do it here. For example the set filters uses this
|    // to update the list of available values to select from (e.g. 'Ireland', 'UK' etc for
|    // Country filter). To get the list of available values from within this method from the
|    // Client Side Row Model, use gridApi.forEachLeafNode(callback)
|    onNewRowsLoaded?(): void;
|
|    // Called whenever any filter is changed.
|    onAnyFilterChanged?(): void;
|
|    // Gets called when the column is destroyed. If your custom filter needs to do
|    // any resource cleaning up, do it here. A filter is NOT destroyed when it is
|    // made 'not visible', as the GUI is kept to be shown again if the user selects
|    // that filter again. The filter is destroyed when the column it is associated with is
|    // destroyed, either when new columns are set into the grid, or the grid itself is destroyed.
|    destroy?(): void;
|
|    // If floating filters are turned on for the grid, but you have no floating filter
|    // configured for this column, then the grid will check for this method. If this
|    // method exists, then the grid will provide a read-only floating filter for you
|    // and display the results of this method. For example, if your filter is a simple
|    // filter with one string input value, you could just return the simple string
|    // value here.
|    getModelAsString?(model: any): string;
|
|    // Gets called every time the popup is shown, after the GUI returned in
|    // getGui is attached to the DOM. If the filter popup is closed and re-opened, this method is
|    // called each time the filter is shown. This is useful for any logic that requires attachment
|    // before executing, such as putting focus on a particular DOM element. The params has a
|    // callback method 'hidePopup', which you can call at any later point to hide the popup - good
|    // if you have an 'Apply' button and you want to hide the popup after it is pressed.
|    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
|
|    // Gets called every time the popup is hidden, after the GUI returned in getGui is detached
|    // from the DOM. If the filter popup is closed and re-opened, this method is called each time
|    // the filter is hidden. This is useful for any logic to reset the UI state back to the model
|    // before the component is reopened.
|    afterGuiDetached?(): void;
|}
|```
|
|[[note]]
||Note that if you're using Hooks for Grid Components that have lifecycle/callbacks that the
||grid will call (for example, the `doesFilterPass` callback from an Editor Component), then you'll need to expose them with
||`forwardRef` & `useImperativeHandle`.
||
||Please refer to the [Hook](/react-hooks/) documentation (or the examples on this page) for more information.
|
|### Custom Filter Parameters
|
|When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `props` - the interface for what is provided is documented below.
|
|If custom params are provided via the `colDef.filterParams` property, these
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
