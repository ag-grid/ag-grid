---
title: "Excel Export - Images"
enterprise: true
---
Excel Export provides a way to export images, this can be useful to add your logo to the top or bottom of the exported documents, but can also be used to export images within grid cells.


## Exporting Images

To export images you can use the following callback in the [export parameters](../excel-export-api/#excelexportparams).

<snippet>
const gridOptions = {
    defaultExcelExportParams: {
        addImageToCell: (rowIndex, column, value) => {
            if (rowIndex === 1 && column.colId === 'athlete') {
                const myCompanyLogo = getBase64Image('logo.png');
                return {
                    image: {
                        id: 'company_logo',
                        base64: myCompanyLogo,
                        imageType: 'png',
                        fitCell: true
                    }
                };
            }
        }
    }
}
</snippet>

It's important to notice that images can only be exported as `base64` strings, and the format must be either `png`, or `gif` or `jpg`. To convert your images to a base64 string, you can use third party tools, or use the code from one of our examples.

[[note]]
| Every image is required to have an `id`. This happens because if the same image is reused multiple times, the ID will be used so the image is imported only once.

[[warning]]
| At the moment, it's only possible the export one image per cell.

## Cells with Images

This example, has a [Custom Cell Renderer](../component-cell-renderer/), and uses the the `addImageToCell` to convert the cell value into a base64 image.

Note the following:
- The image gets a margin within the cell because of the `offsetX` and `offsetY` properties in the `ExcelImage`.

<grid-example title='Excel Export - Cells with Images' name='excel-export-cells-with-images' type='generated' options='{ "enterprise": true }'></grid-example>

## Cells with Images and Text

This example, has a [Custom Cell Renderer](../component-cell-renderer/), and uses the the `addImageToCell` to convert the cell value into a base64 image.

Note the following:
- The image gets a margin within the cell because of the `offsetX` and `offsetY` properties in the `ExcelImage`.
- This example returns the image and a value. The value is rendered within the same cell as the image.
- [Excel Styles](../excel-export-styles/) are used to indent the text and vertically align it with the image.

<grid-example title='Excel Export - Cells with Images and Text' name='excel-export-cells-with-images-text' type='generated' options='{ "enterprise": true }'></grid-example>

## Prepend Images

This example uses the [prepend content](../excel-export-extra-content/#example-excel-export-prepend-append) to add a custom logo to the export.

Note the following: 
- The first row has a larger height because of the the custom `rowHeight` callback.
- The custom content added using `prependContent` spans across two columns.

[[note]]
| Even if an ExcelCell object that merges multiple cells across is created, the `ExcelImage` still needs be informed of how many columns it will be spanning. This is done by passing `position: { colSpan: number }` to the `ExcelImage`.

<grid-example title='Excel Export - Prepend Images' name='excel-export-prepend-images' type='generated' options='{ "enterprise": true }'></grid-example>

## Interface

<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelExportParams' names='["addImageToCell"]'></api-documentation>

### ExcelImage
<api-documentation source='excel-export-api/resources/excel-export-params.json' section='excelImage'></api-documentation>