<?php
$key = "Excel Export";
$pageTitle = "ag-Grid Excel Data Export";
$pageDescription = "Data in the grid can be exported to csv. This page explains how to do exports along with properties you can set to get the exports done.";
$pageKeyboards = "ag-Grid Data Export Javascript CSV";
include '../documentation-main/documentation_header.php';
?>

<p>

    <h2>Excel Export</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Excel Export is available in ag-Grid Enterprise.
    </p>

    <p>
    This enterprise feature allows exporting ag-grid to Excel using Excel own XML format. Using Excel own XML format means that the exported table will be opened from Excel
    keeping most of the stying and functionality as seen by the user on your ag-grid application.
    </p>

    <p>
    Excel export is an improvement over the free version of this feature which exports the data in a plain csv format without styling. Documentation for the free csv exporting can be found here: <a href="/javascript-grid-export/">Export</a>
    </p>

    <p>
    Below provides two examples:
    </p>
    <ul>
        <li>Example 1 - shows a simple Excel export without any styling.</li>
        <li>Example 2 - shows a more complex example including styling.</li>
    </ul>

    <p>
    Every time you export to Excel there are four major benefits over the free export.
    </p>

    <ol>
        <li>The column width from your grid options is exported to excel, so the columns in excel will have the same widths as the ag-grid in your web application</li>
        <li>The data types of your columns are passed to excel as part of the export so that if you want to work with the data afterwards within excel you will have less issues</li>
        <li>The cells of the colum header groups are merged looking the same as the group headers in the ag-grid</li>
        <li>As explained in the examples below, you can specify Excel styles which will hook up with your cellClassRules</li>
    </ol>

    <h3>API</h3>
    The export is performed by calling the following API. Note that this API is similar to the CSV export API, so you can use similar config for both.

    <ul>
        <li><b>exportExcel(params)</b>: Does the full export and triggers the download automatically of the file in the browser so that the user would be able to open it immediately.</li>
        <li><b>getDataAsExcel(params)</b>: Returns the Excel XML that represents the export performed by exportExcel(params). This can then be used by you web appliction, eg to send the data to the server for storing or sending via email etc.</li>
    </ul>

    <p>
        Each of these methods takes a an optional params object that can take the following:
    </p>

    <ul>
        <li><b>skipHeader</b>: Set to true if you don't want to first line to be the column header names.</li>
        <li><b>skipGroups</b>: Set to true to skip headers and footers if grouping. No impact if not grouping.</li>
        <li><b>skipFooters</b>: Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping.</li>
        <li><b>fileName</b>: String to use as the file name. If missing, the file name 'export.csv' will be used.</li>
        <li><b>allColumns</b>: If true, all columns will be exported in the order they appear in columnDefs.
            Otherwise only the columns currently showing the in grid, and in that order, are exported.</li>
        <li><b>onlySelected</b>: Only export selected rows.</li>
        <li><b>onlySelectedAllPages</b>: Only export selected rows including other pages (only makes sense when using pagination).</li>
        <li><b>columnKeys</b>: Provide a list (an array) of column keys if you want to export specific columns.</li>
        <li><b>processCellCallback</b>: Allows you to process (typically format) cells for the CSV.</li>
        <li><b>processHeaderCallback</b>: Allows you to create custom header values for the export.</li>
    </ul>

    <h4>processCellCallback()</h4>

    <p>This callback allows you to format the cells for the export. The example below has an option 'Use Cell Callback'
        which puts all the items into upper case. This can be useful if, for example, you need to format date cells
        to be read by Excel.</p>

    <p>
        The callback params has the following attributes: value, node, column, api, columnApi, context.
    </p>

    <h4>processHeaderCallback()</h4>

    <p>If you don't like the header names the grid provides, then you can provide your own header names. Maybe you
        have grouped columns and you want to include the columns parent groups.</p>

    <p>
        The callback params has the following attributes: column, api, columnApi, context.
    </p>

    <h3>
        What Gets Exported
    </h3>

    <p>
        The data in the grid, similar to CSV export, gets exported. However unlike CSV Export, you also get to export styles.
        The details of how to specify Styles with Excel are explained in the last example in this page.

    <p>

    <p>Regardless, the following needs to be taken into consideration</p>

    <ul>
        <li>The raw values, and not the result of cellRenderer, will get used, meaning:
            <ul>
                <li>cellRenderers will NOT be used.</li>
                <li>valueGetters will be used.</li>
                <li>cellFormatters will NOT be used (use <i>processCellCallback</i> instead).</li>
            </ul>
        </li>
        <li>If row grouping, all data will be exported regardless of groups open or closed.</li>
        <li>If row grouping with footers (groupIncludeFooter=true) the footers will NOT be used -
            this is a GUI addition that happens for displaying the data in the grid.</li>
    </ul>

    <h3>Example 1 - Export Wihtout Styles</h3>

    <p>

        The example below demonstrates exporting the data without any styling. Note that the grid has CSS Class Rules
        for changing the background color of some cells. The Excel export does not replicate the HTML styling. How
        to get similar formatting in your Excel is explained in the second example.
    </p>

    <ul>
        <li>The column grouping is exported.</li>
        <li>Filtered rows are not included in the export.</li>
        <li>The sort order is maintained in the export.</li>
        <li>The order of the columns is maintained in the export.</li>
        <li>Only visible columns are export.</li>
        <li>Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name)</li>
        <li>Aggregated values are exported.</li>
        <li>For groups, the first exported value (column) will always have the group key.</li>
    </ul>

    <show-example example="exampleExcel"></show-example>


    <h3>Export with Styles</h3>
    The main reason to export to excel instead to CSV is so that the look & feel remains as consistent as possible to the one provided in your ag-grid application. In order to
    simplify the configuration the excel export reuses the <a href ="/javascript-grid-cell-styling/">cellClassRules</a>. Whatever resultant class is applicable to the cell then is
    expected to be provided as an Excel Style to the excelStyles property in the <a href="/javascript-grid-properties/">gridOptions</a>.

    <h4>Excel Style Definition</h4>

    <p>
    An excel style object has the following properties:
    </p>

    <ul>
        <li>id: Mandatory. The id of the style, this has to be a unique string and has to match the name of the style from the cellClassRules</li>
        <li>name: Mandatory. Same as id</li>
        <li>alignment: Optional. But if specified, both the vertical and horizontal alignment are mandatory:<ul>
                <li>vertical: String one of Top/Bottom</li>
                <li>horizontal: String one of Left/Right</li>
            </ul>
        </li>
        <li>borders: Optional. But if specified, all  the 4 borders must be specified, the structure of an Excel border object is explained in the nest section: <ul>
                <li>borderBottom</li>
                <li>borderLeft</li>
                <li>borderTop</li>
                <li>borderRight</li>
            </ul>
        </li>
        <li>font: Optional. But if specified the color must be declared: <ul>
                <li>color. A color in hexadecimal format</li>
            </ul>
        </li>
        <li>interior: Optional. But if specified, the color and pattern must be declared:
            <ul>
                <li>color. A color in hexadecimal format</li>
                <li>pattern. One of the following strings: None, Solid, Gray75, Gray50, Gray25, Gray125, Gray0625, HorzStripe, VertStripe, ReverseDiagStripe, DiagStripe, DiagCross, ThickDiagCross, ThinHorzStripe, ThinVertStripe, ThinReverseDiagStripe, ThinDiagStripe, ThinHorzCross, and ThinDiagCross</li>
            </ul>
        </li>
