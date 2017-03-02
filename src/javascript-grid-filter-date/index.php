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
<ol>
    <li><a href="../javascript-grid-filtering/#enable-filtering"> Enable filtering on that column</a></li>
    <li>Set the filter type to date</li>
    <li>Specify the date comparator to use if the data in this column are not native Javascript dates. See section
    date filter parameters below</li>
</ol>

<p>In order to set the filter type to text you need to add the following to your column definition</p>

<p><pre>colDef:{
    filter:'date'
}</pre></p>

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

<h2 id="model">Date Filter Model</h2>

<p>
    Get and set the state of the date filter by getting and setting the model on the filter instance.
</p>

<p><pre><span class="codeComment">// get filter instance</span>
var dobFilterComponent = gridOptions.api.getFilterInstance('dob');

<span class="codeComment">// get filter model</span>
var model = dobFilterComponent.getModel();

<span class="codeComment">// OR set filter model and update</span>
dobFilterComponent.setModel({
    type:'equals',
    dateFrom:'2008-08-24'
});
dobFilterComponent.onFilterChanged()

<span class="codeComment">// NOTE number filter allows for ranges</span>
dobFilterComponent.setModel({
    type:'inRange',
    dateFrom:'2008-08-24'
    dateTo:'2012-08-24'
});
dobFilterComponent.onFilterChanged()
</pre></p>

<note>
    <p>The dates for the date filter model are always serialised and expected to be a string with the format
    yyyy-mm-dd</p>
</note>

<p>
    The number filter model has the following attributes:
</p>
<ul>
    <li><b>type:</b> The type of date filter to apply. One of: {equals, notEquals, lessThanOrEqual, greaterThan,
        greaterThan, inRange}</li>
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

<p>The following can be found int the <a "../javascript-grid-filtering/">column filtering documentation page</a></p>
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

<h2 id="custom-date-component">Custom Date Component</h2>

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
