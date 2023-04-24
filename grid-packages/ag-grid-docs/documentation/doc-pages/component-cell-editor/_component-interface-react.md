[[only-react]]
|## Cell Editor Component
|
|When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `props`.
|
|The editor interface is as follows:
|
|```ts
|interface ICellEditorReactComp {
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
|```
|[[note]]
||Note that if you're using Hooks for Grid Components that have lifecycle/callbacks that the
||grid will call (for example, the `getValue` callback from an Editor Component), then you'll need to expose them with
||`forwardRef` & `useImperativeHandle`.
||
||Please refer to the [Hook](/react-hooks/) documentation (or the examples on this page) for more information.
|
|The interface for values available on component creation (via `props`) is `ICellEditorParams`:

