---
title: "Date Component - Imperative"
frameworks: ["react"]
---

<warning>
|This page describes the old imperative way of declaring custom date components when the grid option `reactiveCustomComponents` is not set. This behaviour is deprecated, and you should instead use the new behaviour described on the [Custom Date](../filter-date) page.
</warning>

An example date component looks like this:

<snippet transform={false} language="jsx">
|export default forwardRef((props, ref) => {
|    const dateRef = useRef(null);
|    const [date, setDate] = useState(null);
|
|    // expose AG Grid Date Lifecycle callbacks
|    useImperativeHandle(ref, () => {
|        return {
|            getDate(params) {
|                return dateRef.current;
|            },
|
|            setDate() {
|                dateRef.current = date;
|                setDate(date);
|            },
|        }
|    });
|
|    const onDateChange = (newDate) => {
|        setDate(newDate);
|        dateRef.current = newDate;
|        props.onDateChanged();
|    }
|
|    return (
|       &lt;input
|            type="date"
|            value={convertToString(date)}
|            onChange={({ target: { value } }) => onDateChange(convertToDate(value))}
|        />
|    );
|});
</snippet>

The example below shows how to register a custom date component that contains an extra floating calendar picker rendered from the filter field. The problem with this approach is that we have no control over third party components and therefore no way to implement a `preventDefault` when the user clicks on the Calendar Picker (for more info see [Custom Floating Filter Example](/component-floating-filter/#example-custom-floating-filter)). Our way of fixing this problem is to add the `ag-custom-component-popup` class to the floating calendar.

<grid-example title='Custom Date Component' name='custom-date' type='mixed' options='{ "extras": ["fontawesome", "flatpickr"] }'></grid-example>

## Custom Date Interface

The interface for a custom date component is as follows:

<interface-documentation interfaceName='IDate' config='{"asCode":true }' ></interface-documentation>

<note>
|Note that you will need to expose the lifecycle/callback methods (for example, the `getDate` callback) with
|`forwardRef` and `useImperativeHandle`.
</note>

## Custom Date Parameters

When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
row values available to you via `props` - the interface for what is provided is documented below.

<interface-documentation interfaceName='IDateParams' overridesrc='filter-date/resources/dateParams.json' ></interface-documentation>
