<?php
$pageTitle = "Data Filter: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Date Filter. Date Filter allows filtering dates with {equals, notEquals, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Date Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Date Filter</h1>
<p>
    Date filters allow users to filter data based on the dates contained in the column where this filter is defined. To
    create a new date filter in a column, all you need to do is:
</p>

<note>
    <p>The date filter uses <a href="../javascript-grid-date-component/">your own date component</a> if you have one registered automatically. So both in the rich filter
        and the floating filter it will be used to let the user pick dates. Isn't that nice :)</p>
</note>

<ol>
    <li><a href="../javascript-grid-filtering/#enable-filtering"> Enable filtering on that column</a></li>
    <li>Set the filter type to date</li>
    <li>Specify the date comparator to use if the data in this column are not native Javascript dates. See section
    date filter parameters below</li>
</ol>

<p>In order to set the filter type to <code>date</code> you need to add the following to your column definition</p>

<p><snippet>
colDef: {
    filter: 'agDateColumnFilter'
}</snippet></p>

<h2>Date Filter Parameters</h2>

<p>A date filter can take the following parameters:</p>

<ul class="content">
    <li><code>newRowsAction:</code> What to do when new rows are loaded. The default is to reset the filter.
        If you want to keep the filter status between row loads, then set this value to 'keep'.</li>
    <li><code>applyButton:</code> Set to true to include an 'Apply' button with the filter and not filter
        automatically as the selection changes.</li>
    <li><code>clearButton:</code> Set to true to include a 'Clear' button with the filter which when cliked
        will remove the filter conditions to this filter.</li>
    <li><code>comparator:</code> Needed if the data for this column are not native JS objects. See section below</li>
    <li><code>inRangeInclusive:</code> Set to true so that when doing inRange date filters it will include
        the dates you specify as minimum and maximum, otherwise it selects only the dates in between.</li>
    <li><code>filterOptions:</code> If specified, limits the amount of options presented in the filter UI, it must be
        a string array containing some of the following values  {equals, notEqual, lessThanOrEqual, greaterThan,
        greaterThanOrEqual, inRange}</li>
    <li><code>defaultOption:</code> If specified, changes the default filter option to one of {equals, notEqual,
        lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. If not specified the default type is {equals},
        if {equals} is not available because is removed using <code>filterOptions</code>, then the default
        is the first item in the filterOptions</li>
    <li><code>nullComparator:</code> If specified, it will be used to specify if null values should be included when filtering.
        See: <a href="../javascript-grid-filtering#nullFiltering">Null filtering</a></li>
    <li><code>browserDatePicker:</code> This is only taking into consideration if there isn’t a date component provided. By default the grid will use
        the browser date picker in Chrome and a plain text box for all other browsers (this is because Chrome is the only
        browser providing a decent out of the box date picker). If this property is true, the browser date picker will
        be used regardless of the browser type.
    </li>
</ul>


<h2>Date Filter Comparator</h2>
<p>
    Dates can be represented in your data in many ways e.g. as a JavaScript Date object, or as a string in
    the format eg "26-MAR-2020" or something else different. How you represent dates will be particular to your
    application.

    If you are filtering JavaScript date objects the filter will work automatically, but if you are representing
    your date in any other format you will have to provide your own <code>comparator</code> callback.
</p>

<p>
    The <code>comparator</code> callback takes two parameters. The first parameter is a
    Javascript date object with the local date at midnight
    selected in the filter. The second parameter is the current value of the cell being evaluated.
    The callback must return:
<ul class="content">
    <li>Any number < 0 if the cell value is less than the filter date</li>
    <li>0 if the dates are the same</li>
    <li>Any number > 0 if the cell value is greater than the filter date</li>
</ul>
This pattern is intended to be similar to the JavaScript <code>compareTo(a,b)</code> function.
</p>

<p>
    Below is an example of using a date filter with a comparator.
</p>

<snippet>
colDef = {
    ...
    // specify we want to use the date filter
    filter: 'agDateColumnFilter',

    // add extra parameters for the date filter
    filterParams:{

        // provide comparator function
        comparator: function (filterLocalDateAtMidnight, cellValue) {

            // In the example application, dates are stored as dd/mm/yyyy
            // We create a Date object for comparison against the filter date
            var dateParts  = cellValue.split("/");
            var day = Number(dateParts[2]);
            var month = Number(dateParts[1]) - 1;
            var year = Number(dateParts[0]);
            var cellDate = new Date(day, month, year);

            // Now that both parameters are Date objects, we can compare
            if (cellDate &lt; filterLocalDateAtMidnight) {
                return -1;
            } else if (cellDate &gt; filterLocalDateAtMidnight) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}</snippet>

<h2>Date Filter Model</h2>

<p>
    Get and set the state of the date filter by getting and setting the model on the filter instance.
</p>

<p><snippet>
// get filter instance
var dobFilterComponent = gridOptions.api.getFilterInstance('dob');

// get filter model
var model = dobFilterComponent.getModel();

// OR set filter model and update
dobFilterComponent.setModel({
    type:'equals',
    dateFrom:'2008-08-24'
});
gridOptions.api.onFilterChanged()

// NOTE number filter allows for ranges
dobFilterComponent.setModel({
    type:'inRange',
    dateFrom:'2008-08-24'
    dateTo:'2012-08-24'
});
gridOptions.api.onFilterChanged()</snippet></p>

<note>
    <p>The dates for the date filter model are always serialised and expected to be a string with the format
    yyyy-mm-dd</p>
</note>

<p>
    The number filter model has the following attributes:
</p>
<ul class="content">
    <li><code>type:</code> The type of date filter to apply. One of: {equals, notEqual, lessThanOrEqual, greaterThan,
        greaterThanOrEqual, inRange}</li>
    <li><code>date:</code> The actual filter date to apply, or the start of the range if the filter type is inRange</li>
    <li><code>dateTo:</code> The end range of the filter if the filter type is inRange, otherwise has no effect.</li>
</ul>


<h2>Floating Date Filter</h2>
<p>
    If your grid has floatingFilter enabled, your columns with number filter will automatically show below the header a new
    column that will show two elements:
</p>

<ul class="content">
    <li>Filter input box: Dates represented here need to be entered in the following format: yyyy-mm-dd.
        This input box serves two purposes:
        <ol>
            <li>
                Lets the user change directly the filtering date that will be used for filtering, if the filter type
                is inRange, the dateTo property will only be accessible from the filter rich menu or by setting the
                model through the code.
            </li>
            <li>It reflects any change made to the filtering date from anywhere within the application. This includes
                changes on the rich filter for this column made by the user directly or changes made to the filter through
                a call to setModel to this filter component</li>
        </ol>
    </li>
    <li>Filter button: This button is a shortcut to show the rich filter editor</li>
</ul>

<h2>Common Column Filtering Functionality And Examples</h2>

<p>The following can be found in the <a href="../javascript-grid-filtering/">column filtering documentation page</a></p>

<ul class="content">
    <li>Common filtering params</li>
    <li>Enabling/Disabling filtering in a column</li>
    <li>Enabling/Disabling floating filter</li>
    <li>Adding apply and clear button to a column filter</li>
    <li>Filtering animation</li>
    <li>Examples</li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
