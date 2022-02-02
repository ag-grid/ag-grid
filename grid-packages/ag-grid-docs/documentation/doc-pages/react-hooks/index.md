---
title: "React Hooks"
frameworks: ["react"]
---

AG Grid fits perfectly into the React rendering ecosystem. This page explains best practices for using React Hooks with AG Grid.

## Functional Components

When customising AG Grid, you can use both React Functional Components or React Class Components.

[[only-react]]
```jsx
import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const App = () => {
    const [rowData] = useState([
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ]);

    const [columnDefs] = useState([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' }
    ]);

    return (
        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}>
            </AgGridReact>
        </div>
    );
};
 
render(<App />, document.getElementById('root'));
```

>> Code - simple Classes with React


## Use State, Use Memo

All examples in the documentation use best practices with regards `useState` and `useMemo`, e.g. `rowData` and `columnDefs` are always set using `useState`. However all code snippets in the documentation leave these hooks out for simpler reading of the documentation.

## Use Callback

>> Beware, stale references

