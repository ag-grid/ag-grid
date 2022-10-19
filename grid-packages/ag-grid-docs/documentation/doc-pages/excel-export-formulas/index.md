---
title: "Excel Export - Formulas"
enterprise: true
---
Excel Export allows to include Excel Formulas in the exported file. You can use formulas to translate any column Value Getters logic, so the column values are correctly computed locally in Excel.

## Exporting formulas

There are two ways to export formulas.

There are two ways to include formulas as part of the exported Excel file.
1. Set `dataType='Formula'` in the [Excel Styles](../excel-export-styles/) for a column.
1. Set `autoConvertFormulas=true` in the Excel export parameters to be used across all columns.

## Formula Data Type

When a cell is exported with `dataType='Formula'`, the cell content will be automatically converted to an Excel formula. It is your responsibility to ensure the value in the grid cell is a valid Excel formula. 

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

Note the following:

- The `Full Name` column uses a `valueGetter` to combine `First Name` and `Last Name`.
- The `processCellCallback` create a formula that has a similar function of the `valueGetter`.
- The exported Excel Sheet will have the `Full Name` column computed using a formula that uses the `First Name` and `Last Name` columns as inputs.

<grid-example title='Excel Export - Formula DataType' name='excel-export-formula-data-type' type='generated' options='{ "enterprise": true, "modules": ["clientside", "excel", "menu"] }'></grid-example>

## Auto Convert Formulas

When `autoConvertFormulas=true` is set, the Excel Export will automatically convert any cell with a value that starts with '=' into a formula. As you wouldn't normally display the formula text in the grid (instead, you will display its results), you can provide the Excel formula text in the call to `processCellCallback`, implementing the logic used to compute the cell value in the column's `valueGetter`. This substitution of `valueGetter` logic for an Excel formula in the exported Excel file is shown in the code segment and sample below.

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

- The `Full Name` column uses a `valueGetter` to combine `First Name` and `Last Name`.
- The `processCellCallback` code will be executed for all cells exported to Excel. This code will create an Excel formula for any cell with a `valueGetter`. In our sample there's only one such column (Full Name), and we output the corresponding formula (CONCATENATE) into the Excel exported file. This way the exported Excel file will have cells in the `Full Name` column be computed based on the values of `First Name` and `Last Name`.
- As `autoConvertFormulas=true` there is no need to declare `dataType='Formula'`

<grid-example title='Excel Export - Auto Convert Formulas' name='excel-export-auto-convert-formulas' type='generated' options='{ "enterprise": true, "modules": ["clientside", "excel", "menu"] }'></grid-example>

## Next Up

Continue to the next section: [Extra Content](../excel-export-extra-content/).