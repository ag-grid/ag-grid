---
title: "Excel Export - Styles"
enterprise: true
---

Excel Export provides a special mechanism to add styles to the exported spreadsheet that works independently of the styles applied to the grid.

## Defining styles

The main reason to export to Excel with styles is so that the look and feel remain as consistent as possible with your AG Grid application. In order to simplify the configuration, the Excel Export reuses the [cellClassRules](/cell-styles/#cell-class-rules), the [cellClass](/cell-styles/#cell-class) and the [headerClass](/column-properties/#reference-header-headerClass) from the column definition. Whatever resultant class is applicable to the cell then is expected to be provided as an Excel Style to the `excelStyles`: [ExcelStyle[]](/excel-export-api/#excelstyle) property in the [gridOptions](/grid-options/).

## Resolving Excel Styles

All the defined classes from [cellClass](/cell-styles/#cell-class) and all the classes resulting from evaluating the [cellClassRules](/cell-styles/#cell-class-rules) are applied to each cell, while the resulting classes from [headerClass](/column-properties/#reference-header-headerClass) will be applied to each header cell when exporting to Excel. Normally these styles map to CSS classes when the grid is doing normal rendering. In Excel Export, the styles are mapped against the Excel styles that you have provided. If more than one Excel style is found, the results are merged (similar to how CSS classes are merged by the browser when multiple classes are applied).

## Excel Style Definition Example

The example below demonstrates how to merge the styles in Excel. Everyone less than 23 will have a green background, and a light green color font (`#e0ffc1`) also because redFont is set in cellClass, it will always be applied.

[[note]]
| The ExcelStyle id `cell` is applied to every cell that is **not** a header, and it's useful if you need a style to be applied to all cells.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            // The same cellClassRules and cellClass can be used for CSS and Excel
            cellClassRules: {
                greenBackground: params => params.value < 23,
            },
            cellClass: 'redFont'
        }
    ],
    excelStyles: [
        // The base style, red font.
        {
            id: "redFont",
            font: {
                color: '#ff0000',
            },
        },
        // The cellClassStyle: background is green and font color is light green,
        // note that since this excel style it's defined after redFont
        // it will override the red font color obtained through cellClass:'red'
        {
            id: "greenBackground",
            alignment: {
                horizontal: 'Right', vertical: 'Bottom'
            },
            font: { color: "#e0ffc1"},
            interior: {
                color: "#008000", pattern: 'Solid'
            }
        },
        {
            id: "cell",
            alignment: {
                vertical: "Center"
            }
        }
    ]
}
</snippet>

## Example: Export With Styles

Note the following:

- An Excel Style with id `cell` gets automatically applied to all cells (**not headers**) when exported to Excel.

- All cells will be vertically aligned to the middle due to Excel Style id `cell`.

- Styles can be combined it a similar fashion to CSS, this can be seen in the column **age** where athletes less than 20 years old get two styles applied (greenBackground and redFont).

- A default columnDef containing cellClassRules can be specified and it will be exported to Excel. You can see this is in the styling of the `darkGreyBackground` being applied to `even` rows.

- If a cell has a style but there isn't an associated Excel Style defined, the style for that cell won't get exported. This is the case in this example of the year column which has the style notInExcel, but since it hasn't been specified in the gridOptions, the column then gets exported without formatting.

- As you can see in the column **Group**, the Excel styles can be combined into cellClassRules and cellClass

- Note that there are specific to Excel styles applied - the age column has a conditional number formatting styling applied: age values less than `23` have a green background applied, and age values less than `20` are using red italic underlined font.

<grid-example title='Excel Export - Styles' name='excel-export-with-styles' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel"] }'></grid-example>

## Styling Headers

Similarly to styling cells, the grid will use the result of [headerClass](/column-properties/#reference-header-headerClass) from the column definition to style the grid headers.

Default Column Header Export Styles:

- An Excel Style with id `header` gets automatically applied to all (grouped and not grouped) AG Grid headers when exported to Excel.
- An Excel Style with id `headerGroup` gets automatically applied to the AG Grid grouped headers when exported to Excel.

You can define custom styles to apply to specific column headers when exported to Excel. In the example below, export to Excel and note:

- All column headers will be vertically aligned to the middle, have a grey background colour of `#f8f8f8` and an orange bottom border bottom of colour `#ffab00` due to the Excel Style id `header`.

- All grouped headers will have a bold font due to Excel Style id `headerGroup`.

- The Gold column header will have a gold-like background color.

- The Silver column header will have a silver-like background color.

- The Bronze column header will have a bronze-like background color.

- All column header rows have a height of **30px**.

<grid-example title='Excel Export - Header Styles' name='excel-export-with-header-styles' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel"] }'></grid-example>

## Example: Styling Row Groups

By default, row groups are exported with the names of each node in the hierarchy combined together, like <span style="white-space: nowrap">"-> Parent -> Child"</span>. If you prefer to use indentation to indicate hierarchy like the Grid user interface does, you can achieve this by combining `autoGroupColumnDef.cellClass` and `processRowGroupCallback`:

```ts
processRowGroupCallback(params: ProcessRowGroupForExportParams): string {
    // Discard the `->` added by default, and render the original key.
    return params.node.key;
}
```

```ts
    autoGroupColumnDef: {
        cellClass: getIndentClass
        //...
    }
    excelStyles: [
        {
            id: 'indent-1',
            alignment: {
                indent: 1
            },
            // note, dataType: 'String' required to ensure that numeric values aren't right-aligned
            dataType: 'String'
        },
        //...
    ]
    //...
```

```ts
getIndentClass(params: CellClassParams): string[] | string {
    const node = params.node;

    let indent = 0;
    while (node && node.parent) {
        indent++;
        node = node.parent;
    }

    return `indent-${indent}`;
}
```

<grid-example title='Excel Export - Styling Row Groups' name='excel-export-styling-row-groups' type='generated' options='{  "enterprise": true, "modules": ["clientside", "menu", "excel", "rowgrouping"]}'></grid-example>

## Handling Excel Style Errors

If you get an error when opening the Excel file, the most likely reason is that there is an error in the definition of the styles. If that is the case, we recommend that you remove all style definitions from your configuration and add them one-by-one until you find the definition that is causing the error.

Some of the most likely errors you can encounter when exporting to Excel are:

- Not specifying all the attributes of an Excel Style property. If you specify the interior for an Excel style and don't provide a pattern, just color, Excel will fail to open the spreadsheet

- Using invalid characters in attributes, we recommend you not to use special characters.

- Not specifying the style associated to a cell, if a cell has an style that is not passed as part of the grid options, Excel won't fail opening the spreadsheet but the column won't be formatted.

- Specifying an invalid enumerated property. It is also important to realise that Excel is case sensitive, so Solid is a valid pattern, but SOLID or solid are not.


## API

### API Methods

<api-documentation source='grid-api/api.json' section='export' names='["exportDataAsExcel", "getDataAsExcel"]'></api-documentation>

### Grid Properties

<api-documentation source='grid-options/properties.json' section='export' names='["excelStyles"]'></api-documentation>

## Next Up

Continue to the next section: [Formulas](../excel-export-formulas/).