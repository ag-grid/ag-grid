---
title: "Cell Editor Component - Imperative"
frameworks: ["react"]
---

<warning>
|This page describes the old imperative way of declaring custom cell editor components when the grid option `reactiveCustomComponents` is not set. This behaviour is deprecated, and you should instead use the new behaviour described on the [Custom Cell Editor](../cell-editors) page.
</warning>

An example cell editor component looks like this:

<snippet transform={false} language="jsx">
|export default forwardRef((props, ref) => {
|    const [value, setValue] = useState(props.value);
|
|    /* Component Cell Editor Lifecycle methods */
|    useImperativeHandle(ref, () => {
|        return {
|            getValue() {
|                return value;
|            },
|        };
|    });
|
|    return (
|        &lt;input
|            type="text"
|            value={value || ''}
|            onChange={({ target: { value: newValue }}) => setValue(newValue))}
|        />
|    );
|});
</snippet>

The example below shows a few cell editors in action.

- The `Doubling` Cell Editor will double a given input and reject values over a 1000
- The `Mood` Cell Editor illustrates a slightly more complicated editor with values changed depending on the smiley chosen
- The `Numeric` Cell Editor illustrates a slightly more complicated numeric editor to the `Doubling` editor, with increased input validation

<grid-example title='Simple Editor Components' name='component-editor' type='mixed' options='{ "exampleHeight": 370 }'></grid-example>

## Custom Cell Editor Interface

The interface for a custom cell editor component is as follows:

<snippet transform={false} language="ts">
|interface ICellEditor {
|
|    // Mandatory - Return the final value - called by the grid once after editing is complete
|    getValue(): any;
|
|    // Gets called once after initialised. If you return true, the editor will not be
|    // used and the grid will continue editing. Use this to make a decision on editing
|    // inside the init() function, eg maybe you want to only start editing if the user
|    // hits a numeric key, but not a letter, if the editor is for numbers.
|    isCancelBeforeStart?(): boolean;
|
|    // Gets called once after editing is complete. If your return true, then the new
|    // value will not be used. The editing will have no impact on the record. Use this
|    // if you do not want a new value from your gui, i.e. you want to cancel the editing.
|    isCancelAfterEnd?(): boolean;
|
|    // If doing full line edit, then gets called when focus should be put into the editor
|    focusIn?(): boolean;
|
|    // If doing full line edit, then gets called when focus is leaving the editor
|    focusOut?(): boolean;
|}
</snippet>

<note>
|Note that you will need to expose the lifecycle/callback methods (for example, the `getValue` callback) with
|`forwardRef` and `useImperativeHandle`.
</note>

### Custom Cell Editor Parameters

When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell and
row values available to you via `props` - the interface for what is provided is documented below.

If custom params are provided via the `colDef.cellEditorParams` property, these
will be additionally added to the params object, overriding items of the same name if a name clash exists.

<interface-documentation interfaceName='ICellEditorParams'></interface-documentation>

## Accessing Cell Editor Instances

After the grid has created an instance of a cell editor for a cell it is possible to access that instance. This is useful if you want to call a method that you provide on the cell editor that has nothing to do with the operation of the grid. Accessing cell editors is done using the grid API `getCellEditorInstances(params)`.

<api-documentation source='grid-api/api.json' section='editing' names='["getCellEditorInstances"]'></api-documentation>

If you are doing normal editing, then only one cell is editable at any given time. For this reason if you call `getCellEditorInstances()` with no params, it will return back the editing cell's editor if a cell is editing, or an empty list if no cell is editing.

An example of calling `getCellEditorInstances()` is as follows:

<snippet transform={false}>
const instances = api.getCellEditorInstances(params);
if (instances.length > 0) {
    const instance = instances[0];
}
</snippet>
