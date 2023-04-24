[[only-javascript]]
|## Tool Panel Interface
|
|Implement this interface to create a tool panel component.
|
|```ts
|interface IToolPanelComp {
|    // The init(params) method is called on the tool panel once upon component initialisation.
|    init(params: IToolPanelParams): void;
|
|    // Returns the DOM element for this Tool Panel
|    getGui(): HTMLElement;
|
|    // Can be left blank if no custom refresh logic is required.
|    refresh(): void;
|}
|```
|
|The interface for the init parameters is as follows:
|


