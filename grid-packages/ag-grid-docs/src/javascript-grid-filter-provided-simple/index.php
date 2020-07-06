<?php
$pageTitle = "Provided Simple Filters";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Out of the box many simple filters are provided.";
$pageKeywords = "ag-Grid Simple Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Simple Filters</h1>

<p class="lead">
    The grid provides three simple filters for filtering strings, numbers and dates.
</p>

<style>
    .filter-image {
        flex-grow: 1;
        text-align: center;
    }

    .filter-image__title {
        font-weight: bold;
    }
</style>

<div style="display: flex; margin-bottom: 20px;">
    <span class="filter-image">
        <span class="filter-image__title">Text Filter</span><br/>
        <img src="./textFilter.png"/>
    </span>
    <span class="filter-image">
        <span class="filter-image__title">Number Filter</span><br/>
        <img src="./numberFilter.png"/>
    </span>
    <span class="filter-image">
        <span class="filter-image__title">Date Filter</span><br/>
        <img src="./dateFilter.png"/>
    </span>
</div>

<p>
    Each of the filters works in a similar way.
    This page describes the common parts of the simple provided filters.
</p>

<h3>Example: Simple Filters</h3>

<p>
    The example below demonstrates all three simple filters working. Note the following:
</p>

<ul class="content">
    <li>Three filter types: 1) text filter, 2) number filter and 3) date filter.</li>
    <li><code>filter=false</code> is set on Total to hide the filter on this column.</li>
</ul>

<p>
    Remember Filtering works with all frameworks (e.g. Angular and React) as well as plain JavaScript.
</p>

<?= grid_example('Provided Simple', 'provided-simple', 'generated', ['exampleHeight' => 560, 'modules' => true]) ?>

<h2>Simple Filter Parts</h2>

<p>
    Each simple filter follows the same layout. The only layout difference is the type of input field
    presented to the user: for text and number filters a text field is displayed, whereas for date filters
    a date selector is displayed.
</p>

<div style="text-align: center;">
    <img src="./filter-panel-components.png"/>
</div>

<h3>Filter Options</h3>

<p>
    Each filter provides a dropdown list of filter options to select from. Each filter option
    represents a filtering strategy, e.g. 'equals', 'not equals', etc.
</p>

<p>
    Each filter's default <a href="#filterOptions">Filter Options</a> are listed below, as well as information on
    <a href="#customFilterOptions">Defining Custom Filter Options</a>.
</p>

<h3>Filter Value</h3>

<p>
    Each filter option takes zero (a possibility with custom options), one (for most) or two (for 'in range')
    values. The value type depends on the filter type, e.g. the Date Filter takes Date values.
</p>

<h3>Condition 1 and Condition 2</h3>

<p>
    Each filter initially only displays Condition 1. When the user completes the Condition 1 section of the filter,
    Condition 2 becomes visible.
</p>

<h3>Join Operator</h3>

<p>
    The Join Operator decides how Condition 1 and Condition 2 are joined, using either <code>AND</code> or <code>OR</code>.
</p>

<h2 id="filterParams">Simple Filters Parameters</h2>

<p>
    Simple Filters are configured though the <code>filterParams</code> attribute of the column definition. All of the
    parameters from Provided Filters are available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided/providedFilters.json', 'filterParams'); ?>

<p>
    In addition, the following parameters are also available, depending on the type of filter being used:
</p>

<?= createDocumentationFromFile('simpleFilters.json', 'filterParams'); ?>

<h2 id="filterOptions">Filter Options</h2>

<p>
    Each filter presents a list of options to the user. The list of options for each filter are as follows:
</p>


