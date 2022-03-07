---
title: "Use with RxJS"
frameworks: ["angular", "react", "vue"]
---

It is possible to use RxJS with AG Grid - with the rich [API](/grid-api/) and numerous [Data Update Options](/data-update/) the two can interoperate very well.

There are many ways you can use RxJS with AG Grid. Below we describe two ways to do updates: One that processes just updated rows, and another that supplies the full Row Dataset but with altered rows within it.

## Option 1 - Providing Just Updated Data

In this example we provide the initial data via a subscription, then provide updates via another.

The second subscription only provides changed rows - it does not provide the full dataset once again.

To efficiently process this data we need the following:

- A unique key per row - we do this by making use of the `getRowId` callback:

<snippet>
const gridOptions = {
    getRowId: params => {
        // the code is unique, so perfect for the ID
        return params.data.code;
    }
}
</snippet>

- A manner of letting AG Grid know the type of update we're doing - for this we make use of the [Transaction](/data-update/) method:

<snippet>
updates$.subscribe(update => gridOptions.api.applyTransaction({ update: update }));
</snippet>

With these two pieces of code we can supply the updates to AG Grid and the grid will only re-render the changes rows, resulting
in much improved performance.

<grid-example title='RxJS - Row Updates' name='rxjs-updates' type='generated' options='{ "enterprise": true, "extras": ["lodash", "rxjs", "bluebirdjs"], "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Option 2 - Providing Full Row Data With Updates Within

In this example we provide the initial data via a subscription, then provide updates via another, as above.

This time however the second subscription has the full row data, with altered row data within the full dataset.

To efficiently process this data we need two things:

- A unique key per row - we do this by making use of the `getRowId` callback.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    getRowId: params => {
        // the code is unique, so perfect for the ID
        return params.data.code;
    }
}
</snippet>

With this configuration we can supply the updates to AG Grid and the grid will only re-render the changed rows, resulting in much improved performance.

<snippet>
 updates$ = mockServer.allDataUpdates();    
 updates$.subscribe(function (newRowData) {
     return params.api.setRowData(newRowData);
 });
</snippet>

<grid-example title='RxJS - Full Updates' name='rxjs-full' type='generated' options='{ "enterprise": true, "extras": ["lodash", "rxjs", "bluebirdjs"], "modules": ["clientside", "rowgrouping"] }'></grid-example>

### Async Pipe

In the example above we manually subscribe to the `updates$` observable and call `api.setRowData` to update the grid. One potential downside of this approach is that we must remember to clean up this subscription when we are finished with it. 

Alternatively, we can take advantage of the `async` pipe to manage the Subscription for us. Using the `async` pipe we can provide the updates directly to the grid.

```html
<ag-grid-angular>
    [rowData]="updates$ | async"
</ag-grid-angular>
```