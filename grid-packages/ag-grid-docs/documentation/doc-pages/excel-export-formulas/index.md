---
title: "Excel Export - Formulas"
enterprise: true
---
Excel Export provides a way to export Excel Formulas, this can be useful to replace Value Getters that combine multiple columns, create hyperlinks.

## Exporting formulas

There are two ways to export formulas.

1. Use `dataType='Formula'` in the (Excel Styles)[/excel-export-styles/].
1. Set `autoConvertFormulas=true` in the export params.

## Formula Data Type
When the cell is exported with `dataType='Formula'`, the content of the cell will be automatically considered to be a formula. It is your responsibility to make sure the value in the grid cell is a valid formula.

- The `Full Name` column uses a `valueGetter` to combine `First Name` and `Last Name`
- The processCellCallback `Full Name` will create a formula has a similar function of the value getter.
- The exported excel sheet will have the `Full Name` column depend on the values of `First Name` and `Last Name`

<grid-example title='Excel Export - Formula DataType' name='excel-export-formula-data-type' type='generated' options='{ "enterprise": true }'></grid-example>

## Auto Convert Formulas

When `autoConvertFormulas=true` is set, the Excel Export will look for any cell that starts with `=` and automatically convert that into a formula. Because it's not ideal to have this data displayed in the grid, this feature could be combined with `processCellCallback` to replace a column `valueGetter`.

Note the following: 

- The `Full Name` column uses a `valueGetter` to combine `First Name` and `Last Name`
- The processCellCallback `Full Name` will create a formula has a similar function of the value getter.
- The exported excel sheet will have the `Full Name` column depend on the values of `First Name` and `Last Name`
- If you turn off `Auto Convert Formulas`, the `Full Name` column will display the formula as a string.

<grid-example title='Excel Export - Auto Convert Formulas' name='excel-export-auto-convert-formulas' type='generated' options='{ "enterprise": true }'></grid-example>

## Hyperlinks
Formulas can be used to create `hyperlinks` while exporting an Excel Spreadsheet.

Note the following:

- The URL column has active links in the grid.
- The exported Excel Spreadsheet will have active working links for the in the URL column.

<grid-example title='Excel Export - Hyperlinks' name='excel-export-hyperlinks' type='generated' options='{ "enterprise": true }'></grid-example>