[[only-angular]]
|## Custom Date Interface
|
|The interface for a custom date component is as follows:
|
|```ts
|interface IDateAngularComp {
|    // The agInit(params) method is called on the component once. See below for details on the parameters.
|    agInit(params: IDateParams): void;
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
|}
|```
|
|### Custom Filter Parameters
|
|The `agInit(params)` method takes a params object with the items listed below:
