[[only-angular]]
|## Tool Panel Interface
|
|Implement this interface to create a tool panel component.
|
|```ts
|interface IToolPanelAngularComp {
|    /** The agInit(params) method is called on the tool panel component once.
|        See below for details on the parameters. */
|    agInit(params: IToolPanelParams): void;
|}
|```
|
|The `agInit(params)` method takes a params object with the items listed below:
|

