<?php
$pageTitle = "Provided Simple Filters";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Out of the box many simple filters are provided.";
$pageKeyboards = "ag-Grid Simple Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1" id="pagination">Simple Filters</h1>

<p class="lead">
    The grid provides three simple filters for filtering numbers, strings and dates respectively.

</p>

<style>
    .filterImageSpan {
        flex-grow: 1;
        text-align: center;
    }
    .filterImageTitle {
        font-weight: bold;
    }
</style>

<p style="display: flex;">
    <span class="filterImageSpan">
        <span class="filterImageTitle">Text Filter</span><br/>
        <img src="./textFilter.png"/>
    </span>
    <span class="filterImageSpan">
        <span class="filterImageTitle">Number Filter</span><br/>
        <img src="./numberFilter.png"/>
    </span>
    <span class="filterImageSpan">
        <span class="filterImageTitle">Date Filter</span><br/>
        <img src="./dateFilter.png"/>
    </span>
</p>

<p>
    Each of the filters works in a similar way.
    This page describes the common parts of the simple provided filters.
</p>

<h2>Simple Filter Example</h2>
<p>
    The example below demonstrates all three simple filters working. Note the following:
</p>
<ul class="content">
    <li>Three filter types: 1) text filter, 2) number filter and 3) date filter.</li>
    <li><code>filter=false</code> is set on Total to hide the filter on this column</li>
</ul>

<p>
    Remember Filtering works with all frameworks eg Angular and React as well as plain JavaScript.
</p>

<?= example('Provided Simple', 'provided-simple', 'generated', array("processVue" => true)) ?>

<h2>Simple Filter Parts</h2>

<p>
    Each simple filter follows the same layout. The only layout difference is the type of input field
    presented to the user. For text and number filters a text field is displayed. For date filter
    a date selector is displayed.
</p>

<p style="text-align: center;">
    <img src="./filter-panel-components.png"/>
</p>

<h3>Filter Options</h3>

<p>
    Each filter provides a drop down list of filter options to select from. Each filter option
    represents a filtering strategy eg 'equals', 'not equals' etc.
</p>

<p>
    Each filters <a href="#filterOptions">Filter Options</a> is listed below as well as
    <a href="#customFilterOptions">Defining Custom Filter Options</a>.
</p>

<h3>Filter Value</h3>

<p>
    Each filter option takes zero (a possibility with custom options), one (for most) or two (for 'in rage')
    values. The value type depends on the filter type eg Date Filter takes Date values.
</p>

<h3>Condition 1 and Condition 2</h3>

<p>
    Each filter initially displays Condition 1 only. When the user completes the Condition 1 section of the filter
    then Condition 2 becomes visible.
</p>

<h3>Join Operator</h3>

<p>
    The Join Operator decides how Condition 1 and Condition 2 are joined, whether to use AND or OR.
</p>

<h2 id="filterParams">Simple Filters Parameters</h2>

<p>
    Simple Filters are configured though the <code>filterParams</code> attribute of the column definition.
    The list of filter parameters for all simple filters is as follows:
</p>

<style>
    .supported-filters {
        white-space: nowrap;
    }
    .parameter-key {
        font-weight: bold;
    }
</style>

<table class="properties">
    <tr>
        <th>Parameter</th>
        <th>Description</th>
        <th>Supported Filters</th>
    </tr>
    <tr>
        <td class="parameter-key">applyButton<br/>clearButton<br/>debounceMs<br/>newRowsAction</td>
        <td>See <a href="../javascript-grid-filter-provided/#providedFilterParams">Provided Filter Params</a>.</td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">filterOptions</td>
        <td>
            What <a href="filterOptions">Filter Options</a> to present to the user.
        </td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">defaultOption</td>
        <td>
            The default <a href="filterOptions">Filter Options</a> to be selected.
        </td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">suppressAndOrCondition</td>
        <td>
            If true, the filter will only offer Condition 1.
        </td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">textCustomComparator</td>
        <td>
            Used to override what to filter based on the user input. See textCustomComparator section below.
        </td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">caseSensitive</td>
        <td>
            Set to true to make text filtering case sensitive. Otherwise the filtering will be case insensitive
        </td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">textFormatter</td>
        <td>
            Formats the text before applying the filter compare logic, useful for instance if substituting
            accentuated characters or if you want to do case sensitive filtering.
        </td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">inRangeInclusive</td>
        <td>
            If true then doing 'inRange' filter option will include values equal to the start and end of the range.
        </td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">includeBlanksInEquals</td>
        <td>
            If true then blank (null or undefined) values will pass the 'equals' filter option.
        </td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">includeBlanksInLessThan</td>
        <td>
            If true then blank (null or undefined) values will pass the 'lessThan' and 'lessThanOrEqual' filter options.
        </td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">includeBlanksInGreaterThan</td>
        <td>
            If true then blank (null or undefined) values will pass the 'greaterThan' and 'greaterThanOrEqual' filter options.
        </td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">comparator</td>
        <td>
            Needed if the data for this column are not native JS Date objects.
        </td>
        <td class="supported-filters">Date</td>
    </tr>
    <tr>
        <td class="parameter-key">browserDatePicker</td>
        <td>
            This is only taking into consideration if there isn’t a date component provided. By default the
            grid will use the browser date picker in Chrome and a plain text box for all other browsers
            (this is because Chrome is the only browser providing a decent out of the box date picker).
            If this property is true, the browser date picker will be used regardless of the browser type.
        </td>
        <td class="supported-filters">Date</td>
    </tr>
