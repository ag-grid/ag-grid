<?php
$key = "Getting Started React";
$pageTitle = "Best React Data Grid";
$pageDescription = "Demonstrates teh best React Data Grid. Shows and example of a data grid for using with React.";
$pageKeyboards = "React Grid";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Best React Data Grid</h2>

    <p>
        Webpack and Babel are popular within the React community. The remainder of this page goes
        through an example for React using Webpack and Babel. The full example is
        <a href="https://github.com/ceolter/ag-grid-react-example">
        available on Github</a>. It is assumed you are
        already familiar with Webpack, Babel and React.

        The example demonstrates:
        <ul>
            <li>ag-Grid as a React component.</li>
            <li>Using React Components as ag-Grid cellRenderers for rendering Skills and Proficiency columns.</li>
            <li>Using React Components as ag-Grid filters for filtering Skills and Proficiency columns.</li>
        </ul>

    </p>

    <table>
        <style>
            button {
                margin-left: 4px;
                margin-right: 4px;
            }
        </style>
        <tr>
            <td style="background-color: #EEE; width: 10px;">
            </td>
            <td>
                <div style="background-color: #EEE; font-size: 20px; text-align: center;">
                    Example ag-Grid and React
                </div>
                <div id="myAppContainer"></div>
            </td>
        </tr>
    </table>

    <h2>Dependencies</h2>
    <p>
        Using ReactJS with ag-Grid introduces a dependency on React. For this reason:
    <ul>
        <li>You need to include the additional project ag-grid-react, which has the React dependency.</li>
        <li>You cannot use the bundled version of ag-Grid. You must use the CommonJS distribution.</li>
    </ul>
    </p>
    <p>
    In your package.json file, specify dependency on ag-grid AND ag-grid-react.
    The ag-grid package contains the core ag-grid engine and the ag-grid-react
        contains the React component and
    some utils for React rendering.
        <pre><code>"dependencies": {
    <span class="codeComment">// ag-Grid and ag-Grid React projects</span>
    "ag-grid": "5.0.x",
    "ag-grid-react": "5.0.x",

    <span class="codeComment">// include this if using ag-Grid Enterprise</span>
    "ag-grid-enterprise": "5.0.x"
}</code></pre>
    The major and minor versions should match. Every time a new major or minor
    version of ag-Grid is released, the component will also be released. However
    for patch versions, the component will not be released.
    </p>

    <h2>Configuring AgGridReact Component</h2>
    <p>
        The root of the example application is MyApp.jsx. At the top of this file you can
        see the import the AgGridReact component as follows:
        <pre><code>import {AgGridReact} from 'ag-grid-react';</code></pre>
        After the import you can then reference the component inside your JSX definitions.
        See the <i>render()</i> function in MyApp.jsx, it has AgGridReact defined as
        follows:
    <pre><code>&lt;AgGridReact

    <span class="codeComment">// listen for events with React callbacks</span>
    onRowSelected={this.onRowSelected.bind(this)}
    onCellClicked={this.onCellClicked.bind(this)}

    <span class="codeComment">// binding to properties within React State or Props</span>
    showToolPanel={this.state.showToolPanel}
    quickFilterText={this.state.quickFilterText}
    icons={this.state.icons}

    <span class="codeComment">// column definitions and row data are immutable, the grid</span>
    <span class="codeComment">// will update when these lists change</span>
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}

    <span class="codeComment">// or provide props the old way with no binding</span>
    rowSelection="multiple"
    enableSorting="true"
    enableFilter="true"
    rowHeight="22"
/></code></pre>
    </p>

    <h2>Loading CSS</h2>

    <p>You need 1) the core ag-Grid css and 2) a theme. These are stored in css files packaged
    in the core ag-Grid. To access them, first up we need to define an alias to use inside
    webpack.config.js:
<pre><code>alias: {
    "ag-grid-root" : __dirname + "/node_modules/ag-grid"
}</code></pre>
    Once this is done, we can then access the two css files that we need as follows:
    <pre><code>import 'ag-grid-root/dist/styles/ag-grid.css';
import 'ag-grid-root/dist/styles/theme-fresh.css';</code></pre>
    You will also need to configure CSS loaders for Webpack.
    </p>

    <h2>Applying Theme</h2>

    <p>
        You need to set a theme for the grid. You do this by giving the grid a CSS class, one
        of ag-fresh, ag-blue or ag-dark. You must have the CSS loaded as specified above
        for this to work.
    </p>

    <pre><span class="codeComment">// a parent container of the grid, you could put this on your body tag</span>
<span class="codeComment">// if you only every wanted to use one style of grid</span>

<span class="codeComment">// HTML</span>
&lt;div class="ag-fresh">
    ...

<span class="codeComment">// OR JSX</span>
&lt;div className="ag-fresh">
    ...

    <span class="codeComment">// then later, use the grid</span>
    &lt;AgGridReact
        ...
</pre>

    <h2>Grid API</h2>

    <p>
        When the grid is initialised, it will fire the <i>gridReady</i> event. If you want to
        use the API of the grid, you should put an <i>onGridReady(params)</i> callback onto
        the grid and grab the api from the params. You can then call this api at a later
        stage to interact with the grid (on top of the interaction that can be done by
        setting and changing the props).
        <pre><code><span class="codeComment">// provide gridReady callback to the grid</span>
&lt;AgGridReact
    onGridReady={this.onGridReady.bind(this)}
    .../>

<span class="codeComment">// in onGridReady, store the api for later use</span>
onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
}

<span class="codeComment">// use the api some point later!</span>
somePointLater() {
    this.api.selectAll();
    this.columnApi.setColumnVisible('country', visible);
}</code></pre>
    </p>

    <p>
        The <i>api</i> and <i>columnApi</i> are also stored inside the React backing object
        of the grid. So you can also look up the backing object via React and access the
        <i>api</i> and <i>columnApi</i> that way.
    </p>

    <h2>Next Steps</h2>

    <p>
        The above is all you need to get started using ag-Grid in a React application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h2>Cell Rendering, Cell Editing and Filtering using React</h2>

    <p>
        It is possible to build <a href="../javascript-grid-cell-rendering/#reactCellRendering">cellRenders</a>,
        <a href="../javascript-grid-cell-editing/#reactCellEditing">cellEditors</a> and
        <a href="../javascript-grid-filtering/#reactFiltering">filters</a> using React. Doing each of these
        is explained in the section on each.
    </p>

    <p>
        Although it is possible to use React for your customisations of ag-Grid, it is not necessary. The grid
        will happily work with both React and non-React portions (eg cellRenderers in React or normal JavaScript).
        If you do use React, be aware that you are adding an extra layer of indirection into ag-Grid. ag-Grid's
        internal framework is already highly tuned to work incredibly fast and does not require React or anything
        else to make it faster. If you are looking for a lightning fast grid, even if you are using React and
        the ag-grid-react component, consider using plain ag-Grid Components (as explain on the pages for
        rendering etc) inside ag-Grid instead of creating React counterparts.
    </p>

</div>

<script type="text/javascript" src="bundle.js" charset="utf-8"></script>
<!-- Example uses font awesome icons -->
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

<?php include '../documentation-main/documentation_footer.php';?>
