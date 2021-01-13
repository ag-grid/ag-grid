---
title: "Grid Interface"
---

This section details the public interface that your application can use to interact with the grid, including methods, properties and events.

The grid interface is the combination of the following items:

- [Grid Properties](../grid-properties/): properties used to configure the grid, e.g. `pagination = true`.
- [Grid API](../grid-api/): methods used to interact with the grid after it's created, e.g. `api.getSelectedRows()`.
- [Grid Events](../grid-events/): events published by the grid to inform applications of changes in state, e.g. `rowSelected`.
- [Grid Callbacks](../grid-callbacks/): callbacks are used by the grid to retrieve required information from your application, e.g. `getRowHeight()`.
- [Row Node](../row-object/): each row in the grid is represented by a Row Node object, which in turn has a reference to the piece of row data provided by the application. The Row Node wraps the row data item. The Row Node has attributes, methods and events for interacting with the specific row e.g. `rowNode.setSelected(true)`.

## Grid Options

The `gridOptions` object is a 'one stop shop' for the entire interface into the grid. The grid options can be used regardless of the framework you are using, but if you are using a framework you might find it easier to use your framework's bindings. How to configure for a particular framework is explained further down this page.

The example below shows the different types of items available on `gridOptions`.

```js
var gridOptions = {
    // PROPERTIES
    // Objects like myRowData and myColDefs would be created in your application
    rowData: myRowData,
    columnDefs: myColDefs,
    pagination: true,
    rowSelection: 'single',

    // EVENTS
    // Add event handlers
    onRowClicked: function(event) { console.log('A row was clicked'); },
    onColumnResized: function(event) { console.log('A column was resized'); },
    onGridReady: function(event) { console.log('The grid is now ready'); },

    // CALLBACKS
    isScrollLag: function() { return false; }
}
```

Once the grid is initialised, you will also have access to the grid API (`api`) and column API (`columnApi`) on the `gridOptions` object as shown:

```js
// refresh the grid
gridOptions.api.refreshView();

// resize columns in the grid to fit the available space
gridOptions.columnApi.sizeColumnsToFit();
```

## Listening to Events

In addition to adding event listeners directly via the `gridOptions` object, it is possible to register for events, similar to registering for events on native DOM elements. This means there are two ways to listen for events: either to use the `onXXX()` method on the API (where XXX is replaced with the event name), or to register for the event. The latter option allows you to add multiple handlers for the same event. The following example demonstrates the two options:

```js
// create handler function
function myRowClickedHandler(event) {
    console.log('The row was clicked');
}

// option 1: use the API
gridOptions.onRowClicked = myRowClickedHandler;

// option 2: register the handler
gridOptions.api.addEventListener('rowClicked', myRowClickedHandler);
```

### Events Are Asynchronous

Grid events are asynchronous so that the state of the grid will be settled by the time your event callback gets invoked.

## Default Boolean Properties

Where the property is a boolean (`true` or `false`), then `false` (or left blank) is the default value. For this reason, on / off items are presented in a way that causes the most common behaviour
to be used when the value is `false`. For example, `suppressCellSelection` is named as such because most people will want cell selection to be enabled.

