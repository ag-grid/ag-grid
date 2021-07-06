---
title: "Master / Detail - Detail Grids"
enterprise: true
---

When a row in the Master Grid is expanded, a new Detail Grid appears underneath that row. This page describes configuration options relevant to the Detail Grid.

This page explains how to configure the Detail Cell Renderer using the `detailCellRendererParams` Grid Option and how you can interact with the Detail Grids using the Master Grid's API.

The Detail Grid fits inside one row of the Master Grid without using any of the Master Grid's columns. It is the job of the Detail Cell Renderer to draw the Detail Grid into the provided detail row.

## Detail Grid Definition

The Detail Grid is a fully fledged independent grid instance. This means that the Detail Grid has access to the full range of grid features.

The instance of the grid is instantiated using native JavaScript and not any particular framework. This means properties are provided via a plain JavaScript object called Grid Options and not bound by any framework or HTML tags or bindings.

The Grid Options JSON is provided to the Detail Grid using the parameter `detailGridOptions`.

The example below shows configuring a Detail Grid with some additional Grid Options set. Note the following:

- The `detailGridOptions` is provided inside the `detailCellRendererParams`.
- The Detail Grid Options has the following properties set: `rowSelection=multiple`, `suppressRowClickSelection=true`, `enableRangeSelection=true`, `pagination=true` and `paginationAutoPageSize=true`.
- The Detail Grid Options is provided with a Default Column Definition (`defaultColDef`) that makes all columns sortable and use Flex for sizing.
- The first Column Definition is configured to use Checkbox Selection.

<grid-example title='Detail Grid Options' name='grid-options' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail", "menu", "columnpanel", "range"] }'></grid-example>

## Providing Rows

Row data is provided to the Detail Grid by implementing the `getDetailRowData` callback of the Detail Cell Renderer Params. The interface of this callback is as follows:

```ts
function getDetailRowData(params: GetDetailRowDataParams): void;

interface GetDetailRowDataParams {
    // details for the request,
    node: RowNode;
    data: any;

    // success callback, pass the rows back the grid asked for
    successCallback(rowData: any[]): void;
}
```

The `successCallback` can be called immediately in a synchronous fashion (typical if the data is already available) or asynchronously at a later time (typical if the data needs to be fetched remotely).

The Master Grid in turn will call `api.setRowData()` on the Detail Grid with the data provided.

All the previous examples on Master Detail provided the result synchronously and as such another specific example is not given here.

The following snippet illustrates this using a simple `setTimeout()` function to delay supplying data to the detail row after a fixed timeout.

Below shows an example using `setTimeout()` to simulate lazying loading of data in the detail.

<grid-example title='Lazy Load Detail Rows' name='lazy-load-rows' type='generated' options='{ "enterprise": true, "exampleHeight": 550,  "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Dynamic Definitions

There will be many instances of Detail Grids within one Master Grid, as each time you expand a Master Row, a new Detail Grid instance is created. It is possible to dynamically create Detail Cell Renderer Params so each Detail Grid gets it's own version of the params, allowing each Detail Grid to be configured differently.

This is done by providing a function to `detailCellRendererParams` that in turn returns the params to use for that Detail Grid.

Below shows an example of this, where the Detail Grids are configured with different columns. Note the following:

- Expanding rows 'Mila Smith' or 'Harper Johnson' will use a detail grid with the columns {Call ID, Number}.
- Expanding all other rows will use a detail grid with the columns {Call ID, Direction, Duration, Switch Code}.

<grid-example title='Dynamic Params' name='dynamic-params' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Changing the Template

By default the Detail Cell Renderer does not include any other information around the Detail Grid. It is possible to change this to allow additional details, such as header information, around the Detail Grid. This is done by providing an alternative Detail Template.

If providing an alternative template, you **must** include an element with `ref="eDetailGrid"`. This tells the grid where to place the Detail Grid.

For comparison, the default template is as follows. It is simplistic, only intended for allowing spacing around the Detail Grid.

```html
<!-- for when fixed height (normal) -->
<div class="ag-details-row ag-details-row-fixed-height">
    <div ref="eDetailGrid" class="ag-details-grid ag-details-grid-fixed-height"/>
</div>

<!-- for when auto-height (detailRowAutoHeight=true) -->
<div class="ag-details-row ag-details-row-auto-height">
    <div ref="eDetailGrid" class="ag-details-grid ag-details-grid-auto-height"/>
</div>
```

To change the Detail Template, set the `template` inside the Detail Cell Renderer Params. The Detail Template can be a String or Function depending on whether you want to provide the template statically or dynamically:

- **String Template** - Statically overrides the template used by the grid. The same fixed template is used for each row. This is useful for styling or generic information.

    ```js
    // example override using string template
    detailCellRendererParams: {
        template:
        '<div style="background-color: #edf6ff;">' +
            '  <div style="height: 10%;">Call Details</div>' +
            '  <div ref="eDetailGrid" style="height: 90%;"></div>' +
            '</div>'
    }
    ```

- **Function Template** - Called each time a detail row is shown to dynamically provide a template based on the data. Useful for displaying information specific to the Detail Grid dataset

    ```js
    // override using template callback
    detailCellRendererParams: {
        template: params => {
            const personName = params.data.name;
            return '<div style="height: 100%; background-color: #EDF6FF;">' +
            '  <div style="height: 10%;">Name: ' + personName + '</div>' +
            '  <div ref="eDetailGrid" style="height: 90%;"></div>' +
            '</div>';
        }
    }
    ```

