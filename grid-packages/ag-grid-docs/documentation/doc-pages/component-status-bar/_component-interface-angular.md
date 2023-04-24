[[only-angular]]
|## Status Bar Panel Interface
|
|Implement this interface to create a status bar component.
|
|```ts
|interface IStatusPanelAngularComp {
|    /** The agInit(params) method is called on the status bar component once.
|        See below for details on the parameters. */
|    agInit(params: IStatusPanelParams): void;
|}
|```
|
|The `agInit(params)` method takes a params object with the items listed below:
|