</table>




<h2 id="filterOptions">Filter Options</h2>

<p>
    Each filter presents a list of options to the user. The list of options for each filter are as follows:
</p>


<table class="properties">
    <tr>
        <th>Option Name</th>
        <th>Option Key</th>
        <th>Supported Filters</th>
    </tr>
    <tr>
        <td class="parameter-key">Equals</td>
            <td>equals</td>
            <td class="supported-filters">Text, Number, Date</td>
        </tr>
    <tr>
        <td class="parameter-key">Not Equals</td>
        <td>notEqual</td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">Contains</td>
        <td>contains</td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">Not Contains</td>
        <td>notContains</td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">Starts With</td>
        <td>startsWith</td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">Ends With</td>
        <td>endsWith</td>
        <td class="supported-filters">Text</td>
    </tr>
    <tr>
        <td class="parameter-key">Less Than</td>
        <td>lessThan</td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">Less Than or Equal</td>
        <td>lessThanOrEqual</td>
        <td class="supported-filters">Number</td>
    </tr>
    <tr>
        <td class="parameter-key">Greater Than</td>
        <td>greaterThan</td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">Greater Than or Equal</td>
        <td>greaterThanOrEqual</td>
        <td class="supported-filters">Number</td>
    </tr>
    <tr>
        <td class="parameter-key">In Range</td>
        <td>inRange</td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">Empty*</td>
        <td>empty</td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
</table>

<p>
    <i>* 'Empty' is a special filter option. When Empty is displayed, it means the filter is not active.</i>
</p>

<h3>Default Filter Options</h3>

<p>
    Each of the three filter types has the following default options and default selected option.
</p>

<table class="properties">
    <tr>
        <th>Filter</th>
        <th>Default List of Options</th>
        <th>Default Selected Option</th>
    </tr>
    <tr>
        <td class="parameter-key">Text</td>
        <td>
            Contains, Not Contains, Equals, Not Equals, Starts With, Ends With.
        </td>
        <td>Contains</td>
    </tr>
    <tr>
        <td class="parameter-key">Number</td>
        <td>
            Equals, Not Equals, Less Than, Less Than or Equal, Greater Than, Greater Than or Equal, In Range.
        </td>
        <td>Equals</td>
    </tr>
    <tr>
        <td class="parameter-key">Date</td>
        <td>
            Equals, Greater Than, Less Than, Not Equals, In Range.
        </td>
        <td>Equals</td>
    </tr>
</table>



<h2>Simple Filter Models</h2>

<p>
    When saving or restoring state on a filter the filter model is used. The filter model represents the
    state of the filter. For example the code below first gets and then sets the filter model for the Athlete column:
</p>

<snippet>
// get filter instance
var filterInstance = gridOptions.api.getFilterInstance('athlete');

// get filter model
var model = filterInstance.getModel();

// OR set filter model and update
filterInstance.setModel({
    type:'endsWith',
    filter:'thing'
});
// tell the grid to refresh rows based on the filter. the filter does not
// do this automatically in case multiple filters are going to get set.
gridOptions.api.onFilterChanged()</snippet>

<p>
    This section explains what the filter model looks like for each of the simple
    filters. The interface followed by each filter type is as follows:
</p>

<note>
    The best way to understand what the filter models look like is to set a filter via the
    UI and call api.getFilterModel(). Then observe what the filter model looks like
    for different variations of the filter.
</note>

<snippet>
// text filter uses this filter model
interface TextFilterModel {

    // always 'text' for text filter
    filterType: string;

    // one of the filter options eg 'equals'
    type: string;

    // the text value associated with the filter.
    // it's optional as custom filters may not
    // have a text value
    filter?: string;
}

// number filter uses this filter model
interface NumberFilterModel {

    // always 'number' for number filter
    filterType: string;

    // one of the filter options eg 'equals'
    type: string;

    // the number value(s) associated with the filter.
    // custom filters can have no values (hence both are optional).
    // range filter has two values (from and to).
    filter?: number;
    filterTo?: number;
}

// date filter uses this filter model
interface DateFilterModel {

    // always 'date' for number filter
    filterType: string;

    // one of the filter options eg 'equals'
    type: string;

    // the date value(s) associated with the filter.
    // the type is string and format is always YYYY-MM-DD eg 2019-05-24
    // custom filters can have no values (hence both are optional).
    // range filter has two values (from and to).
    dateFrom: string;
    dateTo: string;
}

</snippet>

<p>
    Examples of filter model instances are as follows:
</p>

<snippet>
// number filter with one condition, with equals type
var numberLessThan35 = {
    filterType: 'number',
    type: 'lessThan',
    filter: 35
};

