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
    Each of the filters works in a similar way, the difference only been around the data type.
    This section goes though how to use each of the three simple filters provided by the grid.
</p>

<h2>Simple Filter Example</h2>
<p>
    The example below demonstrates all three simple filters working. Note the following:
</p>
<ul class="content">
    <li>Three filter types: 1) text filter, 2) number filter and 3) date filter.</li>
    <li>Using the <code>ag-header-cell-filtered</code> class, which is applied to the header
        cell when the header is filtered. By default, no style is applied to this class, the example shows
        applying a different color background to this style.</li>
    <li><code>filter=false</code> is set on Total to hide the filter on this column</li>
</ul>

<p>
    Remember Filtering works with all frameworks eg Angular and React as well as plain JavaScript.
</p>

<?= example('Provided Simple', 'provided-simple', 'generated', array("processVue" => true)) ?>

<h2>Filter Parts</h2>

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

<h3>Clear & Filter Buttons</h3>

<p>
    Each filter can optionally have a Clear and Apply button.
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
        <td class="parameter-key">applyButton</td>
        <td>Set to <code>true</code> to have the filter us an Apply button. If the Apply button is present,
        then the filter is only applied after the user hits the Apply button.</td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">clearButton</td>
        <td>Set to <code>true</code> to have the filter us a Clear button. The Clear button will clear the
            details of the filter thus resetting it.</td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">debounceMs</td>
        <td>By default the provided filters will debounce for 500ms before executing the filter. Use
        <code>debounceMs</code> to override the default debounce time, or set to 0 to remove the debounce.</td>
        <td class="supported-filters">Text, Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">newRowsAction</td>
        <td>This property is for when using the <a href="../javascript-grid-client-side-model/">Client Side Row Model</a>
            only. If set to 'clear', then setting data into the grid by calling api.setRowData() (or updating the rowData
            property if bound by a framework) will clear (reset) the filter. If set to 'keep' then the grid
            will keep it's currently set filter. The default is 'clear', so set to 'keep' if you want to keep filter state
            before loading new data into the grid.
        </td>
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
        <td class="parameter-key">includeNullInEquals</td>
        <td>
            If true then null values will pass the 'equals' filter option.
        </td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">includeNullInLessThan</td>
        <td>
            If true then null values will pass the 'lessThan' and 'lessThanOrEqual' filter options.
        </td>
        <td class="supported-filters">Number, Date</td>
    </tr>
    <tr>
        <td class="parameter-key">includeNullInGreaterThan</td>
        <td>
            If true then null values will pass the 'greaterThan' and 'greaterThanOrEqual' filter options.
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
    <i>*Empty is NOT a normal filter option. When Empty is displayed, it means the filter is not active.</i>
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


<h2>Apply & Clear Buttons</h2>

<p>
    Each of the provided filters can have an Apply and / or Clear button.
</p>
<p>
    When the Apply button is active, the filter is only applied after the Apply button is pressed.
    This is useful if the filtering operation will take a long time because the dataset is large,
    or if doing server side filtering (thus preventing unnecessary calls to the server).
</p>

<p>
    The Clear button clears the filters UI.
</p>

<p>
    The example below also demonstrates using the apply button. It also demonstrates the relationship between
    the Apply button and filter events. Note the following:
</p>
<ul class="content">
    <li>The Athlete, Age and Country columns have filters with Apply and Clear buttons.</li>
    <li>onFilterModified gets called when the filter changes regardless of the apply button.</li>
    <li>onFilterChanged gets called after a new filter is applied.</li>
</ul>

<?= example('Apply Button and Filter Events', 'apply-and-filter-events', 'generated', array("processVue" => true)) ?>


<h2>Filtering null values in Date and Number filters</h2>
<p>
    If the row data contains <code>null</code> it won't be included in the filter results. To change
    this use the filter params <code>includeNullInEquals</code>, <code>includeNullInLessThan</code> and
    <code>includeNullInGreaterThan</code>. For example the code snipped below configures a filter
    to include null for equals, but not for less than or great than:
</p>

<snippet>
filterParams = {
    includeNullInEquals: true,
    includeNullInLessThan: false,
    includeNullInGreaterThan: false
}</snippet>

<p>
    Only less than, greater than and equals allow nulls. In Range will never include null values.
</p>

<p>
    In the following example you can filter by age or date and see how <code>null</code> values are included in the filter based
    on the properties <code>includeNullInEquals</code>, <code>includeNullInLessThan</code> and
    <code>includeNullInGreaterThan</code>.
</p>

<?= example('Null Filtering', 'null-filtering', 'vanilla') ?>

<?php include '../documentation-main/documentation_footer.php';?>
