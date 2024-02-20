<framework-specific-section frameworks="vue">
|
| The grid api can be accessed via `this.$refs.myGrid.api` where `ref="myGrid"` is applied to the `ag-grid-vue` component. This will only be defined after the grid has been initialised.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue ref="myGrid" />
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
| The `api` is also provided on the params for all grid events and callbacks. The first event fired is the `gridReady` event and that can be used to store a reference to the api within your component as an alternative to using `$refs`.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue @grid-ready="onGridReady" />
|
| // Store the api for later use
| onGridReady = (params) => {
|     this.api = params.api;
| }
</snippet>
</framework-specific-section>