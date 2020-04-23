<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter</h1>

<p class="lead">
    The Set Filter takes inspiration from Excel's AutoFilter and allows filtering on sets of data. It is built on top of
    the shared functionality that is common across all <a href="../javascript-grid-filter-provided/">Provided Filters</a>.
</p>

<? enterprise_feature('Set Filter'); ?>

<p>
    <img src="set-filter.png" alt="set filter"/>
</p>

<h2>
    Set Filter Sections
</h2>

<p>
    The Set Filter is composed of the following sections:
</p>

<p>
    <ul class="content">
        <li><b>Mini Filter</b>: used to narrow the filter list and perform filtering in the grid (by hitting the 'Enter' key).</li>
        <li><b>Select All</b>: used to perform grid filtering on all selected / deselected values shown in the filter list.</li>
        <li><b>Filter List</b>: a list of set filter values which can be selected / deselected to perform grid filtering.</li>
        <li><b>Filter Buttons</b>: filter buttons can be optionally added to the bottom of the Set Filter.</li>
    </ul>
</p>


<h2>Enabling Set Filters</h2>

<p>
    The Set Filter is the default filter used in the Enterprise version of the grid, however it can also be explicitly
    configured as shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        {
            field: 'country',
            filter: true // Set Filter used by default in Enterprise version
        },
        {
            field: 'year',
            filter: 'agSetColumnFilter' // explicitly configure the Set Filter
        },
    ],
    // other options
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates how Set Filters can be enabled. Note the following:
</p>

<ul class="content">
    <li>The <b>Athlete</b> column has <code>filter=true</code> which defaults to the Set Filter as this example is using the
        Enterprise version of the grid.</li>
    <li>The <b>Country</b> column is explicitly configured to use the Set Filter using <code>filter='agSetColumnFilter'</code>.</li>
    <li>All other columns are configured to use the number filter using <code>filter='agNumberColumnFilter'</code>.</li>
    <li>Filters can be accessed from the <a href="../javascript-grid-column-menu/">Column Menu</a> or by clicking
        on the filter icon in the <a href="../javascript-grid-floating-filters/">Floating Filters</a>.</li>
</ul>

