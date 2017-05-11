<?php
$key = "Date Component";
$pageTitle = "Date Component";
$pageDescription = "Describes how to implement customer date components for ag-Grid";
$pageKeyboards = "JavaScript Date Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h2>Date Component</h2>


<p>
    You can create your own date components, and ag-Grid will use them every time it needs to ask user for a date value.

    The date components so far are used in ag-Grid in:
    <ol>
        <li>On the rich date filter</li>
        <li>On the floating date filter</li>
    </ol>
</p>

<p>
    By default the grid will use the browser provided date picker for Chrome (as we think it's nice), but for all other
    browser it will just provide a simple text field. You can provide your chosen date picker to ag-Grid. This is done by providing a custom
    Date Component via the grid property dateComponent as follows:
</p>

<pre>
gridOptions: {
    ...
    <span class="codeComment">// Here is where we specify the component to be used as the date picket widget</span>
    dateComponent: MyDateEditor
}},
</pre>

<p>
    The interface for dateComponent is similar to that of a cellRenderer and is as follows:
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

    <span class="codeComment">// Gets called when the component is destroyed.</span>
    destroy?(): void;

     <span class="codeComment">// The grid API</span>
    api: any;
}</pre>

<h4>IFilterParams</h4>

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

<h4>IDoesFilterPassParams</h4>

<p>
    The method doesFilterPass(params) takes the following as a parameter:
</p>

<pre>interface IDoesFilterPassParams {

    <span class="codeComment">// The row node in question</span>
    node: RowNode;

    <span class="codeComment">// The data part of the row node in question</span>
    data: any
}</pre>

<h3>Custom Date Example</h3>

<p>
    The example below shows how to register a custom date component, and then how that component is automatically used in
    the date column for both the rich filter and the floating filter.
</p>

<show-complex-example example="./exampleCustomDate.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleCustomDate.html,exampleCustomDate.js' }
                                ]
                              }"
                      plunker="https://embed.plnkr.co/UQG80i3bRCGnkgtVwteC/"
                      exampleheight="500px">
</show-complex-example>

<?php include '../documentation-main/documentation_footer.php';?>
