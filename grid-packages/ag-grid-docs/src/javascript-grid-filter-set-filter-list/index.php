<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Filter List</h1>

<p class="lead">
    This section describes how filter list values can be managed through custom sorting and formatting. Supplying filter
    values directly to the set filter is also discussed.
</p>


<h2>Sorting Filter Lists</h2>

<p>
    Values inside a set filter will be sorted by default, where the values are converted to a string value and sorted in
    ascending order according to their UTF-16 codes.
</p>

<p>
    When a different sort order is required, a comparator can be supplied to the set filter as shown below:
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
    , 'ts') ?>

<p>
    The comparator used by the set filter is only provided the values in the first two parameters, whereas the comparator
    for the <code>colDef</code> is also provided the row data as additional parameters. This is because when sorting rows,
    row data exists. For example, take 100 rows split across the color values <code>[white, black]</code>.
    The <code>colDef</code> comparator will be sorting 100 rows, however the filter will be only sorting two values.
</p>
<p>
    If you are providing a comparator that depends on the row data, and you are using the set filter, be sure to provide
    the set filter with an alternative comparator that doesn't depend on the row data.
</p>

<p>
    The following example demonstrates sorting set filter values using a comparator. Note the following:
</p>

<ul class="content">
    <li>
        The <b>Age (No Comparator)</b> set filter values are sorted using the default string order;
        <code>1,10,100,...</code>
    </li>
    <li>
        The <b>Age (With Comparator)</b> set filter has a custom comparator supplied in the <code>filterParams</code>
        that sorts the ages by value; <code>1,2,3,...</code>
    </li>
</ul>

<?= grid_example('Sorting Filter Lists', 'sorting-set-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>


<h2>Formatting Values</h2>

<p>
    This section covers different ways to format the displayed filter list values in the set filter.
</p>

<note>
    Formatting filter list values will not change the underlying value or filter model.
</note>

<h3>Value Formatter</h3>
<p>
    A <a href="../javascript-grid-value-formatters/">Value Formatter</a> is a good choice when the string value
    displayed in the filter list needs to be modified, for example; adding country codes in parentheses after country name.
</p>

<p>
    The following snippet shows how to provide a value formatter to the set filter:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'a',         
    valueFormatter: myValueFormatter, //formats cell values
    filter: 'agSetColumnFilter',
    filterParams: {                              
        valueFormatter: myValueFormatter, //formats filter values            
    }
}

function myValueFormatter(params)  {
    return '(' + params.value + ')';        
}

SNIPPET
    , 'ts') ?>

<p>
    In the code above, the same value formatter is supplied to the column and filter, however separate value formatters
    can be used.
</p>

<p>
    The following example shows how set filter values are formatted using a value formatter. Note the following:
</p>

<ul class="content">
    <li>
        <b>No Value Formatter</b> does not have a value formatter supplied to the set filter. The column is supplied a
        value formatter through: <code>colDef.valueFormatter = countryValueFormatter</code>.
    </li>
    <li>
        <b>With Value Formatter</b> has the same value formatter supplied to the column and set filter. The set filter is
        supplied the value formatter through: <code>filterParams.valueFormatter = countryValueFormatter</code>.
    </li>
    <li>
        Click <b>Print Filter Model</b> and note the logged filter model (dev console) has not been modified.
    </li>
</ul>

<?= grid_example('Filter List Value Formatters', 'filter-list-value-formatter', 'generated', ['enterprise' => true, 'exampleHeight' => 745, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>


<h3>Cell Renderer</h3>

<p>
    A <a href="../javascript-grid-cell-rendering/">Cell Renderer</a> is a good choice when the value displayed requires
    markup. For instance if a country flag image is to be shown alongside country names.
</p>

<p>
    The same cell renderer can used to format the grid cells and filter values, or different renderers can be supplied
    to each. Note that the cell renderer will be supplied additional info when used to format cells.
</p>

<p>
    The following snippet shows how the cell renderer's are configured:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'a',         
    cellRenderer: myCellRenderer //formats cell values    
    filter: 'agSetColumnFilter',
    filterParams: {        
        cellRenderer: myCellRenderer //formats filter values        
    }
}

function myCellRenderer(params)  {
    return '<span style="font-weight: bold">' + params.value + '</span>';        
}
SNIPPET
    , 'ts') ?>

