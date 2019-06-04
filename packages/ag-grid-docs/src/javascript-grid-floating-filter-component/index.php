<?php
$pageTitle = "ag-Grid Components: Floating Filter Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It supports the use of components, here we discuss how to implement customer floating filters for the datagrid.";
$pageKeyboards = "JavaScript Grid Floating Filtering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Floating Filter Component</h1>

<p>
    Floating Filter components allow you to add your own floating filter types to ag-Grid. Use this:
</p>

<ul class="content">
    <li>When the provided floating filter for a provided filter does not meet your requirements and you want to replace with one of your own.  </li>
    <li>When you have a custom filter and want to provide a floating filter for your custom filter.</li>
</ul>

<p>
    This page focuses on writing your own floating filters components. To see general information about floating filters
    in ag-Grid see <a href="../javascript-grid-filtering/#floatingFilter">floating filters</a>.
</p>

<h2>Floating Filter LifeCycle</h2>

<p>
    Floating filters do not contain filter state, they merely show the state of the actual underlying filter. Floating
    filters are just another view for the main filter. For this reason the floating filters lifecycle is
    bound to the visibility of the column. So if you hide a column (either set not visible, or
    horizontally scroll the column out of view) then the floating filter UI component is destroyed.
    If the column comes back into view, it is created again. This is different to column filters,
    where the column filter will exist as long as the column exists, regardless of the columns
    visibility.
</p>

<p>
    For details on how the floating filter interacts with its associated column filter,
    see the methods <code>getModelAsString()</code> and <code>onFloatingFilterChanged(change)</code> in the
    <a href="../javascript-grid-filter-component/">filter component interface</a>.
</p>

<p>
    To see examples of the different ways to implement floating filters please refer to the examples below.
</p>

<h2>Floating Filter Interface</h2>

<snippet>
interface IFloatingFilterComp {
    // mandatory methods

    // The init(params) method is called on the floating filter once.
    // See below for details on the parameters.
    init(params: IFilterFloatingParams): void;

    // Gets called every time the parent filter changes. Your floating
    // filter would typically refresh it's UI to reflect the new filter
    // state. The provided parentModel is what the parent filter returns
    // from it's getModel() method. The event is the FilterChangedEvent
    // that the grid fires.
    onParentModelChanged(parentModel:any, event: FilterChangeEvent)

    // Returns the dom html element for this floating filter.
    getGui(): HTMLElement;

    // optional methods

    // Gets called when the floating filter is destroyed. Like column headers,
    // the floating filter life span is only when the column is visible,
    // so gets destroyed if column is made not visible or when user scrolls
    // column out of view with horizontal scrolling.
    destroy?(): void;
}
</snippet>


<h2>IFloatingFilterParams</h2>

<p>
    The method <code>init(params)</code> takes a params object with the items listed below. If the user provides
    params via the <code>colDef.floatingFilterComponentParams</code> attribute, these will be additionally added to the
    params object, overriding items of the same name if a name clash exists.
</p>

<snippet>
interface IFloatingFilterParams {

    // The column this filter is for
    column: Column;

    // The params object passed to the filter. This is to allow the
    // floating filter access to the configuration of the parent filter.
    // For example, the provided filters use debounceMs from the parent
    // filter params.
    filterParams: IFilterParams,

    // This is a shortcut to invoke getModel on the parent parent filter.
    // If the parent filter doesn't exist (filters are lazy created as needed)
    // then returns null rather than calling getModel() on the parent filter.
    currentParentModel(): any;

    // Boolean flag to indicate if the button in the floating filter that
    // opens the parent filter in a popup should be displayed
    suppressFilterButton: boolean;

    // Gets a reference to the parent filter. The result is returned returned
    // async via a callback as the parent filter may not exist yet. If it does
    // not exist, it is created and asynchronously returned (ag-Grid itself
    // does not create component asynchronously, however if providing a framework
    // provided filter eg React, this might be).
    //
    // The floating filter can then call any method it likes on the parent filter.
    // The parent filter will typically provide it's own method for the floating
    // filter to call to set the filter. Eg if creating customer filter A, then
    // it should have a method your floating floating A can call to set the state
    // when the user updates via the floating filter.
    parentFilterInstance: ( callback: (filterInstance: IFilterComp)=>void ) => void;

    // The grid API
    api: any;
}
</snippet>

<h2>Floating Filter Methods on Provided Filters</h2>

<p>
    When the user interacts with a floating filter, the floating filter must set the state
    of the main parent filter in order for filter changes to take effect. This is done by
    the floating filter getting a reference to the parent filter instance and calling
    a method on it.
</p>
<p>
    If you create your own filter and floating filter, it is up to you what method you
    expose on the filter for the floating filter to call. This contract is between the
    filter and the floating filter and doesn't go through the grid.
</p>

<p>
    The simple provided filters (text, string, date) provide the following methods that
    the corresponding provided floating filters then call. This information is useful if
    a) you want to create your own floating filter that is paired with a provided parent filter
    or b) you are just interested to know how the interaction works to help build your
    own filters and floating filters.
</p>

