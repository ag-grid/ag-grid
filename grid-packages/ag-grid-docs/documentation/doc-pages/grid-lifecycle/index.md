---
title: "Grid Lifecycle"
---

This section covers some common lifecycle events that are raised after grid initialisation, data updates, and before the 
grid is destroyed.

<note>
The events on this page are listed in the order they are raised.
</note>

## Grid Ready

The `gridReady` event fires upon grid initialisation but the grid may not be fully rendered.

**Common Uses**
- Customising Grid via API calls.
- Event listener setup.
- Grid-dependent setup code.

In this example, `gridReady` applies user pinning preferences before rendering data.

<grid-example title='Using Grid Ready Event' name='grid-ready' type='mixed'></grid-example>

## First Data Rendered

The `firstDataRendered` event fires the first time data is rendered into the grid. It will only be fired once unlike `rowDataUpdated` which is fired on every data change.

## Row Data Updated

The `rowDataUpdated` event fires every time the grid's data changes, by [Updating Row Data](/data-update-row-data/) or
by applying [Transaction Updates](/data-update-transactions/). In the [Server Side Row Model](/server-side-model), use
the [Model Updated Event](/grid-events/#reference-miscellaneous-modelUpdated) instead.

**Common Uses**

- Hiding loaders.
- Refreshing related UI elements on data changes.

In this example the time at which `firstDataRendered` and `rowDataUpdated` are fired is recorded above the grid. Note that `firstDataRendered` is only set on the initial load of the grid and is not updated when reloading data.

<grid-example title='Using Row Data Event' name='row-data-updated' type='mixed'></grid-example>

## Grid Pre-Destroyed

The `gridPreDestroyed` event fires just before the grid is destroyed and is removed from the DOM.

**Common Uses**

- Clean up resources.
- Save grid state.
- Disconnect other libraries.

In this example, `gridPreDestroyed` saves column widths before grid destruction.

<grid-example title='Using Pre-Destroyed Event' name='grid-pre-destroyed' type='mixed'></grid-example>

<framework-specific-section frameworks="angular">
|### Angular PreDestroy Setup
|When using Angular, register the `gridPreDestroyed` event handler in the grid options instead of on the grid element directly.
|
|For example:
</framework-specific-section>
<framework-specific-section frameworks="angular">
<snippet transform={false}>
|this.gridOptions = {
|  onGridPreDestroyed: () => {
|    // handler code
|  }
|};
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="angular">
|Rather than:
</framework-specific-section>
<framework-specific-section frameworks="angular">
<snippet transform={false}>
|&lt;ag-grid-angular 
|  (gridPreDestroyed)="onGridPreDestroyed($event)"
|>&lt;/ag-grid-angular>
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="angular">
|This approach ensures proper clean-up during Angular's change detection cycle.
</framework-specific-section>