</ul>


    <h4>Excel borders</h4>
    The borderBottom, borderLeft, borderTop, borderRight properties are objects composed of the following mandatory properties:

    <ul>
        <li>lineStyle: One of the following strings: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double</li>
        <li>weight: A number representing the thickness of the border in pixels</li>
        <li>color. A color in hexadecimal format</b></li>
    </ul>


    <h4>Excel Style Definition Example</h4>
    <pre>
var columnDefs = {
    ...,
    cssClassRules: {
        lessThan23IsGreen: function(params) { return params.value < 23},
        lessThan20IsBlue: function(params) { return params.value < 20}
    }
}

<span class="codeComment">// In this example we can see how we merge the styles in excel.</span>
<span class="codeComment">// Everyone less than 23 will have a green background, if also less than 20 the font color will also be red</span>

var gridOptions = {
    ...,
    excelStyles: [
        <span class="codeComment">// The base style, background is green</span>
        {
            id: "lessThan23IsGreen",
            name: "lessThan23IsGreen",
            alignment: {
                horizontal: 'Right', vertical: 'Bottom'
            },
            borders: {
                borderBottom: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderLeft: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderRight: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                },
                borderTop: {
                    color: "#000000", lineStyle: 'Continuous', weight: 1
                }
            },
            font: { color: "#e0ffc1"},
            interior: {
                color: "#008000", pattern: 'Solid'
            }
        },
        <span class="codeComment">// The additional style, on top of a green background it will have a red font</span>
        {
            id: "lessThan20FontIsRed",
            name: "lessThan20FontIsRed",
            interior: {
                color: "#FF0000", pattern: 'Solid'
            }
        }
    ]
}

    </pre>

    <h4>Resolving Excel Styles</h4>

    <p>
        The cellClassRules are executed on each cell to decide what styles to apply. Normally these styles map to CSS
        classes when the grid is doing normal rendering. In Excel Export, the styles are mapped against the Excel Styles
        that you have provided. If more than one Excel style is found, the results are merged (similar to how CSS classes
        are merged by the browser when multiple classes are applied).
    </p>

    <p>
        Headers are a special case, headers are exported to excel as normal rows, so in order to allow you to style them
        you can provide an ExcelStyle with id and name "header". If you do so, the headers
        will have that style applied to them when exported. You can see this is the second example below in this page.
    </p>

    <h4>Dealing With Errors In Excel</h4>

    <p>
        If you get an error when opening the Excel file, the most likely reason is that there is an error in the definition of the styles.
        If that is the case, since the generated xls file is a plain XML text file, we recommend you to edit the contents manually
        and see if any of the styles specified have any error according to the <a href="https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx">
        Microsoft specification for the Excel XML format</a>.
    </p>

    <p>
        Some of the most likely errors you can encounter when exporting to excel are:
        <ul>
            <li>Not specifying all the attributes of an Excel Style property. IE. If you specify the interior for an
                Excel style and don't provide a pattern, just color, Excel will fail to open the spreadsheet</li>
            <li>Using invalid characters in attributes, we recommend you not to use special characters.</li>
            <li>Not specifying the style associated to a cell, if a cell has an style that is not passed as part of the
                grid options, Excel won't fail opening the spreadsheet but the column won't be formatted.</li>
            <li>Specifying an invalid enumerated property. It is also important to realise that Excel is case sensitive,
            so Solid is a valid pattern, but SOLID or solid are not</li>
        </ul>
    </p>

    <h3>
        Example 2 - Export With Styles
    </h3>
    <p>
        This example illustrates the following features from the Excel export.
        <ul>
            <li>Cells with only one style will be exported to Excel, as you can see in the Country and Gold columns</li>
            <li>Styles can be combined it a similar fashion than CSS, this can be seen in the column age where athletes l
                ess than 20 years old get two styles applied (greenBackground and redFont)</li>
            <li>A default columnDef containing cellClassRules can be specified and it will be exported to Excel.
                You can see this is in the styling of the oddRows of the grid (boldBorders)</li>
            <li>Its possible to export borders as specified in the gold column (boldBorders)</li>
            <li>If a cell has an style but there isn't an associated Excel Style defined, the style for that cell won't
                get exported. This is the case in this example of the year column which has the style notInExcel, but since
                it hasn't been specified in the gridOptions, the column then gets exported without formatting.</li>
            <li>Note that there is an Excel Style with name and id header that gets automatically applied to the ag-grid headers when exported to Excel</li>
        </ul>
    </p>

    <show-example example="exampleExcelStyles"></show-example>

<?php include '../documentation-main/documentation_footer.php';?>