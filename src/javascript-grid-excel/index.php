<?php
$key = "Excel Export";
$pageTitle = "Javascript Excel Export";
$pageDescription = "We are now supporting JavaScript Export to Excel. This page explains how to use this new feature to Export to Excel along with properties you can set to get the configure the exports.";
$pageKeyboards = "JavaScript Export to Excel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<p>

    <h1><img src="../images/enterprise_50.png" title="Enterprise Feature"/> JavaScript Excel Export in ag-Grid</h1>

    <p>
        Excel Export allows exporting ag-Grid data to Excel using Excel's own XML format. Using this format
        allows for rich Excel files to be created with the following:
        <ol>
            <li>The column width from your grid is exported to Excel, so the columns in Excel will have the same width as your web application</li>
            <li>You can specify Excel styles (colors, fonts, borders etc) to be included in the Excel file.</li>
            <li>The data types of your columns are passed to Excel as part of the export so that if you can to work with the data within Excel in the correct format.</li>
            <li>The cells of the column header groups are merged in the same manner as the group headers in ag-Grid.</li>
        </ol>
    </p>

    <h3 id="ExcelExportApi">API</h3>

    <p>
        The export is performed by calling the following API. Note that this API is similar to the <a href="../javascript-grid-export/#cellClassRules">CSV Export</a> API,
        so you can use similar config for both.
    </p>

    <ul>
        <li><b>exportDataAsExcel(params)</b>: Does the full export and triggers the download of the file in the browser automatically so the user can open immediately.</li>
        <li><b>getDataAsExcel(params)</b>: Returns the Excel XML that represents the export performed by
            <i>exportDataAsExcel(params)</i>. This can then be used by your web application, e.g. to send the data to the
            server for storing or sending via email etc.</li>
    </ul>

    <p>
        Each of these methods takes an optional params object that can take the following:
    </p>

    <ul>
        <li><b>skipHeader</b>: Set to true if you don't want the first line to be column header names.</li>
        <li><b>columnGrouping</b>: Set to true to skip header column groupings.</li>
        <li><b>skipGroups</b>: Set to true to skip row group headers and footers if grouping rows. No impact if not grouping rows.</li>
        <li><b>skipFooters</b>: Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping.</li>
        <li><b>fileName</b>: String to use as the file name. If missing, the file name 'export.xls' will be used.</li>
        <li><b>allColumns</b>: If true, all columns will be exported in the order they appear in columnDefs.
            Otherwise only the columns currently showing in the grid, and in that order, are exported.</li>
        <li><b>onlySelected</b>: Only export selected rows.</li>
        <li><b>onlySelectedAllPages</b>: Only export selected rows including other pages (only applicable when using pagination).</li>
        <li><b>columnKeys</b>: Provide a list (an array) of column keys to export specific columns.</li>
        <li><b>shouldRowBeSkipped</b>: Allows you to skip entire rows from the export.</li>
        <li><b>processCellCallback</b>: Allows you to process (typically format) cells for the export.</li>
        <li><b>processHeaderCallback</b>: Allows you to create custom header values for the export.</li>
    </ul>


    <h4>shouldRowBeSkipped()</h4>

    <p>This callback allows you to entirely skip a row to be exported. The example below has an option 'Skip Group R'
        which will entirely skip all the rows which Group=R.</p>

    <p>
        The callback params has the following attributes: node, api, context.
    </p>

    <h4>processCellCallback()</h4>

    <p>This callback allows you to format the cells for the export. The example below has an option 'Use Cell Callback'
        which puts all the items into upper case. This can be useful if, for example, you need to format date cells
        to be read by Excel.</p>

    <p>
        The callback params has the following attributes: value, node, column, api, columnApi, context.
    </p>

    <h4>processHeaderCallback()</h4>

    <p>If you don't like the header names the grid provides then you can provide your own header names. For example, you
        have grouped columns and you want to include the columns parent groups.</p>

    <p>
        The callback params has the following attributes: column, api, columnApi, context.
    </p>

    <p>
        You can assign default export parameters to your Excel export by setting the property <i>defaultExportParams</i>
        in your gridOptions. This is useful if you are planning the user to let export the data via the contextual menu.
    </p>

    <h3>
        What Gets Exported
    </h3>

    <p>
        The data in the grid, similar to <a href="../javascript-grid-export/#cellClassRules">CSV Export</a>, gets exported. However unlike <a href="../javascript-grid-export/#cellClassRules">CSV Export</a>, you also get to export styles.
        The details of how to specify styles with Excel are explained in the last example on this page.
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

    <h3>Example 1 - Export Without Styles</h3>

    <p>
        The example below demonstrates exporting the data without any styling. Note that the grid has CSS Class Rules
        for changing the background color of some cells. The Excel Export does not replicate the HTML styling. How
        to get similar formatting in your Excel is explained in the second example. The following items can be noted
        from the example:
    </p>

    <ul>
        <li>The column grouping is exported.</li>
        <li>Filtered rows are not included in the export.</li>
        <li>The sort order is maintained in the export.</li>
        <li>The order of the columns is maintained in the export.</li>
        <li>Only visible columns are exported.</li>
        <li>Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name)</li>
        <li>Aggregated values are exported.</li>
        <li>For groups, the first exported value (column) will always have the group key.</li>
    </ul>

    <show-example example="exampleExcel"></show-example>

    <h3>Export with Styles</h3>

    <p>
        The main reason to export to Excel instead of CSV is so that the look and feel remain as consistent as possible with your ag-Grid application. In order to
        simplify the configuration the Excel Export reuses the <a href="../javascript-grid-cell-styling/#cellClassRules">cellClassRules</a>
        and the <a href="../javascript-grid-cell-styling/#cellClass">cellClass</a> from the column definition.
        Whatever resultant class is applicable to the cell then is expected to be provided as an Excel Style to the
        ExcelStyles property in the <a href="../javascript-grid-properties/">gridOptions</a>.
    </p>

    <p>
        The configuration maps to the <a href="https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx">
        Microsoft Excel XML format</a>. This is why the configuration below deviates away from what is used elsewhere
        in ag-Grid.
    </p>

    <h4>Excel Style Definition</h4>

    <p>
        An Excel style object has the following properties:
    </p>

    <ul>
        <li><b>id</b> (mandatory): The id of the style, this has to be a unique string and has to match the name of the style from the <a href="../javascript-grid-cell-styling/#cellClassRules">cellClassRules</a></li>
        <li><b>alignment</b> (optional): Vertical and horizontal alignmen:<ul>
                <li>horizontal: String one of Automatic, Left, Center, Right, Fill, Justify, CenterAcrossSelection, Distributed, and JustifyDistributed</li>
                <li>indent: Number of indents</li>
                <li>readingOrder: String one of RightToLeft, LeftToRight, and Context</li>
                <li>rotate: Number. Specifies the rotation of the text within the cell. 90 is straight up, 0 is horizontal, and -90 is straight down</li>
                <li>shrinkToFit: Boolean. True means that the text size should be shrunk so that all of the text fits within the cell. False means that the font within the cell should behave normally</li>
                <li>vertical: String one of Automatic, Top, Bottom, Center, Justify, Distributed, and JustifyDistributed</li>
                <li>verticalText: Boolean. Specifies whether the text is drawn "downwards", whereby each letter is drawn horizontally, one above the other. </li>
                <li>wrapText: Boolean. Specifies whether the text in this cell should wrap at the cell boundary.
                    False means that text either spills or gets truncated at the cell boundary (depending on whether the adjacent cell(s) have content). </li>
            </ul>
        </li>
        <li><b>borders</b> (optional): All the 4 borders must be specified (explained in next section): <ul>
                <li>borderBottom</li>
                <li>borderLeft</li>
                <li>borderTop</li>
                <li>borderRight</li>
            </ul>
        </li>
        <li><b>font</b> (optional):  The color must be declared: <ul>
                <li>bold. Boolean</li>
                <li>color. A color in hexadecimal format</li>
                <li>fontName. String</li>
                <li>italic. Boolean</li>
                <li>outline. Boolean</li>
                <li>shadow. Boolean</li>
                <li>size. Number. Size of the font in points</li>
                <li>strikeThrough. Boolean.</li>
                <li>underline. One of None, Subscript, and Superscript.</li>
                <li>charSet. Number. Win32-dependent character set value.</li>
                <li>family. String. Win32-dependent font family. One of Automatic, Decorative, Modern, Roman, Script, and Swiss</li>
            </ul>
        </li>
        <li><b>interior</b> (optional): The color and pattern must be declared:
            <ul>
                <li><b>color</b>: A color in hexadecimal format</li>
                <li><b>pattern</b>: One of the following strings: None, Solid, Gray75, Gray50, Gray25, Gray125, Gray0625, HorzStripe, VertStripe, ReverseDiagStripe, DiagStripe, DiagCross, ThickDiagCross, ThinHorzStripe, ThinVertStripe, ThinReverseDiagStripe, ThinDiagStripe, ThinHorzCross, and ThinDiagCross</li>
                <li><b>patternColor</b>: A color in hexadecimal format</li>
            </ul>
        </li>
        <li><b>numberFormat</b> (optional): A javascript object with one property called format, this is any valid Excel format like: #,##0.00 (This formatting is used in the example below in the age column)
        </li>
        <li><b>protection</b> (optional): A javascript object with the following properties:
            <ul>
                <li><b>protected</b>: Boolean. This attribute indicates whether or not this cell is protected.
                    When the worksheet is unprotected, cell-level protection has no effect. When a cell is protected,
                    it will not allow the user to enter information into it.</li>
                <li><b>hideFormula</b>: Boolean. This attribute indicates whether or not this cell's formula should be hidden
                    when worksheet protection is enabled.</li>
            </ul>
        </li>
