[[only-angular]]
|## Tooltip Component Interface
|
|Implement this interface to create a tooltip component.
|
|```ts
|interface ITooltipAngularComp {
|    /** The agInit(params) method is called on the tooltip component once.
|        See below for details on the parameters. */
|    agInit(params: ITooltipParams): void;
|}
|```
|
|The `agInit(params)` method takes a params object with the items listed below:
|