<table class="reference">
    <tr>
        <th>Option Name</th>
        <th>Option Key</th>
        <th>Supported Filters</th>
    </tr>
    <tr>
        <td class="reference__name">Equals</td>
        <td><code>equals</code></td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="reference__name">Not Equals</td>
        <td><code>notEqual</code></td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="reference__name">Contains</td>
        <td><code>contains</code></td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="reference__name">Not Contains</td>
        <td><code>notContains</code></td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="reference__name">Starts With</td>
        <td><code>startsWith</code></td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="reference__name">Ends With</td>
        <td><code>endsWith</code></td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="reference__name">Less Than</td>
        <td><code>lessThan</code></td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="reference__name">Less Than or Equal</td>
        <td><code>lessThanOrEqual</code></td>
        <td class="supported-filters">Number</td>
    </tr>
    <tr>
        <td class="reference__name">Greater Than</td>
        <td><code>greaterThan</code></td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="reference__name">Greater Than or Equal</td>
        <td><code>greaterThanOrEqual</code></td>
        <td class="supported-filters">Number</td>
    </tr>
    <tr>
        <td class="reference__name">In Range</td>
        <td><code>inRange</code></td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="reference__name">Choose One</td>
        <td><code>empty</code></td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
</table>

<p>
    Note that the <code>empty</code> filter option is primarily used when creating
    <a href="../javascript-grid-filter-provided-simple/#customFilterOptions">Custom Filter Options</a>. When 'Choose One' is
    displayed, the filter is not active.</i>
</p>

<h3>Default Filter Options</h3>

<p>
    Each of the three filter types has the following default options and default selected option.
</p>

<table class="reference">
    <tr>
        <th>Filter</th>
        <th>Default List of Options</th>
        <th>Default Selected Option</th>
    </tr>
    <tr>
        <td>Text</td>
        <td>
            Contains, Not Contains, Equals, Not Equals, Starts With, Ends With.
        </td>
        <td>Contains</td>
    </tr>
    <tr>
        <td>Number</td>
        <td>
            Equals, Not Equals, Less Than, Less Than or Equal, Greater Than, Greater Than or Equal, In Range.
        </td>
        <td>Equals</td>
    </tr>
    <tr>
        <td>Date</td>
        <td>
            Equals, Greater Than, Less Than, Not Equals, In Range.
        </td>
        <td>Equals</td>
    </tr>
</table>

<h2>Simple Filter Models</h2>

<p>
    When saving or restoring state on a filter, the filter model is used. The filter model represents the
    state of the filter. For example, the code below first gets and then sets the filter model for the Athlete column:
</p>

<?= createSnippet(<<<SNIPPET
// get filter instance (Note - React users must use the async version
// of this method by passing a callback parameter)
var filterInstance = gridOptions.api.getFilterInstance('athlete');

// get filter model
var model = filterInstance.getModel();

// set filter model and update
filterInstance.setModel({
    type: 'endsWith',
    filter: 'thing'
});

// tell the grid to refresh rows based on the filter. The filter does
// not do this automatically, allowing you to batch multiple filter
// updates for performance
gridOptions.api.onFilterChanged();
SNIPPET
) ?>

<p>
    This section explains what the filter model looks like for each of the simple
    filters. The interface used by each filter type is as follows:
</p>

<note>
    The best way to understand what the filter models look like is to set a filter via the
    UI and call <code>api.getFilterModel()</code> in your console. You can then see what the filter model looks like
    for different variations of the filters.
</note>

<?= createSnippet(<<<SNIPPET
// text filter uses this filter model
interface TextFilterModel {
    // always 'text' for text filter
    filterType: string;

    // one of the filter options, e.g. 'equals'
    type: string;

    // the text value associated with the filter.
    // it's optional as custom filters may not
    // have a text value
    filter?: string;
}
SNIPPET
) ?>

<?= createSnippet(<<<SNIPPET
// number filter uses this filter model
interface NumberFilterModel {
    // always 'number' for number filter
    filterType: string;

    // one of the filter options, e.g. 'equals'
    type: string;

    // the number value(s) associated with the filter.
    // custom filters can have no values (hence both are optional).
    // range filter has two values (from and to).
    filter?: number;
    filterTo?: number;
}
SNIPPET
) ?>

