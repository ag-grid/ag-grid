<framework-specific-section frameworks="vue">
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
|     ref="myGrid"
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