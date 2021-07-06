---
title: "Styling Components"
frameworks: ["react"]
---

[[only-react]]
|### Components Containers in AG Grid
|
|By default user supplied React components will be wrapped in a `div` but it is possible to have your component
|wrapped in a container of your choice (i.e. a `span` etc), perhaps to override/control a third party component.
|
|For example, assuming a user component as follows:
|
|```jsx
|const HelloWorldRenderer = () => <span>Hello World</span>;
|```
|
|The default behaviour will render the following within the grid:
|
|```html
|<div class="ag-react-container"><span>Hello World</span></div>
|```
|
|In order to override this default behaviour and can specify a `componentWrappingElement`:
|
|```jsx
|<AgGridReact
|    onGridReady={ this.onGridReady }
|    rowData={ this.state.rowData }
|    componentWrappingElement='span'>
|</AgGridReact>
|```
|
|Doing this would result in the following being rendered:
|```html
|<span class="ag-react-container"><span>Hello World</span></span>
|```
|
|If you wish to override the style of the grid container you can either provide an implementation of the `ag-react-container` class, or via the `getReactContainerStyle` or `getReactContainerClasses` callbacks on your React component.
|
|### Styling a React Component:
|
|```jsx
|export default class CustomTooltip extends Component {
|    getReactContainerClasses() {
|        return ['custom-tooltip'];
|    }
|
|    getReactContainerStyle() {
|        return {
|            display: 'inline-block',
|            height: '100%'
|        };
|    }
|
|    //...rest of the component
|```
|
|### Styling a React Hook:
|
|```js
|export default forwardRef(({ parentFilterInstance }, ref) => {
|    useImperativeHandle(ref, () => ({
|        getReactContainerClasses() {
|            return ['custom-tooltip'];
|        },
|        getReactContainerStyle() {
|            return {
|                display: 'inline-block',
|                height: '100%'
|            }
|        }
|    }));
|
|    //...rest of the hook
|});
|```
|
|See [Hooks](/react-hooks/) for more information in using Hooks within the grid.
|
|In both cases (component or hook) the following would be rendered:
|
|```html
|<div class="ag-react-container custom-tooltip" style="display: inline-block; height: 100%" >
|    <span>Hello World</span>
|</div>
|```
