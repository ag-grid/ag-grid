[[only-javascript]]
|## Custom Date Interface
|
|The interface for a custom date component is as follows:
|
|```ts
|interface IDateComp {
|    // Mandatory methods
|
|    // The init(params) method is called on the component once. See below for details on the parameters.
|    init(params: IDateParams): void;
|
|    // Returns the DOM element for this component
|    getGui(): HTMLElement;
|
|    // Returns the current date represented by this editor
|    getDate(): Date | null;
|
|    // Sets the date represented by this component
|    setDate(date: Date | null): void;
|
|    // Optional methods
|
|    // Sets the disabled state of this component
|    setDisabled?(disabled: boolean): void;
|
|    // Sets the input text placeholder
|    setInputPlaceholder?(placeholder: string): void;
|
|    // Sets the input text aria label
|    setInputAriaLabel?(label: string): void;
|
|    // Gets called when the component is destroyed. If your custom component needs to do
|    // any resource cleaning up, do it here.
|    destroy?(): void;
|}
|```
|
|### Custom Filter Parameters
|
|The `init(params)` method takes a params object with the items listed below:
