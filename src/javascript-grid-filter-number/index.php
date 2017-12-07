<?php
$key = "Number Filter";
$pageTitle = "JavaScript Grid Number Filter";
$pageDescription = "ag-Grid comes with a number filter. This sections explains how to use the number filter.";
$pageKeyboards = "ag-Grid Number Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h2 id="overview">Number Filter</h2>
<p>
    Number filters allow users to filter data based on the numbers contained in the column where this filter is defined. To
    create a new text filter in a column, all you need to do is:
</p>
<ol>
    <li><a href="../javascript-grid-filtering/#enable-filtering"> Enable filtering on that column</a></li>
    <li>Set the filter type to number</li>
</ol>

<p>In order to set the filter type to text you need to add the following to your column definition</p>


<p><snippet>
colDef:{
    filter:'number'
}</snippet></p>

<h2 id="params">Number Filter Parameters</h2>
<p>
    A number filter can take the following parameters:
<ul>
    <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter.
        If you want to keep the filter status between row loads, then set this value to 'keep'.</li>
    <li><b>applyButton:</b> Set to true to include an 'Apply' button with the filter and not filter
        automatically as the selection changes.</li>
    <li><b>clearButton:</b> Set to true to include a 'Clear' button with the filter which when cliked
        will remove the filter conditions to this filter.</li>
    <li><b>inRangeInclusive:</b> Set to true so that when doing inRange number filters it will include
        the numbers you specify as minimum and maximum, otherwise it selects only the numbers in between.</li>
    <li><b>filterOptions:</b> If specified, limits the amount of options presented in the filter UI, it must be
        a string array containing some of the following values  {equals, notEqual, lessThanOrEqual, greaterThan,
        greaterThanOrEqual, inRange}</li>
    <li><b>defaultOption:</b> If specified, changes the default filter option to one of {equals, notEqual,
        lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. If not specified the default type is {equals},
        if {equals} is not available because is removed using <i>filterOptions</i>, then the default
        is the first item in the filterOptions</li>
    <li><b>debounceMs:</b> If specified, the filter will wait this amount of ms after the user stops entering any characters in the
        input box before is triggered. If not specified this value is 500ms, if the value specified is 0 the filter
        will be immediately triggered</li>
    <li><b>nullComparator:</b> If specified, it will be used to specify if null values should be included when filtering.
    See: <a href="../javascript-grid-filtering#nullFiltering">Null filtering</a></li>
</ul>

The parameters for the filter must be specified in the property filterParams inside the column definition
object
<p><snippet>
colDef:{
    filter:'number',
    filterParams:{
        ...
    }
}</snippet></p>
</p>

<h2 id="model">Number Filter Model</h2>

<p>
    Get and set the state of the number filter by getting and setting the model on the filter instance.
</p>

<p><snippet>
// get filter instance
var ageFilterComponent = gridOptions.api.getFilterInstance('age');

// get filter model
var model = ageFilterComponent.getModel();

// OR set filter model and update
ageFilterComponent.setModel({
    type:'lessThan',
    filter:35
});
ageFilterComponent.onFilterChanged()

// NOTE number filter allows for ranges
ageFilterComponent.setModel({
    type:'inRange',
    filter:30,
    filterTo:35
});
ageFilterComponent.onFilterChanged()</snippet></p>

<p>
    The number filter model has the following attributes:
</p>
<ul>
    <li><b>type:</b> The type of number filter to apply. One of: {equals, notEqual, lessThanOrEqual, greaterThan,
        greaterThanOrEqual, inRange}</li>
    <li><b>filter:</b> The actual filter number to apply, or the start of the range if the filter type is inRange</li>
    <li><b>filterTo:</b> The end range of the filter if the filter type is inRange, otherwise has no effect.</li>
</ul>


<h2 id="floating">Floating Number Filter</h2>
<p>
    If your grid has floatingFilter enabled, your columns with number filter will automatically show below the header a new
    column that will show two elements:

<ul>
    <li>Filter input box: This input box serves two purposes:
        <ol>
            <li>
                Lets the user change directly the filtering number that will be used for filtering, if the filter type
                is inRange, the filterTo property will only be accessible from the filter rich menu or by setting the
                model htrough the code.
            </li>
            <li>It reflects any change made to the filtering text from anywhere within the application. This includes
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
