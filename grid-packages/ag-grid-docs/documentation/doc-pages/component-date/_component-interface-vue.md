[[only-vue]]
|## Custom Date Interface
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `this.params`.
|
|The interface for a custom filter component is as follows:
|
|```ts
|interface {
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
