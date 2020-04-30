<?php
$pageTitle = "Set Filter - Filter List";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Filter List</h1>

<p class="lead">
    This section describes how Filter List values can be managed through custom sorting and formatting. Supplying filter
    values directly to the Set Filter is also discussed.
</p>

<h2>Sorting Filter Lists</h2>

<p>
    Values inside a Set Filter will be sorted by default, where the values are converted to a string value and sorted in
    ascending order according to their UTF-16 codes.
</p>

<p>
    When a different sort order is required, a Comparator can be supplied to the set filter as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'age',
    filter: 'agSetColumnFilter',
    filterParams: {
        comparator: function(a, b) {
            var valA = parseInt(a);
            var valB = parseInt(b);
            if (valA === valB) return 0;
            return valA > valB ? 1 : -1;
        }
    }
}
SNIPPET
) ?>

<p>
    The Comparator used by the Set Filter is only provided the values in the first two parameters, whereas the Comparator
    for the Column Definition (<code>colDef</code>) is also provided the row data as additional parameters. This is because when sorting rows,
    row data exists. For example, take 100 rows split across the colour values <code>[white, black]</code>.
    The column will be sorting 100 rows, however the filter will be only sorting two values.
</p>

<p>
    If you are providing a Comparator that depends on the row data and you are using the Set Filter, be sure to provide
    the Set Filter with an alternative Comparator that doesn't depend on the row data.
</p>

<p>
    The following example demonstrates sorting Set Filter values using a comparator. Note the following:
</p>

<ul class="content">
    <li>
        The <b>Age (no Comparator)</b> filter values are sorted using the default string order:
        <code>1, 10, 100...</code>
    </li>
    <li>
        The <b>Age (with Comparator)</b> filter has a custom Comparator supplied in the <code>filterParams</code>
        that sorts the ages by numeric value: <code>1, 2, 3...</code>
    </li>
</ul>

<?= grid_example('Sorting Filter Lists', 'sorting-set-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>

<h2>Formatting Values</h2>

<p>
    This section covers different ways to format the displayed Filter List values in the Set Filter.
</p>

<note>
    Formatting Filter List values will not change the underlying value or Filter Model.
</note>

<h3>Value Formatter</h3>

<p>
    A <a href="../javascript-grid-value-formatters/">Value Formatter</a> is a good choice when the string value
    displayed in the Filter List needs to be modified, for example adding country codes in parentheses after country name.
</p>

<p>
    The following snippet shows how to provide a Value Formatter to the Set Filter:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'a',
    valueFormatter: myValueFormatter, // formats cell values
    filter: 'agSetColumnFilter',
    filterParams: {
        valueFormatter: myValueFormatter, // formats filter values
    }
}

function myValueFormatter(params) {
    return '(' + params.value + ')';
}
SNIPPET
) ?>

<p>
    In the code above, the same value formatter is supplied to the Column and Filter, however separate Value Formatters
    can be used.
</p>

<p>
    The following example shows how Set Filter values are formatted using a Value Formatter. Note the following:
</p>

<ul class="content">
    <li>
        <b>No Value Formatter</b> does not have a Value Formatter supplied to the Set Filter. The column is supplied a
        Value Formatter through <code>colDef.valueFormatter = countryValueFormatter</code>.
    </li>
    <li>
        <b>With Value Formatter</b> has the same Value Formatter supplied to the Column and Set Filter. The Set Filter is
        supplied the value formatter through <code>filterParams.valueFormatter = countryValueFormatter</code>.
    </li>
    <li>
        Click <b>Print Filter Model</b> with a filter applied and note the logged Filter Model (dev console) has not been modified.
    </li>
</ul>

<?= grid_example('Filter List Value Formatters', 'filter-list-value-formatter', 'generated', ['enterprise' => true, 'exampleHeight' => 745, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>

<h3>Cell Renderer</h3>

<p>
    A <a href="../javascript-grid-cell-rendering/">Cell Renderer</a> is a good choice when the value displayed requires
    markup. For instance if a country flag image is to be shown alongside country names.
</p>

<p>
    The same Cell Renderer can used to format the grid cells and filter values, or different renderers can be supplied
    to each. Note that the Cell Renderer will be supplied additional info when used to format cells inside the grid
    (as grid cells have row details that are not present for values inside a Filter List).
</p>

<p>
    The following snippet shows how the Cell Renderers are configured:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'a',
    cellRenderer: myCellRenderer // formats cell values
    filter: 'agSetColumnFilter',
    filterParams: {
        cellRenderer: myCellRenderer // formats filter values
    }
}

function myCellRenderer(params)  {
    return '<span style="font-weight: bold">' + params.value + '</span>';
}
SNIPPET
) ?>

