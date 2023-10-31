--- 
title: "Quick Start" 
---

Display your data in a Grid in 60 seconds.

## Install

<framework-specific-section frameworks="react">
<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>
</framework-specific-section>

_For more information, read our detailed [installation guide](/packages-modules/)._

## Create

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import { useState } from 'react';
|import { AgGridReact } from 'ag-grid-react'; // Core Grid Logic
|import "ag-grid-community/styles/ag-grid.css"; // Core CSS
|import "ag-grid-community/styles/ag-theme-alpine.css"; // Theme
| 
|function GridExample() {
|  // Set Row Data
|  const [rowData, setRowData] = useState([
|    { make: 'Toyota', model: 'Prius', price: 35000 },
|    { make: 'Ford', model: 'Mondeo', price: 32000 },
|    { make: 'Porsche', model: 'Boxster', price: 72000 }
|  ]);
|  
|  // Define Columns (Should match properties in rowData)
|  const [colDefs] = useState([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" }
|  ]);
|  
|  // Wrap the grid component in a parent container to set the theme & dimensions
|  return (
|    &lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|      &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|    &lt;/div>
|  );
|}
</snippet>
</framework-specific-section>

## Next Steps

To learn more about the Grid, read our tutorials:

<next-step-tiles tutorial1="true" tutorial2="true" tutorial3="true"/>
