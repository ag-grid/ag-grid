---
title: "Excel Export - Extra Content"
enterprise: true
---

## Prepending and Appending Custom Content

The recommended way to prepend and append content, is by passing an array of ExcelCell objects to `prependContent` or `appendContent`. This ensures that your header content is correctly escaped.

For compatibility with earlier versions of the Grid you can also pass a string, which will be inserted into the file without any processing. You are responsible for formatting the string correctly.

Note the following:

- You can use select fields at the top to switch the value of `prependContent` and `appendContent`.
    - With `prependContent=ExcelCell[][]` or `appendContent=ExcelCell[][]`, custom content will be inserted containing commas and quotes. These commas and quotes will be visible when opened in Excel because they have been escaped properly.


<grid-example title='Excel Export - Custom Header and Footer' name='excel-export-prepend-append' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>

## Adding Headers and Footers

<grid-example title='Excel Export - Custom Header and Footer' name='excel-export-header-footer' type='generated' options='{ "enterprise": true, "exampleHeight": 815 }'></grid-example>
