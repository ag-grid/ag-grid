<?php
$pageTitle = "Text Filter: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Text Filter. Text Filter allows filtering text strings with {equals, notEqual, contains, notContains, startsWith, endsWith}. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Text Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1>Text Filter</h1>
<p>
    Text filters allow users to filter data based on the text contained in the column where this filter is defined. To
    create a new text filter in a column, all you need to do is:
</p>
<ol>
    <li><a href="../javascript-grid-filtering/#enable-filtering"> Enable filtering on that column</a></li>
    <li>Set the filter type to text</li>
</ol>

<p>In order to set the filter type to text you need to add the following to your column definition</p>

<p><snippet>
colDef:{
    filter:'agTextColumnFilter'
}</snippet></p>

<note>
    <p>Enterprise users have <a href="../javascript-grid-set-filtering/">Set Filter</a> as the default type</p>

    <p>Non enterprise users have text filter as the default filter type. If you are not enterprise user,
        you don't need to specify filter:'text' since it is your default filter type</p>
</note>


<h2 id="params">Text Filter Parameters</h2>
<p> A text filter can take the following parameters: </p>

    <ul class="content">
    <li><code>newRowsAction:</code> What to do when new rows are loaded. The default is to reset the filter.
        If you want to keep the filter status between row loads, then set this value to 'keep'.</li>
    <li><code>applyButton:</code> Set to true to include an 'Apply' button with the filter and not filter
        automatically as the selection changes.</li>
    <li><code>clearButton:</code> Set to true to include a 'Clear' button with the filter which when cliked
        will remove the filter conditions to this filter.</li>
    <li><code>textCustomComparator:</code> Used to override what to filter based on the user input. See textCustomComparator
        section below </li>
    <li><code>filterOptions:</code> If specified, limits the amount of options presented in the filter UI, it must be
        a string array containing some of the following values {equals, notEqual, contains, notContains, startsWith,
        endsWith}</li>
    <li><code>defaultOption:</code> If specified, changes the default filter option to one of {equals, notEqual, contains,
        notContains, startsWith, endsWith}. If not specified the default type is {contains}, if {contains} is not
        available because is removed using <code>filterOptions</code>, then the default
        is the first item in the filterOptions</li>
    <li><code>textFormatter:</code> If specified, formats the text before applying the filter compare logic, useful for
        instance if substituting accentuated characters or if you want to do case sensitive filtering.</li>
    <li><code>debounceMs:</code> If specified, the filter will wait this amount of ms after the user stops entering any characters in the
        input box before is triggered. If not specified this value is 500ms, if the value specified is 0 the filter
        will be immediately triggered</li>
    <li><code>caseSensitive</code> If true, the text filtering will be case sensitive, if not specified or false, the filtering
    will be case insensitive</li>
    </ul>

<p>The parameters for the filter must be specified in the property filterParams inside the column definition object</p>

<snippet>
colDef:{
    filter:'agTextColumnFilter',
    filterParams: {
        ...
    }
}</snippet>

<h2>Text Custom Comparator</h2>
<p>
    By default the text filter does strict case insensitive text filtering: ie If you provide as data for a text column
    the following values ['1,234.5USD', '345GBP']:
</p>

    <ul class="content">
<li><b>contains '1,2'</b> Will show 1 value: ['1,234.5USD']</li>
    <li><b>contains '12'</b> Will show 0 values</li>
    <li><b>contains '$'</b> Will show 0 values</li>
    <li><b>contains 'gbp'</b> Will show 1 value ['345GBP']</li>
</ul>

<p>
    You can change the default behaviour by providing your own <code>textCustomComparator</code>. Using your own <code>textCustomComparator</code>
    you can provide your own logic to decide when to include a row in the filtered results.
</p>

<p>The <code>textCustomComparator</code> is a function with the following signature:</p>

<snippet>
(filter:string, gridValue:any, filterText:string):boolean;</snippet>

<ul class="content">
    <li><code>filter:string</code> The applicable filter type being tested. One of: {equals, notEqual, contains, notContains,
        startsWith, endsWith}</li>
    <li><code>gridValue:any</code> The value about to be filtered, if this column has a value getter, this value will be
        coming off the value getter, otherwise it is the raw value injected into the grid</li>
    <li><code>filterText:string</code> The value to filter by.</li>
    <li><code>returns:boolean</code> True if the value passes the filter, otherwise false.</li>
</ul>

