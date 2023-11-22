<framework-specific-section frameworks="vue">
|
| - **Event Handlers**: event handlers are are bound in the standard way (e.g. `@cell-clicked="onCellClicked"`). Event names must use `kebab-case`.
|
| Event handlers are registered using their 'dash' syntax and not camel-case. For example, the event `cellClicked` is bound using `cell-clicked`.
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
|    // these are registering event callbacks
|    @model-updated="onModelUpdated"
|    @cell-clicked="onCellClicked">
| &lt;/ag-grid-vue>
</snippet>
</framework-specific-section>