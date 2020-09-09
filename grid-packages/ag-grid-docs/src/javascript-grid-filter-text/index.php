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
</p>

<p>
    The <a href="../javascript-grid-filter-provided/">Provided Filters</a> and
    <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a> pages explain the parts of the
    Text Filter that the same as the other Provided Filters. This page builds on that and explains some
    details that are specific to the Text Filter.
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
    By default, the grid compares the text filter with the values in a case-insensitive way, by converting both the
    filter text and the values to lower-case and comparing them; for example, <code>'o'</code> will match
    <code>'Olivia'</code> and <code>'Salmon'</code>. If you instead want to have case-sensitive matches, you can set
    <code>caseSensitive = true</code> in the <code>filterParams</code>, so that no lower-casing is performed. In this
    case, <code>'o'</code> would no longer match <code>'Olivia'</code>.
</p>

<p>
    You might have more advanced requirements, for example to ignore accented characters. In this case, you can provide
    your own <code>textFormatter</code>, which is a function with the following signature:
</p>

<?= createSnippet('function textFormatter(gridValue: string): string;', 'ts') ?>

<p>
    <code>gridValue</code> is the value coming from the grid. This can be from the <code>valueGetter</code> if there is
    any for the column, or the value as originally provided in the <code>rowData</code>. The function should return a
    string to be used for the purpose of filtering.
</p>

<p>
    The following is an example function to remove accents and convert to lower case.
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
    <li>The <strong>Athlete</strong> column has only two filter options: <code>filterOptions = ['contains', 'notContains']</code></li>
    <li>
        The <strong>Athlete</strong> column has a text formatter, so if you search for <code>'o'</code> it will find <code>&oslash;</code>. You can try this by
        searching the string <code>'Bjo'</code>.
    </li>
    <li>
        The <strong>Athlete</strong> column has a debounce of 0ms (<code>debounceMs = 0</code>). This is used by both the parent and
        floating filter components.
    </li>
    <li>The <strong>Athlete</strong> column filter has the AND/OR additional filter suppressed (<code>suppressAndOrCondition = true</code>)</li>
    <li>The <strong>Country</strong> column has only one filter option: <code>filterOptions = ['contains']</code></li>
    <li>The <strong>Country</strong> column has a <code>textCustomComparator</code> so that aliases can be entered in the filter,
        e.g. if you filter using the text <code>'usa'</code> it will match <code>United States</code> or <code>'holland'</code> will match <code>'Netherlands'</code></li>
    <li>The <strong>Country</strong> column filter has a debounce of 2000ms (<code>debounceMs = 2000</code>)</li>
    <li>The <strong>Year</strong> column has one filter option: <code>filterOptions = ['inRange']</code></li>
    <li>The <strong>Sport</strong> column has a different default option (<code>defaultOption = 'startsWith'</code>)</li>
    <li>The <strong>Sport</strong> column filter is case-sensitive (<code>caseSensitive = true</code>)</li>
</ul>

<?= grid_example('Text Filter', 'text-filter', 'generated', ['exampleHeight' => 555, 'modules' => true, 'reactFunctional' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
