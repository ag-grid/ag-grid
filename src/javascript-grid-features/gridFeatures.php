
<style>
    .feature-animated-gif-container {
        float: right;
    }
    .feature-animated-gif {
        border: 1px solid #ddd;
    }
    .feature-item:hover {
        background-color: #f4f4f4;
    }
    .feature-item {
        display: flow-root;
        background-color: #fafafa;
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 10px;
        position: relative;
        margin-bottom: 50px;
    }
    .feature-title {
        margin-top: 0px;
        margin-bottom: 14px;
        padding-bottom: 6px;
        border-bottom: 1px solid #ccc;
    }
    .feature-snippet {
        display: inline-block;
        margin-top: 10px;
    }
    .feature-description {
        margin-bottom: 4px;
        padding-right: 12px;
        display: inherit;
    }
    .feature-highlight {
        font-weight: bold;
    }
    
    /* used for column filter and value handlers, with half width child features */
    .half-width-child-features .feature-animated-gif-container {
        float: none;
        width: 100%;
    }
    .half-width-child-features h2 {
        font-size: 20px;
    }
    .half-width-child-features .feature-snippet {
        margin-top: 10px;
    }
    .half-width-child-features .feature-item {
        margin-bottom: 10px;
        border: 1px solid #ddd;
        margin-top: 10px;
    }
    .half-width-child-features .feature-description {
        margin-top: 10px;
    }


    /* used in data functions, with full width child feature */
    .full-width-child-features h2 {
        font-size: 20px;
    }
    .full-width-child-features .feature-item {
        margin-bottom: 20px;
        border: 1px solid #ddd;
        margin-top: 10px;
    }

</style>

<?php
function gridFeature($name, $url, $image, $description, $snippet) {
    print('<div class="feature-item">');
    print('  <h2 class="feature-title"><a href="'.$url.'">'.$name.'</a></h2>');
    if (isset($image)) {
        print('  <div class="feature-animated-gif-container">');
        print('    <img src="./images/' . $image . '" class="feature-animated-gif"/>');
        print('  </div>');
    }
    print('  <div class="feature-description">'.$description.'</div>');
    if (isset($snippet)) {
        print('<div class="feature-snippet"><snippet>'.$snippet.'</snippet></div>');
    }
    if (isset($otherHtml)) {
        print($otherHtml);
    }
    print('</div>');
}

