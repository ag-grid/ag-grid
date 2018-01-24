<div>

    <h2>
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="/images/react_small.png" height="25px"/>
        Getting Started
    </h2>

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
        <snippet>
            import {AgGridReact} from 'ag-grid-react';
        </snippet>
        After the import you can then reference the component inside your JSX definitions.
        See the <i>render()</i> function in MyApp.jsx, it has AgGridReact defined as
        follows (Make sure that you set the height for the parent element of `
        <AgGridReact/>
        `):
        <snippet>
            &lt;AgGridReact

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
            /&gt;
        </snippet>
    </p>

    <h2 id="loading-css">Loading CSS</h2>

    <p>You need 1) the core ag-Grid css and 2) a theme. These are stored in css files packaged
        in the core ag-Grid. To access them, first up we need to define an alias to use inside
        webpack.config.js:
        <snippet>
            alias: {
            "ag-grid-root" : __dirname + "/node_modules/ag-grid"
            }
        </snippet>
        Once this is done, we can then access the two css files that we need as follows:
        <snippet>
            import 'ag-grid-root/dist/styles/ag-grid.css';
            import 'ag-grid-root/dist/styles/ag-theme-balham.css';
        </snippet>
        You will also need to configure CSS loaders for Webpack.
    </p>

    <h2 id="applying-theme">Applying Theme</h2>

    <p>
        You need to set a theme for the grid. You do this by giving the grid a CSS class, one
        of ag-theme-balham, ag-theme-material, ag-theme-fresh, ag-theme-blue or ag-theme-dark. You must have the CSS loaded as specified above
        for this to work.
    </p>

    <snippet>
        // a parent container of the grid, you could put this on your body tag
        // if you only every wanted to use one style of grid

        // HTML
        &lt;div class="ag-theme-balham"&gt;
        ...

        // OR JSX
        &lt;div className="ag-theme-balham"&gt;
        ...

        // then later, use the grid
        &lt;AgGridReact
        ...
    </snippet>

    <h2 id="grid-api">Grid API</h2>

    <p>
        When the grid is initialised, it will fire the <i>gridReady</i> event. If you want to
        use the API of the grid, you should put an <i>onGridReady(params)</i> callback onto
        the grid and grab the api from the params. You can then call this api at a later
        stage to interact with the grid (on top of the interaction that can be done by
        setting and changing the props).
        <snippet>
            // provide gridReady callback to the grid
            &lt;AgGridReact
            onGridReady={this.onGridReady.bind(this)}
            .../&gt;

            // in onGridReady, store the api for later use
            onGridReady(params) {
            this.api = params.api;
            this.columnApi = params.columnApi;
            }

            // use the api some point later!
            somePointLater() {
            this.api.selectAll();
            this.columnApi.setColumnVisible('country', visible);
            }
        </snippet>
    </p>

    <p>
        The <i>api</i> and <i>columnApi</i> are also stored inside the React backing object
        of the grid. So you can also look up the backing object via React and access the
        <i>api</i> and <i>columnApi</i> that way.
    </p>

</div>

<!-- Example uses font awesome icons -->
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