<p>
    The following is an example of a textCustomComparator that mimics the current implementation of ag-Grid. This can be
    used as a template to create your own.
</p>

<snippet>
function myComparator (filter, value, filterText){
    var filterTextLoweCase = filterText.toLowerCase();
    var valueLowerCase = value.toString().toLowerCase();
    switch (filter) {
    case 'contains':
        return valueLowerCase.indexOf(filterTextLoweCase) &gt;= 0;
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
        return index &gt;= 0 && index === (valueLowerCase.length - filterTextLoweCase.length);
    default:
        // should never happen
        console.warn('invalid filter type ' + filter);
        return false;
    }
}</snippet>

<h2>Text Formatter</h2>
<p>
    The grid compares the text filter with the values in a case insensite way, thus 'o' will match 'Olivia' and 'Salmon',
    however it will not match against 'Bj&oslash;rk'. If you want to match in any other way (eg you want to makes against
    accents), or you want to have case sensitive matches, then you should provide your own textFormatter.
</p>
<p>
    The <code>textFormatter</code> is a function with the following signature
</p>
<snippet>
(gridValue:string):string;</snippet>

<ul class="content">
    <li><b>gridValue:string</b> The value coming from the grid. This can be the valueGetter if there is any for the
    column, or the value as originally provided in the rowData</li>
    <li><b>returns:string</b> The string to be used for the purpose of filtering.</li>
</ul>

<p>
    If no <code>textFormatter</code> is provided the grid will convert the text to lower case. Is important to note that when
    comparing to the text entered in the filter box, the text in the filter box is converted always to lower case.
</p>

<p>
    The following is an example to remove accents and convert to lower case.
</p>

<snippet>
function(s){
        var r=s.toLowerCase();
        r = r.replace(new RegExp("\\s", 'g'),"");
        r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
        r = r.replace(new RegExp("æ", 'g'),"ae");
        r = r.replace(new RegExp("ç", 'g'),"c");
        r = r.replace(new RegExp("[èéêë]", 'g'),"e");
        r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
        r = r.replace(new RegExp("ñ", 'g'),"n");
        r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
        r = r.replace(new RegExp("œ", 'g'),"oe");
        r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
        r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
        r = r.replace(new RegExp("\\W", 'g'),"");
        return r;
};</snippet>

<h2>Text Filter Model</h2>

<p>
    Get and set the state of the text filter by getting and setting the model on the filter instance.
</p>

    <p><snippet>
// get filter instance
var athleteFilterComponent = gridOptions.api.getFilterInstance('athlete');

// get filter model
var model = athleteFilterComponent.getModel();

// OR set filter model and update
athleteFilterComponent.setModel({
    type:'endsWith',
    filter:'thing'
});
athleteFilterComponent.onFilterChanged()</snippet></p>

<p>
    The text filter model has the following attributes:
</p>
<ul class="content">
    <li><b>type:</b> The type of text filter to apply. One of: {equals, notEqual, contains, notContains,
        startsWith, endsWith}</li>
    <li><b>filter:</b> The actual filter text to apply.</li>
</ul>

<h2>Floating Text Filter</h2>

<p>
    If your grid has floatingFilter enabled, your columns with text filter will automatically show below the header a new
    column that will show two elements:
</p>

<ul class="content">
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

<h2>Example</h2>

<ul class="content">
    <li>The athlete column has only two filter options: <code>filterOptions=['contains','notContains']</code></li>
    <li>The athlete column has a text formatter so if you search for 'o' it will find &oslash; You can try this by
        searching the string 'Bjo'</code></li>
    <li>The athlete column has a debounce of 0ms <code>debounceMs:0</code> in the column filter menu. The floating filter
    has the default 500ms</li>
    <li>The athlete column filter is case sensitive, note that it has the following flag: <code>caseSensitive:true</code></li>
    <li>The country column has only one filter option: <code>filterOptions=['contains']</code></li>
    <li>The country column has a <code>textCustomComparator</code> so that there are aliases that can be entered in the filter
    ie: if you filter using the text 'usa' it will match United States or 'holland' will match 'Netherlands'</li>
    <li>The country column has a debounce of 2000ms <code>debounceMs:2000</code> in the column filter menu. The floating filter
        has the default 500ms</li>
    <li>The year column has one filter option <code>filterOptions=['inRange']. </code></li>
    <li>The sports column has a different default option <code>defaultOption='startsWith'</code></li>
</ul>

<?= example('Text Filter', 'text-filter', 'generated') ?>

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
