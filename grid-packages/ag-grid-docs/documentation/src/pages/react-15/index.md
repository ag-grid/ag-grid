---
title: "ag-Grid with React 15.x.x"
frameworks: ["react"]
---

[[warning]]
| Version 21.2.0 of `AgGridReact` is the last version that supports both React 15.x.x and React 16.x.x. <br/><br/>Version 22 onwards of `AgGridReact` will support React 16+ only.

### Control React Components Container

By default user supplied React components will be rendered with a `div` container but it is possible to have your specify
a container (i.e. a `div`, `span` etc), perhaps to override/control a third party component.

For example, assuming a user component as follows:

```js
class CellRenderer extends Component {
    render() {
        return(
            <div>Age: {props.value}</div>
        )
    }
}
```

The default behaviour will render the following within the grid:

```html
<div class="ag-react-container"><span>Age: 24</span></div>
```

In order to override this default behaviour and can specify a `componentWrappingElement`:

```jsx
<AgGridReact
    onGridReady={this.onGridReady}
    rowData={this.state.rowData}
    componentWrappingElement='span'
    ///...other properties
```

Doing this would result in the following being rendered:

```html
<span class="ag-react-container"><span>Age: 24</span></span    >
```
If you wish to override the style of this div you can either provide an implementation of
the `ag-react-container` class, or via the `getReactContainerStyle` or `getReactContainerClasses`
callbacks on the React component:

```js
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
```

Would result in the following being rendered:

```html
<div class="ag-react-container custom-tooltip" style="display: inline-block; height: 100%" >
    <span>Hello World</span>
</div>
```
