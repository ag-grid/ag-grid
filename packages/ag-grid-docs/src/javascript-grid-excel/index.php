<?php
$pageTitle = "Excel Export: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Excel Export. Export in native Excel Format which will maintain the column widths and also allow exporting of styles. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "JavaScript Grid Excel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">JavaScript Grid Excel</h1>

    <h2>Exporting ag-Grid Data to Excel</h2>

    <p>
        Excel Export allows exporting ag-Grid data to Excel using Excel's own XML format. Using this format
        allows for rich Excel files to be created with the following:
</p>

        <ol class="content">
            <li>The column width from your grid is exported to Excel, so the columns in Excel will have the same width as your web application</li>
            <li>You can specify Excel styles (colors, fonts, borders etc) to be included in the Excel file.</li>
            <li>The data types of your columns are passed to Excel as part of the export so that if you can to work with the data within Excel in the correct format.</li>
            <li>The cells of the column header groups are merged in the same manner as the group headers in ag-Grid.</li>
        </ol>

    <note>If you want to disable Excel export, you can set the property <code>suppressExcelExport = true</code> in your
    <code>gridOptions</code></note>

    <h2>API</h2>

    <p>
        The export is performed by calling the following API. Note that this API is similar to the <a href="../javascript-grid-export/#cellClassRules">CSV Export</a> API,
        so you can use similar config for both.
    </p>

    <ul class="content">
        <li><code>exportDataAsExcel(params)</code>: Does the full export and triggers the download of the file in the browser automatically so the user can open immediately.</li>
        <li><code>getDataAsExcel(params)</code>: Returns the Excel XML that represents the export performed by
            <code>exportDataAsExcel(params)</code>. This can then be used by your web application, e.g. to send the data to the
            server for storing or sending via email etc.</li>
    </ul>

    <p>
        Each of these methods takes an optional params object that can take the following:
    </p>

    <ul class="content">
        <li><code>skipHeader</code>: Set to true if you don't want the first line to be column header names.</li>
        <li><code>columnGroups</code>: Set to true to include header column groupings.</li>
        <li><code>skipGroups</code>: Set to true to skip row group headers and footers if grouping rows. No impact if not grouping rows.</li>
        <li><code>skipFooters</code>: Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping.</li>
        <li><code>fileName</code>: String to use as the file name. If missing, the file name 'export.xls' will be used.</li>
        <li><code>allColumns</code>: If true, all columns will be exported in the order they appear in columnDefs.
            Otherwise only the columns currently showing in the grid, and in that order, are exported.</li>
        <li><code>onlySelected</code>: Only export selected rows.</li>
        <li><code>onlySelectedAllPages</code>: Only export selected rows including other pages (only applicable when using pagination).</li>
        <li><code>columnKeys</code>: Provide a list (an array) of column keys to export specific columns.</li>
        <li><code>shouldRowBeSkipped</code>: Allows you to skip entire rows from the export.</li>
        <li><code>processCellCallback</code>: Allows you to process (typically format) cells for the export.</li>
        <li><code>processHeaderCallback</code>: Allows you to create custom header values for the export.</li>
        <li><code>customHeader</code>: If you want to put some rows at the top of the xls file, stick it here.
            The format of this rows is specified below in the section custom rows.</li>
        <li><code>customFooter</code>: Same as customHeader, but for the end of the file.</li>
        <li><code>sheetName</code>: The name of the sheet in excel where the grid will get exported. If not specified defaults to 'ag-grid'.</li>
        <li><code>suppressTextAsCDATA</code>: Since v17 the default behaviour of exporting text is to include CDATA tags to avoid any text
            parsing issues, but if this is incompatible to you current approach, you can switch this off by setting this to true.</li>
    </ul>


    <h3><code>shouldRowBeSkipped()</code></h3>

    <p>This callback allows you to entirely skip a row to be exported. The example below has an option 'Skip Group R'
        which will entirely skip all the rows which Group=R.</p>

    <p>
        The callback params has the following attributes: node, api, context.
    </p>

    <h3><code>processCellCallback()</code></h3>

    <p>This callback allows you to format the cells for the export. The example below has an option 'Use Cell Callback'
        which puts all the items into upper case. This can be useful if, for example, you need to format date cells
        to be read by Excel.</p>

    <p>
        The callback params has the following attributes: value, node, column, api, columnApi, context.
    </p>

    <h3><code>processHeaderCallback()</code></h3>

    <p>If you don't like the header names the grid provides then you can provide your own header names. For example, you
        have grouped columns and you want to include the columns parent groups.</p>

    <p>
        The callback params has the following attributes: column, api, columnApi, context.
    </p>

    <p>
        You can assign default export parameters to your Excel export by setting the property <code>defaultExportParams</code>
        in your gridOptions. This is useful if you are planning the user to let export the data via the contextual menu.
    </p>

    <h3>Custom rows</h3>

    <p>You can pass your custom rows in the properties <code>customHeader</code> amd <code>customFooter</code>. This properties are
        expected to contain an array of array of ExcelCell objects, which itself contains ExcelData objects. </p>

    <p>Each item in the array is considered to be a row in the excel export</p>

    <p>Find below the definition of these interfaces and an example</p>

    <?php include 'customRowProperties.php' ?>

     <h4>ExcelCell</h4>
    <?php printPropertiesTable($excelCell) ?>


    <h4>ExcelData</h4>
    <?php printPropertiesTable($excelData) ?>

    <h4>Example</h4>
    <p>The following example shows 4 custom rows, note that:</p>

    <ul class="content">
        <li>The first and the last row are empty '[]'</li>
        <li>The second row spans 2 columns</li>
        <li>The third row has 2 cells. The first cell is a label (string) and the second one a total (number)</li>
        <li>All cells have styles associated. These styles need to be specified as part of the <code>gridOptions</code>. See
        below 'Export with Styles'
        </li>
    </ul>

    <snippet>
