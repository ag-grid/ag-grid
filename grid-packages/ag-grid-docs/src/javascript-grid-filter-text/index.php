<?php
$pageTitle = "Text Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Text Filter. Text Filter allows filtering text strings with {equals, notEqual, contains, notContains, startsWith, endsWith}. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Text Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Text Filter</h1>

<p class="lead">

    Text filters allow you to filter string data.
    The pages <a href="../javascript-grid-filter-provided/">Provided Filters</a> and
    <a href="../javascript-grid-filter-provided-simple/">Provided Simple Filters</a> explains the parts of the
    text filter that the same as the other provided filters. This page builds on that and explains some
    details that are specific to the text filter.
</p>

<h2>Text Filter Parameters</h2>

<p>
    Text Filters are configured though the <code>filterParams</code> attribute of the column definition. All of the
    parameters from Provided Filters are available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided/providedFilters.json', 'filterParams'); ?>

<p>
    In addition, the following parameters are also available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided-simple/simpleFilters.json', 'filterParams', ['Text']); ?>

<h2>Text Custom Comparator</h2>

<p>
    By default the text filter performs strict case-insensitive text filtering, i.e. if you provide <code>['1,234.5USD', '345GBP']</code> as data for a text column:
</p>

<ul class="content">
    <li><b>contains '1,2'</b> will show 1 value: ['1,234.5USD']</li>
    <li><b>contains '12'</b> will show 0 values</li>
    <li><b>contains '$'</b> will show 0 values</li>
    <li><b>contains 'gbp'</b> will show 1 value ['345GBP']</li>
</ul>

<p>
    You can change the default behaviour by providing your own <code>textCustomComparator</code>, which allows you to
    provide your own logic to decide when to include a row in the filtered results.
</p>

<p>The <code>textCustomComparator</code> is a function with the following signature:</p>

<?= createSnippet('function textCustomComparator(filter: string, gridValue: any, filterText: string): boolean;', 'ts') ?>

<ul class="content">
    <li><code>filter: string</code> The applicable filter type being tested. One of: <code>equals, notEqual, contains, notContains,
        startsWith, endsWith</code></li>
    <li><code>gridValue: any</code> The value about to be filtered. If this column has a value getter, this value will be
        coming from the value getter, otherwise it is the raw value injected into the grid.</li>
    <li><code>filterText: string</code> The value to filter by.</li>
    <li><code>returns: boolean</code> Set to <code>true</code> if the value passes the filter, otherwise <code>false</code>.</li>
</ul>

<p>
    The following is an example of a <code>textCustomComparator</code> that mimics the current implementation of ag-Grid. This can be
    used as a template to create your own.
</p>

<?= createSnippet(<<<SNIPPET
function myComparator(filter, value, filterText) {
    var filterTextLowerCase = filterText.toLowerCase();
    var valueLowerCase = value.toString().toLowerCase();

    switch (filter) {
        case 'contains':
            return valueLowerCase.indexOf(filterTextLowerCase) >= 0;
        case 'notContains':
            return valueLowerCase.indexOf(filterTextLowerCase) === -1;
        case 'equals':
            return valueLowerCase === filterTextLowerCase;
        case 'notEqual':
            return valueLowerCase != filterTextLowerCase;
        case 'startsWith':
            return valueLowerCase.indexOf(filterTextLowerCase) === 0;
        case 'endsWith':
            var index = valueLowerCase.lastIndexOf(filterTextLowerCase);
            return index >= 0 && index === (valueLowerCase.length - filterTextLowerCase.length);
        default:
            // should never happen
            console.warn('invalid filter type ' + filter);
            return false;
        }
    }
}
SNIPPET
) ?>

<h2>Text Formatter</h2>

<p>
    By default, the grid compares the text filter with the values in a case-insensitive way, thus <code>'o'</code> will match <code>'Olivia'</code> and <code>'Salmon'</code>,
    but will not match <code>'Bj&ouml;rk'</code>. If you want to match in any other way (e.g. you want to ignore
    accents), or you want to have case-sensitive matches, then you should provide your own <code>textFormatter</code>.
</p>
<p>
    The <code>textFormatter</code> is a function with the following signature:
</p>

<?= createSnippet('function textFormatter(gridValue: string): string;', 'ts') ?>

<ul class="content">
    <li><b>gridValue: string</b> The value coming from the grid. This can be the <code>valueGetter</code> if there is any for the
        column, or the value as originally provided in the <code>rowData</code>.</li>
    <li><b>returns: string</b> The string to be used for the purpose of filtering.</li>
</ul>

<p>
    If no <code>textFormatter</code> is provided the grid will convert the text to lower-case. It is important to note that when
    comparing to the text entered in the filter box, the text in the filter box is always converted to lower case.
</p>

<p>
    The following is an example to remove accents and convert to lower case.
</p>

<?= createSnippet(<<<SNIPPET
function(value) {
    return value.toLowerCase()
        .replace(/\s/g, '')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/\W/g, '');
};
SNIPPET
) ?>

<h2>Example: Text Filter</h2>

<ul class="content">
    <li>The Athlete column has only two filter options: <code>filterOptions = ['contains', 'notContains']</code></li>
    <li>The Athlete column has a text formatter, so if you search for <code>'o'</code> it will find <code>&oslash;</code>. You can try this by
        searching the string <code>'Bjo'</code>.</li>
    <li>
        The Athlete column has a debounce of 0ms (<code>debounceMs = 0</code>). This is used by both the parent and
        floating filter components.
    </li>
    <li>The Athlete column filter is case-sensitive (<code>caseSensitive = true</code>)</li>
    <li>The Athlete column filter has the AND/OR additional filter suppressed (<code>suppressAndOrCondition = true</code>)</li>
    <li>The Country column has only one filter option: <code>filterOptions = ['contains']</code></li>
    <li>The Country column has a <code>textCustomComparator</code> so that aliases can be entered in the filter,
        e.g. if you filter using the text <code>'usa'</code> it will match <code>United States</code> or <code>'holland'</code> will match <code>'Netherlands'</code></li>
    <li>The country column filter has a debounce of 2000ms (<code>debounceMs = 2000</code>)</li>
    <li>The year column has one filter option: <code>filterOptions = ['inRange']</code></li>
    <li>The sports column has a different default option (<code>defaultOption = 'startsWith'</code>)</li>
</ul>

<?= grid_example('Text Filter', 'text-filter', 'generated', ['exampleHeight' => 555, 'modules' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
