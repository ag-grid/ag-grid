<framework-specific-section frameworks="react">
| ### Quick Look Code Example
</framework-specific-section>

<framework-specific-section frameworks="react">
<tabs>

<tabs-links>
<open-in-cta type="stackblitz" href="https://stackblitz.com/edit/ag-grid-react-hello-world" />
</tabs-links>

<div tab-label="index.js">
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx" lineNumbers="true">
|import React, { useState } from 'react';
|import { createRoot } from 'react-dom/client';
|import { AgGridReact } from 'ag-grid-react';
|
|import 'ag-grid-community/styles/ag-grid.css';
|import 'ag-grid-community/styles/ag-theme-alpine.css';
|
|const App = () => {
|    const [rowData] = useState([
|        {make: "Toyota", model: "Celica", price: 35000},
|        {make: "Ford", model: "Mondeo", price: 32000},
|        {make: "Porsche", model: "Boxster", price: 72000}
|    ]);
|    
|    const [columnDefs] = useState([
|        { field: 'make' },
|        { field: 'model' },
|        { field: 'price' }
|    ]);
|
|    return (
|        &lt;div className="ag-theme-alpine" style={{height: 400, width: 600}}>
|            &lt;AgGridReact
|                rowData={rowData}
|                columnDefs={columnDefs}>
|            &lt;/AgGridReact>
|        &lt;/div>
|    );
|};
|
|const root = createRoot(document.getElementById('root'));
|root.render(&lt;GridExample />);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
</div>
<div tab-label="index.html">
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="html" lineNumbers="true">
|&lt;div id="root">&lt;/div>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
</div>

</tabs>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>
| Please refer to our [Compatibility Chart](../react-compatibility) for Supported Versions of React & AG Grid.
</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Getting Started with Community Video
</framework-specific-section>

<framework-specific-section frameworks="react">
 <video-section id="Pr__B6HM_s4" title="Video Tutorial for Getting Started with AG Grid Community">
 <p>
     In this video we detail the steps to get an application working with React and AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
 </p>
 </video-section>
</framework-specific-section>


<framework-specific-section frameworks="react">
| ## Getting Started with Enterprise Video
</framework-specific-section>

<framework-specific-section frameworks="react">
 <video-section id="pKUhYE1VTP4" title="Getting Started with AG Grid Enterprise">
 <p>
     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
 </p>
 </video-section>
</framework-specific-section>

