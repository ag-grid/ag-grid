<?php
$key = "Date Filter";
$pageTitle = "JavaScript Grid Date Filter";
$pageDescription = "ag-Grid comes with a date filter. This sections explains how to use the date filter.";
$pageKeyboards = "ag-Grid Date Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h2 id="overview">Date Filter</h2>
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
colDef:{
    filter:'date'
}</snippet></p>

<h2 id="dateFilterParameters">Date Filter Parameters</h2>

A date filter can take the following parameters:
<ul>
    <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter.
        If you want to keep the filter status between row loads, then set this value to 'keep'.</li>
    <li><b>applyButton:</b> Set to true to include an 'Apply' button with the filter and not filter
        automatically as the selection changes.</li>
    <li><b>clearButton:</b> Set to true to include a 'Clear' button with the filter which when cliked
        will remove the filter conditions to this filter.</li>
    <li><b>comparator:</b> Needed if the data for this column are not native JS objects. See section below</li>
    <li><b>inRangeInclusive:</b> Set to true so that when doing inRange date filters it will include
        the dates you specify as minimum and maximum, otherwise it selects only the dates in between.</li>
    <li><b>filterOptions:</b> If specified, limits the amount of options presented in the filter UI, it must be
        a string array containing some of the following values  {equals, notEquals, lessThanOrEqual, greaterThan,
        greaterThanOrEqual, inRange}</li>
    <li><b>defaultOption:</b> If specified, changes the default filter option to one of {equals, notEquals,
        lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. If not specified the default type is {equals},
        if {equals} is not available because is removed using <i>filterOptions</i>, then the default
        is the first item in the filterOptions</li>
    <li><b>nullComparator:</b> If specified, it will be used to specify if null values should be included when filtering.
        See: <a href="../javascript-grid-filtering#nullFiltering">Null filtering</a></li>
</ul>


<h3 id="dateFilterComparator">Date Filter Comparator</h3>
<p>
    Dates can be represented in your data in many ways e.g. as a JavaScript Date object, or as a string in
    the format eg "26-MAR-2020" or something else different. How you represent dates will be particular to your
    application.

    If you are filtering JavaScript date objects the filter will work automatically, but if you are representing
    your date in any other format you will have to provide your own <i>comparator</i> callback.
</p>

<p>
    The <i>comparator</i> callback takes two parameters. The first parameter is a
    Javascript date object with the local date at midnight
    selected in the filter. The second parameter is the current value of the cell being evaluated.
    The callback must return:
<ul>
    <li>Any number < 0 if the cell value is less than the filter date</li>
    <li>0 if the dates are the same</li>
    <li>Any number > 0 if the cell value is greater than the filter date</li>
</ul>
This pattern is intended to be similar to the JavaScript <i>compareTo(a,b)</i> function.
</p>

<p>
    Below is an example of using a date filter with a comparator.
</p>

<snippet>
colDef = {
    ...
    // specify we want to use the date filter
    filter: 'date',

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

<h2 id="model">Date Filter Model</h2>

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
<ul>
    <li><b>type:</b> The type of date filter to apply. One of: {equals, notEquals, lessThanOrEqual, greaterThan,
        greaterThanOrEqual, inRange}</li>
    <li><b>date:</b> The actual filter date to apply, or the start of the range if the filter type is inRange</li>
    <li><b>dateTo:</b> The end range of the filter if the filter type is inRange, otherwise has no effect.</li>
</ul>


<h2 id="floating">Floating Date Filter</h2>
<p>
    If your grid has floatingFilter enabled, your columns with number filter will automatically show below the header a new
    column that will show two elements:

<ul>
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
</p>

<h2 id="commonFunctionality">Common Column Filtering Functionality And Examples</h2>

<p>The following can be found in the <a href="../javascript-grid-filtering/">column filtering documentation page</a></p>
<p>
<ul>
    <li>Common filtering params</li>
    <li>Enabling/Disabling filtering in a column</li>
    <li>Enabling/Disabling floating filter</li>
    <li>Adding apply and clear button to a column filter</li>
    <li>Filtering animation</li>
    <li>Examples</li>
</ul>
</p>



<?php include '../documentation-main/documentation_footer.php';?>
