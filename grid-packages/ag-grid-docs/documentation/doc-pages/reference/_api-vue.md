<framework-specific-section frameworks="vue">
|
| The grid api can be accessed via `this.$refs.myGrid.api` where `ref="myGrid"` is applied to the `ag-grid-vue` component. This will only be defined after the grid has been initialised.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
|     ref="myGrid"
|     // ...
| />
|
| // methods
| onClick() {
|     this.$refs.myGrid.api.deselectAll();
| },
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### API within Events and Callbacks
|
| The `api` is also provided on the params for all grid events and callbacks.
|
| The first event fired is the `gridReady` event and that can be used to store a reference to the api within your component as an alternative to using `$refs`.
|
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
| ## Grid Options
|
| The `gridOptions` object can be used instead of, or in addition to, normal framework binding. If an option is set via `gridOptions`, as well as directly on the component, then the component value will take precedence.
|
| The example below shows the different types of items available on `gridOptions`.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| const gridOptions = {
|     // PROPERTIES
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