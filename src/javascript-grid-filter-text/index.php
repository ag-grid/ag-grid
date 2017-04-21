<?php
$key = "Text Filter";
$pageTitle = "JavaScript Grid Text Filter";
$pageDescription = "ag-Grid comes with a text filter. This sections explains how to use the text filter.";
$pageKeyboards = "ag-Grid Text Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h2 id="overview">Text Filter</h2>
<p>
    Text filters allow users to filter data based on the text contained in the column where this filter is defined. To
    create a new text filter in a column, all you need to do is:
</p>
<ol>
    <li><a href="../javascript-grid-filtering/#enable-filtering"> Enable filtering on that column</a></li>
    <li>Set the filter type to text</li>
</ol>

<p>In order to set the filter type to text you need to add the following to your column definition</p>


<p><pre>colDef:{
    filter:'text'
}</pre></p>

<note>
    <p>Enterprise users have <a href="../javascript-grid-set-filtering/">Set Filter</a> as the default type</p>

    <p>Non enterprise users have text filter as the default filter type. If you are not enterprise user,
        you don't need to specify filter:'text' since it is your default filter type</p>
</note>


<h2 id="params">Text Filter Parameters</h2>
<p>
    A text filter can take the following parameters:
    <ul>
    <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter.
        If you want to keep the filter status between row loads, then set this value to 'keep'.</li>
    <li><b>applyButton:</b> Set to true to include an 'Apply' button with the filter and not filter
        automatically as the selection changes.</li>
    <li><b>clearButton:</b> Set to true to include a 'Clear' button with the filter which when cliked
        will remove the filter conditions to this filter.</li>
    <li><b>textCustomComparator:</b> Used to override what to filter based on the user input. See textCustomComparator
        section below </li>
    <li><b>filterOptions:</b> If specified, limits the amount of options presented in the filter UI, it must be
        a string array containing some of the following values {equals, notEqual, contains, notContains, startsWith,
        endsWith}</li>
    </ul>

The parameters for the filter must be specified in the property filterParams inside the column definition
object
<p><pre>colDef:{
    filter:'text',
    filterParams:{
        ...
    }
}</pre></p>
</p>

<h3 id="textCustomComparator">Text Custom Comparator</h3>
<p>
    By default the text filter does strict case insensitive text filtering: ie If you provide as data for a text column
    the following values ['1,234.5USD', '345GBP']:
    <ul><li><b>contains '1,2'</b> Will show 1 value: ['1,234.5USD']</li>
    <li><b>contains '12'</b> Will show 0 values</li>
    <li><b>contains '$'</b> Will show 0 values</li>
    <li><b>contains 'gbp'</b> Will show 1 value ['345GBP']</li></ul>

</p>

<p>
    You can change the default behaviour by providing your own <i>textCustomComparator</i>. Using your own <i>textCustomComparator</i>
    you can provide your own logic to decide when to include a row in the filtered results.
</p>

<p>The <i>textCustomComparator</i> is a function with the following signature:</p>

<pre>
(filter:string, gridValue:any, filterText:string):boolean;
</pre>

<ul>
    <li><b>filter:string</b> The applicable filter type being tested. One of: {equals, notEqual, contains, notContains,
        startsWith, endsWith}</li>
    <li><b>gridValue:any</b> The value about to be filtered, if this column has a value getter, this value will be
        coming off the value getter, otherwise it is the raw value injected into the grid</li>
    <li><b>filterText:string</b> The value to filter by.</li>
    <li><b>returns:boolean</b> True if the value passes the filter, otherwise false.</li>
</ul>

<p>
    The following is an example of a textCustomComparator that mimics the current implementation of ag-Grid. This can be
    used as a template to create your own.
</p>

<pre>
function myComparator (filter, value, filterText){
    var filterTextLoweCase = filterText.toLowerCase();
    var valueLowerCase = value.toString().toLowerCase();
    switch (filter) {
    case 'contains':
        return valueLowerCase.indexOf(filterTextLoweCase) >= 0;
    case 'notContains':
        return valueLowerCase.indexOf(filterTextLoweCase) === -1;
    case 'equals':
        return valueLowerCase === filterTextLoweCase;
    case 'notEqual':
        return valueLowerCase != filterTextLoweCase;
    case 'startsWith':
        return valueLowerCase.indexOf(filterTextLoweCase) === 0;
    case 'endsWith':
        var index = valueLowerCase.lastIndexOf(filterTextLoweCase);
        return index >= 0 && index === (valueLowerCase.length - filterTextLoweCase.length);
    default:
        // should never happen
        console.warn('invalid filter type ' + filter);
        return false;
    }
}
</pre>

<h2 id="model">Text Filter Model</h2>

<p>
    Get and set the state of the text filter by getting and setting the model on the filter instance.
</p>

    <p><pre><span class="codeComment">// get filter instance</span>
var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');

<span class="codeComment">// get filter model</span>
var model = athleteFilterComponent.getModel();

<span class="codeComment">// OR set filter model and update</span>
athleteFilterComponent.setModel({
    type:'endsWith',
    filter:'thing'
});
athleteFilterComponent.onFilterChanged()
</pre></p>

<p>
    The text filter model has the following attributes:
</p>
<ul>
    <li><b>type:</b> The type of text filter to apply. One of: {equals, notEqual, contains, notContains,
        startsWith, endsWith}</li>
    <li><b>filter:</b> The actual filter text to apply.</li>
</ul>

<h2 id="floating">Floating Text Filter</h2>
<p>
    If your grid has floatingFilter enabled, your columns with text filter will automatically show below the header a new
    column that will show two elements:

<ul>
    <li>Filter input box: This input box serves two purposes:
        <ol>
            <li>
                Lets the user change directly the filtering text that will be used for filtering.
            </li>
            <li>It reflects any change made to the filtering text from anywhere within the application. This includes
            changes on the rich filter for this column made by the user directly or changes made to the filter through
            a call to setModel to this filter component</li>
        </ol>
        </li>
    <li>Filter button: This button is a shortcut to show the rich filter editor</li>
</ul>
</p>

<h2 id="example">Example</h2>
<p>
<ul>
    <li>The athlete column has only two filter options: <i>filterOptions=['contains','notContains']</i></li>
    <li>The country column has only one filter option: <i>filterOptions=['contains']</i></li>
    <li>The country column has a <i>textCustomComparator</i> so that there are aliases that can be entered in the filter
    ie: if you filter using the text 'usa' it will match United States or 'holland' will match 'Netherlands'</li>
</ul>
</p>
<show-example example="exampleFilter"></show-example>

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
