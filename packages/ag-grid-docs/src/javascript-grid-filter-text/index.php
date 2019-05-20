<?php
$pageTitle = "Text Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Text Filter. Text Filter allows filtering text strings with {equals, notEqual, contains, notContains, startsWith, endsWith}. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Text Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1>Text Filter</h1>


<p class="lead">

    Text filters allow you to filter text data.
    The pages <a href="../javascript-grid-filter-provided/">Provided Filters</a> and
    <a href="../javascript-grid-filter-provided-simple/">Provided Simple Filters</a> explains the parts of the
    text filter that are similar to the other provided filters. This page builds on that and explains some
    details that are specific to the text filter.
</p>

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

<snippet>(filter:string, gridValue:any, filterText:string):boolean;</snippet>

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
function myComparator (filter, value, filterText) {

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

<snippet>(gridValue:string):string;</snippet>

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

<h2>Example Text Filter</h2>

<ul class="content">
    <li>The athlete column has only two filter options: <code>filterOptions=['contains','notContains']</code></li>
    <li>The athlete column has a text formatter so if you search for 'o' it will find &oslash; You can try this by
        searching the string 'Bjo'</code></li>
    <li>
        The athlete column has a debounce of 0ms <code>debounceMs:0</code>. This is used by both the parent and
        floating filter components.
    </li>
    <li>The athlete column filter is case sensitive, note that it has the following flag: <code>caseSensitive:true</code></li>
    <li>The athlete column filter has the AND/OR additional filter suppressed, note that it has the following flag: <code>suppressAndOrCondition:true</code></li>
    <li>The country column has only one filter option: <code>filterOptions=['contains']</code></li>
    <li>The country column has a <code>textCustomComparator</code> so that there are aliases that can be entered in the filter
        ie: if you filter using the text 'usa' it will match United States or 'holland' will match 'Netherlands'</li>
    <li>
        The country column filter has a debounce of 2000ms <code>debounceMs:2000</code>
    </li>
    <li>The year column has one filter option <code>filterOptions=['inRange']. </code></li>
    <li>The sports column has a different default option <code>defaultOption='startsWith'</code></li>
</ul>

<?= example('Text Filter', 'text-filter', 'generated', array("processVue" => true)) ?>


<?php include '../documentation-main/documentation_footer.php';?>
