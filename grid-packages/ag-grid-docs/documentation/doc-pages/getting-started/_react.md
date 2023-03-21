[[only-react]]
|
|<section class="code-tab mb-3">
|<div class="card">
|<div class="card-header">Quick Look Code Example</div>
|<div class="card-body">
|<ul class="nav nav-tabs">
|<li class="nav-item">
|<a  class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">
|
| index.js
|
|</a>
|</li>
|<li class="nav-item">
|<a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">
|
| index.html
|
|</a>
|</li>
|</ul>
|<div class="tab-content">
|<div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
|
| ```jsx
| import React, { useState } from 'react';
| import { createRoot } from 'react-dom/client';
| import { AgGridReact } from 'ag-grid-react';
|
| import 'ag-grid-community/styles/ag-grid.css';
| import 'ag-grid-community/styles/ag-theme-alpine.css';
|
| const App = () => {
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
|    ])
|
|    return (
|        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
|            <AgGridReact
|                rowData={rowData}
|                columnDefs={columnDefs}>
|            </AgGridReact>
|        </div>
|    );
| };
|
|const root = createRoot(document.getElementById('root'));
|root.render(<GridExample />);
| ```
|
|</div>
|<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
|
| ```html
| <div id="root"></div>
| ```
|
|</div>
|</div>
|</div>
|<div class="text-right" style="margin-top: -1.5rem;">
|
| <a class="btn btn-dark mb-2 mr-3" href="https://stackblitz.com/edit/ag-grid-react-hello-world" target="_blank">
|     Open in <img src="resources/stackBlitz_icon.svg" alt="Open in StackBlitz" style="height: 2.5rem"/> StackBlitz
| </a>
|
|</div>
|</div>
|</section>
|
| [[note]]
| | Please refer to our [Compatibility Chart](#ag-grid--react-compatibility-chart) for Supported Versions of React & AG Grid.
|
| ## Getting Started with Community Video
|
| <video-section id="Pr__B6HM_s4" title="Video Tutorial for Getting Started with AG Grid Community">
| <p>
|     In this video we detail the steps to get an application working with React and AG Grid Community. We show how to set up Rows and Columns, set some Grid Properties, use the Grid's API and listen to Grid events.
| </p>
| </video-section>
| <br/>
| <br/>
|
| ## Getting Started with Enterprise Video
|
| <video-section id="pKUhYE1VTP4" title="Getting Started with AG Grid Enterprise">
| <p>
|     The video then follows showing how to get started with <a href="../licensing/">AG Grid Enterprise</a>. Please take a look at Enterprise, you don't need a license to trial AG Grid Enterprise, you only need to get in touch if you decide to use it in your project.
| </p>
| <br/>
| </video-section>
| <br/>
| <br/>
|
| ## Getting Started with AG Grid Community
|
| Below we provide code for a simple AG Grid React application. To get this working locally,
| create a new React application as follows:
|
| ```bash
| npx create-react-app hello
| cd hello
| npm install --save ag-grid-community
| npm install --save ag-grid-react
| npm start
| ```
|
| If everything goes well, `npm start` has started the web server and conveniently opened a browser
| pointing to [localhost:3000](http://localhost:3000).
|
| <br/>
|
| ### Grid Dependencies
|
| Note the `package.json` has the following dependencies:
|
| ```jsx
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-react": "@AG_GRID_VERSION@",
|    ...
| ```
|
| `ag-grid-community` is the core logic of the Grid, and `ag-grid-react` is the React Rendering Engine.
| Both are needed for the grid to work with React and their versions <b>must</b> match.
|
| <br/>
|
| ### Copy in Application Code
|
| Copy the content below into the file `App.js`:
|
|```jsx
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
|    <div>
|
|      {/* Example using Grid's API */}
|      <button onClick={buttonListener}>Push Me</button>
|
|      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
|      <div className="ag-theme-alpine" style={{width: 500, height: 500}}>
|
|        <AgGridReact
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
|      </div>
|    </div>
|  );
|};
|
|export default App;
|```
|
| If everything is correct, you should see a simple grid that looks like this:<br/><br/>
| ![AG Grid in its simplest form](resources/step1.png)
|
| We will now break this file down and explain the different parts...
|
| <br/>
|
| ### Grid CSS and Themes
|
| Two CSS files were loaded as follows:
|
| ```jsx
|import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
|import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
| ```
|
| The first `ag-grid.css` is always needed. It's the core structural CSS needed by the grid. Without this, the Grid will not work.
|
| The second `ag-theme-alpine.css` is the chosen [Grid Theme](/themes/). This is then subsequently applied to the Grid by including the Theme's CSS Class in the Grid's parent DIV `className="ag-theme-alpine"`.
|
| ```jsx
|<div className="ag-theme-alpine" style={{width: 500, height: 500}}>
| ```
|
| You can select from any of the [Grid Provided Themes](/themes/). If you don't like the provided themes you can [Customise the Provided Theme](/themes/) or do not use a Theme and style the grid yourself from scratch.
|
| The dimension of the Grid is also set on the parent DIV via `style={{width: 500, height: 500}}`. The grid will fill 100% in both directions, so size it's parent element to the required dimensions.
|
| <br/>
|
| ### Setting Row Data
|
| The Grid is provided Row Data via the `rowData` Grid Property. This is wired up using React `useState()` hook and loading the data from the server.
|
| ```jsx
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
|<AgGridReact
|    rowData={rowData} // Row Data for Rows
|    ...
|    />
| ```
|
| <br/>
|
| ### Setting Column Definitions
|
| Columns are defined by setting [Column definitions](/column-definitions/). Each Column Definition
| defines one Column. Properties can be set for all Columns using the Default Column Definition.
|
| ```jsx
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
|<AgGridReact
|    columnDefs={columnDefs} // Column Defs for Columns
|    defaultColDef={defaultColDef} // Default Column Properties
|    ...
|/>
| ```
|
| <br/>
|
| ### Accessing the Grid's API
|
|```jsx
|const gridRef = useRef(); // Optional - for accessing Grid's API
|// Example using Grid's API
|const buttonListener = useCallback( e => {
|    gridRef.current.api.deselectAll();
|}, []);
|
|<AgGridReact
|    ref={gridRef} // Ref for accessing Grid's API
|    />
|```
|
| <br/>
|
| ### Consuming Grid Events
|
| Listen to [Grid Events](/grid-events/) by adding a callback to the appropriate `on[eventName]` property.
| This example demonstrates consuming the `cellClicked` event.
|
|```jsx
|<AgGridReact
|    onCellClicked={cellClickedListener} // Optional - registering for Grid Event
|    ...
|/>
|```
|
| <br/>
|
| ### Grid Properties
|
| Set other [Grid Options](/grid-options/) by adding parameters to `<AgGridReact/>` component.
| This example demonstrates setting `animateRows` and `rowSelection`.
|
|```jsx
|<AgGridReact
|    animateRows={true} // Optional - set to 'true' to have rows animate when sorted
|    rowSelection='multiple' // Options - allows click selection of rows
|    ...
|/>
|```
|
| <br/>
| <br/>
|
| ## Getting Started with AG Grid Enterprise
|
| We would love for you to try out AG Grid Enterprise. There is no cost to trial.
| You only need to get in touch if you want to start using AG Grid Enterprise
| in a project intended for production.
|
| The following steps continues from above and installs AG Grid Enterprise.
|
| <br/>
|
| ### Install Dependency
|
| In addition to `ag-grid-community` and `ag-grid-react`, AG Grid Enterprise also needs
| `ag-grid-enterprise`.
|
| ```bash
| npm install --save ag-grid-enterprise
| ```
|
| The `package.json` should now contain the following dependencies:
|
| ```jsx
|"dependencies": {
|    "ag-grid-community": "@AG_GRID_VERSION@",
|    "ag-grid-enterprise": "@AG_GRID_VERSION@",
|    "ag-grid-react": "@AG_GRID_VERSION@",
|    ...
| ```
|
| `ag-grid-enterprise` contains the Enterprise features only, it does not contain the core grid,
| hence you still need `ag-grid-community` and `ag-grid-react`. Versions of all three <b>must</b> match.
|
| <br/>
|
| ### Import Enterprise
|
| Import AG Grid Enterprise intro your application as follows:
|
|```jsx
|import 'ag-grid-enterprise';
|```
|
| And that is all, you use the same `<AgGridReact/>` component, except this time it comes installed
| with all the Enterprise features.
|
| For example, you can now Row Group (an Enterprise Feature) by a particular Column by
| setting `rowGroup=true` on the Column Definition.
|
|```jsx
|// Each Column Definition results in one Column.
|const [columnDefs, setColumnDefs] = useState([
|    {field: 'make', rowGroup: true},
|    {field: 'model'},
|    {field: 'price'}
|]);
|```
|
| <br/>
| <br/>
|
| ## AG Grid & React Compatibility Chart
|
| | React Version | AG Grid Versions |
| | ------------- | ---------------- |
| | 15.x          | 18 - 21.2.0      |
| | 16.3+ / 17+   | 22+              |
| | 18+           | 27.2.0+          |