<framework-specific-section frameworks="react">
|
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid React application. To get this working locally,
| create a new React application as follows:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="bash">
| npx create-react-app hello
| cd hello
| npm install --save ag-grid-community
| npm install --save ag-grid-react
| npm start
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| If everything goes well, `npm start` has started the web server and conveniently opened a browser
| pointing to [localhost:3000](http://localhost:3000).
|
| ### Grid Dependencies
|
| Note the `package.json` has the following dependencies:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-react": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| `ag-grid-community` is the core logic of the Grid, and `ag-grid-react` is the React Rendering Engine.
| Both are needed for the grid to work with React and their versions **must** match.
|
| ### Copy in Application Code
|
| Copy the content below into the file `App.js`:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
|import { createRoot } from 'react-dom/client';
|import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
|
|import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
|
|const App = () => {
|
|  const gridRef = useRef(); // Optional - for accessing Grid's API
|  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
|
|  // Each Column Definition results in one Column.
|  const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', filter: true},
|    {field: 'model', filter: true},
|    {field: 'price'}
|  ]);
|
|  // DefaultColDef sets props common to all Columns
|  const defaultColDef = useMemo( ()=> ({
|      sortable: true
|    }));
|
|  // Example of consuming Grid Event
|  const cellClickedListener = useCallback( event => {
|    console.log('cellClicked', event);
|  }, []);
|
|  // Example load data from server
|  useEffect(() => {
|    fetch('https://www.ag-grid.com/example-assets/row-data.json')
|    .then(result => result.json())
|    .then(rowData => setRowData(rowData))
|  }, []);
|
|  // Example using Grid's API
|  const buttonListener = useCallback( e => {
|    gridRef.current.api.deselectAll();
|  }, []);
|
|  return (
|    &lt;div>
|
|      {/* Example using Grid's API */}
|      &lt;button onClick={buttonListener}>Push Me&lt;/button>
|
|      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
|      &lt;div className="ag-theme-alpine" style={{width: 500, height: 500}}>
|
|        &lt;AgGridReact
|            ref={gridRef} // Ref for accessing Grid's API
|
|            rowData={rowData} // Row Data for Rows
|
|            columnDefs={columnDefs} // Column Defs for Columns
|            defaultColDef={defaultColDef} // Default Column Properties
|
|            animateRows={true} // Optional - set to 'true' to have rows animate when sorted
|            rowSelection='multiple' // Options - allows click selection of rows
|
|            onCellClicked={cellClickedListener} // Optional - registering for Grid Event
|            />
|      &lt;/div>
|    &lt;/div>
|  );
|};
|
|export default App;
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| If everything is correct, you should see a simple grid that looks like this:
| ![AG Grid in its simplest form](../../images/resources/getting-started/step1.png)
|
| We will now break this file down and explain the different parts...
|
| ### Grid CSS and Themes
|
| Two CSS files were loaded as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The first `ag-grid.css` is always needed. It's the core structural CSS needed by the grid. Without this, the Grid will not work.
|
| The second `ag-theme-alpine.css` is the chosen [Grid Theme](/themes/). This is then subsequently applied to the Grid by including the Theme's CSS Class in the Grid's parent DIV `className="ag-theme-alpine"`.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;div className="ag-theme-alpine" style={{width: 500, height: 500}}>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| You can select from any of the [Grid Provided Themes](/themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the parent DIV via `style={{width: 500, height: 500}}`. The grid will fill 100% in both directions, so size it's parent element to the required dimensions.
|
| ### Setting Row Data
|
| The Grid is provided Row Data via the `rowData` Grid Property. This is wired up using React `useState()` hook and loading the data from the server.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
|
|...
|
|// Example load data from server
|useEffect(() => {
|    fetch('https://www.ag-grid.com/example-assets/row-data.json')
|    .then(result => result.json())
|    .then(rowData => setRowData(rowData))
|}, []);
|
|...
|
|&lt;AgGridReact
|    rowData={rowData} // Row Data for Rows
|    ...
|    />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Setting Column Definitions
|
| Columns are defined by setting [Column definitions](/column-definitions/). Each Column Definition
| defines one Column. Properties can be set for all Columns using the Default Column Definition.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|// Each Column Definition results in one Column.
|const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', filter: true},
|    {field: 'model', filter: true},
|    {field: 'price'}
|]);
|
|// DefaultColDef sets props common to all Columns
|const defaultColDef = useMemo( ()=> ({
|    sortable: true
|}));
|
|...
|
|&lt;AgGridReact
|    columnDefs={columnDefs} // Column Defs for Columns
|    defaultColDef={defaultColDef} // Default Column Properties
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Accessing the Grid's API
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|const gridRef = useRef(); // Optional - for accessing Grid's API
|// Example using Grid's API
|const buttonListener = useCallback( e => {
|    gridRef.current.api.deselectAll();
|}, []);
|
|&lt;AgGridReact
|    ref={gridRef} // Ref for accessing Grid's API
|    />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Consuming Grid Events
|
| Listen to [Grid Events](../grid-events/) by adding a callback to the appropriate `on[eventName]` property.
| This example demonstrates consuming the `cellClicked` event.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;AgGridReact
|    onCellClicked={cellClickedListener} // Optional - registering for Grid Event
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### Grid Properties
|
| Set other [Grid Options](../grid-options/) by adding parameters to `&lt;AgGridReact/>` component.
| This example demonstrates setting `animateRows` and `rowSelection`.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|&lt;AgGridReact
|    animateRows={true} // Optional - set to 'true' to have rows animate when sorted
|    rowSelection='multiple' // Options - allows click selection of rows
|    ...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Getting Started with AG Grid Enterprise
|
| We would love for you to try out AG Grid Enterprise. There is no cost to trial.
| You only need to get in touch if you want to start using AG Grid Enterprise
| in a project intended for production.
|
| The following steps continues from above and installs AG Grid Enterprise.
|
| ### Install Dependency
|
| In addition to `ag-grid-community` and `ag-grid-react`, AG Grid Enterprise also needs
| `ag-grid-enterprise`.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="bash">
| npm install --save ag-grid-enterprise
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The `package.json` should now contain the following dependencies:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-enterprise": "@AG_GRID_VERSION@",
|    "ag-grid-react": "@AG_GRID_VERSION@",
|    ...
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| `ag-grid-enterprise` contains the Enterprise features only, it does not contain the core grid,
| hence you still need `ag-grid-community` and `ag-grid-react`. Versions of all three **must** match.
|
| ### Import Enterprise
|
| Import AG Grid Enterprise intro your application as follows:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import 'ag-grid-enterprise';
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| And that is all, you use the same `&lt;AgGridReact/>` component, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|// Each Column Definition results in one Column.
|const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', rowGroup: true},
|    {field: 'model'},
|    {field: 'price'}
|]);
</snippet>
</framework-specific-section>