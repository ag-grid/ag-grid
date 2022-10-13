---
title: "Excel Export - Customising Content"
enterprise: true
---

## Customising Row Groups

The grid cell and row group values exported to Excel can be customised using the following function params for a call to `exportDataAsExcel` API method or in the `defaultExcelExportParams`.

<snippet>
gridApi.exportDataAsExcel({
    processCellCallback(params) {
        const value = params.value
        return value === undefined ? '' : `_${value}_`
    },
    processRowGroupCallback(params) {
        return `row group: ${params.node.key}`
    }
})
</snippet>

<interface-documentation
    interfaceName='ExcelExportParams'
    names='["processRowGroupCallback", "processCellCallback"]'>
</interface-documentation>

The following example shows Excel customisations where the exported document has the following:

* All row groups with the prefix `row group: `
* All cell values surrounded by `_`, unless they are `undefined`, in which case they are empty

[[note]]
| Row groups are also cells, so will also have the `_` surrounding the value, whereas group headers and headers are not.

<grid-example title='Excel Export - Customising Row Groups' name='excel-export-customising-row-groups' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "csv", "excel", "menu", "setfilter"]}'></grid-example>

## Customising Column Group Headers

The column group headers and headers exported to Excel can be customised using the following function params for a call to `exportDataAsExcel` API method or in the `defaultExcelExportParams`.

<snippet>
gridApi.exportDataAsExcel({
    processGroupHeaderCallback(params) {
        return `group header: ${params.columnApi.getDisplayNameForColumnGroup(params.columnGroup, null)}`
    },
    processHeaderCallback(params) {
        return `header: ${params.columnApi.getDisplayNameForColumn(params.column, null)}`
    }
})
</snippet>

<interface-documentation
    interfaceName='ExcelExportParams'
    names='["processGroupHeaderCallback", "processHeaderCallback"]'>
</interface-documentation>

The following example shows Excel customisations where the exported document has the following:

* Group headers with the prefix `group header: `
* Headers with the prefix `header: `

<grid-example title='Excel Export - Customising Column Group Headers' name='excel-export-customising-column-group-headers' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "csv", "excel", "menu", "setfilter"]}'></grid-example>

## Next Up

Continue to the next section: [Images](../excel-export-images/).
