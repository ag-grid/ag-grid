---
title: "Excel Export - Extra Content"
enterprise: true
---

## Prepending and Appending Custom Content

The recommended way to prepend and append content, is by passing an array of ExcelCell objects to `prependContent` or `appendContent`. This ensures that the extra content is correctly escaped.

For compatibility with earlier versions of the Grid you can also pass a string, which will be inserted into the file without any processing. You are responsible for formatting the string correctly.

Note the following:

- You can use select fields at the top to switch the value of `prependContent` and `appendContent`.
    - With `prependContent=ExcelCell[][]` or `appendContent=ExcelCell[][]`, custom content will be inserted containing commas and quotes. These commas and quotes will be visible when opened in Excel because they have been escaped properly.
  
<grid-example title='Excel Export - Custom Header and Footer' name='excel-export-prepend-append' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

## Adding Headers and Footers

Extra content can also be added in a form of Headers and Footers. These are only visible when printing or exporting from Excel to PDF.

To use export headers and footers, the `headerFooterConfig: ExcelHeaderFooterConfig` object should be configured.

The header and footer object accepts some special configs as follows: 

- `&[Page]`: Prints the current page number.
- `&[Pages]`: Prints the total number of pages.
- `&[Date]`: Prints the current date.
- `&[Time]`: Prints the current time.
- `&[Tab]`: Prints the current sheet name.
- `&[Path]`: Prints the file path.
- `&[File]`: Prints the file name.

<grid-example title='Excel Export - Custom Header and Footer' name='excel-export-header-footer' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

### ExcelHeaderFooterConfig

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelHeaderFooterConfig'></api-documentation>

### ExcelHeaderFooter

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelHeaderFooter'></api-documentation>

### ExcelHeaderFooterContent

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelHeaderFooterContent'></api-documentation>

## Export Cover Page
<grid-example title='Excel Export - Cover Page' name='excel-export-cover-page' type='generated' options='{ "enterprise": true }'></grid-example>

