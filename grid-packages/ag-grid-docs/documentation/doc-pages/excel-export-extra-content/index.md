---
title: "Excel Export - Extra Content"
enterprise: true
---

## Prepending and Appending Custom Content

The recommended way to prepend and append content, is by passing an array of ExcelCell objects to `prependContent` or `appendContent`. This ensures that the extra content is correctly escaped.

For compatibility with earlier versions of the Grid you can also pass a string, which will be inserted into the file without any processing. You are responsible for formatting the string correctly.

Note the following:

- You can check and uncheck the checkboxes to add extra content before and after the grid via the `prependContent` and `appendContent` properties.

- With `prependContent=ExcelRow[]` or `appendContent=ExcelRow[]`, custom content will be inserted containing commas and quotes. These commas and quotes will be visible when opened in Excel because they have been escaped properly.
  
<grid-example title='Excel Export - Prepend and Append Content' name='excel-export-prepend-append' type='generated' options='{ "enterprise": true, "modules": ["clientside", "excel", "menu"], "exampleHeight": 815 }'></grid-example>

## Adding Header and Footer Content

Extra content can also be added in the form of Headers and Footers of the exported Excel file. Please note that this header and footer content is only visible when printing or exporting from Excel to PDF.

You can set header and footer content via the `headerFooterConfig: ExcelHeaderFooterConfig` object. See it documented further below.

The header and footer object accepts the following placeholders: 

- `&[Page]`: Prints the current page number.
- `&[Pages]`: Prints the total number of pages.
- `&[Date]`: Prints the current date.
- `&[Time]`: Prints the current time.
- `&[Tab]`: Prints the current sheet name.
- `&[Path]`: Prints the file path.
- `&[File]`: Prints the file name.

<grid-example title='Excel Export - Custom Header and Footer' name='excel-export-header-footer' type='generated' options='{ "enterprise": true,"modules": ["clientside", "excel", "menu"], "exampleHeight": 815 }'></grid-example>

### ExcelHeaderFooterConfig
<interface-documentation interfaceName='ExcelHeaderFooterConfig'></interface-documentation>

### ExcelHeaderFooter
<interface-documentation interfaceName='ExcelHeaderFooter'></interface-documentation>

### ExcelHeaderFooterContent
<interface-documentation interfaceName='ExcelHeaderFooterContent' overrideSrc='excel-export-api/resources/excel-api.json'></interface-documentation>

## Export Cover Page

In addition to exporting the Grid in the Excel file, you can also provide additional content on a separate sheet of the Excel file. This can be useful when you'd like to add a cover page to provide your users additional details on the data in this file.

<grid-example title='Excel Export - Cover Page' name='excel-export-cover-page' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu", "setfilter"]}'></grid-example>

## Export Customisation

The Excel export can be customised using the following function params for `exportDataAsExcel`:

<snippet>
gridOptions.api.exportDataAsExcel({
    processCellCallback: () => {},
    processHeaderCallback: () => {},
    processGroupHeaderCallback: () => {},
    processRowGroupCallback: () => {},
})
</snippet>

<api-documentation source='grid-api/api.json' config='{"isApi": true}' section='export' names='["exportDataAsExcel"]'></api-documentation>

<interface-documentation interfaceName='ExcelExportParams' names='["exportDataAsExcel", "processGroupHeaderCallback", "processHeaderCallback", "processRowGroupCallback", "processCellCallback"]' ></interface-documentation>

The following example shows Excel customisations where the exported document has the following:

* Group headers with the prefix `group header: `
* Headers with the prefix `header: `
* All row groups with the prefix `row group: `
* All cell values are surrounded by `_`, unless they are `undefined`, in which case they are empty

[[note]]
| Row groups are also cells, so will also have the `_` surrounding the value, whereas group headers and headers are not.

<grid-example title='Excel Export - Customisation' name='excel-export-customisation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "csv", "excel", "menu", "setfilter"]}'></grid-example>

## Next Up

Continue to the next section: [Images](../excel-export-images/).