---
title: "Grid Lifecycle"
---

AG Grid fires lifecycle events to enable applications to run code at key moments in the grid's lifecycle. For example: at initialization, first data rendered, data updated and destruction.

This guide focuses on the most commonly used lifecycle events.
For a complete list of all available grid events, visit [Grid Events](/grid-events/) documentation page.

## Grid Ready

The first event fired is `gridReady` which signals the grid has initialised and is ready for api calls. This doesn't mean that the grid has fully rendered on the screen yet.

### Use Cases

* Calling api methods to customize the grid
* Setting up event listeners
* Running setup code that requires the grid to be initialized

### Example

In this example, the `gridReady` event retrieves a users pinning preference and applies it before the data is rendered.

<grid-example title='Using Grid Ready Event' name='grid-ready' type='mixed'></grid-example>

## First Data Rendered

The `firstDataRendered` event fires the first time data is rendered into the grid.

### Use Cases

* Hiding loaders or placeholders once grid data is displayed
* Capturing grid state only available post-render (e.g. auto-calculated column widths)
* Running logic requiring the grid rows to be rendered

### Example

This example demonstrates using `firstDataRendered` to capture auto-calculated column widths.

Click the __Load Grid Data__ button, the first column width is calculated based on the loaded data. We use the `firstDataRendered` event to capture the new column width and display it in the UI.

<grid-example title='Using Grid Ready Event' name='first-data-rendered' type='mixed'></grid-example>

## Row Data Updated

The `rowDataUpdated` event fires when the client has updated data for the grid either by setting new Row Data or by applying a Row Transaction.

This is only triggered when the client uses the [Client Side](/client-side-model/) row model.
For the [Server Side](/server-side-model/) row model, use the [Model Updated](/grid-events/model-updated/) event instead.

### Use Cases

* Refreshing other UI components to reflect the new data
* Triggering calculations or application logic based on data changes
* Broadcasting data changes to other parts of the app

### Example

This example demonstrates using `rowDataUpdated` to update another component when grid data changes.

<grid-example title='Using Grid Ready Event' name='row-data-updated' type='mixed'></grid-example>

## Grid Pre-Destroyed

The `gridPreDestroyed` event is invoked immediately before the grid is destroyed and removed from the DOM.

### Use Cases

* Cleaning up resources or state used by the grid, like removing event listeners.
* Capturing final grid state before destroy, if needed for persistence or recovery.
* Tearing down integrations with other libraries.

### Example

In this example, column widths can be edited by users either by resizing columns directly or clicking
the `Change Columns Width` button.

When the grid is destroyed, the `gridPreDestroyed` callback captures the current column widths for future use.
When the grid is re-created using the __Reload Grid__ button, the column widths are restored to their previous values.

<grid-example title='Using Grid Ready Event' name='grid-pre-destroyed' type='mixed'></grid-example>

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
|This is necessary because of how Angular handles event binding. Using the options object ensures the handler will be
|properly cleaned up by the Angular change detection.
</framework-specific-section>
