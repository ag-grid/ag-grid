<?php
$pageTitle = "ag-Grid Components: Floating Filter Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It supports the use of components, here we discuss how to implement customer floating filters for the datagrid.";
$pageKeywords = "JavaScript Grid Floating Filtering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Floating Filter Component</h1>

<p>
    Floating Filter components allow you to add your own floating filter types to ag-Grid. Use this:
</p>

<ul class="content">
    <li>When the provided floating filter for a provided filter does not meet your requirements and you want to replace with one of your own</li>
    <li>When you have a custom filter and want to provide a floating filter for your custom filter</li>
</ul>

<p>
    This page focusses on writing your own floating filter components. To see general information about floating filters
    in ag-Grid see <a href="../javascript-grid-floating-filters/">floating filters</a>.
</p>

<h2>Floating Filter Lifecycle</h2>

<p>
    Floating filters do not contain filter state themselves, but show the state of the actual underlying filter. Floating
    filters are just another view for the main filter. For this reason, the floating filters lifecycle is
    bound to the visibility of the column; if you hide a column (either set not visible, or
    horizontally scroll the column out of view) then the floating filter UI component is destroyed.
    If the column comes back into view, it is created again. This is different to column filters,
    where the column filter will exist as long as the column exists, regardless of the column's
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

<h2>Floating Filter Interface (<code>IFloatingFilterComp</code>)</h2>

<?= createSnippet(<<<SNIPPET
interface IFloatingFilterComp {
    // Mandatory methods

    // The init(params) method is called on the floating filter once.
    // See below for details on the parameters.
    init(params: IFilterFloatingParams): void;

    // Gets called every time the parent filter changes. Your floating
    // filter would typically refresh its UI to reflect the new filter
    // state. The provided parentModel is what the parent filter returns
    // from its getModel() method. The event is the FilterChangedEvent
    // that the grid fires.
    onParentModelChanged(parentModel: any, event: FilterChangedEvent): void;

    // Returns the HTML element for this floating filter.
    getGui(): HTMLElement;

    // Optional methods

    // Gets called when the floating filter is destroyed. Like column headers,
    // the floating filter lifespan is only when the column is visible,
    // so they are destroyed if the column is made not visible or when a user
    // scrolls the column out of view with horizontal scrolling.
    destroy?(): void;
}
SNIPPET
, 'ts') ?>

<h2><code>IFloatingFilterParams</code></h2>

<p>
    The method <code>init(params)</code> takes a <code>params</code> object with the items listed below. If the user provides
    params via the <code>colDef.floatingFilterComponentParams</code> attribute, these will be additionally added to the
    <code>params</code> object, overriding items of the same name if a name clash exists.
</p>

<?= createSnippet(<<<SNIPPET
interface IFloatingFilterParams {
    // The column this filter is for
    column: Column;

    // The params object passed to the filter. This is to allow the
    // floating filter access to the configuration of the parent filter.
    // For example, the provided filters use debounceMs from the parent
    // filter params.
    filterParams: IFilterParams;

    // This is a shortcut to invoke getModel on the parent filter.
    // If the parent filter doesn't exist (filters are lazily created as needed)
    // then it returns null rather than calling getModel() on the parent filter.
    currentParentModel(): any;

    // Boolean flag to indicate if the button in the floating filter that
    // opens the parent filter in a popup should be displayed
    suppressFilterButton: boolean;

    // Gets a reference to the parent filter. The result is returned asynchronously
    // via a callback as the parent filter may not exist yet. If it does
    // not exist, it is created and asynchronously returned (ag-Grid itself
    // does not create components asynchronously, however if providing a framework
    // provided filter e.g. React, it might be).
    //
    // The floating filter can then call any method it likes on the parent filter.
    // The parent filter will typically provide its own method for the floating
    // filter to call to set the filter. For example, if creating custom filter A,
    // it should have a method your floating A can call to set the state
    // when the user updates via the floating filter.
    parentFilterInstance: (callback: (filterInstance: IFilterComp) => void) => void;

    // The grid API
    api: any;
}
SNIPPET
, 'ts') ?>

<h2>Floating Filter Methods on Provided Filters</h2>

<p>
    When the user interacts with a floating filter, the floating filter must set the state
    of the main parent filter in order for filter changes to take effect. This is done by
    the floating filter getting a reference to the parent filter instance and calling
    a method on it.
</p>
<p>
    If you create your own filter and floating filter, it is up to you which method you
    expose on the filter for the floating filter to call. This contract is between the
    filter and the floating filter and doesn't go through the grid.
</p>

<p>
    The simple provided filters (Text, Number, Date) provide methods that
    the corresponding provided floating filters can call. This information is useful if
    a) you want to create your own floating filter that is paired with a provided parent filter
    or b) you are just interested to know how the interaction works to help build your
    own filters and floating filters.
</p>

<ul>
    <li>
        <b>Date, Text and Number Filters:</b> all these filters provide a method
        <code>onFloatingFilterChanged(type: string, value: string)</code> where
        <code>type</code> is the type (<code>'lessThan'</code>, <code>'equals'</code>, etc.) and the value is the text value
        to use (the number and date filters will convert the text to the corresponding type).
    </li>
    <li>
        <b>Set Filter:</b> The floating set filter is not editable, so no method is
        exposed on the parent filter for the floating filter to call.
    </li>
