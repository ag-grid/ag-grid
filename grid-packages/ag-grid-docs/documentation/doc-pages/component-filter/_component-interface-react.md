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
<note>If you do not enable the grid option `reactiveCustomComponents`, it is still possible to use custom filters, however this will involve declaring your React component imperatively, and is not recommended. See [Imperative Filter Component](../component-filter-imperative-react/).</note>
</framework-specific-section>
