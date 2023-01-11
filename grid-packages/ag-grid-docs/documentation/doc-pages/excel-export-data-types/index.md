---
title: "Excel Export - Data Types"
enterprise: true
---

Excel Exporter allows you to export values into different Excel data types.

## Strings, Number and Booleans

In order to correctly display cell values in the exported Excel file you need to set the appropriate formatting to use during the Excel export process. In the segment below, we're demonstrating different value formatting to export values into different Excel data types.

Note that:

- We define a list of Excel types/formats to export into in the `excelStyles` array. These styles include a **unique id**, and either a `dataType` or a `numberFormat`.

- In the grid column definitions we link to the corresponding types defined in the `excelStyles` array storing the export configuration we want to apply for the column values.

<snippet>
const gridOptions = {
    columnDefs: [
        { headerName: 'provided', field: 'rawValue' },
        { headerName: 'number', field: 'rawValue', cellClass: 'numberType' },
        { headerName: 'currency', field: 'rawValue', cellClass: 'currencyFormat' },
        { headerName: 'boolean', field: 'rawValue', cellClass: 'booleanType' },
        { headerName: 'Negative', field: 'negativeValue', cellClass: 'negativeInBrackets' },
        { headerName: 'string', field: 'rawValue', cellClass: 'stringType' },
        { headerName: 'Date', field: 'dateValue', cellClass: 'dateType', minWidth: 220 },
    ], 
    rowData: [
        {
            rawValue: 1,
            negativeValue: -10,
            dateValue: '2009-04-20T00:00:00.000',
        },
    ],
    excelStyles: [
        {
            id: 'numberType',
            numberFormat: {
                format: '0',
            },
        },
        {
            id: 'currencyFormat',
            numberFormat: {
                format: '#,##0.00 €',
            },
        },
        {
            id: 'negativeInBrackets',
            numberFormat: {
                format: '$[blue] #,##0;$ [red](#,##0)',
            },
        },
        {
            id: 'booleanType',
            dataType: 'Boolean',
        },
        {
            id: 'stringType',
            dataType: 'String',
        },
        {
            id: 'dateType',
            dataType: 'DateTime',
        },
    ],
    popupParent: document.body
};
</snippet>

The following example demonstrates how to use other data types for your export. 

Note that:

- Boolean works off using `1` for `true`, `0` for `false`. All other values produce an error when exported to boolean.
- When you provide a `numberFormat`, the value gets exported as a number using the format provided. You can set the decimal places, format negative values differently and change the exported value color based on the value.
- When using dataType: 'DateTime', the date time format for Excel is `yyyy-mm-ddThh:MM:ss.mmm:`
- If you try to export a value that is not compatible with the underlying data type Excel will display an error when opening the file.
- When using `dataType: 'DateTime'` Excel doesn't format the resultant value, in this example it shows `39923`. You need to add the formatting inside Excel. You can see a better example of how to handle Date Formatting in the [Dates](excel-export-data-types/#dates) section below.

<grid-example title='Excel Data Types' name='excel-export-data-types' type='generated' options='{ "enterprise": true,"modules": ["clientside", "csv", "excel", "menu"], "exampleHeight": 200 }'></grid-example>

## Dates

When exporting dates to Excel format, you should use an Excel Style with `dataType="DateTime"`. The DateTime format only accepts dates in ISO Format, so all date values need to be provided in the `yyyy-mm-ddThh:mm:ss` format. 

If your date values are not in ISO format, please use the `processCellCallback` method to convert them. As demonstrated in example above, by default Excel displays these date values as numbers. To format these numbers like regular dates in Excel, please enter a numberFormat value containing the desired date value format in the Excel Style as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'date',
            headerName: 'ISO Format',
            cellClass: 'dateISO'
        }
    ], 
    rowData: [
        { date: '2020-05-30T10:01:00' },
        { date: '2015-04-21T16:30:00' },
        { date: '2010-02-19T12:02:00' },
        { date: '1995-10-04T03:27:00' }
    ],
    excelStyles: [
        {
            id: 'dateISO',
            dataType: 'DateTime',
            numberFormat: {
                format: 'yyy-mm-ddThh:mm:ss'
            }
        }
    ]
};
</snippet>


Note the following:

- There is only one date source in `ISO Format`.
- All columns apart from the `ISO Format` column use `Value Formatter` to change the date format.
- The `excelStyles` has a `numberFormat` for each date style (including the ISO Format), otherwise only a number would be displayed.

<grid-example title='Excel Export - Styling Dates' name='excel-export-dates' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"] }'></grid-example>

## Next Up

Continue to the next section: [Hyperlinks](../excel-export-hyperlinks/).