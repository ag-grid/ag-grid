---
title: "Fine Tuning"
frameworks: ["react"]
---

This section describes some of the finer grain tuning you might want to do with your React & ag-Grid application.

## Styling React Components in ag-Grid

By default user supplied React components will be wrapped in a `div` but it is possible to have your component 
wrapped in a container of your choice (i.e. a `span` etc), perhaps to override/control a third party component.

For example, assuming a user component as follows:

```jsx
const HelloWorldRenderer = () => <span>Hello World</span>;
```

The default behaviour will render the following within the grid:

```html
<div class="ag-react-container"><span>Hello World</span></div>
```

In order to override this default behaviour and can specify a `componentWrappingElement`:

```jsx
<AgGridReact
    onGridReady={ this.onGridReady }
    rowData={ this.state.rowData }
    componentWrappingElement='span'>
</AgGridReact>
```

Doing this would result in the following being rendered:
```html
<span class="ag-react-container"><span>Hello World</span></span>
```

If you wish to override the style of the grid container you can either provide an implementation of the `ag-react-container` class, or via the `getReactContainerStyle` or `getReactContainerClasses` callbacks on your React component.

### Styling a React Component:

```jsx
export default class CustomTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    getReactContainerStyle() {
        return {
            display: 'inline-block',
            height: '100%'
        };
    }

    //...rest of the component
```

### Styling a React Hook:

```js
export default forwardRef(({ parentFilterInstance }, ref) => {
    useImperativeHandle(ref, () => ({
        getReactContainerClasses() {
            return ['custom-tooltip'];
        },
        getReactContainerStyle() {
            return {
                display: 'inline-block',
                height: '100%'
        };
    }));

    //...rest of the hook
});
```
    
See [Hooks](../react-hooks/) for more information in using Hooks within the grid.

In both cases (component or hook) the following would be rendered:

```html
<div class="ag-react-container custom-tooltip" style="display: inline-block; height: 100%" >
    <span>Hello World</span>
</div>
```

## Access the Grid & Column API

When the grid is initialised, it will fire the `gridReady` event. If you want to use the API of 
the grid, you should put an `onGridReady(params)` callback onto the grid and grab the api 
from the params. You can then call this api at a later stage to interact with the 
grid (on top of the interaction that can be done by setting and changing the props).

```jsx
// provide gridReady callback to the grid
<AgGridReact
    onGridReady={onGridReady}
    //...
/>

// in onGridReady, store the api for later use
onGridReady = (params) => {
    // using hooks - setGridApi/setColumnApi are returned by useState
    setGridApi(params.api);
    setColumnApi(params.columnApi);

    // or setState if using components
    this.setState({
        gridApi: params.api,
        columnApi: params.columnApi
    });
}

// use the api some point later!
somePointLater() {
    // hooks
    gridApi.selectAll();
    columnApi.setColumnVisible('country', visible);

    // components
    this.state.gridApi.selectAll();
    this.state.columnApi.setColumnVisible('country', visible);
}
```

The `api` and `columnApi` are also stored inside the `AgGridReact` component, so you can also 
look up the backing object via React and access the `api` and `columnApi` that way if you'd prefer.


## Cell Component Rendering

React renders components asynchronously and although this is fine in the majority of use cases it can 
be the case that in certain circumstances a very slight flicker can be seen where an old component is 
destroyed but the new one is not yet rendered by React.

In order to eliminate this behaviour the Grid will "pre-render" cell components and replace them with 
the real component once they are ready.

What this means is that the `render` method on a given Cell Component will be invoked twice, once for 
the pre-render and once for the actual component creation.

In the vast majority of cases this will result in overall improved performance but if you wish to 
disable this behaviour you can do so by setting the `disableStaticMarkup` property on the `AgGridReact` 
component to `true`:

```jsx
<AgGridReact
    disableStaticMarkup={true}
```

Note that this pre-render only applies to Cell Components - other types of Components are unaffected.

## Row Data & Column Def Control

By default the ag-Grid React component will check props passed in to determine if data has changed 
and will only re-render based on actual changes.

For `rowData` and `columnDefs` we provide an option for you to override this behaviour by the `rowDataChangeDetectionStrategy` and `columnDefsChangeDetectionStrategy` properties respectively:

```jsx

<AgGridReact
    onGridReady={this.onGridReady}
    rowData={this.state.rowData}
    rowDataChangeDetectionStrategy={ChangeDetectionService.IdentityCheck}
    columnDefsChangeDetectionStrategy={ChangeDetectionService.NoCheck}
    //...other properties
```

The following table illustrates the different possible combinations:

| Strategy | Behaviour | Notes |
| -------- | --------- | ----- |
| `IdentityCheck` | Checks if the new prop is exactly the same as the old prop (i.e. `===`) | Quick, but can result in re-renders if no actual data has changed |
| `DeepValueCheck` | Performs a deep value check of the old and new data | Can have performance implication for larger data sets |
| `NoCheck` | Does no checking - passes the new value as is down to the grid | Quick, but can result in re-renders if no actual data has changed |

For `rowData` the default value for this setting is:

| ImmutableData | Default          |
| ------------- | ---------------- |
| `true`        | `IdentityCheck`  |
| `false`       | `DeepValueCheck` |

If you're using Redux or larger data sets then a default of `IdentityCheck` is a good idea 
provided you ensure you make a copy of the new row data and do not mutate the `rowData` passed in.

For `columnDefs` the default value for this setting is `NoCheck` - this allows the grid to 
determine if a column configuration change is to be applied or not. This is the preferred and 
most performant choice.

