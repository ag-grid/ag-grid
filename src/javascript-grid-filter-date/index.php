<?php
$key = "Date Filter";
$pageTitle = "JavaScript Grid Date Filter";
$pageDescription = "ag-Grid comes with a date filter. This sections explains how to use the date filter.";
$pageKeyboards = "ag-Grid Date Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h3 id="dateFilter">Date Filter</h3>

<p>
    The date filter allows filtering by dates. It is more complex than the text and number filters as it
    allows custom comparators and also custom date pickers.
</p>


<h3>Date Filter Component Methods</h3>
<p>
    Similar to the text and number filter, the number filter also provides the following API methods:
<ul>
    <li>getDateFrom(): Gets the filter date as string with the format yyyy-mm-dd. If the filter type is "in range", it returns the first date from the range.</li>
    <li>setDateFrom(dateAsString): Sets the date from. The format of the string must be yyyy-mm-dd.</li>
    <li>getDateTo(): Gets the second filter date of an "in range" filter as string with the format yyyy-mm-dd, if the filter type is not "in range", then this returns null</li>
    <li>setDateTo(dateAsString): Sets the date to of an "in range" filter. The format of the string must be yyyy-mm-dd.</li>
    <li>getFilterType(): Gets the current type of the filter, the possible values are: equals, notEquals, lessThan, greaterThan, inRange.</li>
    <li>setFilterType(filterName): Sets the current type of the filter, it can only be one of the acceptable types of date filter.</li>
</ul>
</p>

<p>
    The available types for the text filter are the strings: 'equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan' and 'greaterThanOrEqual'.
</p>


<h4 id="dateFilterComparator">Date Filter Comparator</h4>

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

<pre>
colDef = {
    ...
    <span class="codeComment">// specify we want to use the date filter</span>
    filter: 'date',

    <span class="codeComment">// add extra parameters for the date filter</span>
    filterParams:{

        <span class="codeComment">// provide comparator function</span>
        comparator: function (filterLocalDateAtMidnight, cellValue) {

            <span class="codeComment">// In the example application, dates are stored as dd/mm/yyyy</span>
            <span class="codeComment">// We create a Date object for comparison against the filter date</span>
            var dateParts  = cellValue.split("/");
            var day = Number(dateParts[2]);
            var month = Number(dateParts[1]) - 1;
            var year = Number(dateParts[0]);
            var cellDate = new Date(day, month, year);

            <span class="codeComment">// Now that both parameters are Date objects, we can compare</span>
            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            } else if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}
</pre>

<h4 id="custom-date-component">Custom Date Component</h4>

<p>
    It is possible to specify your own component to be used as a date picker. By default the grid will us
    the browser provided date picker for Chrome (as we think it's nice), but for all other browser it will
    just provide a simple text field. It is assumed that you will have a chosen date picker for your application.
    In this instance you can provide your chosen date picker to ag-Grid. This is done by providing a custom
    Date Component via the grid property <i>dateComponent</i> as follows:
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

<pre>
interface IDateComp {
    <span class="codeComment">// Callback received to signal the creation of this cellEditorRenderer,
    // placeholder to create the necessary logic to setup the component,
    // like initialising the gui, or any other part of your component</span>
    init?(params: IDateParams): void;

    <span class="codeComment">// Return the DOM element of your editor, this is what the grid puts into the DOM</span>
    getGui(): HTMLElement;

    <span class="codeComment">// Gets called once by grid after editing is finished.
    // If your editor needs to do any cleanup, do it here</span>
    destroy?(): void;

    <span class="codeComment">// Returns the current date represented by this editor</span>
    getDate(): Date;

    <span class="codeComment">// Sets the date represented by this component</span>
    setDate(date:Date): void;

    <span class="codeComment">// A hook to perform any necessary operation just after the
    // gui for this component has been renderer in the screen</span>
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
}
</pre>

<p>
    The params object for the <i>DateComponent</i> has the following signature:
</p>

<pre>
export interface IDateCompParams {
    <span class="codeComment">// Method for component to tell ag-Grid that the date has changed</span>
    onDateChanged:()=>void
}
</pre>

<p>
    The onDateChanged method is used to tell ag-Grid the date selection has changed.
    You are responsible to hook this method inside your date component so that every time that the date changes
    inside the component, this method is called, so that ag-Grid can proceed with the filtering.
</p>

<p>
    See below an example of a custom JQuery date picker.
</p>

<show-complex-example example="exampleCustomDate.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleCustomDate.html,exampleCustomDate.js' }
                                ]
                              }"
                      plunker="https://embed.plnkr.co/hIMxzFxvZk34NnpGpvOT/"
                      exampleheight="500px">
</show-complex-example>



<?php include '../documentation-main/documentation_footer.php';?>
