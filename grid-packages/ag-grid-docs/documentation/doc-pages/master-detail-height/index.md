---
title: "Master / Detail - Detail Height"
enterprise: true
---

This section shows how the detail height can be customised to suit application requirements.

## Detail Height Options


The default height of each detail section (ie the row containing the Detail Grid in the master) is fixed at `300px`. The height does not change based on how much data there is to display in the detail section.

To change the height of the details section from the default you have the following options:


- [Fixed Height](/master-detail-height/#fixed-height): a custom fixed height can be provided for all detail sections instead of the default `300px`.

- [Auto Height](/master-detail-height/#auto-height): detail sections can auto-size to fit based off the contents.

- [Dynamic Height](/master-detail-height/#dynamic-height): different heights can be provided for each detail section.

## Fixed Height

Use the grid property `detailRowHeight` to set a fixed height for each detail row.

<snippet>
const gridOptions = {
    // statically fix row height for all detail grids
    detailRowHeight: 200,
}
</snippet>

The following example sets a fixed row height for all detail rows.

<grid-example title='Fixed Detail Row Height' name='fixed-detail-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 575, "modules":["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Auto Height

Set grid property `detailRowAutoHeight=true` to have the detail grid to dynamically change it's height to fit it's rows.

<snippet>
const gridOptions = {
    // dynamically set row height for all detail grids
    detailRowAutoHeight: true,
}
</snippet>

<grid-example title='Auto Height' name='auto-height' type='generated' options='{ "enterprise": true, "exampleHeight": 600, "modules": ["clientside", "masterdetail"] }'></grid-example>

If you are not providing your own Detail Cell Renderer, then there is nothing else to be concerned about.

If you are providing your own Detail Cell Renderer, then you need to make sure the top most element of the
Detail Cell Renderer has the correct height, as this is what the grid checks and matches the row height to this.
So make sure the CSS on the top most element is set so that its height is correct.

[[only-angular]]
| This can be a particular concern if providing a Detail Cell Renderer in Angular. Be aware that by default
| custom Angular tags will not inherit the height of their children. This can be fixed by adding
| `display: inline-block` style to the top most element of your component. This is done as follows:
|
|
| ```ts
| @Component({
|   styles: [':host { display: inline-block; }'],
|   // other items here
| }
| ```

[[note]]
| When using Auto Height feature, the Detail Grid will render all of it's rows all the time.
| [Row Virtualisation](/dom-virtualisation/) will not happen.
| This means if the Detail Grid has many rows, it could slow down your application and could
| result in stalling he browser.
| <br/><br/>
| Do not use Auto Height if you have many rows (eg 100+) in the Detail Grid's. To know if this
| is a concern for your grid and dataset, try it out and check the performance.


## Dynamic Height

Use the callback `getRowHeight(params)` to set height for each row individually. This is a specific use of the callback that is explained in more detail in
[Get Row Height](/row-height/#getrowheight-callback)

<api-documentation source='grid-options/properties.json' section='styling' names='["getRowHeight"]'></api-documentation>

Note that this callback gets called for **all rows** in the Master Grid, not just rows containing Detail Grids. If you do not want to set row heights explicitly for other rows simply return `undefined / null` and the grid will ignore the result for that particular row.

<snippet>
| const gridOptions = {
|     // dynamically assigning detail row height
|     getRowHeight: params => {
|         const isDetailRow = params.node.detail;
|         // for all rows that are not detail rows, return nothing
|         if (!isDetailRow) { return undefined; }
|
|         // otherwise return height based on number of rows in detail grid
|         const detailPanelHeight = params.data.children.length * 50;
|         return detailPanelHeight;
|     }
| }
</snippet>

The following example demonstrates dynamic detail row heights:

<grid-example title='Dynamic Detail Row Height' name='dynamic-detail-row-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>
