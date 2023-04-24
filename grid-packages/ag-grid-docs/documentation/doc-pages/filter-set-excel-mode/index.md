---
title: "Set Filter - Excel Mode"
enterprise: true
---

The Set Filter is a more powerful version of Excel's AutoFilter, allowing users to easily build more complex sets for filtering in less time. However, sometimes you may want to provide your users with an Excel-like experience. For this you can use Excel Mode.

## Enabling Excel Mode

To enable Excel Mode, simply add the `excelMode` option to your filter params:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                // can be 'windows' or 'mac'
                excelMode: 'windows',
            },
        }
    ]
}
</snippet>

Excel's AutoFilter behaves differently depending on whether you are using the Windows or Mac version. The grid therefore allows you to choose which behaviour you would like by setting `excelMode` to `'windows'` or `'mac'` respectively.

The example below demonstrates the differences between the different modes:

- The **Default** column demonstrates the default behaviour of the Set Filter in the grid.
- The **Excel (Windows)** column demonstrates the behaviour of the Set Filter in Windows Excel Mode.
- The **Excel (Mac)** column demonstrates the behaviour of the Set Filter in Mac Excel Mode.

<grid-example title='Excel Mode' name='excel-mode' type='generated' options='{ "enterprise": true, "exampleHeight": 640, "modules": ["clientside", "setfilter", "menu", "filterpanel"] }'></grid-example>

## Differences Between Modes

The table below shows the differences in behaviour alongside the default behaviour of the grid for comparison. Note that the behaviour of the grid can be changed from the defaults in many ways using the other options detailed on the [Set Filter](/filter-set/) page. These options can also be used in conjunction with the Excel Mode to give you the maximum amount of flexibility.

<matrix-table src='filter-set-excel-mode/resources/excel-mode.json' rootnode='behaviours' columns='{ "behaviour": "Behaviour", "agGrid": "Default", "windowsExcel": "Excel (Windows)", "macExcel": "Excel (Mac)" }'></matrix-table>

## Next Up

Continue to the next section to learn about the [Set Filter API](/filter-set-api/).