<note>
    A custom <a href="../javascript-grid-cell-rendering-components/#cell-renderer-component">Cell Renderer Component</a>
    can also be supplied to <code>filterParams.cellRenderer</code>.
</note>

<p>
    The following example shows how Set Filter values are rendered using a Cell Renderer. Note the following:
</p>

<ul class="content">
    <li>
        <b>No Cell Renderer</b> does not have a Cell Renderer supplied to the Set Filter. The Column has a Cell Renderer
        supplied to the Column using <code>colDef.cellRenderer = countryCellRenderer</code>.
    </li>
    <li>
        <b>With Cell Renderer</b> uses the same Cell Renderer to format the cells and filter values. The Set Filter is
        supplied the Value Formatter using <code>filterParams.cellRenderer = countryCellRenderer</code>.
    </li>
    <li>
        Click <b>Print Filter Model</b> with a filter applied and note the logged filter model (dev console) has not been modified.
    </li>
</ul>

<?= grid_example('Filter List Cell Renderers', 'filter-list-cell-renderer', 'generated', ['enterprise' => true, 'exampleHeight' => 745, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>

<h2>Complex Objects</h2>

<p>
    If you are providing complex objects as values, then you need to provide a Key Creator function (<code>colDef.keyCreator</code>)
    to convert the objects to strings when using the Set Filter. Note the string is used to compare objects when
    filtering and to render a label in the filter UI.
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'country',
    keyCreator: countryKeyCreator,
    valueFormatter: countryValueFormatter,
    filter: 'agSetColumnFilter',
},

function countryKeyCreator(params) {
    var countryObject = params.value;
    return countryObject.name;
}

function countryValueFormatter(params) {
    return params.value.name;
}
SNIPPET
) ?>

<p>
    The snippet above shows a Key Creator function that returns the country name from the complex object.
    If the Key Creator was not provided on the Column Definition, the Set Filter would not work.
</p>

<p>
    If the value returned by Key Creator is not human-readable then you should consider also providing
    a Formatter for the Filter List label.
</p>

<p>
    The following example shows the Key Creator handling complex objects for the Set Filter. Note the following:
</p>

<ul class="content">
    <li>
        <b>Country (Complex Object)</b> column is supplied a complex object through <code>colDef.field</code>.
    </li>
    <li>
        A Key Creator is supplied to the column using <code>colDef.keyCreator = countryKeyCreator</code> which extracts
        the <code>name</code> property for the Set Filter.
    </li>
    <li>
        A value formatter is supplied to the column using <code>colDef.valueFormatter = countryValueFormatter</code>
        which extracts the <code>name</code> property for the cell values.
    </li>
    <li>
        Click <b>Print Filter Model</b> with a filter active and note the logged Filter Model (dev console) uses the <code>name</code>
        property from the complex object.
    </li>
</ul>

