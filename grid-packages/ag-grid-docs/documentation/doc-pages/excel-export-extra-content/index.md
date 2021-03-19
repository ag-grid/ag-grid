---
title: "Excel Export - Extra Content"
enterprise: true
---

## Appending header and footer content

The recommended way to append header and footer content is by passing an array of CsvCell objects to `customHeader` or `customFooter`. This ensures that your header content is correctly escaped.

For compatibility with earlier versions of the Grid you can also pass a string, which will be inserted into the CSV file without any processing. You are responsible for formatting the string according to the CSV standard.

Note the following:

- You can use select fields at the top to switch the value of `customHeader` and `customFooter`.
    - With `customHeader=ExcelCell[][]` or `customFooter=ExcelCell[][]`, custom content will be inserted containing commas and quotes. These commas and quotes will be visible when opened in Excel because they have been escaped properly.


<grid-example title='Excel Export - Custom Header and Footer' name='excel-export-header-footer' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>
