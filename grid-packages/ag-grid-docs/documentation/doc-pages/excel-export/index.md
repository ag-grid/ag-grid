---
title: "Excel Export"
enterprise: true
---

Excel Export allows exporting AG Grid data to Excel using Open XML format (xlsx) or Excel's own XML format. The export can be initiated with with an API call or by using the right-click context menu on the Grid.

[[note]]
| This page covers Excel-specific features such as styling. For information on how to control what data is included in the export
| and to format/transform the data as it is exported, see the [Export documentation](../export/).

Using this format allows for rich Excel files to be created with the following:


1. The column width in Excel will be the same as the actual width of the column in the application at the time that the export happens, or 75px, whichever is wider. "Actual width" may be different from the width in the column definition if column has been resized or uses flex sizing. This can be overridden using the `columnWidth` export parameter.

1. You can specify Excel styles (colors, fonts, borders etc) to be included in the Excel file.

1. The data types of your columns are passed to Excel as part of the export so that if you can to work with the data within Excel in the correct format.
1. The cells of the column header groups are merged in the same manner as the group headers in AG Grid.

## API

### Grid Properties

<api-documentation source='grid-properties/properties.json' section='miscellaneous' names='["suppressExcelExport"]'></api-documentation>

### Grid API

<api-documentation source='grid-api/api.json' section='export' names='["exportDataAsExcel(params)", "getDataAsExcel(params)"]'></api-documentation>

The `params` object can contain all the [common export options](../export/), as well as these Excel-specific options:

<api-documentation source='excel-export/resources/excel.json' section='exportProperties'></api-documentation>

## Defining styles

