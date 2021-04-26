---
title: "Excel Export - Formulas"
enterprise: true
---
Excel Export provides a way to export Excel Formulas, this can be useful to replace Value Getters that combine multiple columns, create hyperlinks.

## Exporting formulas

There are two ways to export formulas.

1. Use `dataType='Formula'` in the [Excel Styles](../excel-export-styles/).
1. Set `autoConvertFormulas=true` in the export params.

## Formula Data Type
When the cell is exported with `dataType='Formula'`, the content of the cell will be automatically considered to be a formula. It is your responsibility to make sure the value in the grid cell is a valid formula.

- The `Full Name` column uses a `valueGetter` to combine `First Name` and `Last Name`
- The processCellCallback `Full Name` will create a formula has a similar function of the value getter.
- The exported excel sheet will have the `Full Name` column depend on the values of `First Name` and `Last Name`


<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'firstName', headerName: 'First Name' },
        { field: 'lastName', headerName: 'Last Name' },
        {
            headerName: 'Full Name',
            cellClass: 'fullName', 
            valueGetter: params => {
                return `${params.data.firstName} ${params.data.lastName}`;
            }
        },
    ],
     defaultExcelExportParams: {
        processCellCallback: params => {
            const rowIndex = params.accumulatedRowIndex;
            const valueGetter = params.column.getColDef().valueGetter;
            return !!valueGetter ? `=CONCATENATE(A${rowIndex}, " ", B${rowIndex})` : params.value;
        }
     },
     excelStyles: [
        {
            id: 'fullName',
            dataType: 'Formula'
        }
    ],
}
</snippet>


<grid-example title='Excel Export - Formula DataType' name='excel-export-formula-data-type' type='generated' options='{ "enterprise": true }'></grid-example>

## Auto Convert Formulas

When `autoConvertFormulas=true` is set, the Excel Export will look for any cell that starts with `=` and automatically convert that into a formula. Because it's not ideal to have this data displayed in the grid, this feature could be combined with `processCellCallback` to replace a column `valueGetter`.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'firstName', headerName: 'First Name' },
        { field: 'lastName', headerName: 'Last Name' },
        { 
            headerName: 'Full Name', 
            valueGetter: params => {
                return `${params.data.firstName} ${params.data.lastName}`;
            }
        },
    ],
     defaultExcelExportParams: {
        autoConvertFormulas: true, // instead of dataType='Formula'
        processCellCallback: params => {
            const rowIndex = params.accumulatedRowIndex;
            const valueGetter = params.column.getColDef().valueGetter;
            return !!valueGetter ? `=CONCATENATE(A${rowIndex}, " ", B${rowIndex})` : params.value;
        }
     }
}
</snippet>

Note the following: 

- The `Full Name` column uses a `valueGetter` to combine `First Name` and `Last Name`
- The processCellCallback `Full Name` will create a formula has a similar function of the value getter.
- The exported Excel will have the `Full Name` column depend on the values of `First Name` and `Last Name`
- As `autoConvertFormulas=true` there is no need to declare `dataType='Formula`.

<grid-example title='Excel Export - Auto Convert Formulas' name='excel-export-auto-convert-formulas' type='generated' options='{ "enterprise": true }'></grid-example>
