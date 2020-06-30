<?php
$pageTitle = "Number Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Number Filter. Number Filter allows filtering numbers with {equals, notEquals, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. Free and Commercial version available.";
$pageKeywords = "ag-Grid Number Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Number Filter</h1>

<p class="lead">
    Number filters allow you to filter number data.
</p>

<p>
    The <a href="../javascript-grid-filter-provided/">Provided Filters</a> and
    <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a> pages explain the parts of the
    Number Filter that the same as the other Provided Filters. This page builds on that and explains some
    details that are specific to the Number Filter.
</p>

<h2>Number Filter Parameters</h2>

<p>
    Number Filters are configured though the <code>filterParams</code> attribute of the column definition. All of the
    parameters from Provided Filters are available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided/providedFilters.json', 'filterParams'); ?>

<p>
    In addition, the following parameters are also available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided-simple/simpleFilters.json', 'filterParams', ['Number']); ?>

<h2>Custom Number Support</h2>

<p>
    By default, the Number Filter uses HTML5 <code>number</code> inputs. However, these have mixed browser support,
    particularly around locale-specific nuances, e.g. using commas rather than periods for decimal values. You might also
    want to allow users to type other characters e.g. currency symbols, commas for thousands, etc, and still be able to
    handle those values correctly.
</p>

<p>
    For these reasons, the Number Filter allows you to control what characters the user is allowed to type, and provide
    custom logic to parse the provided value into a number to be used in the filtering. In this case, a <code>text</code>
    input is used with JavaScript controlling what characters the user is allowed (rather than the browser).
</p>

<p>
    Custom number support is enabled by specifying configuration similar to the following:
</p>

<?= createSnippet(<<<SNIPPET
colDef: {
    filter: 'agNumberColumnFilter',
    filterParams: {
        allowedCharPattern: '\\\\d\\\\-\\\\,', // note: ensure you escape as if you were creating a RegExp from a string
        numberParser: function(text) {
            return text == null ? null : parseFloat(text.replace(',', '.'));
        }
    }
}
SNIPPET
) ?>

<p>
    The <code>allowedCharPattern</code> is a regex of all the characters that are allowed to be typed. This is
    surrounded by square brackets <code>[]</code> and used as a character class to be compared against each typed
    character individually and prevent the character from appearing in the input if it does not match, in supported
    browsers (all except Safari).
</p>

<p>
    The <code>numberParser</code> should take the user-entered text and return either a number if one can be interpreted,
    or <code>null</code> if not.
</p>

<p>
    The example below shows custom number support in action. The first column shows the default behaviour, and the
    second column uses commas for decimals and allows a dollar sign ($) to be included.
</p>

<?= grid_example('Number Filter', 'number-filter', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php';?>
