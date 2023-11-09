--- 
title: "Quick Start" 
---

Create a Grid in 60 seconds.

<framework-specific-section frameworks="react">

## Install

Create a new React project and install the `ag-grid-react` library:

<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>

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
|    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
|    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
|    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
|  ]);
|  
|  // Column Definitions: Defines & controls grid columns.
|  const [colDefs] = useState([
|    { field: "mission" },
|    { field: "country" },
|    { field: "successful" },
|    { field: "date" },
|    { field: "price" },
|    { field: "company" }
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

- Read our [Introductory Tutorial](/deep-dive/).
- Watch our <a href="https://www.youtube.com/watch?v=&list=PLsZlhayVgqNwHNHeqpCkSgdRV08xrKtzW" target="_blank">Video Tutorials</a>.