// number filter with one condition, with inRange type
var numberBetween35And40 = {
    filterType: 'number',
    type: 'inRange',
    filter: 35,
    filterTo: 40
};
</snippet>

<note>
    The <code>filterType</code> is not used by the grid when you call <code>setFilterModel()</code>.
    It is provided for information purposes only when you get the filter model. This is useful if
    you are doing server side filtering, where the filter type may be used in building back end
    queries.
</note>

<p>
    If the filter has both Condition 1 and Condition 2 set, then two instances of the model
    are created and wrapped inside a Combined Model. A combined model looks as follows:
</p>

<snippet>
// a filter combining two conditions. the 'M' is replace with the type
// of filter model, one of TextFilterModel, NumberFilterModel or DateFilterModel
interface ICombinedSimpleModel&lt;M&gt; {

    // always 'date' for number filter
    filterType: string;

    // one of 'AND' or 'OR'
    operator: string;

    // two instance of the filter model
    condition1: M;
    condition2: M;
}
</snippet>

<p>
    An example of a filter model with two conditions is as follows:
</p>

<snippet>
// number filter with two conditions, both are equals type
var numberEquals18OrEquals20 = {
    filterType: 'number',
    operator: 'OR'
    condition1: {
        filterType: "number",
        type: "equals",
        filter: 18
    },
    condition2: {
        filterType: "number",
        type: "equals",
        filter: 18
    }
};</snippet>


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

<snippet>
export interface IFilterOptionDef {
    displayKey: string;
    displayName: string;
    test: (filterValue: any, cellValue: any) => boolean;
    hideFilterInput?: boolean;
}</snippet>

<p>
    The <code>displayKey</code> should contain a unique key value that doesn't clash with the built-in filter keys.
    A default <code>displayName</code> should also be provided but can be replaced by a locale specific value using a
    <a href="../javascript-grid-internationalisation/#using-localetextfunc">localeTextFunc</a>.
</p>

<p>
    The custom filter logic is implemented through the <code>test</code> function, which receives the <code>filterValue</code>
    typed by the user along with the <code>cellValue</code> from the grid, and returns <code>true</code> or <code>false</code>.
</p>

<p>
    It is also possible to hide the filter input field by enabling the optional property <code>hideFilterInput</code>.
</p>

<p>
    Custom <code>FilterOptionDef's</code> can be supplied alongside the built-in filter option <code>string</code> keys
    as shown below:
</p>

<snippet>
{
    field: "age",
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
}</snippet>

<p>
    The following example demonstrates several custom filter options:
</p>
<ul class="content">
    <li>The 'Athlete' column contains two custom filter options <code>Starts with "A"</code> and
        <code>Starts with "B"</code>. Both these options take no text filter input.
    </li>
    <li>The 'Age' column contains two custom filter options <code>evenNumbers</code>, <code>oddNumbers</code> and
        <code>blanks</code>. It also has uses the build in 'empty' filter along with <code>suppressAndOrCondition=true</code>.
    </li>
    <li>The 'Date' column includes a custom <code>equalsWithNulls</code> filter. Note that a custom <code>comparator</code>
        is still required for the built-in date filter options, i.e. <code>equals</code>.</li>
    <li>The 'Country' column includes a custom <code>notEqualNoNulls</code> filter which also removes null values.</li>
    <li>The 'Country' columns also demonstrates how internationalisation can be achieved via the
        <code>gridOptions.localeTextFunc()</code> callback function, where the default value replaced for the filter
        option 'notEqualNoNulls'.
    </li>
    <li>Saving and Restoring custom filter options via <code>api.getFilterModel()</code> and <code>api.setFilterModel()</code>
        can also be tested using the provided buttons.
    </li>
</ul>

<?= example('Custom Filter Options', 'custom-filter-options', 'generated', array("processVue" => true)) ?>


<h2>Blank Cells (Date and Number Filters)</h2>
<p>
    If the row data contains blanks (ie <code>null</code> or <code>undefined</code>) it won't be included in
    filter results. To change this use the filter params <code>includeBlanksInEquals</code>,
    <code>includeBlanksInLessThan</code> and <code>includeBlanksInGreaterThan</code>.
    For example the code snippet below configures a filter to include null for equals,
    but not for less than or great than:
</p>

<snippet>
filterParams = {
    includeBlanksInEquals: true,
    includeBlanksInLessThan: false,
    includeBlanksInGreaterThan: false
}</snippet>

<p>
    Only less than, greater than and equals allow nulls. In Range will never include null values.
</p>

<p>
    In the following example you can filter by age or date and see how blank values are included.
    Not the following:
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

<?= example('Null Filtering', 'null-filtering', 'vanilla') ?>


<h2>Style Header on Filter</h2>

<p>
    Each time a filter is applied to a column the CSS class <code>ag-header-cell-filtered</code> is added to
    the header. This can be used for adding style to headers that are filtered.
</p>

<p>
    In the example below a background color is added to <code>ag-header-cell-filtered</code>. This means
    any column you filter on will it's header change background color.
</p>

<?= example('Style Header', 'style-header-on-filter', 'generated', array("processVue" => true)) ?>



<?php include '../documentation-main/documentation_footer.php';?>