[[only-javascript]]
| ## Vanilla JavaScript
|
| For plain Javascript, all of your interaction with ag-Grid will be through `gridOptions`.
|
| ## Polymer
|
| The `gridOptions` are fully available, but you can also advantage of the properties and events provided by ag-Grid's Polymer Component. This is done as follows:
|
| ### Properties
|
| Properties on ag-grid-polymer can be provided in the following three ways:
|
| - LowerCase: `rowanimation`
| - CamelCase: `rowAnimation`
| - Hyphenated Lowercase: `row-animation`
|
| You can specify the properties in the following ways:
|
| - On the `ag-grid-polymer`component at declaration time
| - On the `gridOptions` property
|
| #### Properties on ag-grid-polymer
|
| ```html
| <ag-grid-polymer rowData="{{rowData}}" rowAnimation pivot-mode></ag-grid-polymer>
| ```
|
| Here we've specified three properties: `rowData` is provided with two-way binding, and `rowAnimation` and `pivot-mode` illustrate how you can specify properties using different cases.
|
| ### Events
|
| All data out of the grid comes through events. You can specify the events you want to listen to in the following ways:
|
| - On the `ag-grid-polymer`component at declaration time
| - On the `gridOptions` property
| - On the `ag-grid-polymer`component post creation time, via event listeners
| - On the `ag-grid-polymer`component post creation time, via direct property access
|
| #### Events on ag-grid-polymer
|
| ```html
| <ag-grid-polymer onGridReady="{{onGridReady}}"></ag-grid-polymer>
| ```
|
| Here we're listening to the `gridReady` event - as with most events we need to add the "on" prefix.
| [[note]]
| | When defining event listeners in this way it's important to note that the `this` context will be `ag-grid-polymer`, **not** the containing application element. You will have access to the grid's properties directly, but not the application element itself. The `api` and `columnApi` are available directly via `this.api` and `this.columnApi`.
|
| #### Events via the _gridOptions_ property
|
| ```html
| <ag-grid-polymer gridOptions="{{gridOptions}}"></ag-grid-polymer>
| ```
|
| ```js
| this.gridOptions.onColumnResized = event => {
|     console.log('Event via option 1: ' + event);
| };
| ```
|
| #### Events via Event Listeners on an instance of ag-grid-polymer
|
| ```html
| <ag-grid-polymer id="myGrid"></ag-grid-polymer>
| ```
|
| ```js
| this.$.myGrid.addEventListener('columnresized', event => {
|     console.log('Event via option 2: ' + event.agGridDetails);
| });
| ```
|
| In this case we need to specify an ID on the `ag-grid-polymer` component in order to access it.
|
| The grid's payload will be available on the event's `agGridDetails` property.
|
| #### Events via direct property access on an instance of ag-grid-polymer
|
| ```html
| <ag-grid-polymer id="myGrid"></ag-grid-polymer>
| ```
|
| ```js
| this.$.myGrid.oncolumnresized = event => {
|     console.log('Event via option 3: ' + event.agGridDetails);
| };
| ```
|
| In this case we need to specify an ID on the `ag-grid-polymer` component in order to access it.
|
| The grid's payload will be available on the event's `agGridDetails` property.
|
| ### Grid API
|
| The Grid API (both `api` and `columnApi`) will only be available after the `gridReady` event has been fired.
|
| You can access the APIs in the following ways:
|
| - Store them from the `gridReady` event - they'll be available via the `params` argument passed into the event
| - Provide a `gridOptions` object to the grid pre-creation time. Post-creation the APIs will be available on the `gridOptions` object.
|
| ## Web Components
|
| The `gridOptions` are fully available for Web Components. However you can take advantage of Web Components attributes for setting properties and also directly accessing the Web Components DOM object for interacting with the component. This is done as follows:
|
| - **Attributes**: attributes are defined as normal HTML attributes and set non-bound values.
| - **Properties**: properties are set directly onto the DOM object using JavaScript.
| - **Callbacks**: callbacks, like properties, are also set directly on the DOM object using JavaScript.
| - **Event Handlers**: event handlers are registered as normal DOM event handlers, using either `addEventListener(eventName, handler)` or assigning an `onXXX` method on the DOM object.
| - **API**: The grid API and column API are accessible through the DOM object.
|
| Bindings are registered using their 'dash' syntax and not camel-case. For example, the property `rowAnimation` is bound using `row-animation`.
|
| Properties and callbacks are set using standard camel-case; no changes are made.
|
| **Web Components Events are all done using lowercase**. This keeps the event handling consistent with native DOM elements, but breaks away from the camel-case of how events are managed by the  other frameworks ag-Grid supports.
|
| This example shows setting up as a Web Component in HTML. Notice it's similar to Angular, but without binding of properties or event handling.
|
| ```html
| <ag-grid
|    // normal ID for CSS selector inside JavaScript
|    id="myGrid"
|
|    // these are boolean values, which if included without a value, default to true
|    row-animation
|
|    // these are attributes, not bound, give explicit values here
|    row-height="22"
|    row-selection="multiple">
| </ag-grid>
| ```
|
| Then the callbacks and event handling are done in JavaScript as follows:
|
| ```js
| var myGrid = document.querySelector('#myGrid');
|
| // calling a method directly on the ag-Grid DOM element.
| // calling setGridOptions starts up the grid and is mandatory (even if gridOptions is empty)
| myGrid.setGridOptions(gridOptions);
|
| // add events to grid, option 1 - add an event listener
| myGrid.addEventListener('columnresized', function(event) {
|     console.log('Got an event via option 1');
| });
|
| // add events to grid, option 2 - callback on the element
| myGrid.oncolumnresized = function(event) {
|     console.log('Got an event via option 2');
| };
|
| // add events to grid, option 3 - callback on the grid options
| // remember we can still use everything in gridOptions, the
| // Web Components features are all in addition
| gridOptions.onColumnResized = function(event) {
|     console.log('Got an event via option 3');
| };
|
| // call something on the API
| myGrid.api.refreshView();
| myGrid.columnApi.sizeColumnsToFit();
|
| // change a property
| myGrid.quickFilterText = 'sandy';
| myGrid.showToolPanel = true;
| ```

