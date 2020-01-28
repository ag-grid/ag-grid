<?php
$pageTitle = "Date Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Date Filter. Date Filter allows filtering dates with {equals, notEquals, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Date Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Date Filter</h1>

<p class="lead">
    Date filters allow you to filter date data.
    The pages <a href="../javascript-grid-filter-provided/">Provided Filters</a> and
    <a href="../javascript-grid-filter-provided-simple/">Provided Simple Filters</a> explains the parts of the
    date filter that are similar to the other provided filters. This page builds on that and explains some
    details that are specific to the date filter.
</p>

<h2>Date Selection Component</h2>


<p>
    By default the grid will use the browser provided date picker for Chrome (as we think it's nice), but for all
    other browser it will provide a simple text field. To override this and provide a custom date picker
    see <a href="../javascript-grid-date-component/">Date Component</a>.
</p>


<h2>Date Filter Comparator</h2>
<p>
    Dates can be represented in your data in many ways e.g. as a JavaScript Date object, as a string in
    the format eg "26-MAR-2020" or something else different. How you represent dates will be particular to your
    application.
</p>
<p>
    The date filter by default assumes you are using JavaScript Date objects. If this is true, then the
    date filter will work by default. However if your date is in any other format you will have to provide
    your own <code>comparator</code> callback to do the date comparisons.
</p>

<p>
    The <code>comparator</code> callback takes two parameters. The first parameter is a
    Javascript date object with the local date at midnight selected in the filter. The second
    parameter is the current value of the cell being evaluated. The callback must return:
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
            var dateAsString = cellValue;
            if (dateAsString == null) return 0;

            // In the example application, dates are stored as dd/mm/yyyy
            // We create a Date object for comparison against the filter date
            var dateParts = dateAsString.split("/");
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

<p>
    Once the date comparator callback is provided, then the Date Filter is able to perform all the
    comparison operations it needs eg 'Less Then', 'Greater Than' and 'Equals'.
</p>

<h2>Date Model vs Comparison Types</h2>

<p>
    It should be noted that the Date Filter Model represents the Date as a string in format 'YYYY-DD-MM',
    however when doing comparisons the date is provided as a JavaScript Date object. The filter works with
    JavaScript date object as that's what date pickers typically work with. The model uses string representation
    to make it easier to save and avoid any timezone issues.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
