[[only-javascript]]
|## Status Bar Panel Interface
|
|Implement this interface to create a status bar component.
|
|```ts
|interface IStatusPanelComp {
|    // The init(params) method is called on the status bar component once.
|    // See below for details on the parameters.
|    init?(params: IStatusPanelParams): void;
|
|    // Return the DOM element of your component, this is what the grid puts into the DOM.
|    getGui(): HTMLElement;
|
|    // Gets called when the grid is destroyed - if your status bar components needs to do any cleanup, do it here.
|    destroy?(): void;
|}
|```
|
|The interface for the init parameters is as follows:
|