[
    [],
    [{styleId:'bigHeader', data:{type:'String', value:'Summary'}}],
    [
        {styleId:'label', data:{type:'String', value:'Sales'}, mergeAcross:2},
        {styleId:'amount', data:{type:'Number', value:'3695.36'}}
    ],
    []
]</snippet>

    <h2> What Gets Exported </h2> 

    <p>
        The data in the grid, similar to <a href="../javascript-grid-export/#cellClassRules">CSV Export</a>, gets exported. However unlike <a href="../javascript-grid-export/#cellClassRules">CSV Export</a>, you also get to export styles.
        The details of how to specify styles with Excel are explained in the last example on this page.
    <p>

    <p>Regardless, the following needs to be taken into consideration</p>

    <ul class="content">
        <li>The raw values, and not the result of cell renderer, will get used, meaning:
            <ul class="content">
                <li>Cell Renderers will NOT be used.</li>
                <li>Value Getters will be used.</li>
                <li>Cell Formatters will NOT be used (use <code>processCellCallback</code> instead).</li>
            </ul>
        </li>
        <li>If row grouping, all data will be exported regardless of groups open or closed.</li>
        <li>If row grouping with footers (groupIncludeFooter=true) the footers will NOT be used -
            this is a GUI addition that happens for displaying the data in the grid.</li>
    </ul>

    <h2>Example 1 - Export Without Styles</h2>

    <p>
        The example below demonstrates exporting the data without any styling. Note that the grid has CSS Class Rules
        for changing the background color of some cells. The Excel Export does not replicate the HTML styling. How
        to get similar formatting in your Excel is explained in the second example. The following items can be noted
        from the example:
    </p>

    <ul class="content">
        <li>The column grouping is exported.</li>
        <li>Filtered rows are not included in the export.</li>
        <li>The sort order is maintained in the export.</li>
        <li>The order of the columns is maintained in the export.</li>
        <li>Only visible columns are exported.</li>
        <li>Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name)</li>
        <li>Aggregated values are exported.</li>
        <li>For groups, the first exported value (column) will always have the group key.</li>
    </ul>

    <?= example('Excel Export Without Styles', 'excel-export-without-styles', 'generated', array("enterprise" => 1)) ?>

    <h2>Export with Styles</h2>

    <p>
        The main reason to export to Excel instead of CSV is so that the look and feel remain as consistent as possible with your ag-Grid application. In order to
        simplify the configuration the Excel Export reuses the <a href="../javascript-grid-cell-styles/#cellClassRules">cellClassRules</a>
        and the <a href="../javascript-grid-cell-styles/#cellClass">cellClass</a> from the column definition.
        Whatever resultant class is applicable to the cell then is expected to be provided as an Excel Style to the
        ExcelStyles property in the <a href="../javascript-grid-properties/">gridOptions</a>.
    </p>

    <p>
        The configuration maps to the <a href="https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx">
        Microsoft Excel XML format</a>. This is why the configuration below deviates away from what is used elsewhere
        in ag-Grid.
    </p>

    <h2>Excel Style Definition</h2>

    <p>
        An Excel style object has the following properties:
    </p>

    <ul class="content">
        <li><code>id</code> (mandatory): The id of the style, this has to be a unique string and has to match the name of the style from the <a href="../javascript-grid-cell-styles/#cellClassRules">cellClassRules</a></li>
        <li><code>alignment</code> (optional): Vertical and horizontal alignmen:<ul class="content">
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
        <li><code>borders</code> (optional): All the 4 borders must be specified (explained in next section): <ul class="content">
                <li>borderBottom</li>
                <li>borderLeft</li>
                <li>borderTop</li>
                <li>borderRight</li>
            </ul>
        </li>
        <li><code>font</code> (optional):  The color must be declared: <ul class="content">
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
        <li><code>interior</code> (optional): The color and pattern must be declared:
            <ul class="content">
                <li><code>color</code>: A color in hexadecimal format</li>
                <li><code>pattern</code>: One of the following strings: None, Solid, Gray75, Gray50, Gray25, Gray125, Gray0625, HorzStripe, VertStripe, ReverseDiagStripe, DiagStripe, DiagCross, ThickDiagCross, ThinHorzStripe, ThinVertStripe, ThinReverseDiagStripe, ThinDiagStripe, ThinHorzCross, and ThinDiagCross</li>
                <li><code>patternColor</code>: A color in hexadecimal format</li>
            </ul>
        </li>
        <li><code>numberFormat</code> (optional): A javascript object with one property called format, this is any valid Excel format like: #,##0.00 (This formatting is used in the example below in the age column)
        </li>
        <li><code>protection</code> (optional): A javascript object with the following properties:
            <ul class="content">
                <li><code>protected</code>: Boolean. This attribute indicates whether or not this cell is protected.
                    When the worksheet is unprotected, cell-level protection has no effect. When a cell is protected,
                    it will not allow the user to enter information into it.</li>
                <li><code>hideFormula</code>: Boolean. This attribute indicates whether or not this cell's formula should be hidden
                    when worksheet protection is enabled.</li>
            </ul>
        </li>
        <li><code>dataType</code> (optional): One of (string, number, boolean, dateTime, error). In most cases this is not necessary since this value is
            guessed based in weather the cell content is numeric or not. This is helpful if you want to fix the type of the
            cell. ie. If your cell content is 003, this cell will be default be interpreted as numeric, and in Excel, it will
            show up as 3. But if you want to keep your original formatting, you can do so by setting this property to string.
        </li>