<?= grid_example('Complex Objects', 'complex-objects', 'generated', ['enterprise' => true, 'exampleHeight' => 505, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>

<h2>Supplying Filter Values</h2>

<p>
    The Set Filter will obtain the filter values from the row data by default. However it is also possible to provide
    values, either synchronously or asynchronously, for the Filter List.
</p>

<h3>Synchronous Values</h3>

<p>The simplest approach is to supply a list of values to <code>filterParams.values</code> as shown below:</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'days',
    filter: 'agSetColumnFilter',
    filterParams: {
        // provide all days, even if days are missing in data!
        values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
}
SNIPPET
) ?>

<p>
    Note that if there are missing values in the row data, the filter list will display all provided values. This could
    give users the impression that filtering is broken.
</p>

<note>
    When providing filter values which are already sorted it is often useful to disable the default filter list sorting
    using <code>filterParams.suppressSorting=true</code>.
</note>

<p>
    The following example demonstrates providing filter values using <code>filterParams.values</code>. Note the following:
</p>

<ul class="content">
    <li>
        The <b>Days (Values Not Provided)</b> set filter obtains values from the row data to populate the filter list and as
        <code>'Saturday'</code> and <code>'Sunday'</code> are not present in the data they do not appear in the filter list.
    </li>
    <li>
        As the <b>Days (Values Not Provided)</b> filter values come from the row data they are sorted using a
        <a href="../javascript-grid-filter-set-filter-list#sorting-filter-lists">Custom Sort Comparator</a> to ensure the days are
        ordered according to the week day.
    </li>
    <li>
        The <b>Days (Values Provided)</b> set filter is given values using <code>filterParams.values</code>.
        As all days are supplied the filter list also contains <code>'Saturday'</code> and <code>'Sunday'</code>.
    </li>
    <li>
        As the <b>Days (Values Not Provided)</b> filter values are provided in the correct order, the default filter list
        sorting is turned off using: <code>filterParams.suppressSorting=true</code>.
    </li>
</ul>

<?= grid_example('Providing Filter Values', 'providing-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>

<h3>Asynchronous Values</h3>

<p>
    It is also possible to supply values asynchronously to the set filter. This is done by providing a callback function
    instead of a list of values as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'col1',
    filter: 'agSetColumnFilter',
    filterParams: {
        values: function(params) {
            // async update simulated using setTimeout()
            setTimeout(function() {
                // fetch values from server
                var values = getValuesFromServer();

                // supply values to the set filter
                params.success(values);
            }, 3000);
        }
    }
}
SNIPPET
) ?>

<p>
    Note in the snippet above the values callback receives a parameter object which contains <code>params.success()</code>
    which allows values obtained asynchronously to be supplied to the set filter.
</p>

<p>
    The interface for this parameter object is as follows:
</p>

<?= createSnippet(<<<SNIPPET
interface SetFilterValuesFuncParams {
    // The function to call with the values to load into the filter once they are ready
    success: (values: string[]) => void;

    // The column definition object from which the set filter is invoked
    colDef: ColDef;
}
SNIPPET
, 'ts') ?>

<p>
    The following example demonstrates loading set filter values asynchronous. Note the following:
</p>

<ul class="content">
    <li>
        <code>filterParams.values</code> is assigned a callback function that loads the filter values after a 3 second
        delay using the callback supplied in the params: <code>params.success(['value1', 'value2'])</code>.
    </li>
    <li>Opening the set filter shows a loading message before the values are set. See the
        <a href="../javascript-grid-localisation/">Localisation</a> section for details on how to change this message.
    </li>
    <li>
        The callback is only invoked the first time the filter is opened. The next time the filter is opened the values are
        not loaded again.
    </li>
</ul>

<?= grid_example('Callback/Async', 'callback-async', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Missing Values</h2>

<p>
    If there are missing / empty values in the row data of the grid, or missing values in the list of
    <a href="#supplying-filter-values">Supplied Values</a>, the Filter List will contain an entry called <code>(Blanks)</code>
    which can be used to select / deselect all of these values. If this not the desired behaviour,
    provide a <a href="#value-formatter">Formatter</a> to present blank values in a different way.
</p>

<h2>Filter Value Tooltips</h2>

<p>
    Set filter values that are too long to be displayed are truncated by default with ellipses. To allow users to see
    the full filter value, tooltips can be enabled as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'colA',
    filter: 'agSetColumnFilter',
    filterParams: {
        showTooltips: true,
    }
}
SNIPPET
) ?>

<p>
    The default tooltip component will be used unless a
    <a href="../javascript-grid-tooltip-component/">Custom Tooltip Component</a> is provided.
</p>

<p>
    The following example demonstrates tooltips in the Set Filter. Note the following:
</p>

<ul class="content">
    <li>Filter values are automatically truncated with ellipses when the values are too long.</li>
    <li><b>Col A</b> does not have Set Filter Tooltips enabled.</li>
    <li><b>Col B</b> has Set Filter Tooltips enabled via <code>filterParams.showTooltips=true</code>.</li>
    <li><b>Col C</b> has Set Filter Tooltips enabled and is supplied a Custom Tooltip Component.</li>
</ul>

<?= grid_example('Filter Value Tooltips', 'filter-value-tooltips', 'generated', ['enterprise' => true, 'exampleHeight' => 500, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section: <a href="../javascript-grid-filter-set-data-updates">Data Updates</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
