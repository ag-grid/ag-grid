<?php

$excelProperties = [
    [
        "columnWidth",
        "Override the default column width. Can be a number (width in pixels) or a function that returns a number. If a function is
        provided, it will be called with a params with the following attributes: column, index."
    ],
    [
        "exportMode",
        "Defaults to \"xlsx\" and uses the Open Office XML standards. It can be set to \"xml\" to use Excel's
        <a href=\"https://docs.microsoft.com/en-us/previous-versions/office/developer/office-xp/aa140066(v=office.10)?redirectedfrom=MSDN\">legacy XML format</a>."
    ],
    [
        "headerRowHeight",
        "The height (in px) of header rows. If not specified it will take the <code>rowHeight</code> value."
    ],
    [
        "rowHeight",
        "The height (in px) of all rows. If not specified it will take the Excel default value."
    ],
    [
        "sheetName",
        "The name of the sheet in excel where the grid will get exported. If not specified defaults to 'ag-grid'.
        <br/><strong>Note: 31 charecters max</strong>."
    ],
    [
        "suppressTextAsCDATA",
        "When exportMode=\"xml\" the default behaviour is to wrap text in CDATA sections. Pass true and text content will be
        encoded with XML character entities like &amp;lt; and &amp;gt;."
    ]
];

?>