</ul>

    <h2>Excel borders</h2>

    <p>
        The borderBottom, borderLeft, borderTop, borderRight properties are objects composed of the following mandatory properties:
    </p>

    <ul class="content">
        <li><code>lineStyle</code>: One of the following strings: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double.</li>
        <li><code>weight</code>: A number representing the thickness of the border in pixels.</li>
        <li><code>color</code>: A color in hexadecimal format.</code></li>
    </ul>


    <h2>Excel Style Definition Example</h2>

    <snippet>
var columnDef = {
    ...,
    // The same cellClassRules and cellClass can be used for CSS and Excel
    cellClassRules: {
        greenBackground: function(params) { return params.value &lt; 23}
    },
    cellClass: 'redFont'
}

// In this example we can see how we merge the styles in Excel.
// Everyone less than 23 will have a green background, and a light green color font (#e0ffc1)
// also because redFont is set in cellClass, it will always be applied

var gridOptions = {
    ...,
    ExcelStyles: [
        // The base style, red font.
        {
            id: "redFont",
            interior: {
                color: "#FF0000", pattern: 'Solid'
            }
        },
        // The cellClassStyle: background is green and font color is light green,
        // note that since this excel style it's defined after redFont
        // it will override the red font color obtained through cellClass:'red'
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

   </snippet>

    <h2>Resolving Excel Styles</h2>

    <p>
        All the defined classes from <a href="../javascript-grid-cell-styles/#cellClass">cellClass</a> and all the classes resultant of evaluating
        the <a href="../javascript-grid-cell-styles/#cellClassRules">cellClassRules</a>
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

    <h2>Dealing With Errors In Excel</h2>

    <p>
        If you get an error when opening the Excel file, the most likely reason is that there is an error in the definition of the styles.
        If that is the case, since the generated xls file is a plain XML text file, we recommend you to edit the contents manually
        and see if any of the styles specified have any error according to the <a href="https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx">
        Microsoft specification for the Excel XML format</a>.
    </p>

    <p>
        Some of the most likely errors you can encounter when exporting to Excel are:
    </p>

        <ul class="content">
            <li>Not specifying all the attributes of an Excel Style property. If you specify the interior for an
                Excel style and don't provide a pattern, just color, Excel will fail to open the spreadsheet</li>
            <li>Using invalid characters in attributes, we recommend you not to use special characters.</li>
            <li>Not specifying the style associated to a cell, if a cell has an style that is not passed as part of the
                grid options, Excel won't fail opening the spreadsheet but the column won't be formatted.</li>
            <li>Specifying an invalid enumerated property. It is also important to realise that Excel is case sensitive,
            so Solid is a valid pattern, but SOLID or solid are not</li>
        </ul>

    <h2> Example 2 - Export With Styles </h2>

    <p>
        This example illustrates the following features from the Excel export.
    </p>
        <ul class="content">
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
            <li>
                The silver column has a style with <code>dataType=string</code>. This forces this column to be rendered as text in
                Excel even though all of their cells are numeric
            </li>
        </ul>

    <?= example('Excel Export With Styles', 'excel-export-with-styles', 'generated', array("enterprise" => 1)) ?>

    <h2> Example 3 - Data types </h2> 

    <p>
        The following example demonstrates how to use other data types for your export. Note that:
    </p>

    <ul class="content">
        <li>Boolean works off using 1 for true</li>
        <li>The date time format for excel follows this format yyyy-mm-ddThh:MM:ss.mmm: </li>
        <li>If you try to pass data that is not compatible with the underlying data type Excel will throw an error</li>
        <li>When using <code>dataType: 'dateTime'</code> Excel doesn't format the resultant value, in this example
        it shows 39923. You need to add the formatting inside Excel</li>
    </ul>

    <?= example('Excel Data Typs', 'excel-data-types', 'generated', array("enterprise" => 1)) ?>

    <h2>
        Exporting To XLSX
    </h2>
    <p>
        The xls files that we create are based on
        <a href="https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx">Excel own XML specification</a>. This
        is not compatible with the xlsx format, which is the preferred format of newer MS Excel versions.
    </p>
        Because of that when you open one of our exported files in a recent MS office version you might see this error:
    </p>

    <p>
        <img src="/images/excel_error.png" class="img-fluid">
    </p>

    </p>
    If you want to export to xlsx, you can reuse the XML that we generate and pass it onto a third
    party library that would convert it into XLSX.
    </p>
    </p>
    As specified in the API section above, <code>api.getDataAsExcel(params)</code> is the method that you need to call to
    obtain the XML that we generate
    </p>
    </p>
    The following example shows how this can be achieved by using <a href="http://sheetjs.com/" target="_blank">SheetJs</a>
    </p>

    <h2> SheetJs Custom XLSX Export Example - Without styles </h2>

    <p> In the following example note that: </p>

    <ul class="content">
        <li><a href="http://sheetjs.com/" target="_blank">sheetJs</a> Is included as a third party library</li>
        <li>
            The "Export to Excel (xlsx)" button reuses the XML and passes it to sheetJs to generate a xlsx
<snippet>

    var content = gridOptions.api.getDataAsExcel(params);
    var workbook = XLSX.read(content, {type: 'binary'});
    var xlsxContent = XLSX.write(workbook, {bookType: 'xlsx', type: 'base64'});</snippet>

</li>
        </li>
        <li>The CDATA tags for text columns have been disabled (This is not compatible with sheetJs) <code>defaultExportParams.suppressTextAsCDATA = true</code></li>
        <li>There is some code to handle the conversion from base64 to blob adapted from
            <a href="http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript">stackOverflow</a></li>
        <li>There is some code to handle the download of the blob:
<snippet>
function download (params, content){
    var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
    var fileName = fileNamePresent ? params.fileName : 'noWarning.xlsx';


    var blobObject = b64toBlob(content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');


    if (window.navigator.msSaveOrOpenBlob) {
        // Internet Explorer
        window.navigator.msSaveOrOpenBlob(blobObject, fileName);
    } else {
        // Chrome
        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blobObject);
        downloadLink.download = fileName;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
}</snippet></li>
    <li>Note that this example doesnt't import the styles to xls. To add styling to the xlsx, the logic could be extended
        to read the XML styling information received from
        <code>gridOptions.api.getDataAsExcel(params)</code>, and it could thn be passed into SheetJs through the object returned by
        <code>XLSX.read(content, {type: 'binary'})</code>. The reason this example is not exporting styles is because that it will
        go beyond of the purpose of demonstrating that you can reuse the XML we provide anyway you want.
    </li>
    </ul>

    <?= example('Custom XLSX', 'custom-xlsx', 'generated', array("enterprise" => 1, "extras" => array('xlsx'))) ?>

    <h2>Export to Excel with iPad</h2>

    <p>
        It is not possible to download files directly from JavaScript to an iPad. This is a restriction
        on iOS and not something wrong with ag-Grid. For this reason, the download links in the context
        menu are removed when running on iPad. If you do want to download on iPad, then it is recommended
        you use the api function <code>getDataAsCsv()</code> to get the export data and then send this
        to the server to allow building an endpoint for doing the download.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>