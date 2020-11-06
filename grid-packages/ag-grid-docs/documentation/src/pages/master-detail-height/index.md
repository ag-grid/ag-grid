---
title: "Master / Detail - Detail Height"
enterprise: true
---

This section shows how the detail height can be customised to suit application requirements.

## Detail Height Options


The default height of each detail section (ie the row containing the Detail Grid in the master) is fixed at `300px`. The height does not change based on how much data there is to display in the detail section.

To change the height of the details section from the default you have the following options:


- [Fixed Height](../master-detail-height/#fixed-height): a custom fixed height can be provided for all detail sections instead of the default `300px`.

- [Auto Height](../master-detail-height/#auto-height): detail sections can auto-size to fit based off the contents.

- [Dynamic Height](../master-detail-height/#dynamic-height): different heights can be provided for each detail section.

## Fixed Height

Use the grid property `detailRowHeight` to set a fixed height for each detail row.

```js
// statically fix row height for all detail grids
masterGridOptions.detailRowHeight = 200;
```

The following example sets a fixed row height for all detail rows.

<grid-example title='Fixed Detail Row Height' name='fixed-detail-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 575, "modules":["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Auto Height

Set grid property `detailRowAutoHeight=true` to have the detail grid to dynamically change it's height to fit it's rows.

```js
// statically fix row height for all detail grids
masterGridOptions.detailRowAutoHeight = true;
```

<grid-example title='Auto Height' name='auto-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail"] }'></grid-example>

[[note]]
| When using Auto Height feature, the Detail Grid will render all of it's rows all the time.
| [Row Virtualisation](../dom-virtualisation/) will not happen.
| This means if the Detail Grid has many rows, it could slow down your application and could
| result in stalling he browser.
| <br/>
| Do not use Auto Height if you have many rows (eg 100+) in the Detail Grid's. To know if this
| is a concern for your grid and dataset, try it out and check the performance.

## Dynamic Height

Use the callback `getRowHeight()` to set height for each row individually. This is a specific use of the callback that is explained in more detail in
[Get Row Height](../row-height/#getrowheight-callback)

Note that this callback gets called for **all rows** in the Master Grid, not just rows containing Detail Grids. If you do not want to set row heights explicitly for other rows simply return `undefined / null` and the grid will ignore the result for that particular row.

```js
// dynamically assigning detail row height
masterGridOptions.getRowHeight = function (params) {
    var isDetailRow = params.node.detail;

    // for all rows that are not detail rows, return nothing
    if (!isDetailRow) { return undefined; }

    // otherwise return height based on number of rows in detail grid
    var detailPanelHeight = params.data.children.length * 50;
    return detailPanelHeight;
}
```

The following example demonstrates dynamic detail row heights:

<grid-example title='Dynamic Detail Row Height' name='dynamic-detail-row-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>
