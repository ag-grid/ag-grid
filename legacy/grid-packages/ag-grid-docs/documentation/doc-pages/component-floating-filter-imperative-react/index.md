---
title: "Floating Filter Component - Imperative"
frameworks: ["react"]
---

<warning>
|This page describes the old imperative way of declaring custom floating filter components when the grid option `reactiveCustomComponents` is not set. This behaviour is deprecated, and you should instead use the new behaviour described on the [Custom Floating Filter](../component-floating-filter) page.
</warning>

An example floating filter component looks like this:

<snippet transform={false} language="jsx">
|export default forwardRef((props, ref) => {
|    const [value, setValue] = useState('');
|    const [type, setType] = useState('contains');
|
|      // expose AG Grid Filter Lifecycle callbacks
|    useImperativeHandle(ref, () => {
|        return {
|            onParentModelChanged(parentModel) {
|                setType(parentModel == null ? 'contains' : parentModel.type);
|                setValue(parentModel == null ? null : parentModel.filter);
|            },
|        };
|    });
|
|    const onChange = ({ target: { value: newValue }}) => {
|        setValue(newValue);
|        props.parentFilterInstance((instance) => {
|            instance.onFloatingFilterChanged(type, newValue === '' ? null : newValue);
|        });
|    };
|
|    return (
|        &lt;input
|            value={value}
|            type="text"
|            onChange={onChange}
|        />
|    );
|});
</snippet>

In the following example you can see how the Gold, Silver, Bronze and Total columns have a custom floating filter `NumberFloatingFilter`. This filter substitutes the standard floating filter for an input box that the user can change to adjust how many medals of each column to filter by based on a greater than filter.

<grid-example title='Custom Floating Filter' name='custom-floating-filter' type='mixed'></grid-example>

## Custom Floating Filter Interface

The interface for a custom floating filter component is as follows:

<snippet transform={false} language="ts">
|interface IFloatingFilter {
|    // Gets called every time the parent filter changes. Your floating
|    // filter would typically refresh its UI to reflect the new filter
|    // state. The provided parentModel is what the parent filter returns
|    // from its getModel() method. The event is the FilterChangedEvent
|    // that the grid fires.
|    onParentModelChanged(parentModel: any, event: FilterChangedEvent): void;
|
|    // Gets called every time the popup is shown, after the GUI returned in
|    // getGui is attached to the DOM. If the filter popup is closed and re-opened, this method is
|    // called each time the filter is shown. This is useful for any logic that requires attachment
|    // before executing, such as putting focus on a particular DOM element. 
|    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
|}
</snippet>

<note>
|Note that you will need to expose the lifecycle/callback methods (for example, the `onParentModelChanged` callback) with
|`forwardRef` and `useImperativeHandle`.
</note>

### Custom Floating Filter Parameters

When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell and row values available to you via `props` - the interface for what is provided is documented below.

If custom params are provided via the `colDef.floatingFilterComponentParams` property, these will be additionally added to the params object, overriding items of the same name if a name clash exists.

<interface-documentation interfaceName='IFloatingFilterParams' ></interface-documentation>
