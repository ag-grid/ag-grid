<framework-specific-section frameworks="react">
|To configure custom filters, first enable the grid option `reactiveCustomComponents`.
|
|Custom filter components are controlled components, which receive a filter model as part of the props, and pass model updates back to the grid via the `onModelChange` callback. A filter model of `null` means that no filter is applied (the filter displays as inactive). Note that the filter is applied immediately when `onModelChange` is called.
|
|To implement the filtering logic, a custom filter needs to implement the `doesFilterPass` callback, and provide it to the `useGridFilter` hook.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default ({ model, onModelChange, getValue }) => {
|    const doesFilterPass = useCallback(({ node }) => {
|        // filtering logic
|        return getValue(node).contains(model);
|    }, [model]);
|
|    // register filter callbacks with the grid
|    useGridFilter({ doesFilterPass });
|
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
<note>Enabling `reactiveCustomComponents` affects all custom components. If you have custom components built in an imperative way instead of setting the `reactiveCustomComponents` option, they may need to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents). For the legacy imperative documentation, see [Imperative Filter Component](../component-filter-imperative-react/).</note>
</framework-specific-section>
