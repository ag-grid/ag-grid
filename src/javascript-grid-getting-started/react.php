<div>

    <?php if (!isFrameworkAll()) { ?>
        <h2>
            <img src="../images/svg/docs/getting_started.svg" width="50" />
            <img style="vertical-align: middle" src="/images/react_small.png" height="25px"/>
            Getting Started
        </h2>
    <?php } ?>

    <?php
    $frameworkChild = 'react';
    include 'ag-grid-dependency-framework.php'
    ?>

    <p style="margin-top: 5px">
        Using ReactJS with ag-Grid introduces a dependency on React. For this reason:
    <ul>
        <li>You need to include the additional project ag-grid-react, which has the React dependency.</li>
        <li>You cannot use the bundled version of ag-Grid. You must use the CommonJS distribution.</li>
    </ul>

    <p>
        You have the option (but not forced) of using React Components internally in the grid for rendering,
        editing and filtering. The example has two applications as follows:
    <ul>
        <li>Standard - the standard is shown below and demonstrates using React Components for renderers, editors
            and filters.
        </li>
        <li>Large - the large uses only one simple React Component for rendering the entire grid and the grid has many
            rows and columns and fills the entire web page. This project is proof of concept that ag-Grid can manage
            large data when using React to render. If you are having performance issues in your React application,
            it's not because of ag-Grid.
        </li>
    </ul>
    </p>

    <h2 id="ag-Grid-react-features">ag-Grid React Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid React Component. The React Component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        React ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-aggridreact-component">Configuring AgGridReact Component</h2>
    <p>
        The root of the example application is MyApp.jsx. At the top of this file you can
        see the import the AgGridReact component as follows:
    <pre><code>import {AgGridReact} from 'ag-grid-react';</code></pre>
    After the import you can then reference the component inside your JSX definitions.
    See the <i>render()</i> function in MyApp.jsx, it has AgGridReact defined as
    follows (Make sure that you set the height for the parent element of `
    <AgGridReact/>
    `):
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

    <h2 id="loading-css">Loading CSS</h2>

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

    <h2 id="applying-theme">Applying Theme</h2>

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

    <h2 id="grid-api">Grid API</h2>

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

</div>

<!-- Example uses font awesome icons -->
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