The following two examples demonstrate both approaches.

### Example Static Template

In this first example, the template is set statically. Note the following:

- All Detail Grids have a spacing with blue background.
- All Detail Grids have the same static title 'Call Details'.

<grid-example title='Customising via String Template' name='string-template-customisation' type='generated' options='{ "enterprise": true, "exampleHeight": 550, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

### Example Dynamic Template

In this second example, the template is set dynamically. Note the following:

- All Detail Grids have a spacing with blue background.
- All Detail Grids have the a different dynamic title including the persons name e.g. 'Mila Smith'.

<grid-example title='Customising via Template Callback' name='template-callback-customisation' type='generated' options='{ "enterprise": true, "exampleHeight": 550, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Accessing Detail Grids

The Master Grid manages all the Detail Grid instances. You can access the API of the underlying Detail Grids to call API methods directly on those grids. The Master Grid stores references to the Detail Grid API's in Detail Grid Info objects.

The Detail Grid Info objects contain a reference to the underlying [Grid API](/grid-api/) and [Column API](/column-api/) for each detail grid. The interface for Detail Grid Info is as follows:

```ts
interface DetailGridInfo {
    // id of the detail grid, the format is detail_&lt;row-id>
    // where row-id is the id of the parent row.
    id: string;

    // the grid API of the detail grid
    api: GridApi;

    // the column API of the detail grid
    columnApi: ColumnApi;
}
```

The Detail Grid Info objects are accessed via the Master Grid's API via the following methods:

- `getDetailGridInfo(id)`: Returns back the Detail Grid Info for the Detail Grid with the provided ID.

    <snippet>
    // lookup a specific DetailGridInfo by id, and then call stopEditing() on it
    const detailGridInfo = gridOptions.api.getDetailGridInfo('detail_someId');
    detailGridInfo.api.flashCells();
    </snippet>

    The grid generates IDs for detail grids by prefixing the parent row's ID with `detail_`. For example if the ID of the expanded Master Row is "88", then the ID of the Detail Grid / row will be "detail_88".

- `forEachDetailGridInfo(callback)`: Calls the callback for each existing instance of a Detail Grid.

    <snippet>
    // iterate over all DetailGridInfos, and call stopEditing() on each one
    gridOptions.api.forEachDetailGridInfo(detailGridInfo => {
        detailGridInfo.api.flashCells();
    });
    </snippet>

The following example shows flashing cells on the detail grids by using the Grid API `flashCells()`. Note the following:

- The example is made more compact by a) setting Detail Row Height to 200 pixels and b) setting CSS to reduce padding around the Detail Grid.
- The callback `getRowNodeId` is implemented in the Master Grid to give each row an ID. In this instance the `account` attribute is used.
- Button 'Flash Mila Smith' uses `getDetailGridInfo` to get access to the Grid API for the Mila Smith Detail Grid.
- Button 'Flash All' uses `forEachDetailGridInfo` to access all existing Detail Grids.

<grid-example title='Detail Grid API' name='detail-grid-api' type='generated' options='{ "enterprise": true, "exampleHeight": 535, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Detail Grid Lifecycle

When a Master Row is expanded a Detail Row is created. When the Master Row is collapsed, the Detail Row is destroyed. When the Master Row is expanded a second time, a Detail Row is created again from scratch. This can be undesirable behaviour if there was context in the Detail Row, e.g. if the user sorted or filtered data in the Detail Row, the sort or filter will be reset the second time the Retail Row is displayed.

To prevent losing the context of Details Rows, the grid provides two properties to cache the Details Rows to be reused the next time the row is shows. The properties are as follows:

<api-documentation source='grid-properties/properties.json' section='masterDetail' names='["keepDetailRows", "keepDetailRowsCount"]'></api-documentation>

The example below demonstrates keeping Detail Rows. Note the following:

- The Master Grid has property `keepDetailRows=true` to turn on keeping Detail Rows.
- The Master Grid has property `keepDetailRowsCount=2` which sets the number of Details Rows to keep to 2.
- All the Detail Grids allow moving and sorting columns. If you change the state of a Detail Grid (e.g. by sorting a Detail Grid), that state will be kept if you close the Parent Row and then open the Parent Row again.
- The maximum number of Detail Rows kept is two. If you open three Detail Rows and apply sorting on each Detail Grid, then close all three Detail Rows (so none are showing) and then open all three again, only two of them will have the sort state kept.

<grid-example title='Keep Detail Rows' name='keep-detail-rows' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "masterdetail", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

## Detail Parameters

The full list of Detail Cell Renderer Params are as follows:

<api-documentation source='master-detail-grids/resources/properties.json' section='detailCellRenderer'></api-documentation>

The pattern of setting components such as Cell Renderers and providing parameters to those components is consistent across the grid and explained in [Grid Components](/components/).

As with all components, the parameters object (in this case `detailCellRendererParams`) can either be a JSON Object, or it can be a function that returns a JSON Object. The latter allows providing different parameters for each Detail Grid, allowing Detail Grids to be configured differently.
