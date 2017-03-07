<?php
$key = "Filter Component";
$pageTitle = "JavaScript Grid Filtering";
$pageDescription = "Describes how to implement customer filters for ag-Grid";
$pageKeyboards = "JavaScript Grid Filtering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h2 id="filter-component">Filter Component</h2>


<p>
    Filter components allow you to add your own filter types to ag-Grid. Use this when the provided
    filters do not meet your requirements.
</p>

<p>
    To provide a custom filter, instead of providing a string for the filter in
    the column definition, provide a Filter Component in the form of a function. ag-Grid will call 'new'
    on this function and treat the generated class instance as a filter component. A filter component class
    can be any function / class that implements the following interface:
</p>

<pre>interface IFilterComp {

    <span class="codeComment">// mandatory methods</span>

    <span class="codeComment">// The init(params) method is called on the filter once. See below for details on the parameters.</span>
    init(params: IFilterParams): void;

    <span class="codeComment">// Returns the GUI for this filter. The GUI can be a) a string of html or b) a DOM element or node.</span>
    getGui(): any;

    <span class="codeComment">// This is used to show the filter icon in the header. If true, the filter icon will be shown.</span>
    isFilterActive(): boolean;

    <span class="codeComment">// The grid will ask each active filter, in turn, whether each row in the grid passes. If any
    // filter fails, then the row will be excluded from the final set. The method is provided a
    // params object with attributes node (the rodNode the grid creates that wraps the data) and data
    // (the data object that you provided to the grid for that row).</span>
    doesFilterPass(params: IDoesFilterPassParams): boolean;

    <span class="codeComment">// Gets the filter state for storing</span>
    getModel(): any;

    <span class="codeComment">// Restores the filter state.</span>
    setModel(model: any): void;

    <span class="codeComment">// optional methods</span>

    <span class="codeComment">// Gets called every time the popup is shown, after the gui returned in getGui is attached to the DOM.
    // If the filter popup is closed and reopened, this method is called each time the filter is shown.
    // This is useful for any logic that requires attachment before executing, such as putting focus on a particular DOM
    // element. The params has one callback method 'hidePopup', which you can call at any later
    // point to hide the popup - good if you have an 'Apply' button and you want to hide the popup
    // after it is pressed.</span>
    afterGuiAttached?(params?: {hidePopup?: Function}): void;

    <span class="codeComment">// Gets called when new rows are inserted into the grid. If the filter needs to change it's state
    // after rows are loaded, it can do it here.</span>
    onNewRowsLoaded?(): void;

    <span class="codeComment">// Gets called when the Column is destroyed. If your custom filter needs to do
    // any resource cleaning up, do it here. A filter is NOT destroyed when it is
    // made 'not visible', as the gui is kept to be shown again if the user selects
    // that filter again. The filter is destroyed when the column it is associated with is destroyed,
    // either new columns are set into the grid, or the grid itself is destroyed.</span>
    destroy?(): void;

    <span class="codeComment">// optional methods used for floating filters</span>

    <span class="codeComment">// Used by ag-Grid when rendering floating filters and there isn't a floating filter
    // associated for this filter, this will happen if you create a custom filter and NOT a custom floating
    // filter. If this method is present and the column doesn't have a custom floating filter, ag-Grid will create
    // a read-only floating filter by reading the model off from this method</span>
    getModelAsString?(model:any): string;

    <span class="codeComment">/**
     * Optional method used by ag-Grid when rendering floating filters.
     *
     * If this method IS NOT IMPLEMENTED, when the floating filter changes, ag-Grid will automatically call
     * IFilterParams.filterChangedCallback,  triggering the filtering of the data based on the changes from
     * the floating filter. For the simplest cases this is enough.
     *
     * IF IT IS IMPLEMENTED. ag-Grid will call it immediately after setting the model of this filter from
     * the floating filter. Then it will delegate into this method the responsibility of calling
     * IFilterParams.filterChangedCallback. This is useful if additional logic is necessary, for instance
     * ag-Grid uses this in addition with the applyNow flag to handle the apply button logic in the default
     * ag-Grid filters.
     *
     *     applyNow[true]: The floating filter would like to apply immediately now the filtering
     *     applyNow[false]: The floating filter just notifies of a change in the filter model
    */</span>
    onFloatingFilterChanged ?(applyNow:boolean): void;

}</pre>