gridFeature('Column Definitions', '../javascript-grid-column-definitions/', 'columns.gif',
    'Columns are configured in the grid by providing a list of <span class="feature-highlight">Column Definitions</span>.
The attributes you set on the column definitions define how the columns behave eg title, width etc.',
    '
columnDefinitions = [
    {field: \'firstName\', width: 100px},
    {field: \'lastName\', width: 100px},
    {field: \'phoneNumber\', width: 200px}
];');

gridFeature('Column Groups', '../javascript-grid-grouping-headers/', 'columnGroups.gif',
    'Columns can be grouped together into <span class="feature-highlight">Column Groups</span>. Additionally you
can configure groups to be expandable to show and hide columns within the group.',
    '
columnDefinitions = [
    {group: \'User Details\', children: [
        {field: \'firstName\', pinned: \'left\'},
        {field: \'lastName\', width: 100},
        {field: \'phoneNumber\'}
    ]};
];');

gridFeature('Column Headers', '../javascript-grid-column-header/', 'columnHeaders.gif',
    'The display of column headers can be fine tuned to change for example 
    <span class="feature-highlight">Header Height</span> and <span class="feature-highlight">Text Orientation</span>.',
    '
// set heights as a grid option
gridOptions = {
    headerHeight: 25,
    headerHeight: 40    
}

// display text vertically using CSS
.ag-header-cell-label .ag-header-cell-text {
    transform: rotate(90deg);
}');

gridFeature('Column Resizing', '../javascript-grid-resizing/', 'columnResize.gif',
    '<span class="feature-highlight">Resize columns</span> by dragging the edge of the column header, <span class="feature-highlight">Auto Fill</span> to fill the grid width, or <span class="feature-highlight">Auto Size</span> columns to fit their content.',
    '
// get columns to fit the grid width
api.sizeColumnsToFit();

// get columns to fit content
columnApi.autoSizeAllColumns();
');

?>

<div class="feature-item">

    <h2 class="feature-title"><a href="../javascript-grid-filtering/">Column Filter</a></h2>
    <div class="feature-description">
        <span class="feature-highlight">Column Filter's</span> appear in the column menu.
        The grid provides filters out of the box (text, number, date and set filters) or create your
        own customer filter.
    </div>
    <div class="feature-snippet">
        <snippet>gridOptions = {
    // turn on filtering
    enableFilter: true,
    ...
    columnDefs: [
    {field: "athlete", filter: "text"},
    {field: "age",     filter: "number"},
    {field: "sport",   filter: MyCustomerFilter}
]}</snippet>
    </div>

    <div class="row half-width-child-features">
        <div class="col-md-6">
            <?php gridFeature('Text Filter', '../javascript-grid-filter-text/', 'textFilter.gif',
                '<span class="feature-highlight">Text Filter</span> allows filtering text strings with 
{equals, notEqual, contains, notContains, startsWith, endsWith}.',
                '
colDef = {
    field: \'athlete\',
    filter: \'text\',
    filterOptions: {\'equals\', \'contains\'}
}
'); ?>
        </div>
        <div class="col-md-6">
            <?php gridFeature('Number Filter', '../javascript-grid-filter-number/', 'numberFilter.gif',
                '<span class="feature-highlight">Number Filter</span> allows filtering numbers with 
{equals, notEquals, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}',
                '
colDef = {
    field: \'totalWinnings\',
    filter: \'number\'
}
'); ?>
        </div>
    </div>
    <div class="row half-width-child-features">
        <div class="col-md-6">
            <?php gridFeature('Date Filter', '../javascript-grid-filter-date/', 'dateFilter.gif',
                '<span class="feature-highlight">Date Filter</span> allows filtering dates with 
{equals, notEquals, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}.',
                '
colDef = {
    field: \'date\',
    filter: \'date\'
}
'); ?>
        </div>
        <div class="col-md-6">
            <?php gridFeature('Set Filter', '../javascript-grid-filter-set/', 'setFilter.gif',
                '<span class="feature-highlight">Set Filter</span> works like excel, providing checkboxes to select values from a set.',
                '
colDef = {
    field: \'country\',
    filter: \'set\'
}
'); ?>
        </div>
    </div>
    <div class="row half-width-child-features">
        <div class="col-md-6">
            <?php gridFeature('Custom Filter', '../javascript-grid-filter-custom/', 'customFilter.gif',
                'Create your own filter to match your own business requirements.',
                '
colDef = {
    field: \'name\',
    filter: MyCustomFilter
}
'); ?>
        </div>
    </div>

</div>

<?php

gridFeature('Quick Filter', '../javascript-grid-filter-quick/', 'quickFilter.gif',
    '<span class="feature-highlight">Quick Filter</span> filters all columns simultaneously with a simple text search,
just like how you filter your GMail.',
'// you pass the filter text to the grid
// via the grid\'s API
api.setQuickFilter(searchText)
');

gridFeature('External Filter', '../javascript-grid-filter-external/', 'externalFilter.gif',
    '<span class="feature-highlight">External Filter</span> allows you to build filters that live
outside of the grid. For example you can include your own widgets outside the grid for your own filter.',
null);

gridFeature('Row Sorting', '../javascript-grid-sorting/', 'rowSorting.gif',
    '<span class="feature-highlight">Row Sorting</span> will sort the data. Sort a column by clicking the header. 
Sort multiple columns by holding down shift.',
'// enable filtering with grid option
gridOptions = {
    enableSorting: true,
    ...
}');

gridFeature('Row Selection', '../javascript-grid-selection/', 'rowSelection.gif', '<span class="feature-highlight">Row Selection</span> to select rows. Choose between click selection or checkbox selection. Selecting groups will select children.',
    '// enable sorting with grid option
gridOptions = {
    // set to \'single\' or \'multiple\'
    rowSelection: \'multiple\',
    ...
}');

gridFeature('Range Selection', '../javascript-grid-range-selection/', 'rangeSelection.gif',
    'Drag the mouse over cells to create a <span class="feature-highlight">Range Selection</span>. 
This is handy for highlighting data or for copying to the clipboard.',
    '// enable sorting with grid option
gridOptions = {
    enableRangeSelection: true,
    ...
}');

gridFeature('Grid Size', '../javascript-grid-width-and-height/', 'gridSize.gif',
    'Set the <span class="feature-highlight">Width and Height</span> of the grid using CSS. If your application
changes the size of the grid at run time, the grid will dynamically adjust to the new size.',
    '
&lt;!-- set using exact pixel -->
&lt;ag-grid style="height: 200px; width: 400px;"/>

&lt;!-- or set using percent -->
&lt;ag-grid style="height: 100%; width: 100%;"/>');

gridFeature('Column Spanning', '../javascript-grid-column-spanning/', 'columnSpanning.gif',
    '<span class="feature-highlight">Column Spanning</span> allows cells to span columns, similar to cell span in Excel',
'colDef = {
    field: \'country\',
    colSpan: function(params) {
        // span 2 cols for Russia, otherwise 1
        var country = params.data.country;
        return country===\'Russia\' ? 2 : 1;
    }
    ...
};');

gridFeature('Column Pinning', '../javascript-grid-pinning/', 'columnPinning.gif',
    'Use <span class="feature-highlight">Columm Pinning</span> to pin one or more columns to the left
or to the right. Pinned columns are always present and not impacted by horizontal scroll.',
'var columns = [
    {field: \'athlete\', pinned: \'left\'},
    {field: \'total\', pinned: \'right\'},
    ...
]');

gridFeature('Row Pinning', '../javascript-grid-row-pinning/', 'rowPinning.gif',
    'Use <span class="feature-highlight">Pinned Rows</span> to pin one or more rows to the top
or the bottom. Pinned rows are always present and not impacted by vertical.',
'// set pinned column using grid property
gridOptions = {
    pinnedTopRowData: [],
    pinnedBottomRowData: [],
    ...
}');

gridFeature('Row Height', '../javascript-grid-row-height/', 'rowHeight.gif',
    'Rows can have different <span class="feature-highlight">Row Height</span>. You can
even change the row height dynamically at run time.',
    'gridOptions = {
    // getRowHeight is a grid callback
    getRowHeight = function(params) {
        // 25 px for even rows, 50 px for other rows
        var rowIndex = params.node.rowIndex;
        var rowEven = rowIndex % 2 === 0;
        return rowEven ? 25 : 50;
}');

gridFeature('Cell Styling', '../javascript-grid-cell-styling/', 'cellStyling.gif',
    'Use CSS rules to define <span class="feature-highlight">Cell Style</span> based on
data content, eg put a red background onto cells that have negative values, and green on values
greater than 100.',
    'cellClassRules = {
    // put CSS class \'highlight-negative\' onto cells
    // that have negative values.
    \'highlight-negative\': \'x < 0\'
    \'highlight-large-value\': \'x > 100\'
}');
?>

<div class="feature-item">
    <h2 class="feature-title"><a href="../javascript-grid-value-handlers/">Value Handlers</a></h2>
    <div class="feature-description">
        Each grid column typically has a field where it gets the value to display. However you can
        provide more logic here to get finer control over how data is retrevied (for display) and stored (after editing)
        with the family of <span class="feature-highlight">Value Handlers</span>.
    </div>

    <div class="row half-width-child-features">
        <div class="col-md-6">
            <?php gridFeature('Value Getters & Value Formatters', '../javascript-grid-value-getters/', null,
                '<span class="feature-highlight">Value Getters & Value Formatters</span> are about getting and formatting the
data to display. Use <span class="feature-highlight">Value Getters</span> when the data is not a simple field.
Use <span class="feature-highlight">Value Formatters</span> to format values for display.',
                'var columns = [
    // two simple cols, A and B
    {field: \'a\'},
    {field: \'b\'},
    // total column, giving sum of A and B
    {headerName: \'Total\', 
        valueGetter: function(params) {
            var data = params.data;
            return data.a + data.b;
        }
    },
    {field: \'price\', 
        // simple currency formatter putting in dollar sign
        valueFormatter: function(params){
            return \'$\' + params.value;
        },
    }
];'); ?>
        </div>
        <div class="col-md-6">
            <?php gridFeature('Setters and Parsers', '../javascript-grid-value-setters/', null,
                '<span class="feature-highlight">Value Setters and Value Parsers</span> are the inverse of value getters
and value formatters. Value setters are for placing values into data when field cannot be used. Value parser is for parsing
edited values, eg removing formatting before storing into the data.',
                'var columns = [
    // this example assumes the data is in an array,
    // so you want to access indexes of the array rather
    // than using field
    {
        // value getter returns first array element
        valueGetter: function(params) {
            var data = params.data;
            return data[0];
        },
        // value setter sets first array element
        valueSetter: function(params) {
            var data = params.data;
            data[0] = params.newValue;
        }
    },
    // this column is for a number, the default editor sets
    // strings, so we convert the string to a number
    {
        field: \'amount\',
        valueFormatter: function(params){
            return Number(params.newValue);
        }
    }
];'); ?>
        </div>
        <div class="col-md-6">
            <?php gridFeature('Expressions', '../javascript-grid-cell-expressions/', null,
                '<span class="feature-highlight">Expressions</span> allow you to use simple strings instead
of functions for value getters, setters, formatters and parsers.',
                'var columns = [
    {        
        valueGetter: \'data[0]\',
        valueSetter: \'data[0] = newValue\',
        valueFormatter: \'"$"+value\',
        valueParser: \'Number(params.newValue)\'
    }
];'); ?>
        </div>
        <div class="col-md-6">
            <?php gridFeature('Value Cache', '../javascript-grid-value-cache/', null,
                'The <span class="feature-highlight">Value Cache</span> is used to store
results of value getters. It is always on enhancing the performance of the grid.',
                null); ?>
        </div>
        <div class="col-md-6">
            <?php gridFeature('Reference Data', '../javascript-grid-reference-data/', null,
                'Use <span class="feature-highlight">Reference Data</span> for easier editing
of data that uses reference data for display. For example, you might have country codes in your data eg
{IE, UK, USA} but you display values eg {Ireland, Great Britain, United States of America}). Using reference
data simplifies this, especially if editing.',
                null); ?>
        </div>
    </div>

</div>


<?php

gridFeature('Cell Rendering', '../javascript-grid-cell-rendering/', 'cellRendering.gif',
    'Use <span class="feature-highlight">Cell Rendering</span> to have cells rendering values other than simple strings.
For example, put country flags beside country names, or push buttons for actions.',
    'colDef = {
    field: \'country\',
    cellRenderer: MyCountryCellRenderer
    ...
}');

gridFeature('Cell Editing', '../javascript-grid-cell-editing/', 'cellEditing.gif',
    'Users can updated data with <span class="feature-highlight">Cell Editing</span>. Use some one of the provided
cell editors, or create your own to suit your business needs.',
    'colDef = {
    field: \'country\',
    cellEditor: \'richSelect\',
    cellEditorParams: {
        values: [\'Ireland\',\'United Kingdom\']
    }
    ...
}');

gridFeature('Keyboard Navigation', '../javascript-grid-keyboard-navigation/', 'keyboardNavigation.gif',
    'With <span class="feature-highlight">Keyboard Navigation</span> users can use cursor keys and tab keys
to navigate between cells.',
    null);

gridFeature('Touch Support', '../javascript-grid-touch/', 'touchSupport.gif',
    'User can navigate the features of the grid on a touch device with teh build in 
<span class="feature-highlight">Touch Support</span>. You don\'t need to do anything, it works
out of the box.',
    null);

gridFeature('Animation', '../javascript-grid-animation/', 'animation.gif',
    'Rows in the grid will <span class="feature-highlight">Animate</span> into place
after the user sorts or filters.',
    'gridOptions = {
    animateRows: true
    ...
}');

gridFeature('Accessing Data', '../javascript-grid-accessing-data/', 'accessingData.gif',
    'Once data is in the grid, you can <span class="feature-highlight">Access the Data</span> using
the grid\'s API.',
    '// get the number of displayed rows
gridApi.getDisplayedRowCount()

// get the first row
gridApi.getDisplayedRowAtIndex(0);');

gridFeature('Pagination', '../javascript-grid-pagination/', 'pagination.gif',
    'Use <span class="feature-highlight">Pagination</span> when you don\'t want the user
to have to scroll. Pagination allows viewing rows one page at a time.',
    'gridOptions = {
    pagination: true,
    ...
}');

gridFeature('Tree Data', '../javascript-grid-tree/', 'treeData.gif',
    'Use <span class="feature-highlight">Tree Data</span> to display data that has parent / child
relationships that is not balanced. For example, a file can have zero or more parent folders.',
    null);

gridFeature('Updating Data', '../javascript-grid-data-update/', 'dataUpdate.gif',
    'Data can be <span class="feature-highlight">updated in real time</span>. The grid can highlight
the change by flashing the cells or by animation inside the cell as the cell refreshes.',
    '// get a reference to the right row
var rowNode = api.getRowNode(\'22\');

// set new value into the row
rowNode.setDataValue(\'bid\', 33.24);');

gridFeature('View Refresh', '../javascript-grid-refresh/', 'viewRefresh.gif',
    'If the data changes outside of the grid, get the grid to do a <span class="feature-highlight">View Refresh</span> 
to update the UI to the latest values. The grid will use change detection to only refresh values that have changed.',
    '// refresh all cells in the grid
gridApi.refreshCells();');

gridFeature('Change Detection', '../javascript-grid-change-detection/', 'changeDetection.gif',
    'As you change dat inside the grid, the grid runs <span class="feature-highlight">Change Detection</span> to
check if any other cells need to be updated to reflect the change.',
    null);

gridFeature('Internationalisation', '../javascript-grid-internationalisation/', 'internationalisation.gif',
    'Support multiple languages with <span class="feature-highlight">Internationalisation</span>.',
    'gridOptions = {
    localeText: {
        lessThanOrEqual: \'menor o igual\',
        greaterThanOrEqual: \'mayor o igual\',
        ...
    }
}');

gridFeature('Performance', '../javascript-grid-performance/', 'performance.gif',
    'The core grid engine gives <span class="feature-highlight">performance</span> unlike
that seen before. The grid uses row and column virtualisation, animation frames and many other 
techniques.',
    null);

gridFeature('Accessibility', '../javascript-grid-accessibility/', '.gif',
    'The grid has ARIA roles inside the cells for <span class="feature-highlight">Accessibility</span> 
to enable navigation with screen readers.',
    '&lt;div role="row">
    &lt;div role="gridcell">&lt;/div>
    &lt;div role="gridcell">&lt;/div>
&lt;/div>');

gridFeature('Full Width Rows', '../javascript-grid-full-width-rows/', 'fullWidth.gif',
    '<span class="feature-highlight">Full Width Rows</span> allow you to have one cell that
spans the entire width of the tables. This allows a card layout to work alongside the normal cells.',
    'gridOptions = {
     isFullWidthCell: function(rowNode) {
        // return every second row as full width
        return rowNode.rowIndex % 2 === 0;
    },
    // use custom component for the full width row
    fullWidthCellRenderer: MyCardComponent
}');

gridFeature('Master Detail', '../javascript-grid-master-detail/', 'masterDetail.gif',
    'Use <span class="feature-highlight">Master Detail</span> to expand rows and have another grid
with different columns inside.',
    null);

gridFeature('Aligned Grids', '../javascript-grid-aligned-grids/', 'alignedGrids.gif',
    'Have one or more grids horizontally <span class="feature-highlight">Aligned</span> so that any
column changes in one grid impact the other grid. This allows two girds with different data to be kept horizontally
in sync.',
    null);

gridFeature('CSV Export', '../javascript-grid-export/', 'csvExport.gif',
    'Use <span class="feature-highlight">CSV Export</span> to take data out of the grid and into another
application for further processing, eg Excel.',
    null);

gridFeature('Excel Export', '../javascript-grid-excel/', 'excelExport.gif',
    'Export in native <span class="feature-highlight">Excel Format</span> which will maintain the column
widths and also allow exporting of styles. For example, you can color cells in the grid and have the equivalent cells
colored in the Excel export.',
    null);

gridFeature('RTL', '../javascript-grid-rtl/', 'rtl.gif',
    'Use <span class="feature-highlight">Right to Left</span> alignment to allow languages such as 
Arabic & Hebrew.',
    null);

gridFeature('Custom Icons', '../javascript-grid-icons/', 'customIcons.gif',
    'All the icons in the grid can be replace with your own <span class="feature-highlight">Custom Icons</span>.
You can use either CSS or provide your own images.',
    'gridOptions = {
    icons: {
        // use font awesome for menu icons
        menu: \'&lt;i class="fa fa-bath"/>\',
        filter: \'&lt;i class="fa fa-long-arrow-down"/>\',
        columns: \'&lt;i class="fa fa-handshake-o"/>\'
    }
    ...
}');

gridFeature('Overlays', '../javascript-grid-overlays/', 'overlays.gif',
    'Full control of <span class="feature-highlight">Overlays</span> to display to the user
messages on top of the grid',
    null);

gridFeature('Layout For Print', '../javascript-grid-for-print/',  null,
    'Use <span class="feature-highlight">For Print</span> to have the grid render without using
any scrollbars. This is useful for printing the grid, where all rows should be printed, not just what\'s
visible on the screen.',
    null);

?>

<div class="feature-item">
    <h2 class="feature-title"><a href="../javascript-grid-data-functions/">Data Functions</a></h2>
    <div class="feature-description">
        <span class="feature-highlight">Data Functions</span> allow you to manipulate the data using
        <span class="feature-highlight">Grouping</span>, <span class="feature-highlight">Aggregation</span>
        and <span class="feature-highlight">Pivoting</span>.
    </div>

    <div class="full-width-child-features">
    <?php
    gridFeature('Grouping Rows', '../javascript-grid-grouping/', 'rowGroup.gif',
        'Use <span class="feature-highlight">Grouping Rows</span> to group the data over selected
dimensions. You can set the data to group by specific columns, or allow the user to drag and drop columns
of their choice and have it grouped on the fly.',
        'columnDefs = [
    {field: \'country\', rowGroup: true},
    {field: \'sport\'},
    ...
]');

    gridFeature('Aggregation', '../javascript-grid-aggregation/', 'aggregation.gif',
        'When grouping you can also do <span class="feature-highlight">Aggregation</span> to get aggregate
values for the data ie sum, min, max etc. Use the built in aggregate functions or create your own.',
        'columnDefs = [
    {field: \'country\', rowGroup: true},
    {field: \'gold\', aggFunc: \'sum\'},
    ...
]');

    gridFeature('Pivoting', '../javascript-grid-pivoting/', 'pivot.gif',
        'Make columns out of values by <span class="feature-highlight">Pivoting</span> on the data,
similar to Pivot in Excel.',
        'columnDefs = [
    {field: \'country\', rowGroup: true},
    {field: \'sport\', pivot: true},
    {field: \'gold\', aggFunc: \'sum\'},
    ...
]');
    ?>

    </div>
</div>

<?php

gridFeature('Data Functions', '../javascript-grid-data-functions/', null,
    '<span class="feature-highlight">Data Functions</span> allow you to manipulate the data using
<span class="feature-highlight">Grouping</span>, <span class="feature-highlight">Aggregation</span> 
and <span class="feature-highlight">Pivoting</span>.',
    null);

gridFeature('Grouping Rows', '../javascript-grid-grouping/', 'rowGroup.gif',
    'Use <span class="feature-highlight">Grouping Rows</span> to group the data over selected
dimensions. You can set the data to group by specific columns, or allow the user to drag and drop columns
of their choice and have it grouped on the fly.',
    'columnDefs = [
    {field: \'country\', rowGroup: true},
    {field: \'sport\'},
    ...
]');

gridFeature('Aggregation', '../javascript-grid-aggregation/', 'aggregation.gif',
    'When grouping you can also do <span class="feature-highlight">Aggregation</span> to get aggregate
values for the data ie sum, min, max etc. Use the built in aggregate functions or create your own.',
    'columnDefs = [
    {field: \'country\', rowGroup: true},
    {field: \'gold\', aggFunc: \'sum\'},
    ...
]');

gridFeature('Pivoting', '../javascript-grid-pivoting/', 'pivot.gif',
    'Make columns out of values by <span class="feature-highlight">Pivoting</span> on the data,
similar to Pivot in Excel.',
    'columnDefs = [
    {field: \'country\', rowGroup: true},
    {field: \'sport\', pivot: true},
    {field: \'gold\', aggFunc: \'sum\'},
    ...
]');

gridFeature('Tool Panel', '../javascript-grid-tool-panel/', 'toolPanel.gif',
    'The <span class="feature-highlight">Tool Panel</span> allows the user to maniuplate the
list of columns, such as show and hide, or drag columns to group or pivot.',
    'gridOptions: {
    showToolPanel: true,
    ...
}');

gridFeature('Clipboard', '../javascript-grid-clipboard/', 'clipboard.gif',
    'Copy and paste data to and from the <span class="feature-highlight">Clipboard</span>. Users will be
able to edit data in Excel, then copy the data back into the grid when done.',
    null);

gridFeature('Column Menu', '../javascript-grid-column-menu/', 'columnMenu.gif',
    'The <span class="feature-highlight">Column Menu</span> drops down from the column header. Use the default
options or provide your own.',
    null);

gridFeature('Context Menu', '../javascript-grid-context-menu/', 'contextMenu.gif',
    'The <span class="feature-highlight">Context Menu</span> appears when you right click on a cell. Use the
default options or provide your own.',
    null);

gridFeature('Status Bar', '../javascript-grid-status-bar/', 'statusBar.gif',
    'The <span class="feature-highlight">Status Panel</span> appears on the bottom of the grid and shows 
aggregations (sum, min, max etc) when you select a range of cells using range selection. This is similar to what
happens in Excel.',
    null);

gridFeature('License Key', '../javascript-grid-set-license/', 'licenseKey.gif',
    'Each customer of ag-Grid Enterprise will be given a <span class="feature-highlight">License Key</span> to
put into their application.',
    null);

?>

<!--
<div class="feature-item">
    <div class="feature-animated-gif-container">
        <img src="./images/gridSize.gif" class="feature-animated-gif"/>
    </div>
    <h3 class="feature-title"><a href="../javascript-grid-column-definitions/">Grid Size</a></h3>
    <div class="feature-description">
        Set the width and height of the grid using CSS.
    </div>
    <div class="feature-snippet">
        <snippet></snippet>
    </div>
</div>
-->

</div>