[[only-react]]
|
| ## React
| The `gridOptions` are fully available for React. However, you can also take advantage of the properties and events provided by ag-Grid's React Component. This is done as follows:
|
| - **Properties**: properties are defined by passing React props down to ag-Grid.
| - **Callbacks**: callbacks are also defined using React Props.
| - **Event Handlers**: event handlers are also defined using React Props.
| - **API**: The grid API and column API are provided to you via the `onGridReady()` event callback.
|
| So in summary, in React, everything is done via React Props. Here is an example:
|
| ```jsx
| <AgGridReact
|    ref="agGrid" // useful for accessing the component directly via ref
|    rowSelection="multiple" // simple attributes, not bound to any state or prop
|
|    // these are bound props, so can use anything in React state or props
|    columnDefs={this.props.columnDefs}
|    showToolPanel={this.state.showToolPanel}
|
|    // this is a callback
|    isScrollLag={this.myIsScrollLagFunction.bind(this)}
|
|    // these are registering event callbacks
|    onCellClicked={this.onCellClicked.bind(this)}
|    onColumnResized={this.onColumnEvent.bind(this)}
|
|    // inside onGridReady, you receive the grid APIs if you want them
|    onGridReady={this.onGridReady.bind(this)}
| />
| ```
|
| The APIs are also accessible through the component itself. For example, above the `ref` is given as `'myGrid'` which then allows the API to be accessed like this:
|
| ```jsx
| <button onClick={() => this.refs.agGrid.api.deselectAll()}>Clear Selection</button>
| ```

[[only-angular]]
|
| ## Angular
|
| The `gridOptions` are fully available for Angular. However, you can also take advantage of the properties and events provided by ag-Grid's Angular Component. This is done as follows:
|
| - **Attributes**: attributes are defined as normal HTML attributes and set non-bound values.
| - **Properties**: properties are defined as HTML attributes enclosed in square brackets and are Angular bound values.
| - **Callbacks**: callbacks are actually a type of property, but by convention they are always functions and are not for relaying event information. They are bound as properties using square brackets. As callbacks are not events, they do not impact the Angular event cycle, and as such should not change the state of anything.
| - **Event Handlers**: event handlers are defined as HTML attributes enclosed in normal brackets and are Angular bound functions.
| - **API**: the grid API and column API are accessible through the component.
|
| All of the above (attributes, properties, callbacks and event handlers) are registered using their 'dash' syntax and not camel-case. For example, the property `rowAnimation` is bound using `row-animation`. The following example shows some bindings:
|
| ```jsx
| <ag-grid-angular
|    #myGrid // assign an angular ID to the grid
|
|    // these are boolean values, which if included without a value, default to true
|    // (if they are not specified, the default is false)
|    row-animation
|    pagination
|
|    // these are attributes, not bound, give explicit values here
|    row-selection="multiple"
|
|    // these are bound properties, bound to the AngularJS 1.x current context (that's what a
|    // scope is called in Angular 2)
|    [column-defs]="columnDefs"
|    [show-tool-panel]="showToolPanel"
|
|    // this is a callback
|    [is-scroll-lag]="myIsScrollLagFunction"
|
|    // these are registering event callbacks
|    (cell-clicked)="onCellClicked($event)"
|    (column-resized)="onColumnEvent($event)">
| </ag-grid-angular>
| ```
|
| The APIs are also accessible through the component. For example, above the ID is given as `'#myGrid'` which then allows the API to be accessed like this:
|
| ```jsx
| <button (click)="myGrid.api.deselectAll()">Clear Selection</button>
| ```

[[only-vue]]
|
| ## VueJS
|
| The `gridOptions` are fully available for VueJS. However, you can also take advantage of the properties and events provided by ag-Grid's VueJS Component. This is done as follows:
|
| - **Attributes**: attributes are defined as normal HTML attributes and set non-bound values.
| - **Properties**: properties are defined as HTML attributes prefixed with a colon (`:`) and are VueJS bound values.
| - **Callbacks**: callbacks are actually a type of property, but by convention they are always functions and are not for relaying event information. They are bound as properties prefixed with a colon (`:`). As callbacks are not events, they do not impact the VueJS event cycle, and as such should not change the state of anything.
| - **Event Handlers**: event handlers are defined as HTML attributes prefixed with a colon (`:`) and are VueJS bound functions.
| - **API**: The grid API and column API are accessible through the component.
|
| All of the above (attributes, properties, callbacks and event handlers) are registered using their 'dash' syntax and not camel-case. For example, the property `pivotMode` is bound using `pivot-mode`. The following example shows some bindings:
|
| ```jsx
| <ag-grid-vue
|    // these are attributes, not bound, give explicit values here
|    rowSelection="multiple"
|
|    // these are boolean values
|    // (leaving them out will default them to false)
|    :rowAnimation="true"
|    :pivot-mode="true"
|
|    // these are bound properties
|    :gridOptions="gridOptions"
|    :columnDefs="columnDefs"
|
|    // this is a callback
|    :isScrollLag="myIsScrollLagFunction"
|
|    // these are registering event callbacks
|    :modelUpdated="onModelUpdated"
|    :cellClicked="onCellClicked">
| </ag-grid-vue>
| ```
|
| The APIs are accessible through the component. For example, above the ID is given as `'#myGrid'` which then allows the API to be accessed like this:
|
| ```html
| <button @click="myGrid.api.deselectAll()">Clear Selection</button>
| ```

## Next Steps

That's it, Doc! Now you know how to interface with the grid. Go now and find out about all the great [properties](../grid-properties/), [methods](../grid-api/), [callbacks](../grid-callbacks/) and [events](../grid-events/) you can use.
