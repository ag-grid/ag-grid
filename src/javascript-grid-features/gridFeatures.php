
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

gridFeature('Grid Size', '../javascript-grid-width-and-height/', 'gridSize.gif', 'Set the <span class="feature-highlight">Width and Height</span> of the grid using CSS.',
    '
&lt;!-- set using exact pixel -->
&lt;ag-grid style="height: 200px; width: 400px;"/>

&lt;!-- or set using percent -->
&lt;ag-grid style="height: 100%; width: 100%;"/>');

gridFeature('Column Definitions', '../javascript-grid-column-definitions/', 'columns.gif', 'Configure the columns using <span class="feature-highlight">Column Definitions</span>.',
    '
columnDefinitions = [
    {field: \'firstName\', width: 100px},
    {field: \'lastName\', width: 100px},
    {field: \'phoneNumber\', width: 200px}
];');

gridFeature('Column Groups', '../javascript-grid-grouping-headers/', 'columnGroups.gif', 'Group related columns into <span class="feature-highlight">Column Groups</span> to make grid more readable.',
    '
columnDefinitions = [
    {group: \'User Details\', children: [
        {field: \'firstName\', width: 100px},
        {field: \'lastName\', width: 100px},
        {field: \'phoneNumber\', width: 200px}
    ]};
];');

gridFeature('Column Headers', '../javascript-grid-column-header/', 'columnHeaders.gif', 'Configure the <span class="feature-highlight">Header Height</span> and <span class="feature-highlight">Text Orientation</span>.',
    null);

gridFeature('Column Resizing', '../javascript-grid-resizing/', 'columnResize.gif', '<span class="feature-highlight">Resize columns</span> by dragging the edge of the column header, <span class="feature-highlight">Auto Fill</span> to fill the grid width, or <span class="feature-highlight">Auto Size</span> columns to fit their content.',
    '
// get columns to fit the grid width
api.sizeColumnsToFit();

// get columns to fit content
columnApi.autoSizeAllColumns();
');

gridFeature('Column Filter', '../javascript-grid-filtering/', 'columnFilter.gif', '<span class="feature-highlight">Column Filter\'s</span> appear in the column menu. Use one of the grid built in filters or use your own.',
    '
gridOptions = {
    // turn on filtering
    enableFilter: true,
    ...
    columnDefs: [
        {field: "athlete", filter: "text"},
        {field: "age",     filter: "number"},
        {field: "sport",   suppressFilter: true}
    ]
}');

?>

<div class="row small-feature">
    <div class="col-md-6">
        <?php gridFeature('Text Filter', '../javascript-grid-filter-text/', 'textFilter.gif', null,
            '
colDef = {
    field: \'athlete\',
    filter: \'text\'
}
'); ?>
    </div>
    <div class="col-md-6">
        <?php gridFeature('Number Filter', '../javascript-grid-filter-number/', 'numberFilter.gif', null,
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
        <?php gridFeature('Date Filter', '../javascript-grid-filter-date/', 'dateFilter.gif', null,
            '
colDef = {
    field: \'date\',
    filter: \'date\'
}
'); ?>
    </div>
    <div class="col-md-6">
        <?php gridFeature('Set Filter', '../javascript-grid-filter-set/', 'setFilter.gif', null,
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
        <?php gridFeature('Custom Filter', '../javascript-grid-filter-custom/', 'customFilter.gif', null,
            '
colDef = {
    field: \'name\',
    filter: MyCustomFilter
}
'); ?>
    </div>
</div>

<?php

gridFeature('Quick Filter', '../javascript-grid-filter-quick/', 'quickFilter.gif', '<span class="feature-highlight">Quick Filter</span> filters all columns simultaneously with a simple text search.',
'
api.setQuickFilter(searchText)
');

gridFeature('External Filter', '../javascript-grid-filter-external/', 'externalFilter.gif', '<span class="feature-highlight">External Filter</span> allows you to include filters inside your application and outside of the grid.',
null);

gridFeature('Row Sorting', '../javascript-grid-sorting/', 'rowSorting.gif', '<span class="feature-highlight">Row Sorting</span> will sort the data. Sort a column by clicking the header. Sort multiple columns by holding down shift.',
null);

gridFeature('Row Selection', '../javascript-grid-selection/', 'rowSelection.gif', '<span class="feature-highlight">Row Selection</span> to select rows. Choose between click selection or checkbox selection. Selecting groups will select children.',
null);

gridFeature('Range Selection', '../javascript-grid-range-selection/', 'rangeSelection.gif', '<span class="feature-highlight">Range Selection</span> allows selecting ranges of cells, handy for copying to the clipboard.',
null);

gridFeature('Column Spanning', '../javascript-grid-column-spanning/', 'columnSpanning.gif', '<span class="feature-highlight">Column Spanning</span> allows cells to span columns, similar to cell span in Excel',
null);

gridFeature('Column Pinning', '../javascript-grid-pinning/', 'columnPinning.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Row Pinning', '../javascript-grid-row-pinning/', 'rowPinning.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Row Height', '../javascript-grid-row-height/', 'rowHeight.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Cell Styling', '../javascript-grid-cell-styling/', 'cellStyling.gif', '<span class="feature-highlight"></span> ',
    null);

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

gridFeature('Cell Rendering', '../javascript-grid-cell-rendering/', 'cellRendering.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Cell Editing', '../javascript-grid-cell-editing/', 'cellEditing.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Keyboard Navigation', '../javascript-grid-keyboard-navigation/', 'keyboardNavigation.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Touch Support', '../javascript-grid-touch/', 'touchSupport.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Animation', '../javascript-grid-animation/', 'animation.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Accessing Data', '../javascript-grid-accessing-data/', 'accessingData.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Pagination', '../javascript-grid-pagination/', 'pagination.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Tree Data', '../javascript-grid-tree/', 'treeData.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Updating Data', '../javascript-grid-data-update/', 'dataUpdate.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('View Refresh', '../javascript-grid-refresh/', 'viewRefresh.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Change Detection', '../javascript-grid-change-detection/', 'changeDetection.gif', '<span class="feature-highlight"></span> ',
    null);

gridFeature('Internationalisation', '../javascript-grid-internationalisation/', 'internationalisation.gif', '<span class="feature-highlight"></span> ',
    null);

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

/*

gridFeature('Layout For Print', '../javascript-grid-for-print/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Data Functions', '../javascript-grid-data-functions/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Grouping Rows', '../javascript-grid-grouping/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Aggregation', '../javascript-grid-aggregation/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Pivoting', '../javascript-grid-pivoting/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Tool Panel', '../javascript-grid-tool-panel/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Clipboard', '../javascript-grid-clipboard/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Column Menu', '../javascript-grid-column-menu/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Context Menu', '../javascript-grid-context-menu/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('Status Bar', '../javascript-grid-status-bar/', '.gif', '<span class="feature-highlight"></span> ',
null);

gridFeature('License Key', '../javascript-grid-set-license/', '.gif', '<span class="feature-highlight"></span> ',
null);*/

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