<?= createSnippet(<<<SNIPPET
// date filter uses this filter model
interface DateFilterModel {
    // always 'date' for date filter
    filterType: string;

    // one of the filter options, e.g. 'equals'
    type: string;

    // the date value(s) associated with the filter.
    // the type is string and format is always YYYY-MM-DD e.g. 2019-05-24
    // custom filters can have no values (hence both are optional).
    // range filter has two values (from and to).
    dateFrom: string;
    dateTo: string;
}
SNIPPET
) ?>

<p>
    Examples of filter model instances are as follows:
</p>

<?= createSnippet(<<<SNIPPET
// number filter with one condition, with equals type
var numberLessThan35 = {
    filterType: 'number',
    type: 'lessThan',
    filter: 35
};
SNIPPET
) ?>

<?= createSnippet(<<<SNIPPET
// number filter with one condition, with inRange type
var numberBetween35And40 = {
    filterType: 'number',
    type: 'inRange',
    filter: 35,
    filterTo: 40
};
SNIPPET
) ?>

<note>
    The <code>filterType</code> is not used by the grid when you call <code>setFilterModel()</code>.
    It is provided for information purposes only when you get the filter model. This is useful if
    you are doing server-side filtering, where the filter type may be used in building back-end
    queries.
</note>

<p>
    If the filter has both Condition 1 and Condition 2 set, then two instances of the model
    are created and wrapped inside a Combined Model. A combined model looks as follows:
</p>

<?= createSnippet(<<<SNIPPET
// A filter combining two conditions
// M is either TextFilterModel, NumberFilterModel or DateFilterModel
interface ICombinedSimpleModel<M> {
    // the filter type: date, number or text
    filterType: string;

    // one of 'AND' or 'OR'
    operator: string;

    // two instances of the filter model
    condition1: M;
    condition2: M;
}
SNIPPET
) ?>

<p>
    An example of a filter model with two conditions is as follows:
</p>

<?= createSnippet(<<<SNIPPET
// number filter with two conditions, both are equals type
var numberEquals18OrEquals20 = {
    filterType: 'number',
    operator: 'OR'
    condition1: {
        filterType: 'number',
        type: 'equals',
        filter: 18
    },
    condition2: {
        filterType: 'number',
        type: 'equals',
        filter: 18
    }
};
SNIPPET
) ?>

<h2 id="customFilterOptions">Custom Filter Options</h2>

<p>
    For applications that have bespoke filtering requirements, it is also possible to add new custom filtering options
    to the number, text and date filters. For example, a 'Not Equal (with Nulls)' filter option could be included
    alongside the built in 'Not Equal' option.
</p>

<p>
    Custom filter options are supplied to the grid via <code>filterParams.filterOptions</code> and must conform to the
    following interface:
</p>

<?= createSnippet(<<<SNIPPET
interface IFilterOptionDef {
    displayKey: string;
    displayName: string;
    test: (filterValue: any, cellValue: any) => boolean;
    hideFilterInput?: boolean;
}
SNIPPET
, 'ts') ?>

<p>
    The <code>displayKey</code> should contain a unique key value that doesn't clash with the built-in filter keys.
    A default <code>displayName</code> should also be provided but can be replaced by a locale-specific value using a
    <a href="../javascript-grid-localisation/#using-localetextfunc">localeTextFunc</a>.
</p>

<p>
    The custom filter logic is implemented through the <code>test</code> function, which receives the <code>filterValue</code>
    typed by the user along with the <code>cellValue</code> from the grid, and returns <code>true</code> or <code>false</code>.
</p>

<p>
    It is also possible to hide the filter input field by enabling the optional property <code>hideFilterInput</code>.
</p>

<p>
    Custom <code>FilterOptionDef</code>s can be supplied alongside the built-in filter option <code>string</code> keys
    as shown below:
</p>