The main reason to export to Excel instead of CSV is so that the look and feel remain as consistent as possible with your AG Grid application. In order to simplify the configuration the Excel Export reuses the [cellClassRules](../cell-styles/#cell-class-rules) and the [cellClass](../cell-styles/#cell-class) from the column definition. Whatever resultant class is applicable to the cell then is expected to be provided as an Excel Style to the `excelStyles` property in the [gridOptions](../grid-properties/).

An Excel style object has the following properties:

- `id` (mandatory): The id of the style, this has to be a unique string and has to match the name of the style from the [cellClassRules](../cell-styles/#cell-class-rules)

- `alignment` (optional): Vertical and horizontal alignment:
    - horizontal: String one of Automatic, Left, Center, Right, Fill, Justify, CenterAcrossSelection, Distributed, and JustifyDistributed
    - indent: Number of indents
    - readingOrder: String one of RightToLeft, LeftToRight, and Context
    - rotate: Number. Specifies the rotation of the text within the cell. Values range between 0 and 180.
    - shrinkToFit: Boolean. True means that the text size should be shrunk so that all of the text fits within the cell. False means that the font within the cell should behave normally
    - vertical: String one of Automatic, Top, Bottom, Center, Justify, Distributed, and JustifyDistributed
    - wrapText: Boolean. Specifies whether the text in this cell should wrap at the cell boundary. False means that text either spills or gets truncated at the cell boundary (depending on whether the adjacent cell(s) have content).

- `borders` (optional): All the 4 borders must be specified (explained in next section):
    - borderBottom
    - borderLeft
    - borderTop
    - borderRight

- `font` (optional):  The color must be declared:
    - bold. Boolean
    - color. A color in hexadecimal format
    - fontName. String
    - italic. Boolean
    - outline. Boolean
    - shadow. Boolean
    - size. Number. Size of the font in points
    - strikeThrough. Boolean.
    - underline. One of None, Subscript, and Superscript.
    - charSet. Number. Win32-dependent character set value.
    - family. String. Win32-dependent font family. One of Automatic, Decorative, Modern, Roman, Script, and Swiss

- `interior` (optional): The color and pattern must be declared:
    - `color`: A color in hexadecimal format
    - `pattern`: One of the following strings: None, Solid, Gray75, Gray50, Gray25, Gray125, Gray0625, HorzStripe, VertStripe, ReverseDiagStripe, DiagStripe, DiagCross, ThickDiagCross, ThinHorzStripe, ThinVertStripe, ThinReverseDiagStripe, ThinDiagStripe, ThinHorzCross, and ThinDiagCross
    - `patternColor`: A color in hexadecimal format

- `numberFormat` (optional): A javascript object with one property called format, this is any valid Excel format like: #,##0.00 (This formatting is used in the example below in the age column)

- `protection` (optional): A javascript object with the following properties:
    - `protected`: Boolean. This attribute indicates whether or not this cell is protected. When the worksheet is unprotected, cell-level protection has no effect. When a cell is protected, it will not allow the user to enter information into it. Note that in Excel, the default for cells with no protection style is to be protected, so you must explicitly disable protection if it is not desired.
    - `hideFormula`: Boolean. This attribute indicates whether or not this cell's formula should be hidden when worksheet protection is enabled.

- `dataType` (optional): One of (string, number, boolean, dateTime, error). In most cases this is not necessary since this value is guessed based in weather the cell content is numeric or not. This is helpful if you want to fix the type of the cell. ie. If your cell content is 003, this cell will be default be interpreted as numeric, and in Excel, it will show up as 3. But if you want to keep your original formatting, you can do so by setting this property to string.

## Excel borders

The borderBottom, borderLeft, borderTop, borderRight properties are objects composed of the following mandatory properties:

- `lineStyle`: One of the following strings: "None", "Continuous", "Dash", "Dot", "DashDot", "DashDotDot", "SlantDashDot", and "Double".
- `weight`: A number representing the thickness of the border in pixels.
    0. hair
    1. thin
    2. medium
    3. thick

    Note: for "Continuous" lines, all 4 weights are valid. "Dash", "DashDot" and "DashDotDot" accept weight 0 (default) and weight 2 (medium). Weight is not used for the other line styles.
- `color`: A color in hexadecimal format.

## Excel Style Definition Example

The example below demonstrates how to merge the styles in Excel. Everyone less than 23 will have a green background, and
a light green color font (#e0ffc1) also because redFont is set in cellClass, it will always be applied

<snippet>
const gridOptions = {
    columnDefs: [
        {
            // The same cellClassRules and cellClass can be used for CSS and Excel
            cellClassRules: {
                greenBackground: params => params.value > 23,
            },
            cellClass: 'redFont'
        }
    ],
    excelStyles: [
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

## Resolving Excel Styles


All the defined classes from [cellClass](../cell-styles/#cell-class) and all the classes resulting from evaluating the [cellClassRules](../cell-styles/#cell-class-rules) are applied to each cell when exporting to Excel. Normally these styles map to CSS classes when the grid is doing normal rendering. In Excel Export, the styles are mapped against the Excel styles that you have provided. If more than one Excel style is found, the results are merged (similar to how CSS classes are merged by the browser when multiple classes are applied).

Headers are a special case, headers are exported to Excel as normal rows, so in order to allow you to style them you can provide an ExcelStyle with id and name "header". If you do so, the headers.

## Example: Export Without Styles

- The column grouping is exported.
- Filtered rows are not included in the export.
- The sort order is maintained in the export.
- The order of the columns is maintained in the export.
- Only visible columns are exported.
- Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name).
- Aggregated values are exported.
- For groups, the first exported value (column) will always have the group key.

<grid-example title='Excel Export Without Styles' name='excel-export-without-styles' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

## Example: Export With Styles

- Cells with only one style will be exported to Excel, as you can see in the Country and Gold columns

- Styles can be combined it a similar fashion than CSS, this can be seen in the column age where athletes less than 20 years old get two styles applied (greenBackground and redFont)

- A default columnDef containing cellClassRules can be specified and it will be exported to Excel. You can see this is in the styling of the oddRows of the grid (boldBorders)

- Its possible to export borders as specified in the gold column (boldBorders)
- If a cell has an style but there isn't an associated Excel Style defined, the style for that cell won't get exported. This is the case in this example of the year column which has the style notInExcel, but since it hasn't been specified in the gridOptions, the column then gets exported without formatting.

- Note that there is an Excel Style with name and id header that gets automatically applied to the AG Grid headers when exported to Excel

- As you can see in the column "Group", the Excel styles can be combined into cellClassRules and cellClass

- Note that there are specific to Excel styles applied, the age column has a number formatting style applied and the group column uses italic and bold font

- The silver column has a style with `dataType=string`. This forces this column to be rendered as text in Excel even though all of their cells are numeric

<grid-example title='Excel Export With Styles' name='excel-export-with-styles' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

## Example: Styling Row Groups

By default, row groups are exported with the names of each node in the hierarchy combined together, like <span style="white-space: nowrap">"-> Parent -> Child"</span>. If you prefer to use indentation to indicate hierarchy like the Grid user interface does, you can achieve this by combining `colDef.cellClass` and `processRowGroupCallback`:

<grid-example title='Styling Row Groups' name='styling-row-groups' type='generated' options='{ "enterprise": true }'></grid-example>

## Dealing With Errors In Excel

If you get an error when opening the Excel file, the most likely reason is that there is an error in the definition of the styles. If that is the case, we recommend that you remove all style definitions from your configuration and add them one-by-one until you find the definition that is causing the error.

Some of the most likely errors you can encounter when exporting to Excel are:

- Not specifying all the attributes of an Excel Style property. If you specify the interior for an Excel style and don't provide a pattern, just color, Excel will fail to open the spreadsheet

- Using invalid characters in attributes, we recommend you not to use special characters.

- Not specifying the style associated to a cell, if a cell has an style that is not passed as part of the grid options, Excel won't fail opening the spreadsheet but the column won't be formatted.

- Specifying an invalid enumerated property. It is also important to realise that Excel is case sensitive, so Solid is a valid pattern, but SOLID or solid are not.

## Example: Data types

The following example demonstrates how to use other data types for your export. Note that:

- Boolean works off using 1 for true
- The date time format for excel follows this format yyyy-mm-ddThh:MM:ss.mmm:
- If you try to pass data that is not compatible with the underlying data type Excel will throw an error
- When using `dataType: 'dateTime'` Excel doesn't format the resultant value, in this example it shows 39923. You need to add the formatting inside Excel

<grid-example title='Excel Data Types' name='excel-data-types' type='generated' options='{ "enterprise": true, "exampleHeight": 200 }'></grid-example>

