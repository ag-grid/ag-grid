<?php
$pageTitle = "ag-Grid Components: Filter Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page describes how to implement custom filters for ag-Grid";
$pageKeyboards = "JavaScript Grid Filtering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Filter Component</h1>

<p>
    Filter components allow you to add your own filter types to ag-Grid. Use this when the provided
    filters do not meet your requirements.
</p>

<h2>Filter Interface</h2>

<snippet>
interface IFilterComp {

    // mandatory methods

    // The init(params) method is called on the filter once. See below for details on the
    // parameters.
    init(params: IFilterParams): void;

    // Returns the GUI for this filter. The GUI can be a) a string of html or b) a DOM element or
    // node.
    getGui(): any;

    // Return true if the filter is active. If active than 1) the grid will show the filter icon in the column
    // header and 2) the filter will be included in the filtering of the data.
    isFilterActive(): boolean;

    // The grid will ask each active filter, in turn, whether each row in the grid passes. If any
    // filter fails, then the row will be excluded from the final set. A params object is supplied
    // with attributes node (the rowNode the grid creates that wraps the data) and data (the data
    // object that you provided to the grid for that row).
    doesFilterPass(params: IDoesFilterPassParams): boolean;

    // Gets the filter state. If filter is not active, then should return null/undefined.
    // The grid calls getModel() on all active filters when gridApi.getFilterModel() is called.
    getModel(): any;

    // Restores the filter state. Called by the grid after gridApi.setFilterModel(model) is called.
    // The grid will pass undefined/null to clear the filter.
    setModel(model: any): void;

    // optional methods

    // Gets called every time the popup is shown, after the gui returned in
    // getGui is attached to the DOM. If the filter popup is closed and reopened, this method is
    // called each time the filter is shown. This is useful for any logic that requires attachment
    // before executing, such as putting focus on a particular DOM element. The params has one
    // callback method 'hidePopup', which you can call at any later point to hide the popup - good
    // if you have an 'Apply' button and you want to hide the popup after it is pressed.
    afterGuiAttached?(params?: {hidePopup?: Function}): void;

    // Gets called when new rows are inserted into the grid. If the filter needs to change its
    // state after rows are loaded, it can do it here. For example the set filters uses this
    // to update the list of available values to select from (eg 'Ireland', 'UK' etc for
    // Country filter).
    onNewRowsLoaded?(): void;

    // Gets called when the Column is destroyed. If your custom filter needs to do
    // any resource cleaning up, do it here. A filter is NOT destroyed when it is
    // made 'not visible', as the gui is kept to be shown again if the user selects
    // that filter again. The filter is destroyed when the column it is associated with is
    // destroyed, either new columns are set into the grid, or the grid itself is destroyed.
    destroy?(): void;

    // If floating filters are turned on for the grid, but you have no floating filter
    // configured for this column, then the grid will check for this method. If this
    // method exists, then the grid will provide a read only floating filter for you
    // and display the results of this method. For example, if your filter is a simple
    // filter with one string input value, you could just return the simple string
    // value here.
    getModelAsString?(model:any): string;
}
</snippet>

<h2 id="ifilter-params">IFilterParams</h2>

<p>
    The method init(params) takes a params object with the items listed below. If the user provides
    params via the <code>colDef.filterParams</code> attribute, these will be additionally added to the
    params object, overriding items of the same name if a name clash exists.
</p>

<snippet>
interface IFilterParams {

    // The column this filter is for
    column: Column;

    // The column definition for the column
    colDef: ColDef;

    // The row model, helpful for looking up data values if needed.
    // If the filter needs to know which rows are a) in the table
    // b) currently visible (ie not already filtered), c) what groups
    // d) what order - all of this can be read from the rowModel.
    rowModel: IRowModel;

    // A function callback to be called when the filter changes. The
    // grid will then respond by filtering the grid data. The callback
    // takes one optional parameter which if included, will get merged
    // to the FilterChangedEvent object (useful for passing additional
    // information to anyone listening to this event, however such extra
    // attributes are not used by the grid).
    filterChangedCallback: (additionalEventAttributes?: any)=&gt; void;

    // A function callback, to be optionally called, when the filter UI changes.
    // The grid will respond with emitting a FilterModifiedEvent. Apart from
    // emitting the event, the grid takes no further action.
    filterModifiedCallback: ()=&gt; void;

    // A function callback for the filter to get cell values from the
    // row data. Call with a node to be given the value for that filters
    // column for that node. The callback takes care of selecting the
    // right column definition and deciding whether to use valueGetter
    // or field etc. This is useful in, for example, creating an Excel
    // style filer, where the filter needs to lookup available values
    // to allow the user to select from.
    valueGetter: (rowNode: RowNode) =&gt; any;

    // A function callback, call with a node to be told whether the node
    // passes all filters except the current filter. This is useful if you
    // want to only present to the user values that this filter can filter
    // given the status of the other filters. The set filter uses this to
    // remove from the list, items that are no longer available due to the
    // state of other filters (like Excel type filtering).
    doesRowPassOtherFilter: (rowNode: RowNode) =&gt; boolean;

    // The context for this grid. See section on Context
    context: any;

    // The grid API
    api: any;

    // Only if using AngularJS (ie Angular v1), if angularCompileFilters
    // is set to true, then a new child scope is created for each column
    // filter and provided here.
    $scope: any;
}
</snippet>

<h3 id="i-does-filter-pass-params">IDoesFilterPassParams</h3>

<p>
    The method <code>doesFilterPass(params)</code> takes the following as a parameter:
</p>

<snippet>
interface IDoesFilterPassParams {

    // The row node in question
    node: RowNode;

    // The data part of the row node in question
    data: any
}
</snippet>

<h3>Associating Floating Filter</h3>

<p>
    If you create your own filter you have two options to get its floating filters working for that filter:
</p>

<ol class="content">
    <li>
        You can <a href="../javascript-grid-floating-filter-component/">create your own floating filter</a>.
    </li>
    <li>
        You can implement the method <code>getModelAsString()</code> in your custom filter. If you implement this method and
        you don't
        provide a custom floating filter, ag-Grid will automatically provide a read-only version of a floating filter
    </li>
</ol>

<p>
If you don't provide any of these two options for your custom filter, the display area for the floating filter
will be empty.
</p>

<h2>Custom Filter Example</h2>

<p>
    The example below shows two custom filters. The first is on the Athlete column and the
    second is on the Year column.
</p>

<?= example('Filter Component', 'custom-filter') ?>

<h2>Custom Filters Containing a Popup Element</h2>

<p>
    Sometimes you will need to create custom components for your filters that also contain popup elements.
    This is is the case for Date Filter as it pops up a Date Picker. If the library you use to display
    anchors the popup element outside of the parent filter, then when you click on it the grid will think
    you clicked outside of the filter and hence close the column menu.
</p>
<p>
    There are two ways you can get fix this problem:
</p>
<ul>
    <li>Add a mouse click listener to your floating element and set it to preventDefault(). This way, the click event
        will not bubble up to the grid.<br>
        Note: This is the best solution, but you can only do this if you are writing the component yourself.
    </li>
    <li>
        Add the <code>ag-custom-component-popup</code> CSS class to your floating element. An example of this
        usage can be found here: <a href="/javascript-grid-date-component/#example-custom-date">Custom Date Component</a>
    </li>
</ul>

<?php 
include './angular.php'; 

include './react.php';

include './vuejs.php';

include './polymer.php';

include '../documentation-main/documentation_footer.php'; 
?>
