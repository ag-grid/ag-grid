---
title: "Date Component - Imperative"
frameworks: ["react"]
---

<warning>
|This page describes the old imperative way of declaring custom date components when the grid option `reactiveCustomComponents` is not set. It is strongly recommended to instead use the new behaviour described on the [Custom Date](../component-date) page.
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

## Custom Date Interface

The interface for a custom date component is as follows:

<interface-documentation interfaceName='IDateReactComp' config='{"asCode":true }' ></interface-documentation>

<note>
|Note that you will need to expose the lifecycle/callback methods (for example, the `getDate` callback) with
|`forwardRef` and `useImperativeHandle`.
</note>

## Custom Date Parameters

When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
row values available to you via `props` - the interface for what is provided is documented below.

<interface-documentation interfaceName='IDateParams' overridesrc='component-date/resources/dateParams.json' ></interface-documentation>
