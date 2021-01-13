---
title: "Polymer 3 Grid"
frameworks: ["javascript"]
---

## More Details

[[note]]
| A full working example of using ag-Grid with Polymer 3 can be found in our <a href="https://github.com/ag-grid/ag-grid-polymer-example">ag-Grid Polymer 3 Example Repo</a>.

### Downloading the ag-Grid Enterprise Dependency

If you're using the ag-Grid Enterprise features, then in addition to the ag-Grid Polymer dependency
above, you also require the ag-Grid Polymer Enterprise dependency:

```bash
npm install ag-grid-enterprise --save
```

Note that this is in addition to the `ag-grid-community` dependency. The `ag-grid-community`
dependency will be required for the CSS styles.

Using our application from the [Polymer Getting Started](../polymer-getting-started/) section as a
starting point, we'll replace the `ag-grid-community` reference with the `ag-grid-enterprise` dependency:

```diff
- <script src="/node_modules/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
+ <script src="/node_modules/ag-grid-enterprise/dist/ag-grid-enterprise.min.noStyle.js"></script>
```

Although we've removed the reference to `ag-grid-community` here, we'll still reference the
styles within it when defining the ag-Grid element later.

## ag-Grid Polymer Features

Every feature of ag-Grid is available when using the ag-Grid Polymer Component. The Polymer Component
wraps the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core
ag-Grid and Polymer ag-Grid when it comes to features.


## Configuring ag-Grid in Polymer

### Properties

Properties on `ag-grid-polymer` can be provided in the following three ways:

- LowerCase: ie: `rowanimation`
- CamelCase: ie: `rowAnimation`
- Hyphenated Lowercase: ie: `row-animation`

You can specify the properties in the following ways:

- On the `ag-grid-polymer`component at declaration time
- On the `gridOptions` property

### Properties on ag-grid-polymer

```html
<!-- Grid Definition -->
<ag-grid-polymer
    rowData="{{rowData}}"
    rowAnimation
    pivot-mode
    >
</ag-grid-polymer>
```

Here we've specified 3 properties: `rowData` is provided with two-way binding. `rowAnimation`
and `pivot-mode` illustrate how you can specify properties in different cases.

### Events

All data out of the grid comes through events. You can specify the events you want to listen
to in the following ways:

- On the `ag-grid-polymer`component at declaration time
- On the `gridOptions` property
- On the `ag-grid-polymer`component post creation time, via event listeners
- On the `ag-grid-polymer`component post creation time, via direct property access

### Events on ag-grid-polymer

```html
<!-- Grid Definition -->
<ag-grid-polymer
    onGridReady="{{onGridReady}}"
    ...other properties>
</ag-grid-polymer>
```

Here we're listening to the `gridReady` event - as with most events we need to add the "on" prefix.

[[note]]
| When defining event listeners in this way it's important to note that the `this` context
| will be `ag-grid-polymer`, not the containing application element. You will have access
| to the grids properties directly, but not the application element itself. The `api`
| and `columnApi` are available directly via `this.api` and `this.columnApi`.

### Events via the `gridOptions` property

```html
<!-- Grid Definition -->
<ag-grid-polymer
    gridOptions="{{gridOptions}}"
    ...other properties>
</ag-grid-polymer>
```

```js
this.gridOptions.onColumnResized = (event) => {
    console.log('event via option 3: ' + event);
};
```

### Events via Event Listeners on an instance of ag-grid-polymer

```html
<ag-grid-polymer
    id="myGrid"
    ...other properties>
</ag-grid-polymer>
```

```js
this.$.myGrid.addEventListener('columnresized', (event) => {
    console.log('event via option 1: ' + event.agGridDetails);
})
```

In this case we need to specify an id on the `ag-grid-polymer` component in order to access it.
The grid's payload will be available on the events `agGridDetails` property.

### Events via direct property access on an instance of ag-grid-polymer

```html
<ag-grid-polymer
    id="myGrid"
    ...other properties>
</ag-grid-polymer>
```

```js
this.$.myGrid.oncolumnresized = (event) => {
    console.log('event via option 2: ' + event.agGridDetails);
}
```

In this case we need to specify an id on the `ag-grid-polymer` component in order to access it.
The grid's payload will be available on the events `agGridDetails` property.

### Grid Api

The Grid API (both `api` and `columnApi`) will only be available after the `gridReady` event has been fired.

You can access the APIs in the following ways:

- Store them in the `gridReady` event - they'll be available via the params argument passed into the event
- Provide a `gridOptions` object to the grid pre-creation time. Post creation the APIs will be available on the `gridOptions` object.

### Child to Parent Communication

There are a variety of ways to manage component communication in Polymer (shared service, local variables, etc),
but you often need a simple way to let a "parent" component know that something has happened on a "child"
component. In this case the simplest route is to use the `gridOptions.context` to hold a reference to the
parent, which the child can then access.

```js
// in the parent component - the component that hosts ag-grid-polymer and specifies which polymer components to use in the grid
constructor() {
    this.gridOptions = <GridOptions>{
        context: {
            componentParent: this
        }
    };
}

// in the child component - the polymer components created dynamically in the grid
// the parent component can then be accessed as follows:
this.params.context.componentParent
```

Note that although we've used `componentParent` as the property name here it can be anything - the
main point is that you can use the `context` mechanism to share information between the components.