<?= grid_example('Enabling Set Filters', 'enabling-set-filters', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu']]) ?>

<h2>Sorting Filter Values</h2>

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

<?= grid_example('Sorting Set Filter Values', 'sorting-set-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720]) ?>

<h2>Providing Filter Values</h2>

<p>The Set Filter will obtain the filter values from the row data by default. However it is also possible to provide
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
        The <b>Days (Values Provided)</b> set filter is supplied it's filter list values <code>filterParams.values</code>.
        As all days are supplied the filter list also contains <code>'Saturday'</code> and <code>'Sunday'</code>.
    </li>
    <li>
        Both filter lists are sorted using a <a href="../javascript-grid-filter-set/#sorting-filter-values">Custom Sort Comparator</a>.
    </li>
</ul>

<?= grid_example('Providing Filter Values', 'providing-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720]) ?>

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

<?= grid_example('Callback/Async', 'callback-async', 'generated', ['enterprise' => true, 'exampleHeight' => 510]) ?>

<h2>Data Updates</h2>

<p>
    The following sections cover how data updates affect the Set Filter's filter values.
</p>

<h3>Cell Editing</h3>

<p>
    Filter values will be refreshed when data is updated through <a href="../javascript-grid-cell-editing">Cell Editing</a>.
</p>

<p>
    Here are the rules that determine how filter values are selected:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values, including new values, will be selected.</li>
    <li><b>Active Filters</b>: previous selections will remain intact but new values will not be selected.</li>
</ul>

<p>
    Cell Editing does not re-execute filtering by default, so the row will not be filtered out even though the value in
    the cell is not selected in the filter. This default behaviour mimics how Excel works.
</p>

<p>
    To execute filtering on cell edits, listen to <code>CellValueChanged</code> events and trigger filtering as shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    onCellValueChanged: function(params) {
        // trigger filtering on cell edits
        params.api.onFilterChanged();
    }
    // other options
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates cell editing with the Set Filter. Try the following:
</p>

<p><b>Without selecting any filter values:</b></p>
<ul class="content">
    <li>
        Change (Cell Edit) a <code>'B'</code> cell value to <code>'X'</code> and note it gets added to the filter list and is
        <b>selected</b>.
    </li>
</ul>

<p><b>Click 'Reset' and deselect 'C' in the Filter List:</b></p>
<ul class="content">
    <li>
        Change (Cell Edit) a <code>'B'</code> cell value to <code>'X'</code> and notice it gets added to the filter list
        but it is <b>not selected</b>.
    </li>
    <li>
        Note that although <code>'X'</code> is not selected in the filter the row still appears in the grid. This is
        because grid filtering is not triggered for cell edits.
    </li>
</ul>


<?= grid_example('Cell Editing Updates', 'cell-editing-updates', 'generated', ['enterprise' => true, 'exampleHeight' => 480]) ?>


<h3>Transaction Updates</h3>

<p>
    Filter values are refreshed when data is updated using <a href="../javascript-grid-data-update/#transactions">Transaction Updates</a>
    and <a href="../javascript-grid-data-update/#delta-row-data">Delta Row Mode</a>.
</p>

<p>
    Here are the rules that determine how filter values are selected:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values, including new values, will be selected.</li>
    <li><b>Active Filters</b>: previous selections will remain intact but new values will not be selected.</li>
</ul>

<p>
    Unlike <a href="../javascript-grid-filter-set/#cell-editing">Cell Editing</a>, transaction updates will execute filtering in the grid.
</p>

<p>
    The following example demonstrates these rules. Try the following:
</p>

<p><b>Without selecting any filter values:</b></p>
<ul class="content">
    <li>
        Click <b>Update First Displayed Row</b>: this calls <code>api.updateRowData()</code> and updates the value in the
        first row. Note <code>'AX'</code> now appears in the filter list and is <b>selected</b>.
    </li>
    <li>
        Click <b>Add New 'D' Row</b>: this calls <code>api.updateRowData()</code> and adds a new row to the grid. Note
        <code>'D'</code> has been added to the filter list and is <b>selected</b>.
    </li>
</ul>

<p><b>Click 'Reset' and deselect 'C' in the Filter List:</b></p>
<ul class="content">
    <li>
        Click <b>Update First Displayed Row</b>: this calls <code>api.updateRowData()</code> and updates the value in the
        first row. Note <code>'AX'</code> now appears in the filter list and is <b>not selected</b>.
    </li>
    <li>
        Note that as <code>'AX'</code> is unselected in the filter list it has also been filtered out of the grid. This is
        because transaction updates also triggers grid filtering.
    </li>
    <li>
        Click <b>Add New 'D' Row</b>: this calls <code>api.updateRowData()</code> and adds a new row to the grid. Note
        <code>'D'</code> has been added to the filter list and is <b>not selected</b>.
    </li>
</ul>

<?= grid_example('Transaction Updates', 'transaction-updates', 'generated', ['enterprise' => true, 'exampleHeight' => 480]) ?>

<h3>Setting New Data</h3>

<p>
    By default, when <code>api.setRowData()</code> is called, all set filter selections will be lost.
</p>
<p>
    It is recommended that <code>newRowsAction='keep'</code> set on the filter params to keep existing filter selections
    when new rows are added, as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'col1',
    filter: 'agSetColumnFilter',
    filterParams: {        
        newRowsAction: 'keep'
    }
}
SNIPPET
    , 'ts') ?>

<note>
    <code>newRowsAction</code> has now been deprecated and <code>newRowsAction='keep'</code> will become the default
    behaviour from version 24.
</note>

<p>
    However it is still possible to clear filter selections using: <code>api.setFilterModel([])</code>.
</p>

<p>
    The following example demonstrates how <code>api.setRowData()</code> affects filter selections. Try the following:
</p>

<ul class="content">
    <li>
        Deselect value 'B' from the set filter list and click the <b>Set New Data</b> button which in turn calls
        <code>api.setRowData(newData)</code> which add new data with extra rows to the grid.
    </li>
    <li>
        Notice 'B' remains deselected after new data is supplied to the grid as the Set Filter has set
        <code>newRowsAction='keep'</code> in the filter params.
    </li>
    <li>
        Clicking <b>Reset</b> invokes <code>api.setRowData(origData)</code> to restore the original data but also clears
        any selections using <code>api.setFilterModel([])</code>.
    </li>
</ul>

<?= grid_example('Setting New Data', 'setting-new-data', 'generated', ['enterprise' => true, 'exampleHeight' => 500]) ?>

<h2>Displaying Long Values</h2>

<p>
    Sometimes the values being shown in the set filter may overflow the width of the popup. In this case they will be
    truncated automatically. If you want users to be able to see the full values, you can enable tooltips in the set
    filter by setting <code>showTooltips = true</code>. By default they will use the grid's tooltip component, and
    show the value that was truncated. If you wish, you can use a custom tooltip component as with other areas in
    the grid; see the <a href="../javascript-grid-tooltip-component/">tooltip component</a> section for more information.
</p>

<p>
    The following example demonstrates tooltips in the set filter. Note the following:
</p>

<ul>
    <li>All columns show how long values are truncated automatically.</li>
    <li>In the first column, tooltips in the set filter are disabled, so hovering over the truncated values has no effect.</li>
    <li>In the second column, tooltips in the set filter are enabled using the default grid tooltip component.</li>
    <li>In the third column, tooltips in the set filter are enabled using a custom tooltip component.</li>
</ul>

<?= grid_example('Displaying Long Values', 'displaying-long-values', 'generated', ['enterprise' => true]) ?>




<h2>Filter List Formatting</h2>

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


<?= grid_example('Filter List Cell Renderers', 'filter-list-cell-renderers', 'generated', ['enterprise' => true, 'exampleHeight' => 520, 'modules' => ['clientside', 'setfilter', 'menu']]) ?>


<h3>Complex Objects</h3>

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

<h3>Text Formatter</h3>

<p>
    If specified, this formats the text before applying the mini filter compare logic, useful for instance if substituting
    accented characters or if you want to perform case-sensitive mini filtering. This matches the
    <a href='../javascript-grid-filter-text/#text-formatter'>text formatter used for text filters</a>.
</p>

<h3>Value Formatter</h3>



<h2>Suppressing Mini Filter</h2>


<h2>Set Filter - Search Field</h2>

<p>
    The text box in the set filter is to allow filtering of displayed filter items, but doesn't actually change the
    applied filter.
</p>
<p>
    The expected flow when using the search box would be uncheck "Select All", type what you're after
    in the search box and then finally select the filter entries you want to actually filter on.
</p>

<h2>Set Filter Model</h2>

<p>
    Get and set the state of the set filter by getting and setting the model on the filter instance.
</p>

<?= createSnippet(<<<SNIPPET
// get filter instance (Note - React users must use the async version
// of this method by passing a callback parameter)
var countryFilterComponent = gridOptions.api.getFilterInstance('country');

// get filter model
var model = countryFilterComponent.getModel();

// set filter model and update
countryFilterComponent.setModel({
    type: 'set',
    values: ['Spain', 'Ireland', 'South Africa', 'Australia', 'England']
});

gridApi.onFilterChanged();
SNIPPET
) ?>

<p>
    The filter model contains an array of string values where each item in the array corresponds to an
    element to be selected from the set.
</p>

<h2>Set Filter API</h2>

<p>
    The set filter has the following API (in addition to the <a href="../javascript-grid-filter-provided/#providedFilterApi">API</a> common to all provided filters):
</p>

<?php createDocumentationFromFile('setFilter.json', 'api') ?>

<p>
    It is important to note that when updating the set filter through the API, it is up to the developer to call
    <code>filterInstance.applyModel()</code> to apply the changes that have been made to the model and then
    <code>gridOptions.api.onFilterChanged()</code> at the end of the interaction with the filter.
</p>
<p>
    If no call is made to <code>filterInstance.applyModel()</code> then the filter UI will show the changes, but
    it won't be reflected in the filter model. This will appear as if the user never hit the Apply button (regardless
    of whether the Apply button is active or not).
</p>
<p>
    If no call to <code>gridOptions.api.onFilterChanged()</code> is provided the grid will still show the data relevant to the filter
    before it was updated through the API.
</p>

<p>This code demonstrates a correct update:</p>

<?= createSnippet(<<<SNIPPET
// Get filter instance
var instance = gridOptions.api.getFilterInstance('athlete');

// Set filter properties
instance.selectNothing();
instance.selectValue('John Joe Nevin');
instance.selectValue('Kenny Egan');

// Apply the model
instance.applyModel();

// Get the grid to refresh the rows based on new filter
gridOptions.api.onFilterChanged();
SNIPPET
) ?>

<p>
    In the example below, you can see how the filter for the Athlete column is modified through the API and how at the
    end of the interaction a call to <code>gridOptions.api.onFilterChanged()</code> is performed.
</p>

<?= grid_example('Set Filter API', 'set-filter-api', 'generated', ['enterprise' => true, 'exampleHeight' => 570]) ?>


<h2>Set Filter Parameters</h2>

<?php createDocumentationFromFile('setFilter.json', 'filterParams') ?>

<?php include '../documentation-main/documentation_footer.php';?>
