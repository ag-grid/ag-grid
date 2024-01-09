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
<note>If you do not enable the grid option `reactiveCustomComponents`, it is still possible to use custom dates, however this will involve declaring your React component imperatively, and is not recommend. See [Imperative Date Component](../component-date-imperative-react/).</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
<h2 id="custom-date-parameters">Custom Date Parameters</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|### Date Props
|
|The following props are passed to the custom date components (`CustomDateProps` interface).
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomDateProps' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
|### Date Callbacks
|
|The following callbacks can be passed to the `useGridDate` hook (`CustomDateCallbacks` interface). All the callbacks are optional, and the hook only needs to be used if callbacks are provided.
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomDateCallbacks' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>
