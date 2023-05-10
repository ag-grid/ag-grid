[[only-javascript]]
|## Tooltip Component Interface
|
|Implement this interface to provide a custom tooltip.
|
|```ts
|interface ITooltipComp {
|    // The init(params) method is called on the tooltip component once. See below for details on the parameters.
|    init(params: ITooltipParams): void;
|
|    // Returns the DOM element for this tooltip
|    getGui(): HTMLElement;
|}
|```
|
|The interface for the init parameters is as follows:
|


