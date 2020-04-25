<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Filter List</h1>

<p class="lead">
    This section describes how filter values are provided by default along with methods for supplying values directly to
    the Set Filter.
</p>


<h2>Filter List Sorting</h2>

<p>
    Values inside a set filter will be sorted by default, where the values are converted to a string value and sorted in
    ascending order according to their UTF-16 codes.
</p>

<p>
    When a different sort order is required, a comparator can be supplied to the <code>filterParams</code>, as shown below:
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
    The following example demonstrates sorting set filter values using a comparator. Note the following:
</p>

<ul class="content">
    <li>The <b>Age (No Comparator)</b> set filter values are sorted using the default string order; <code>1,10,100,...</code></li>
    <li>The <b>Age (With Comparator)</b> set filter has a custom comparator supplied in the <code>filterParams</code>
        that sorts the ages by value; <code>1,2,3,...</code></li>
</ul>

<?= grid_example('Sorting Set Filter Values', 'sorting-set-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel', 'filterpanel']]) ?>


<h2>Supplying Filter Values</h2>

<p>
    The Set Filter will obtain the filter values from the row data by default. However it is also possible to provide
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

<p>
    The following example demonstrates providing filter values using <code>filterParams.values</code>. Note the following:
</p>

<ul class="content">
    <li>
        The <b>Days (Values Not Provided)</b> set filter obtains values from the row data to populate the filter list and as
        <code>'Saturday'</code> and <code>'Sunday'</code> are not present in the data they don't appear in the filter list.
    </li>
    <li>
        As the <b>Days (Values Not Provided)</b> filter values come from the row data they are sorted using a
        <a href="../javascript-grid-filter-set/#sorting-filter-values">Custom Sort Comparator</a> to ensure the days are
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

<?= grid_example('Providing Filter Values', 'providing-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel', 'filterpanel']]) ?>

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

<h2>Formatting Values</h2>

<p>
    This section covers the various ways to format filter list items.
</p>

<h3>Cell Renderer</h3>

<p>
    Similar to the cell renderer for the grid (you can use the same one in both locations). Setting it separately here
    allows for the value to be rendered differently in the filter. Note that the cell renderer for the set filter only
    receives the value as a parameter, as opposed to the cell renderer in the colDef that receives more information.
</p>

<?= createSnippet(<<<SNIPPET
{
    field: 'year',         
    filter: 'agSetColumnFilter',
    filterParams: {
        cellRenderer: function (params) {
            //get flags from here: http://www.freeflagicons.com/
            if (params.value === "" || params.value === undefined || params.value === null) {
                return '';
            } else {
                var flag = '<img class="flag" border="0" width="15" height="10" 
                src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
                return flag + ' ' + params.value;
            }
        }
    }
}
SNIPPET
    , 'ts') ?>


<?= grid_example('Filter List Cell Renderers', 'filter-list-cell-renderers', 'generated', ['enterprise' => true, 'exampleHeight' => 520, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h3>Value Formatter</h3>


<h2>Complex Objects</h2>

<p>
    If you are providing complex objects as values, then you need to provide a <code>colDef.keyCreator</code> function
    to convert the objects to strings. This string is used to compare objects when filtering, and to render a label in
    the filter UI, so it should return a human-readable value.
</p>

<p>
    The example below demonstrates <code>keyCreator</code> with the country column by replacing the country name in the
    data with a complex object of country name and code. If the <code>keyCreator</code> was not provided on the
    <code>colDef</code>, the set filter would not work.
</p>

<h2>Filter Value Tooltips</h2>

<p>
    Set Filter values that are too long to be displayed are truncated by default with ellipses. To allow users to see
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
    The Default Tooltip Component will be used unless a
    <a href="../javascript-grid-tooltip-component/">Custom Tooltip Components</a> is provided.
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


<?php include '../documentation-main/documentation_footer.php';?>
