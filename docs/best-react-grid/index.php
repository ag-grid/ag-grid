<?php
$key = "Getting Started React";
$pageTitle = "Best React Grid";
$pageDescription = "Shows and example of a data grid for using with React.";
$pageKeyboards = "React Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - React</h2>

    <p>
        Webpack and Babel are popular within the React community. So I've
        put together a <a href="https://github.com/ceolter/ag-grid-react-example">
        sample application on Github</a> using these. This page goes through how
        ag-Grid works with React using this example. It is assumed you are
        already familiar with Webpack, Babel and React.

        The example demonstrates:
        <ul>
            <li>ag-Grid as a React component.</li>
            <li>React used for rendering Skills and Proficiency columns.</li>
            <li>React used for Skills and Proficiency custom filters.</li>
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
    In your package.json file, specify dependency on ag-grid AND ag-grid-react-component.
    The ag-grid package contains the core ag-grid engine (you will reference the css from
    here for example) and the ag-grid-react-component contains the React component and
    some utils for React rendering.
        <pre><code>  "dependencies": {
    ...
    "ag-grid": "3.2.2",
    "ag-grid-react-component": "3.2.2"
}</code></pre>
    The version of the component must match the version of the grid. Going forward, I will
    be releasing the component in parallel with the grid so there is no confusion about which
    version of the component for which version of the grid.
    </p>

    <h2>Configuring AgGridReact Component</h2>
    <p>
        The root of the example application is MyApp.jsx. At the top of this file you can
        see the import the AgGridReact component as follows:
        <pre><code>import {AgGridReact} from 'ag-grid-react-component';</code></pre>
        After the import you can then reference the component inside your JSX definitions.
        See the <i>render()</i> function in MyApp.jsx, it has AgGridReact defined as
        follows:
    <pre><code>&lt;AgGridReact
    // listen for events with React callbacks
    onRowSelected={this.onRowSelected.bind(this)}
    onCellClicked={this.onCellClicked.bind(this)}

    // binding to properties within React State or Props
    showToolPanel={this.state.showToolPanel}
    quickFilterText={this.state.quickFilterText}
    icons={this.state.icons}

    // column definitions and row data are immutable, the grid
    // will update when these lists change
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}

    // or provide props the old way with no binding
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
    "ag-grid-root" : __dirname + "/node_modules/ag-grid/dist"
}</code></pre>
    Once this is done, we can then access the two css files that we need as follows:
    <pre><code>import 'ag-grid-root/ag-grid.css';
import 'ag-grid-root/theme-fresh.css';</code></pre>
    You will also need to configure CSS loaders for Webpack, but that's not ag-Grid specific
    so I'm not going to explain. P.S. - If anyone knows how to load the CSS without having
    to use an alias, please tell me!!
    </p>

    <h2>Grid API</h2>

    <p>
        When the grid is initialised, it will fire the <i>ready</i> event. If you want to
        use the API of the grid, you should put an <i>onReady(params)</i> callback onto
        the grid and grab teh api from the params. You can then call this api at a later
        stage to interact with the grid (on top of the interaction that can be done by
        setting and changing the props).
        <pre><code>// provide ready callback to the grid
&lt;AgGridReact
    onReady={this.onReady.bind(this)}
    .../>

// in onReady, store the api for later use
onReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
}

// use the api some point later!
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

    <h2>Cell Rendering</h2>

    <p>
        It is possible to have <a href="../angular-grid-cell-rendering/index.php">cellRenderers</a>
        use React. Before reading this, it would be good to understand how to build a
        <a href="../angular-grid-cell-rendering/index.php">cellRenderer</a> without using React as
        it is assumed here that you already know this.
    </p>

    <p>
        In the example, both 'Skills' and 'Proficiency' use React cellRenderers.</p>
    <p>
        To create a React cellRenderer, you use the factory <i>reactCellRendererFactory</i>
        and provide it with the React component you want to render. You then put the result
        onto the columnDef just like a normal cellRenderer.
        <pre><code>columnDef = {headerName: "Skills",
    cellRenderer: reactCellRendererFactory(SkillsCellRenderer),
    ...
}</code></pre>
    The above does some 'magic' to make the React renderer work even though it's not living
    inside a React component. The ag-Grid <i>params</i> (for normal cellRenderers) are
    passed to the React component under the property of <i>params</i>. So to access the cells
    value, for example, you would use <i>props.params.value</i>.
    </p>
    <p>The magic to get this all working is very few lines of 'nifty' code. If your interested,
    just look at the source code of the <a href="https://github.com/ceolter/ag-grid-react-component">ag-grid-react-component project on Github</a>.
    </p>

    <h2>Custom Filtering</h2>

    <p>As with cellRendering, this section on <a href="../angular-grid-filtering/index.php">custom filtering</a>
        also assumes you are familiar with custom filtering inside the grid. If you are not, then please learn
        this first.</p>

    <p>
        Just like cellRendering, customFiltering provides the magic via a factory and
        is called <i>reactFilterFactory</i>.
    </p>

        <pre><code>columnDef = {headerName: "Skills",
    filter: reactFilterFactory(SkillsFilter),
    ...
}</code></pre>

    <p>Again it's some magic to get them working. After this, all you need to do is follow the standard
    ag-Grid custom filter interface in your React component. In other words, the methods in the ag-Grid
    custom filter should appear on your components backing object. The example shows all of this in action.</p>
</div>

<note>
    Getting big components like ag-Grid to work inside React was a lot of work for me and I made
    many decisions. If I did it wrong, or there is a better way, let me know!
</note>

<script type="text/javascript" src="bundle.js" charset="utf-8"></script>
<!-- Example uses font awesome icons -->
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

<?php include '../documentation_footer.php';?>
