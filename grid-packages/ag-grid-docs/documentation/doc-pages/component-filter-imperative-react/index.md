---
title: "Filter Component - Imperative"
frameworks: ["react"]
---

<warning>
|This page describes the old imperative way of declaring custom filter components when the grid option `reactiveCustomComponents` is not set. This behaviour is deprecated, and you should instead use the new behaviour described on the [Custom Filter](../component-filter) page.
</warning>

An example filter component looks like this:

<snippet transform={false} language="jsx">
|export default forwardRef((props, ref) => {
|    const [model, setModel] = useState(null);
|    // expose AG Grid Filter Lifecycle callbacks
|    useImperativeHandle(ref, () => {
|        return {
|            doesFilterPass(params) {
|                // filtering logic
|                ...
|                return rowMatchesFilter;
|            },
|
|            isFilterActive() {
|                return model != null;
|            },
|
|            getModel() {
|                return model;
|            },
|
|            setModel(model) {
|                setModel(model);
|            }
|        }
|    });
|
|    useEffect(() => {
|        props.filterChangedCallback()
|    }, [model]);
|
|    return (
|        &lt;div>
|            &lt;input
|                type="text"
|                value={model == null ? '' : model}
|                onChange={({ target: { value }}) => setModel(value === '' ? null : value)}
|            />
|        &lt;/div>
|    );
|});
</snippet>

The example below shows two custom filters. The first is on the `Athlete` column and demonstrates a filter with "fuzzy" matching and the second is on the `Year` column with preset options.

<grid-example title='Filter Component' name='custom-filter' type='mixed'></grid-example>

## Custom Filter Interface

The interface for a custom filter component is as follows:

<snippet transform={false} language="ts">
|interface IFilter {
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
|   // When defined, this method is called whenever the parameters provided in colDef.filterParams
|   // change. The result returned by this method will determine if the filter should be 
|   // refreshed and reused, or if a new filter instance should be created.
|   // 
|   // When true is returned, the existing filter instance should be refreshed and reused instead
|   // of being destroyed. This is useful if the new params passed are compatible with the
|   // existing filter instance. When false is returned, the existing filter will be destroyed 
|   // and a new filter instance will be created. This should be done if you do not wish to reuse
|   // the existing filter instance.
|   // 
|   // When this method is not provided, the default behaviour is to destroy and recreate the
|   // filter instance everytime colDef.filterParams changes.
|   refresh?(newParams: IFilterParams): boolean;
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
</snippet>

<note>
|Note that you will need to expose the lifecycle/callback methods (for example, the `doesFilterPass` callback) with
|`forwardRef` and `useImperativeHandle`.
</note>

### Custom Filter Parameters

When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell and
row values available to you via `props` - the interface for what is provided is documented below.

If custom params are provided via the `colDef.filterParams` property, these
will be additionally added to the params object, overriding items of the same name if a name clash exists.

<interface-documentation interfaceName='IFilterParams' ></interface-documentation>

### IDoesFilterPassParams

The method `doesFilterPass(params)` takes the following as a parameter:

<interface-documentation interfaceName='IDoesFilterPassParams' ></interface-documentation>

## Accessing the React Component Instance

AG Grid allows you to get a reference to the filter instances via `api.getColumnFilterInstance(colKey)`.

<snippet transform={false} language="ts">
|// let's assume a React component as follows
|export default forwardRef((props, ref) => {
|    useImperativeHandle(ref, () => {
|        return {
|            ... // required filter methods
|
|            // put a custom method on the filter
|            myMethod() {
|                // does something
|            }
|        }
|    });
|
|    ... // rest of component
|}
|
|// later in your app, if you want to execute myMethod()...
|laterOnInYourApplicationSomewhere() {
|    // get reference to the AG Grid Filter component on name column
|    api.getColumnFilterInstance('name').then(filterInstance => {
|        filterInstance.myMethod();
|    });
|}
</snippet>
