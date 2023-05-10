---
title: "Excel Export - Images"
enterprise: true
---

Excel Export allows including images in the Excel export file. For example, you can add your company logo to the top or bottom of the exported Excel spreadsheet, or export any images you're displaying inside grid cells.


## Exporting Images

You can export an image for any grid cell using the addImageToCell callback in the [export parameters](../excel-export-api/#excelexportparams) shown below:

<interface-documentation interfaceName='ExcelExportParams' names='["addImageToCell"]' config='{"description":""}' ></interface-documentation>

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

It's important to note that images can only be exported as `base64` strings, and the image format must be either `PNG`, `GIF` or `JPG`. You can convert your images to a `base64` string, using third party tools, or using the code in our examples on this page.

[[note]]
| Every image is required to have an `id`. This way, if you're exporting the same image multiple times as part of the same export operation, the `id` will be used to access the image data, so the image file is imported only once.

[[warning]]
| At the moment, it's only possible the export one image per cell.

## Cells with Images

The example below includes a [Custom Cell Renderer](../component-cell-renderer/) and uses the `addImageToCell` callback to convert the cell value into a `base64` image.

Note the following:
- The image gets a margin within the cell because of the `offsetX` and `offsetY` properties in the `ExcelImage`.

<grid-example title='Excel Export - Cells with Images' name='excel-export-cells-with-images' type='generated' options='{ "enterprise": true, "modules": ["clientside", "excel", "menu"] }'></grid-example>

## Cells with Images and Text

This example has a [Custom Cell Renderer](../component-cell-renderer/) showing an image together with text, and uses the `addImageToCell` to convert the cell value into a `base64` image.

Note the following:
- The image gets a margin within the cell because of the `offsetX` and `offsetY` properties in the `ExcelImage`.
- This example returns the image and a value. The value is rendered within the same cell as the image.
- [Excel Styles](../excel-export-styles/) are used to indent the text and vertically align it with the image.

<grid-example title='Excel Export - Cells with Images and Text' name='excel-export-cells-with-images-text' type='generated' options='{ "enterprise": true, "modules": ["clientside", "excel", "menu"] }'></grid-example>

## Prepend Images

This example uses the [prepend content](../excel-export-extra-content/#example-excel-export-prepend-append) to add a custom logo to the export.

Note the following: 
- The first row has a larger height as set in the `rowHeight` callback.
- The custom content added using `prependContent` spans across two columns.

[[note]]
| Even if an ExcelCell object that merges multiple cells across is created, the `ExcelImage` still needs be informed of how many columns it will be spanning. This is done by passing `position: { colSpan: number }` to the `ExcelImage`.

<grid-example title='Excel Export - Prepend Images' name='excel-export-prepend-images' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"] }'></grid-example>

## Next Up

Continue to the next section: [Multiple Sheets](../excel-export-multiple-sheets/).