<?= createSnippet(<<<SNIPPET
{
    field: 'age',
    filter: 'agNumberColumnFilter',
    filterParams: {
        filterOptions: [
            'lessThan',
            {
                displayKey: 'lessThanWithNulls',
                displayName: 'Less Than with Nulls',
                test: function(filterValue, cellValue) {
                    return cellValue == null || cellValue < filterValue;
                }
            },
            'greaterThan',
            {
                displayKey: 'greaterThanWithNulls',
                displayName: 'Greater Than with Nulls',
                test: function(filterValue, cellValue) {
                    return cellValue == null || cellValue > filterValue;
                }
            }
        ]
    }
}
SNIPPET
) ?>

<p>
    The following example demonstrates several custom filter options:
</p>

<ul class="content">
    <li>The 'Athlete' column contains two custom filter options: <code>Starts with "A"</code> and
        <code>Starts with "N"</code>. Both these options take no text filter input.
    </li>
    <li>The 'Age' column contains three custom filter options: <code>evenNumbers</code>, <code>oddNumbers</code> and
        <code>blanks</code>. It also uses the built-in <code>'empty'</code> filter along with <code>suppressAndOrCondition=true</code>.
    </li>
    <li>The 'Date' column includes a custom <code>equalsWithNulls</code> filter. Note that a custom <code>comparator</code>
        is still required for the built-in date filter options, i.e. <code>equals</code>.</li>
    <li>The 'Country' column includes a custom <code>notEqualNoNulls</code> filter which also removes null values.</li>
    <li>The 'Country' columns also demonstrates how localisation can be achieved via the
        <code>gridOptions.localeTextFunc()</code> callback function, where the default value is replaced for the filter
        option <code>'notEqualNoNulls'</code>.
    </li>
    <li>Saving and Restoring custom filter options via <code>api.getFilterModel()</code> and <code>api.setFilterModel()</code>
        can also be tested using the provided buttons.
    </li>
</ul>

<?= grid_example('Custom Filter Options', 'custom-filter-options', 'generated', ['modules' => true]) ?>

<h2>Blank Cells (Date and Number Filters)</h2>

<p>
    If the row data contains blanks (i.e. <code>null</code> or <code>undefined</code>), by default the row won't be included in
    filter results. To change this, use the filter params <code>includeBlanksInEquals</code>,
    <code>includeBlanksInLessThan</code> and <code>includeBlanksInGreaterThan</code>.
    For example, the code snippet below configures a filter to include <code>null</code> for equals,
    but not for less than or great than:
</p>

<?= createSnippet(<<<SNIPPET
filterParams = {
    includeBlanksInEquals: true,
    includeBlanksInLessThan: false,
    includeBlanksInGreaterThan: false
};
SNIPPET
) ?>

<p>
    Only less than, greater than and equals allow <code>null</code> values; 'In Range' will never include them.
</p>

<p>
    In the following example you can filter by age or date and see how blank values are included.
    Note the following:
</p>

<ul>
    <li>
        Columns Age and Date have both <code>null</code> and <code>undefined</code> values
        resulting in blank cells.
    </li>
    <li>
        Toggle the controls on the top to see how <code>includeBlanksInEquals</code>,
        <code>includeBlanksInLessThan</code> and <code>includeBlanksInGreaterThan</code>
        impact the search result.
    </li>
</ul>

<?= grid_example('Null Filtering', 'null-filtering', 'vanilla', ['exampleHeight' => 310, 'modules' => true]) ?>

<h2>Style Header on Filter</h2>

<p>
    Each time a filter is applied to a column the CSS class <code>ag-header-cell-filtered</code> is added to
    the header. This can be used for adding style to headers that are filtered.
</p>

<p>
    In the example below, we've added some styling to <code>ag-header-cell-filtered</code>, so
    when you filter a column you will notice the column header change.
</p>

<?= grid_example('Style Header', 'style-header-on-filter', 'generated', ['exampleHeight' => 520]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
