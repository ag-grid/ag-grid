<framework-specific-section frameworks="vue">
| The grid is configure via the `ag-grid-vue` component. Properties consist of simple types, arrays, complex objects and callback functions.
| Properties are registered using their 'dash' syntax and not camel-case. For example, the property `pivotMode` is bound using `pivot-mode`. The following example shows some bindings:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
| &lt;ag-grid-vue
|    // Attribute, not bound, give an explicit value
|    rowSelection="multiple"
|
|    // A boolean value
|    :pivot-mode="true"
|
|    // A bound property
|    :columnDefs="columnDefs"
|
|    // A callback
|    :getRowHeight="myGetRowHeightFunction"
| &lt;/ag-grid-vue>
</snippet>
</framework-specific-section>