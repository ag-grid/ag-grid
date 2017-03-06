<?php
$key = "Floating Filter Component";
$pageTitle = "JavaScript Floating Grid Filtering";
$pageDescription = "Describes how to implement customer floating filters for ag-Grid";
$pageKeyboards = "JavaScript Grid Floating Filtering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h2 id="filter-component">Floating Filter Component</h2>


<p>
    Floating Filter components allow you to add your own floating filter types to ag-Grid. Use this when the provided
    floating filters do not meet your requirements.
</p>

<p>
    This page focuses on writing your own floating filters components. To see general information about floating filters
    in ag-Grid check the <a href="../javascript-grid-filtering/#floatingFilter">docs for floating filters</a>.
</p>

<p>
    To provide a custom floating filter, you have to provide it through the column definition property
    floatingFilterComponent if using plain JS or floatingFilterComponentFramework if you are using your favourite framework.

    For plain JS (floatingFilterComponent) it needs to be provided in the form of a function. ag-Grid will call 'new' on
    this function and treat the generated class instance as a floating filter component. A floating filter component
    class can be any function /class that implements the following interface:
</p>

<pre>interface IFloatingFilter {
    <span class="codeComment">// mandatory methods</span>

    <span class="codeComment">// The init(params) method is called on the floating filter once. See below for details on the parameters.</span>
    init(params: IFilterFloatingParams): void;

    <span class="codeComment">// This is a method that ag-Grid will call every time the model from the associated rich filter
    for this floating filter changes. Typically this would be used so that you can refresh your UI and show
    on it a visual representation of the latest model for the filter as it is being updated somewhere else.</span>
    onParentModelChanged(parentModel:any)

    <span class="codeComment">// Returns the dom html element for this floating filter.</span>
    getGui(): HTMLElement;

    <span class="codeComment">// optional methods</span>

    <span class="codeComment">// Gets called when the column header section is destroyed.
    // like column headers, the floating filter life span is only when the column is visible,
    // so gets destroyed if column is made not visible or when user scrolls column out of
    // view with horizontal scrolling</span>
    destroy?(): void;
}</pre>

<h4 id="ifilter-params">IFloatingFilterParams</h4>

<p>
    The method init(params) takes a params object with the items listed below. If the user provides
    params via the <i>colDef.floatingFilterComponentParams</i> attribute, these will be additionally added to the
    params object, overriding items of the same name if a name clash exists.
</p>

<pre>interface IFloatingFilterParams {

    <span class="codeComment">// The column this filter is for</span>
    column: Column;

    <span class="codeComment">
    // This is the callback you need to invoke from your component every time that you want to update the model
    //from your parent rich filter.
    //In order to make this call you need to be able to produce a model object like the one this rich filter will
    //produce through getModel() after this call is completed, the parent rich filter will be updated and the
    //data on the grid filtered accordingly if applyButton=false.</span>
    onFloatingFilterChanged(change:any): void;

    <span class="codeComment">
    // This is the callback you need to invoke from your component every time that you want to simulate the user
    //clicking the apply button on the rich filter. If there is no apply button on the rich filter, this callback
    //behaves exactly the same as onFloatingFilterChanged.
    //As onFloatingFilterChanged you need to be able to produce a model object.</span>
    onApplyFilter(change:any): void;

    <span class="codeComment">// This is a shortcut to invoke getModel on the parent rich filter..</span>
    currentParentModel(): any;

}</pre>



<show-example example="exampleCustomFloatingFilter"></show-example>

<?php include '../documentation-main/documentation_footer.php';?>