<h4 id="ifilter-params">IFilterParams</h4>

<p>
    The method init(params) takes a params object with the items listed below. If the user provides
    params via the <i>colDef.filterParams</i> attribute, these will be additionally added to the
    params object, overriding items of the same name if a name clash exists.
</p>

<pre>interface IFilterParams {

    <span class="codeComment">// The column this filter is for</span>
    column: Column;

    <span class="codeComment">// The column definition for the column</span>
    colDef: ColDef;

    <span class="codeComment">// The row model, helpful for looking up data values if needed.
    // If the filter needs to know which rows are a) in the table b) currently
    // visible (ie not already filtered), c) what groups d) what order - all of this
    // can be read from the rowModel.</span>
    rowModel: IRowModel;

    <span class="codeComment">// A function callback, to be called, when the filter changes,
    // to inform the grid to filter the data. The grid will respond by filtering the data.</span>
    filterChangedCallback: ()=> void;

    <span class="codeComment">// A function callback, to be optionally called, when the filter changes,
    // but before 'Apply' is pressed. The grid does nothing except call
    // gridOptions.filterModified(). This is useful if you are making use of
    // an 'Apply' button and want to inform the user the filters are not
    // longer in sync with the data (until you press 'Apply').</span>
    filterModifiedCallback: ()=> void;

    <span class="codeComment">// A function callback, call with a node to be given the value for that
    // filters column for that node. The callback takes care of selecting the right colDef
    // and deciding whether to use valueGetter or field etc. This is useful in, for example,
    // creating an Excel style filer, where the filter needs to lookup available values to
    // allow the user to select from.</span>
    valueGetter: (rowNode: RowNode) => any;

    <span class="codeComment">// A function callback, call with a node to be told whether
    // the node passes all filters except the current filter. This is useful if you want
    // to only present to the user values that this filter can filter given the status
    // of the other filters. The set filter uses this to remove from the list, items that
    // are no longer available due to the state of other filters (like Excel type filtering). </span>
    doesRowPassOtherFilter: (rowNode: RowNode) => boolean;

    <span class="codeComment">// The context for this grid. See section on <a href="../javascript-grid-context/">Context</a></span>
    context: any;

    <span class="codeComment">// If the grid options angularCompileFilters is set to true, then a new child
    // scope is created for each column filter and provided here. Just ignore this if
    // you are not using Angular 1</span>
    $scope: any;
}</pre>

<h4 id="i-does-filter-pass-params">IDoesFilterPassParams</h4>

<p>
    The method doesFilterPass(params) takes the following as a parameter:
</p>

<pre>interface IDoesFilterPassParams {

    <span class="codeComment">// The row node in question</span>
    node: RowNode;

    <span class="codeComment">// The data part of the row node in question</span>
    data: any
}</pre>

<h3 id="custom-filter-example">Custom Filter Example</h3>

<p>
    The example below shows two custom filters. The first is on the Athlete column and the
    second is on the Year column.
</p>

<show-example example="exampleCustomFilter"></show-example>

<?php if (isFrameworkAngular()) { ?>
    <?php include './angular.php';?>
<?php } ?>

<?php if (isFrameworkAurelia()) { ?>
    <?php include './aurelia.php';?>
<?php } ?>

<?php if (isFrameworkReact()) { ?>
    <?php include './react.php';?>
<?php } ?>

<?php if (isFrameworkVue()) { ?>
    <?php include './vuejs.php';?>
<?php } ?>

<?php include '../documentation-main/documentation_footer.php';?>
