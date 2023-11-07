--- 
title: "Quick Start" 
---

Display your data in a Grid in 60 seconds.

<framework-specific-section frameworks="react">

## Install

Create a new React project and install the `ag-grid-react` library:

<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>

_For more information, read our detailed [installation guide](/packages-modules/)._

## Create

Replace your `index.js` file with the following code:

<snippet transform={false} language="jsx">
|import { useState } from 'react';
|import { AgGridReact } from 'ag-grid-react'; // Core Grid Logic
|import "ag-grid-community/styles/ag-grid.css"; // Core CSS
|import "ag-grid-community/styles/ag-theme-alpine.css"; // Theme
|
|// Create new GridExample component
|const GridExample = () => {
|  // Row Data: The data to be displayed.
|  const [rowData, setRowData] = useState([
|    { make: 'Toyota', model: 'Prius', price: 35000 },
|    { make: 'Ford', model: 'Mondeo', price: 32000 },
|    { make: 'Porsche', model: 'Boxster', price: 72000 }
|  ]);
|  
|  // Column Definitions: Defines & controls grid columns.
|  const [colDefs] = useState([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" }
|  ]);
|
|  // Container: Defines the grid's theme & dimensions.
|  return (
|    &lt;div className="ag-theme-alpine" style={{ width: 600, height: 500 }}>
|      {/* The AG Grid component, with Row Data & Column Definiton props */}
|      &lt;AgGridReact rowData={rowData} columnDefs={colDefs} />
|    &lt;/div>
|  );
|}
|
|// Render GridExample
|const root = createRoot(document.getElementById('root'));
|root.render(&lt;GridExample />);
</snippet>

</framework-specific-section>

## Run

When you run your application, you should see a basic grid with three rows:

<grid-example title='Quick Start Example' name='quick-start-example' type='generated' options='{ "exampleHeight": 201 }'></grid-example>

## Next Steps

To learn more about the Grid, read our tutorials:

<next-step-tiles tutorial1="true" tutorial2="false" tutorial3="false"/>