</ul>

    <h4>Excel borders</h4>
    <p>
        The borderBottom, borderLeft, borderTop, borderRight properties are objects composed of the following mandatory properties:
    </p>

    <ul>
        <li><b>lineStyle</b>: One of the following strings: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double.</li>
        <li><b>weight</b>: A number representing the thickness of the border in pixels.</li>
        <li><b>color</b>: A color in hexadecimal format.</b></li>
    </ul>


    <h4>Excel Style Definition Example</h4>
    <pre>
var columnDef = {
    ...,
    <span class="codeComment">// The same cellClassRules and cellClass can be used for CSS and Excel</span>
    cellClassRules: {
        greenBackground: function(params) { return params.value < 23}
    },
    cellClass: 'redFont'
}

<span class="codeComment">// In this example we can see how we merge the styles in Excel.</span>
<span class="codeComment">// Everyone less than 23 will have a green background, and a light green color font (#e0ffc1)</span>
<span class="codeComment">// also because redFont is set in cellClass, it will always be applied</span>

var gridOptions = {
    ...,
    ExcelStyles: [
        <span class="codeComment">// The base style, red font.</span>
        {
            id: "redFont",
            interior: {
                color: "#FF0000", pattern: 'Solid'
            }
        },
        <span class="codeComment">// The cellClassStyle: background is green and font color is light green,</span>
        <span class="codeComment">// note that since this excel style it's defined after redFont</span>
        <span class="codeComment">// it will override the red font color obtained through cellClass:'red'</span>
        {
            id: "greenBackground",
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
        }

    ]
}

    </pre>

    <h4>Resolving Excel Styles</h4>

    <p>
        All the defined classes from <a href="../javascript-grid-cell-styling/#cellClass">cellClass</a> and all the classes resultant of evaluating
        the <a href="../javascript-grid-cell-styling/#cellClassRules">cellClassRules</a>
        are applied to each cell when exporting to Excel.
        Normally these styles map to CSS classes when the grid is doing normal rendering. In Excel Export, the styles are mapped against the Excel styles
        that you have provided. If more than one Excel style is found, the results are merged (similar to how CSS classes
        are merged by the browser when multiple classes are applied).
    </p>

    <p>
        Headers are a special case, headers are exported to Excel as normal rows, so in order to allow you to style them
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
        Some of the most likely errors you can encounter when exporting to Excel are:
        <ul>
            <li>Not specifying all the attributes of an Excel Style property. If you specify the interior for an
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
            <li>Styles can be combined it a similar fashion than CSS, this can be seen in the column age where athletes less than 20 years old get two styles applied (greenBackground and redFont)</li>
            <li>A default columnDef containing cellClassRules can be specified and it will be exported to Excel.
                You can see this is in the styling of the oddRows of the grid (boldBorders)</li>
            <li>Its possible to export borders as specified in the gold column (boldBorders)</li>
            <li>If a cell has an style but there isn't an associated Excel Style defined, the style for that cell won't
                get exported. This is the case in this example of the year column which has the style notInExcel, but since
                it hasn't been specified in the gridOptions, the column then gets exported without formatting.</li>
            <li>Note that there is an Excel Style with name and id header that gets automatically applied to the ag-Grid headers when exported to Excel</li>
            <li>As you can see in the column "Group", the Excel styles can be combined into cellClassRules and cellClass</li>
            <li>Note that there are specific to Excel styles applied, the age column has a number formatting style applied
                and the group column uses italic and bold font</li>
        </ul>
    </p>

    <show-example example="exampleExcelStyles"></show-example>

<?php include '../documentation-main/documentation_footer.php';?>