<ul>
    <li>
        <b>Date, Text and Number Filters:</b> All these filters provide a method
        <code>onFloatingFilterChanged(type: string, value: string)</code> where
        type is the type ('lessThan', 'equals' etc) and the value is the text value
        to use (the number and date filters will convert the text to the corresponding
        type).
    </li>
    <li>
        <b>Set Filter:</b> The floating set filter is not editable, thus no method is
        exposed on the parent filter for the floating filter to call.
    </li>
</ul>

<p>
    You could also call <code>setModel()</code> on the filters as an alternative. For
    example you could build your own floating filter for the Set Filter that allows
    picking all European or Asian countries, or you could provide your own Number floating
    filter that allows selecting ranges (the provided Number floating filter does not
    allow editing ranges).
</p>

<h2>Custom Floating Filter Example</h2>

<p>
    In the following example you can see how the columns Gold, Silver, Bronze and Total have a custom floating filter
    NumberFloatingFilter. This filter substitutes the standard floating filter for a input box that the user can change
    to adjust how many medals of each column to filter by based on a greater than filter.
</p>

<p>
    Since this example its using standard filters, the object that needs to be passed
    to the method <code>onParentFilterChanged()</code> needs to provide two properties:
</p>

<ul class="content">
    <li><b>apply</b>: Ignored unless <code>applyButton=true</code>. If true the filter is changed AND applied, if
        it is false, is only changed.
    </li>
    <li><b>model</b>: The model object that represents the new filter state.</li>
</ul>

<p> If the user removes the content of the input box, the filter its removed.  </p>

<p> Note that in this example: </p>

<ol class="content">
    <li>The columns with the floating filter are using the standard number filter as the base filter</li>
    <li>Since the parent filter is the number filter, the floating filter methods <code>onFloatingFilterChanged(parentModel)</code>,
        and <code>currentParentModel():parentModel</code> take and receive model objects
        that correspond to <a href="../javascript-grid-filter-number/#model">the model for the number filter</a></li>
    <li>Since this floating filters are providing a subset of the functionality of their parent filter, which can
        filter for other conditions which are not 'greaterThan' the user is prevented to see the parent filter by adding
        <code>suppressFilterButton:true</code> in the <code>floatingFilterComponentParams</code> and <code>suppressMenu:true</code> in
        the <code>colDef</code></li>
    <li><code>floatingFilterParams</code> for all the medal columns have an additional param that is used to customise the
        font color of the floating filter input text box
    </li>
</ol>

<?= example('Custom Floating Filter', 'custom-floating-filter') ?>


<h3>Custom Filter And Custom Floating Filter Example</h3>

<p>
    This example extends the previous example by also providing its own Custom filter NumberFilter in the gold, silver,
    bronze and
    total columns which now its accessible though the column menu.

    In this example is important to note that:
</p>
<ol class="content">
    <li>NumberFilter <code>getModel()</code> returns a Number representing the current greater than filter than.</li>
    <li>NumberFilter <code>setModel(model)</code> takes an object that can be of ay type. If the value passed is numeric then
        the filter
        gets applied with a condition of greater than
    </li>
    <li>NumberFloatingFilter <code>onParentModelChanged(parentModel)</code>. Receives the product of
        <code>NumberFilter.getModel</code>
        every time that the NumberFilter model changes
    </li>
    <li>NumberFloatingFilter calls on <code>params.onFloatingFilterChanged(modelToAccept)</code> every time the user changes
        the slider value. This will cause an automatic call into <code>NumberFilter.setModel(modelToAccept)</code></li>
    <li>Since NumberFilter <code>onFloatingFilterChanged(change)</code> IS NOT implemented. Every time the user changes the
        input value the filter gets updated automatically. If this method was implemented it would get call it every
        time the floating filter would change, and it would delegate to it the responsibility to perform the filtering.
    </li>
</ol>

<?= example('Custom Filter and Floating Filter', 'custom-filter-and-floating-filter') ?>

<h3>Custom Filter And Read-Only Floating Filter Example</h3>

<p>
    If you want to provide only a custom filter but don't want to provide a custom floating filter, you can implement the
    method <code>Filter.getModelAsString()</code> and you will get for free a read-only floating filter.
</p>

<p>
    This example uses the previous custom filter implementing method <code>NumberFilter.getModelAsString()</code>. Note
    how there are no custom floating filters and yet each column using NumberFilter (gold, silver, bronze and total),
    have a read-only floating filter that gets updated as you change the values from their parent filter
</p>

<?= example('Custom Filter Only', 'custom-filter') ?>

<h2>Complex example with JQuery</h2>

<p>
    The following example illustrates a complex scenario. All the columns have floating filters.
    The first 6 columns (Athlete to Sport) have the standard provided floating filters.
    The last 4 (Gold to Total) have custom filters and custom floating filters that use jQuery sliders.
</p>

<p> Note that: </p>

<ul class="content">
    <li>Athlete has a debounce of 2secs <code>debounceMs:2000</code></li>
    <li>Age has no debounce <code>debounceMs:0</code></li>
    <li>All the other columns have the standard 500ms debounce</i></li>
</ul>

<?= example('Custom Complex Filter and Floating Filter', 'custom-complex-filter-and-floating-filter', 'vanilla', array('extras' => array('jquery', 'jqueryui'))) ?>

<?php include './angular.php'; ?>
<?php include './react.php'; ?>
<?php include './vue.php'; ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
