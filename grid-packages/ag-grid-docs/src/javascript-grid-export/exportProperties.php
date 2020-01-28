<?php

$exportProperties = [
    [
        "allColumns",
        "If true, all columns will be exported in the order they appear in columnDefs. Otherwise only the columns currently showing the in grid, and in that order, are exported."
    ],
    [
        "columnGroups",
        "Set to true to include header column groupings."
    ],
    [
        "columnKeys",
        "Provide a list (an array) of column keys if you want to export specific columns."
    ],
    [
        "columnSeparator",
        "The column separator. Defaults to comma."
    ],
    [
        "customHeader",
        "Content to put at the top of the file export. A 2D array of ExcelCell objects, see
        <a href='#custom-headers-and-footers'>Custom Headers and Footers</a> below. Alternatively, if you're
        exporting to CSV only, you can pass a multi-line string that is simply appended to the top of the file
        content."
    ],
    [
        "customFooter",
        "Same as customHeader, but for the bottom of the exported file."
    ],
    [
        "fileName",
        "String to use as the file name. If missing, the file name 'export.csv' will be used."
    ],
    [
        "getCustomContentBelowRow",
        "A callback function to return styled content to be inserted below a row in the export. The callback params has the following attributes: node, api, columnApi, context."
    ],
    [
        "onlySelected",
        "Only export selected rows."
    ],
    [
        "onlySelectedAllPages",
        "Only export selected rows including other pages (only makes sense when using pagination)."
    ],
    [
        "processCellCallback",
        "A callback function invoked once per cell in the grid. Return a string value to be displayed in the export. Useful e.g. for formatting date values. The callback params has the following attributes: value, node, column, api, columnApi, context."
    ],
    [
        "processGroupHeaderCallback",
        "A callback function invoked once per column group. Return a string to be displayed in the column group header. Note that column groups are not exported by default, you must pass columnGroups=true. The callback params has the following attributes: columnGroup, api, columnApi, context."
    ],
    [
        "processHeaderCallback",
        "A callback function invoked once per column. Return a string to be displayed in the column header. The callback params has the following attributes: column, api, columnApi, context."
    ],
    [
        "processRowGroupCallback",
        "A callback function invoked once per row group. Return a string to be displayed in the group cell. The callback params has the following attributes: node, api, columnApi, context."
    ],
    [
        "shouldRowBeSkipped",
        "A callback function that will be invoked once per row in the grid - return true omit the row from the export.
            The callback is passed an object with the following attributes: node, api, context."
    ],
    [
        "skipFooters",
        "Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping."
    ],
    [
        "skipGroups",
        "Set to true to skip row group headers and footers if grouping rows. No impact if not grouping rows."
    ],
    [
        "skipHeader",
        "Set to true if you don't want to first line to be the column header names."
    ],
    [
        "skipPinnedTop",
        "Set to true to suppress exporting rows pinned to the top of the grid."
    ],
    [
        "skipPinnedBottom",
        "Set to true to suppress exporting rows pinned to the bottom of the grid."
    ],
    [
        "suppressQuotes",
        "Set to true to not use double quotes between values."
    ]
];


?>