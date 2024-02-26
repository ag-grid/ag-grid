---
title: "Excel Export - Hyperlinks"
enterprise: true
---

This section describes how to insert hyperlinks in the cells of the exported Excel file.

## Exporting Formulas

You can insert `hyperlinks` in the cells of the exported Excel file by outputting an Excel formula containing a <a href="https://support.microsoft.com/en-us/office/hyperlink-function-333c7ce6-c5ae-4164-9c47-7de9b76f577f" target="_blank">Hyperlink function</a> with a URL value you provide. The code below inserts hyperlinks in the Excel export file for all values in the URL column.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'company' },
        { 
            field: 'url', 
            cellClass: 'hyperlinks' // references excel style 
        }
    ],
    defaultExcelExportParams: {
        autoConvertFormulas: true,
        processCellCallback: params => {
            const field = params.column.getColDef().field;
            return field === 'url' ? `=HYPERLINK("${params.value}")` : params.value;
        }
    },
    excelStyles: [
        {
            id: 'hyperlinks',
            font: {
                underline: 'Single',
                color: '#358ccb'
            }
        }
    ]
}
</snippet>


Note the following:

- The URL column of the grid below has URL values.
- In the exported Excel file, the URL column has active links for these URL values.

<grid-example title='Excel Export - Hyperlinks' name='excel-export-hyperlinks' type='generated' options='{ "enterprise": true, "modules": ["clientside", "excel", "menu"] }'></grid-example>

## Next Up

Continue to the next section: [Master Detail](../excel-export-master-detail/).