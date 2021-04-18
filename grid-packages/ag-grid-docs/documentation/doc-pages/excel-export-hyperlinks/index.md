---
title: "Excel Export - Hyperlinks"
enterprise: true
---

Formulas can be used to create `hyperlinks` while exporting an Excel Spreadsheet.

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

- The URL column has active links in the grid.
- The exported Excel Spreadsheet will have active working links for the in the URL column.

<grid-example title='Excel Export - Hyperlinks' name='excel-export-hyperlinks' type='generated' options='{ "enterprise": true }'></grid-example>