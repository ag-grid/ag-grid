<framework-specific-section frameworks="react">
|To configure Custom Cell Editors, first enable the grid option `reactiveCustomComponents`.
|
|Custom Cell Editor Components are Controlled Components, which receive a value as part of the props, and pass value updates back to the grid via the `onValueChange` callback. The value is not set until editing stops.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default ({ value, onValueChange }) => {
|    return (
|        &lt;input
|            type="text"
|            value={value || ''}
|            onChange={({ target: { value }}) => onValueChange(value === '' ? null : value)}
|        />
|    );
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>Enabling `reactiveCustomComponents` affects all custom components. If you have custom components built in an imperative way instead of setting the `reactiveCustomComponents` option, they may need to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents). For the legacy imperative documentation, see [Imperative Cell Editor Component](../component-cell-editor-imperative-react/).</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
|The provided props (interface CustomCellRendererProps) are:
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomCellEditorProps' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
|The following callbacks can be passed to the `useGridCellEditor` hook (`CustomCellEditorCallbacks` interface). All the callbacks are optional. The hook only needs to be used if callbacks are provided.
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomCellEditorCallbacks' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>