<note>
    A <a href="../javascript-grid-cell-rendering-components/#cell-renderer-component">Cell Renderer Component</a>
    can also be supplied to <code>filterParams.cellRenderer</code>.
</note>

<p>
    The following example shows how set filter values are formatted using a cell renderer. Note the following:
</p>

<ul class="content">
    <li>
        <b>No Cell Renderer</b> does not have a cell renderer supplied to the set filter. The column has a cell renderer
        supplied to the column using: <code>colDef.cellRenderer = countryCellRenderer</code>.
    </li>
    <li>
        <b>With Cell Renderer</b> uses the same cell renderer to format the cells and filter values. The set filter is
        supplied the value formatter using: <code>filterParams.cellRenderer = countryCellRenderer</code>.
    </li>
    <li>
        Click <b>Print Filter Model</b> and note the logged filter model (dev console) has not been modified.
    </li>
</ul>

<?= grid_example('Filter List Cell Renderers', 'filter-list-cell-renderer', 'generated', ['enterprise' => true, 'exampleHeight' => 745, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>

<h2>Complex Objects</h2>

<p>
    If you are providing complex objects as values, then you need to provide a <code>colDef.keyCreator</code> function
    to convert the objects to strings when using the set filter. Note the string is used to compare objects when
    filtering, and to render a label in the filter UI, so it should return a human-readable value.
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
    , 'ts') ?>

<p>
    The snippet above shows a <code>keyCreator</code> function that returns the country name from the complex object.
    If the <code>keyCreator</code> was not provided on the <code>colDef</code>, the set filter would not work.
</p>

<p>
    The following example shows the <code>keyCreator</code> handling complex objects for the set filter. Note the following:
</p>

<ul class="content">
    <li>
        <b>Country (Complex Object)</b> column is supplied a complex object through <code>colDef.field</code>.
    </li>
    <li>
        A key creator is supplied to the column using <code>colDef.keyCreator = countryKeyCreator</code> which extracts
        the <code>name</code> property for the set filter.
    </li>
    <li>
        A value formatter is supplied to the column using <code>colDef.valueFormatter = countryValueFormatter</code>
        which extracts the <code>name</code> property for the cell values.
    </li>
    <li>
        Click <b>Print Filter Model</b> and note the logged filter model (dev console) uses the <code>name</code>
        property from the complex object.
    </li>
</ul>

<?= grid_example('Complex Objects', 'complex-objects', 'generated', ['enterprise' => true, 'exampleHeight' => 505, 'modules' => ['clientside', 'setfilter', 'menu', 'filterpanel']]) ?>


<h2>Supplying Filter Values</h2>

<p>
    The set filter will obtain the filter values from the row data by default. However it is also possible to provide
    values, either synchronously or asynchronously, to the filter list.
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
    , 'ts') ?>

<p>
    Note that if there are missing values in the row data, the filter list will display all provided values. This could
    give users the impression that filtering is broken.
</p>

<note>
    When providing filter values which are already sorted it is often useful to disable the default filter list sorting
    using: <code>filterParams.suppressSorting=true</code>.
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
        The <b>Days (Values Provided)</b> set filter is supplied it's filter list values <code>filterParams.values</code>.
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
export interface SetFilterValuesFuncParams {
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
    , 'ts') ?>

<p>
    The default tooltip component will be used unless a
    <a href="../javascript-grid-tooltip-component/">Custom Tooltip Component</a> is provided.
</p>

<p>
    The following example demonstrates tooltips in the set filter. Note the following:
</p>

<ul class="content">
    <li>Set filter values are automatically truncated with ellipses when the values are too long.</li>
    <li><b>Col A</b> does not have set filter tooltips enabled.</li>
    <li><b>Col B</b> has set filter tooltips enabled via <code>filterParams.showTooltips=true</code>.</li>
    <li><b>Col C</b> has set filter tooltips enabled and is supplied a Custom Tooltip Component.</li>
</ul>

<?= grid_example('Filter Value Tooltips', 'filter-value-tooltips', 'generated', ['enterprise' => true, 'exampleHeight' => 500, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section: <a href="../javascript-grid-filter-set-data-updates">Data Updates</a>.
</p>



<?php include '../documentation-main/documentation_footer.php';?>
