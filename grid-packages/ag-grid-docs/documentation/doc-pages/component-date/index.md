---
title: "Date Component"
---

You can create your own date components, and AG Grid will use them every time it needs to ask the user for a date value. The date components are currently used in **date filters**.


By default the grid will use the browser provided date picker for Chrome and Firefox (as we think it's nice), but for all other browsers it will just provide a simple text field. You can use your own date picker to AG Grid by providing a custom Date Component via the grid property `dateComponent` as follows:


```js
gridOptions: {
    ...
    // Here is where we specify the component to be used as the date picker widget
    dateComponent: MyDateEditor
},
```

The interface for `dateComponent` is this:

```ts
interface IDateComp {
    // Mandatory methods

    // The init(params) method is called on the component once. See below for details on the parameters.
    init(params: IDateParams): void;

    // Returns the DOM element for this component
    getGui(): HTMLElement;

    // Returns the current date represented by this editor
    getDate(): Date;

    // Sets the date represented by this component
    setDate(date: Date): void;

    // Optional methods

    // Sets the input text placeholder
    setInputPlaceholder(placeholder: string): void;

    // Sets the input text aria label
    setInputAriaLabel(label: string): void;

    // Gets called when the component is destroyed. If your custom component needs to do
    // any resource cleaning up, do it here.
    destroy(): void;
}
```

## IDateParams

The method `init(params)` takes a `params` object with the items listed below. If the user provides params via the `gridOptions.dateComponentParams` attribute, these will be additionally added to the `params` object, overriding items of the same name if a name clash exists.


```ts
interface IDateParams {
    // Callback method to call when the date has changed
    onDateChanged: () => void;
}
```

## Example: Custom Date Component

The example below shows how to register a custom date component that contains an extra floating calendar picker rendered from the filter field. The problem with this approach is that we have no control over third party components and therefore no way to implement a `preventDefault` when the user clicks on the Calendar Picker (for more info see [Custom Floating Filter Example](../component-floating-filter/#example-custom-floating-filter)). Our way of fixing this problem is to add the `ag-custom-component-popup` class to the floating calendar.

<grid-example title='Custom Date Component' name='custom-date' type='generated' options='{ "extras": ["fontawesome", "flatpickr"] }'></grid-example>

