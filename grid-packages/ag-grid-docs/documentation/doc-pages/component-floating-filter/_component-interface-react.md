<framework-specific-section frameworks="react">
|To configure custom floating filters, first enable the grid option `reactiveCustomComponents`.
|
|Custom floating filter components are controlled components, which receive a filter model as part of the props, and pass model updates back to the grid via the `onModelChange` callback. A filter model of `null` means that no filter is applied (the filter displays as inactive). Note that the filter is applied immediately when `onModelChange` is called.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default ({ model, onModelChange }) => {
|    return (
|        &lt;div>
|            &lt;input
|                type="text"
|                value={model || ''}
|                onChange={({ target: { value }}) => onModelChange(value === '' ? null : value)}
|            />
|        &lt;/div>
|    );
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>Enabling `reactiveCustomComponents` affects all custom components. If you have custom components built in an imperative way instead of setting the `reactiveCustomComponents` option, they may need to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents). For the legacy imperative documentation, see [Imperative Floating Filter Component](../component-floating-filter-imperative-react/).</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
<h2 id="custom-floating-filter-parameters">Custom Floating Filter Parameters</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|### Floating Filter Props
|
|The following props are passed to the custom floating filter components (`CustomFloatingFilterProps` interface). If custom props are provided via the `colDef.floatingFilterParams` property, these will be additionally added to the props object, overriding items of the same name if a name clash exists.
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomFloatingFilterProps' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
|### Floating Filter Callbacks
|
|The following callbacks can be passed to the `useGridFloatingFilter` hook (`CustomFloatingFilterCallbacks` interface). All the callbacks are optional, and the hook only needs to be used if callbacks are provided.
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomFloatingFilterCallbacks' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>
