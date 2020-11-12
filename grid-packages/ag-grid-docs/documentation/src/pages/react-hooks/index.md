---
title: "React Hooks & Functional Components"
---

### React Hooks

React Hooks are fully supported within ag-Grid - please refer to our working example in 
<a href="https://github.com/ag-grid/ag-grid-react-example/">GitHub</a>.

We can break down the type of Hooks you can use within ag-Grid into two broad categories - those 
that have lifecycle methods (such as Filters) and those that don't (such as Cell Renderers).

## Hooks without Lifecycle Methods

Cell Renderers, Loading Cell Renderers and Overlay Components are examples of components without lifecycle methods.

For this type of Hook you don't have to do anything special and the Hook should work as 
expected within ag-Grid, although it would often be easier to simply use a functional component 
in these cases (as there won't be any state to maintain).

## Hooks with Lifecycle Methods

Filters, Cell Editors and Floating Filter Components are examples of components that have 
mandatory lifecycle methods.

For these types of components you'll need to wrap your hook with `forwardRef` and then expose 
Grid related lifecycle methods  `useImperativeHandle`, for example:

### Hook Cell Editor

```jsx
import React, { useEffect, forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef((props, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
        return {
            getValue: () => {
                return inputRef.current.value;
            }
        };
    });
    return <input type="text" ref={ inputRef } defaultValue={ props.value }/>;
})
```

### Hook Filter

```jsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";

export default forwardRef((props, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
        return {
            isFilterActive() {
                return inputRef.current.value !== '';
            },

            doesFilterPass: (params) => {
                return params.data.price.toString() === inputRef.current.value;
            }
        };
    });

    return <input type="text" ref={inputRef} onChange={() => props.filterChangedCallback()}/>;
})
```

The same applies to any other component to be used within the grid that requires lifecycle methods to be present.

Please refer to our [Components](../grid-components/) documentation for working examples for the specific
type of component you're interested in.

## Rendering Null

If you don't want to output anything on `render` then return an empty string rather than `null`.

If you return `null` then React simply won't render the component and the Grid is unable to 
determine if this is by design or an error.

```js
function myRenderer({ data }) {
    if (!data.value) {
        return ''; // not null!
    }

    return (
        data.value
    );
}
```