</ul>

<p>
    You could also call <code>setModel()</code> on the filters as an alternative. For
    example, you could build your own floating filter for the Set Filter that allows
    picking all European or Asian countries, or you could provide your own Number floating
    filter that allows selecting ranges (the provided Number floating filter does not
    allow editing ranges).
</p>

<h2>Example: Custom Floating Filter</h2>

<p>
    In the following example you can see how the Gold, Silver, Bronze and Total columns have a custom floating filter
    <code>NumberFloatingFilter</code>. This filter substitutes the standard floating filter for a input box that the user can change
    to adjust how many medals of each column to filter by based on a greater than filter.
</p>

<p>
    Since this example is using standard filters, the object that needs to be passed
    to the method <code>onParentFilterChanged()</code> needs to provide two properties:
</p>

<ul class="content">
    <li><b>apply</b>: If <code>true</code> the filter is changed AND applied, otherwise if
        it is <code>false</code>, the filter is only changed. However, this is ignored unless <code>buttons</code>
        contains <code>'apply'</code> (i.e. it is ignored unless the Apply button is being used).
    </li>
    <li><b>model</b>: The model object that represents the new filter state.</li>
</ul>

<p> If the user removes the content of the input box, the filter is removed.</p>

<p>Note that in this example:</p>

<ol class="content">
    <li>The columns with the floating filter are using the standard Number filter as the base filter</li>
    <li>Since the parent filter is the Number filter, the floating filter methods <code>onFloatingFilterChanged(parentModel)</code>,
        and <code>currentParentModel()</code> take and receive model objects
        that correspond to <a href="../javascript-grid-filter-provided-simple/#simple-filter-models">the model for the Number filter</a></li>
    <li>Since these floating filters are providing a subset of the functionality of their parent filter, which can
        filter for other conditions which are not <code>'greaterThan'</code>, the user is prevented from seeing the parent filter by adding
        <code>suppressFilterButton: true</code> in the <code>floatingFilterComponentParams</code> and <code>suppressMenu: true</code> in
        the <code>colDef</code></li>
    <li><code>floatingFilterParams</code> for all the medal columns have an additional param that is used to customise the
        font colour of the floating filter input text box
    </li>
</ol>

<?= grid_example('Custom Floating Filter', 'custom-floating-filter') ?>

<h3>Example: Custom Filter And Custom Floating Filter</h3>

<p>
    This example extends the previous example by also providing its own custom filter <code>NumberFilter</code> in the Gold, Silver,
    Bronze and Total columns.

    In this example it is important to note that:
</p>
<ol class="content">
    <li><code>NumberFilter.getModel()</code> returns a <code>number</code> representing the current greater than filter.</li>
    <li><code>NumberFilter.setModel(model)</code> takes an object that can be of any type. If the value passed is numeric then
        the filter gets applied with a condition of greater than.
    </li>
    <li><code>NumberFloatingFilter.onParentModelChanged(parentModel)</code> receives the result of
        <code>NumberFilter.getModel()</code> every time the <code>NumberFilter</code> model changes
    </li>
    <li><code>NumberFloatingFilter</code> calls <code>params.onFloatingFilterChanged(modelToAccept)</code> every time the user changes
        the slider value. This will cause an automatic call into <code>NumberFilter.setModel(modelToAccept)</code></li>
    <li>Since <code>NumberFilter.onFloatingFilterChanged(change)</code> is <strong>not</strong> implemented, every time the user changes the
        input value the filter gets updated automatically. If this method was implemented it would get called every
        time the floating filter would change, and would be responsible for performing the filtering.
    </li>
</ol>

<?= grid_example('Custom Filter and Floating Filter', 'custom-filter-and-floating-filter') ?>

<h3>Example: Custom Filter And Read-Only Floating Filter</h3>

<p>
    If you want to provide a custom filter but don't want to provide an equivalent custom floating filter, you can implement the
    method <code>filter.getModelAsString()</code> and you will get a read-only floating filter for free.
</p>

<p>
    This example uses the previous custom filter but implementing the <code>getModelAsString()</code> method. Note
    how there are no custom floating filters and yet each column using <code>NumberFilter</code> (Gold, Silver, Bronze and Total)
    has a read-only floating filter that gets updated as you change the values from the main filter.
</p>

<?= grid_example('Custom Filter Only', 'custom-filter') ?>

<h2>Complex example with jQuery</h2>

<p>
    The following example illustrates a complex scenario. All the columns have floating filters.
    The first 6 columns (Athlete to Sport) have the standard provided floating filters.
    The last 4 (Gold to Total) have custom filters and custom floating filters that use jQuery sliders.
</p>

<p> Note that:</p>

<ul class="content">
    <li>Athlete has a debounce of 2 seconds (<code>debounceMs: 2000</code>)</li>
    <li>Age has no debounce (<code>debounceMs: 0</code>)</li>
    <li>All the other columns have the standard 500ms debounce</li>
</ul>

<?= grid_example('Custom Complex Filter and Floating Filter', 'custom-complex-filter-and-floating-filter', 'vanilla', ['extras' => ['jquery', 'jqueryui']]) ?>

<?php include './angular.php'; ?>
<?php include './react.php'; ?>
<?php include './vue.php'; ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
