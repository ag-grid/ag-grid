<framework-specific-section frameworks="react">
|To configure custom dates, first enable the grid option `reactiveCustomComponents`.
|
|Custom date components are controlled components, which receive a date value as part of the props, and pass date value updates back to the grid via the `onDateChange` callback. Note that the date is applied immediately when `onDateChange` is called.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default ({ date, onDateChange }) => {
|    ...
|    return (
|        &lt;input
|            type="date"
|            value={convertToString(date)}
|            onChange={({ target: { value } }) => onDateChange(convertToDate(value))}
|        />
|    );
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>Enabling `reactiveCustomComponents` affects all custom components. If you have custom components built in an imperative way instead of setting the `reactiveCustomComponents` option, they may need to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents). For the legacy imperative documentation, see [Imperative Date Component](../component-date-imperative-react/).</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
|The following props are passed to the custom date components (`CustomDateProps` interface).
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomDateProps' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
|The following callbacks can be passed to the `useGridDate` hook (`CustomDateCallbacks` interface). All the callbacks are optional, and the hook only needs to be used if callbacks are provided.
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomDateCallbacks' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>
