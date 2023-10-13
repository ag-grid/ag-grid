<framework-specific-section frameworks="vue">
|
| ## Properties, Events, Callbacks and API
|
| - **Attributes**: attributes are properties, but aren't bound - they are instead provided literal values (e.g. `rowSelection="multiple"`).
| - **Properties**: properties are bound attributes (e.g. `:columnDefs="columnDefs"`).
| - **Callbacks**: callbacks are bound in the same as properties are (e.g. `:getRowHeight="myGetRowHeightFunction"`).
| - **Event Handlers**: event handlers are are bound in the standard way (e.g. `@cell-clicked="onCellClicked"`). Event names must use `kebab-case`.
| - **API**: the grid api is accessible through the component.
|
| All of the above (attributes, properties, callbacks and event handlers) are registered using their 'dash' syntax and not camel-case. For example, the property `pivotMode` is bound using `pivot-mode`. The following example shows some bindings:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
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
|    :getRowHeight="myGetRowHeightFunction"
|
|    // these are registering event callbacks
|    @model-updated="onModelUpdated"
|    @cell-clicked="onCellClicked">
| &lt;/ag-grid-vue>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ## Access the Grid API
|
| When the grid is initialised, it will fire the `gridReady` event. If you want to use the `api` of
| the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api
| from the params. You can then call the api at a later stage to interact with the
| grid (on top of the interaction that can be done by setting and changing the properties).
|
| The grid api can also be accessed via `this.$refs.myGrid.api` where `ref="myGrid"` is applied to the `ag-grid-vue` component.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
|     // provide gridReady callback to the grid
|     @grid-ready="onGridReady"
|     // ...
| />
|
| // in onGridReady, store the api for later use
| onGridReady = (params) => {
|     this.api = params.api;
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| The api is then accessible through the component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="html">
| &lt;button @click="this.api.deselectAll()">Clear Selection&lt;/button>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ## Grid Options
|
| The `gridOptions` object is a 'one stop shop' for the entire interface into the grid, commonly used if using plain JavaScript.
| Grid options can however be used instead of, or in addition to, normal framework binding. If an option is set via `gridOptions`, as well as directly on the component, then the component value will take precedence.
|
| The example below shows the different types of items available on `gridOptions`.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| const gridOptions = {
|     // PROPERTIES
|     // Objects like myRowData and myColDefs would be created in your application
|     rowData: myRowData,
|     columnDefs: myColDefs,
|     pagination: true,
|     rowSelection: 'single',
|
|     // EVENTS
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked')
|     onColumnResized: event => console.log('A column was resized')
|     onGridReady: event => console.log('The grid is now ready')
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
| &lt;ag-grid-vue
|     :gridOptions="gridOptions"
</snippet>
</framework-specific-section>