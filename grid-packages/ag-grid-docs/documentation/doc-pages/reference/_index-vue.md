<framework-specific-section frameworks="vue">
|
| ## Properties, Callbacks, Events
|
| - **Attributes**: attributes are properties, but aren't bound - they are instead provided literal values (e.g. `rowSelection="multiple"`).
| - **Properties**: properties are bound attributes (e.g. `:columnDefs="columnDefs"`).
| - **Callbacks**: callbacks are bound in the same as properties are (e.g. `:getRowHeight="myGetRowHeightFunction"`).
| - **Event Handlers**: event handlers are are bound in the standard way (e.g. `@cell-clicked="onCellClicked"`). Event names must use `kebab-case`.
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