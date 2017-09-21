
<style>
    .feature-animated-gif-container {
        float: right;
    }
    .feature-animated-gif {
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

<!--<div class="feature-overview">

    <div class="feature-summary-item">
        <h3 class="feature-summary-title">Columns</h3>
        <p>
            Configure the columns using <a href="../javascript-grid-column-definitions/">Column Definitions</a>.

            Set the grid width and height with <a href="../javascript-grid-width-and-height/">Grid Size</a>.
        </p>
    </div>

    <div class="feature-summary-item">
        <h3 class="feature-summary-title">Basic Features</h3>
        <p>
            Set the grid width and height with <a href="../javascript-grid-width-and-height/">Grid Size</a>.
        </p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-width-and-height/"><h3 class="feature-summary-title">Grid Size</h3></a>
        <p>
        </p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-column-definitions/"><h3 class="feature-summary-title">Column Definitions</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-grouping-headers/"><h3 class="feature-summary-title">Column Groups</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-column-header/"><h3 class="feature-summary-title">Column Headers</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-resizing/"><h3 class="feature-summary-title">Column Resizing</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filtering/"><h3 class="feature-summary-title">Column Filter</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-text/"><h3 class="feature-summary-title">Text Filter</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-number/"><h3 class="feature-summary-title">Number Filter</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-date/"><h3 class="feature-summary-title">Date Filter</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-set/"><h3 class="feature-summary-title">Set Filter</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-custom/"><h3 class="feature-summary-title">Custom Filter</h3></a>
        <p></p>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-quick/"><h3 class="feature-summary-title">Quick Filter</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-external/"><h3 class="feature-summary-title">External Filter</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-sorting/"><h3 class="feature-summary-title">Row Sorting</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-selection/"><h3 class="feature-summary-title">Row Selection</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-range-selection/"><h3 class="feature-summary-title">Range Selection</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-column-spanning/"><h3 class="feature-summary-title">Column Spanning</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-pinning/"><h3 class="feature-summary-title">Column Pinning</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-row-pinning/"><h3 class="feature-summary-title">Row Pinning</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-row-height/"><h3 class="feature-summary-title">Row Height</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-styling/"><h3 class="feature-summary-title">Cell Styling</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-rendering/"><h3 class="feature-summary-title">Cell Rendering</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-editing/"><h3 class="feature-summary-title">Cell Editing</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-quick/"><h3 class="feature-summary-title">Quick Filter</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-filter-external/"><h3 class="feature-summary-title">External Filter</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-sorting/"><h3 class="feature-summary-title">Row Sorting</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-selection/"><h3 class="feature-summary-title">Row Selection</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-range-selection/"><h3 class="feature-summary-title">Range Selection</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-column-spanning/"><h3 class="feature-summary-title">Column Spanning</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-pinning/"><h3 class="feature-summary-title">Column Pinning</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-row-pinning/"><h3 class="feature-summary-title">Row Pinning</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-row-height/"><h3 class="feature-summary-title">Row Height</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-styling/"><h3 class="feature-summary-title">Cell Styling</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-rendering/"><h3 class="feature-summary-title">Cell Rendering</h3></a>
    </div>

    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-editing/"><h3 class="feature-summary-title">Cell Editing</h3></a>
    </div>


    <div class="feature-summary-item">
        <a href="../javascript-grid-keyboard-navigation/"><h3 class="feature-summary-title">Keyboard Navigation</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-touch/"><h3 class="feature-summary-title">Touch Support</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-animation/"><h3 class="feature-summary-title">Animation</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-accessing-data/"><h3 class="feature-summary-title">Accessing Data</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-value-getters/"><h3 class="feature-summary-title">Getters & Formatters</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-value-setters/"><h3 class="feature-summary-title">Setters and Parsers</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-cell-expressions/"><h3 class="feature-summary-title">Expressions</h3></a>
        <p>
            Have Excel style expressions inside your grid, eg 'x.a + b.s'
        </p>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-value-cache/"><h3 class="feature-summary-title">Value Cache</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-pagination/"><h3 class="feature-summary-title">Pagination</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-tree/"><h3 class="feature-summary-title">Tree Data</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-data-update/"><h3 class="feature-summary-title">Updating Data</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-refresh/"><h3 class="feature-summary-title">View Refresh</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-change-detection/"><h3 class="feature-summary-title">Change Detection</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-internationalisation/"><h3 class="feature-summary-title">Internationalisation</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-accessibility/"><h3 class="feature-summary-title">Accessibility</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-full-width-rows/"><h3 class="feature-summary-title">Full Width Rows</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-master-detail/"><h3 class="feature-summary-title">Master Detail</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-aligned-grids/"><h3 class="feature-summary-title">Aligned Grids</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-export/"><h3 class="feature-summary-title">CSV Export</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-excel/"><h3 class="feature-summary-title">Excel Export</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-rtl/"><h3 class="feature-summary-title">RTL</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-icons/"><h3 class="feature-summary-title">Custom Icons</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-overlays/"><h3 class="feature-summary-title">Custom Overlays</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-for-print/"><h3 class="feature-summary-title">Layout for Print</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-data-functions/"><h3 class="feature-summary-title">Data Functions</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-grouping/"><h3 class="feature-summary-title">Grouping Rows</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-aggregation/"><h3 class="feature-summary-title">Aggregation</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-pivoting/"><h3 class="feature-summary-title">Pivoting</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-tool-panel/"><h3 class="feature-summary-title">Tool Panel</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-clipboard/"><h3 class="feature-summary-title">Clipboard</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-column-menu/"><h3 class="feature-summary-title">Column Menu</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-context-menu/"><h3 class="feature-summary-title">Context Menu</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-status-bar/"><h3 class="feature-summary-title">Status Bar</h3></a>
    </div>
    <div class="feature-summary-item">
        <a href="../javascript-grid-set-license/"><h3 class="feature-summary-title">License Key</h3></a>
    </div>
-->
</div>
