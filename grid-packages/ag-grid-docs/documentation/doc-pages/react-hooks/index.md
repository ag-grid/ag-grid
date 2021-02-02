---
title: "React Hooks & Functional Components"
frameworks: ["react"]
---

### React Hooks

React Hooks are fully supported within AG Grid - please refer to our working example in
<a href="https://github.com/ag-grid/ag-grid-react-example/">GitHub</a>.

We can break down the type of Hooks you can use within AG Grid into two broad categories - those
that have lifecycle methods (such as Filters) and those that don't (such as Cell Renderers).

## Hooks without Lifecycle Methods

Cell Renderers, Loading Cell Renderers and Overlay Components are examples of components without lifecycle methods.

For this type of Hook you don't have to do anything special and the Hook should work as
expected within AG Grid, although it would often be easier to simply use a functional component
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

The same applies to any other component to be used within the grid that requires lifecycle methods to be present.

All of our Component examples will have both Hook and Class based examples - the Hook based examples will use `forwardRef` & `useImperativeHandle` 
as appropriate so please refer to the appropriate Component section for more detailed examples.
