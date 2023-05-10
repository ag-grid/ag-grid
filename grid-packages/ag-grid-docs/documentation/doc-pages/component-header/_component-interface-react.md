[[only-react]]
|## Header Component Interface
|
|The interface for a custom header component is as follows:
|
|```ts
|interface IHeaderReactComp {
|    // Gets called when a new Column Definition has been set for this header.
|    // If you handle the refresh of your header return true otherwise return false and the grid will re-create your header from scratch.
|    refresh?(params: IHeaderParams): boolean;
|}
|```
|
|[[note]]
||Note that if you're using Hooks for Grid Components that have lifecycle/callbacks that the
||grid will call (for example, the `refresh` callback from an Editor Component), then you'll need to expose them with
||`forwardRef` & `useImperativeHandle`.
||
||Please refer to the [Hook](/react-hooks/) documentation (or the examples on this page) for more information.
|
|[[note]]
||Implementing `refresh` is entirely optional - if you omit it then the `props` of the Custom Header Component will get updated when changes occur 
||as per the normal React lifecycle.
||
|
|### Custom Header Parameters
|
|When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `props` - the interface for what is provided is documented below.
|
|If custom params are provided via the `colDef.headerComponentParams` property, these
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
