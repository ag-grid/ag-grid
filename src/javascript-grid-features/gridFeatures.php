
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
        background-color: #fafafa;
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 10px;
        position: relative;
        overflow: auto;
        margin-bottom: 50px;
    }
    .feature-title {
        margin-top: 0px;
    }
    .feature-snippet {
        display: inline-block;
    }
    .feature-description {
        margin-bottom: 4px;
    }
    .feature-highlight {
        font-weight: bold;
    }
    .small-feature .feature-animated-gif-container {
        float: none;
        width: 100%;
    }
    .small-feature h2 {
        font-size: 20px;
    }
    .small-feature .feature-snippet {
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

gridFeature('Grid Size', '../javascript-grid-width-and-height/', 'gridSize.gif',
    'Set the <span class="feature-highlight">Width and Height</span> of the grid using CSS. If your application
changes the size of the grid at run time, the grid will dynamically adjust to the new size.',
    '
&lt;!-- set using exact pixel -->
&lt;ag-grid style="height: 200px; width: 400px;"/>

&lt;!-- or set using percent -->
&lt;ag-grid style="height: 100%; width: 100%;"/>');

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

gridFeature('Column Filter', '../javascript-grid-filtering/', 'columnFilter.gif',
    '<span class="feature-highlight">Column Filter\'s</span> appear in the column menu. 
The grid provides filters out of the box (text, number, date and set filters) or create your
own customer filter.',
    '
gridOptions = {
    // turn on filtering
    enableFilter: true,
    ...
    columnDefs: [
        {field: "athlete", filter: "text"},
        {field: "age",     filter: "number"},
        {field: "sport",   filter: MyCustomerFilter}
    ]
}');

?>

<div class="row small-feature">
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
<div class="row small-feature">
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
<div class="row small-feature">
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
outside of the grid. For example you can include your own widgets before the grid for your own filter.',
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

gridFeature('Value Handlers ?????', '../javascript-grid-value-handlers/', '.gif', '<span class="feature-highlight"></span> ',
    null);

/*

gridFeature('Value Getters & Formatters', '../javascript-grid-value-getters/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Value Setters & Parsers', '../javascript-grid-value-setters/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Expressions', '../javascript-grid-cell-expressions/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Value Cache', '../javascript-grid-value-cache/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Reference Data', '../javascript-grid-reference-data/', '.gif', '<span class="feature-highlight"></span> ',
null);

*/

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
    '<span class="feature-highlight"></span> ',
    '');

gridFeature('Performance', '../javascript-grid-performance/', 'performance.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Accessibility', '../javascript-grid-accessibility/', '.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Full Width Rows', '../javascript-grid-full-width-rows/', 'fullWidth.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Master Detail', '../javascript-grid-master-detail/', 'masterDetail.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Aligned Grids', '../javascript-grid-aligned-grids/', 'alignedGrids.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('CSV Export', '../javascript-grid-export/', 'csvExport.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Excel Export', '../javascript-grid-excel/', 'excelExport.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('RTL', '../javascript-grid-rtl/', 'rtl.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Custom Icons', '../javascript-grid-icons/', 'customIcons.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Overlays', '../javascript-grid-overlays/', 'overlays.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Layout For Print', '../javascript-grid-for-print/',  null, '<span class="feature-highlight"></span> ',
    null);

gridFeature('Data Functions', '../javascript-grid-data-functions/', null, '<span class="feature-highlight"></span> ',
    null);

gridFeature('Grouping Rows', '../javascript-grid-grouping/', 'rowGroup.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Aggregation', '../javascript-grid-aggregation/', 'aggregation.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Pivoting', '../javascript-grid-pivoting/', 'pivot.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Tool Panel', '../javascript-grid-tool-panel/', 'toolPanel.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Clipboard', '../javascript-grid-clipboard/', 'clipboard.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Column Menu', '../javascript-grid-column-menu/', 'columnMenu.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Context Menu', '../javascript-grid-context-menu/', 'contextMenu.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Status Bar', '../javascript-grid-status-bar/', 'statusBar.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('License Key', '../javascript-grid-set-license/', 'licenseKey.gif', '<span class="feature-highlight"></span> ',
    null);

?>

<!--
<div class="feature-item">
    <div class="feature-animated-gif-container">
        <img src="./images/gridSize.gif" class="feature-animated-gif"/>
    </div>
    <h3><a href="../javascript-grid-column-definitions/" class="feature-title">Grid Size</a></h3>
    <div class="feature-description">
        Set the width and height of the grid using CSS.
    </div>
    <div class="feature-snippet">
        <snippet></snippet>
    </div>
</div>
-->

</div>
