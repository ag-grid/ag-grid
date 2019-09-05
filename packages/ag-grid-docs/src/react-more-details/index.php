<?php
$pageTitle = "React Columns";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers setting up the ag-Grid React Component, ag-Grid React dependency and getting through some of the fundamental setup.";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
<div>
    <h1>
        Columns
    </h1>

    <p>After importing <code>AgGridReact</code> you can then reference the component inside your JSX definitions.
    An example of the Grid Component can be seen below:</p>
<snippet language="jsx">
// Grid Definition
&lt;AgGridReact
    // listening for events
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}

    // binding to array properties
    rowData=<span ng-non-bindable>{</span>this.state.rowData}

    // no binding, just providing hard coded strings for the properties
    // boolean properties will default to true if provided (ie animateRows =&gt; animateRows="true")
    rowSelection="multiple"
    animateRows

    // setting grid wide date component
    dateComponentFramework=<span ng-non-bindable>{</span>DateComponent}

    // setting default column properties
    defaultColDef=<span ng-non-bindable>{{</span>
        headerComponentFramework: SortableHeaderComponent,
        headerComponentParams: <span ng-non-bindable>{</span>
            menuIcon: 'fa-bars'
        }
    }}&gt;

    // column definitions
    &lt;AgGridColumn field="make">&lt;/AgGridColumn>
&lt;/AgGridReact&gt;>
</snippet>
</p>
<h2 id="configuring-aggridreact-columns">Configuring the Columns</h2>
<p>Columns can be defined in three ways: declaratively (i.e. via markup), via <code>GridOptions</code> or by binding to
<code>columnDefs</code> on the <code>AgGridReact</code> component.</p>
<p>In all cases all <a href="../javascript-grid-column-properties/">column definition properties</a> can be defined to make up a column definition.</p>
<p>Defining columns declaratively:</p>
    <snippet language="jsx">
// column definitions
&lt;AgGridColumn field="make">&lt;/AgGridColumn>
&lt;AgGridColumn field="model">&lt;/AgGridColumn>
&lt;AgGridColumn field="price">&lt;/AgGridColumn>
</snippet>
<p>Defining columns via <code>GridOptions</code>:</p>
    <snippet language="jsx">
// before render/grid initialisation
this.state = {
    gridOptions = {
        columnDefs: [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ]
    }
}

// in the render method
&lt;AgGridReact gridOptions={this.state.gridOptions}>&lt;/AgGridReact&gt;
</snippet>

    <p>Defining columns by binding to a property:</p>
    <snippet language="jsx">
// before render/grid initialisation
this.state = {
    columnDefs: [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ]
}

// in the render method
&lt;AgGridReact columnDefs={this.state.columnDefs}>&lt;/AgGridReact>
</snippet>

<p>A full working Grid definition is shown below, illustrating various Grid & Column property definitions:</p>
    <snippet language="jsx">
&lt;AgGridReact
    // listening for events
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}

    // binding to array properties
    rowData=<span ng-non-bindable>{</span>this.state.rowData}

    // no binding, just providing hard coded strings for the properties
    // boolean properties will default to true if provided (ie animateRows =&gt; animateRows="true")
    rowSelection="multiple"
    animateRows

    // setting grid wide date component
    dateComponentFramework=<span ng-non-bindable>{</span>DateComponent}

    // setting default column properties
    defaultColDef=<span ng-non-bindable>{{</span>
        sortable: true,
        filter: true,
        headerComponentFramework: SortableHeaderComponent,
        headerComponentParams: <span ng-non-bindable>{</span>
            menuIcon: 'fa-bars'
        }
    }}&gt;

    &lt;AgGridColumn headerName="#" width=<span ng-non-bindable>{</span>30} checkboxSelection suppressMenu pinned&gt;&lt;/AgGridColumn&gt;
    &lt;AgGridColumn headerName="Employee" headerGroupComponentFramework=<span ng-non-bindable>{</span>HeaderGroupComponent}&gt;
        &lt;AgGridColumn field="name" width=<span ng-non-bindable>{</span>150} pinned editable cellEditorFramework=<span ng-non-bindable>{</span>NameCellEditor}&gt;&lt;/AgGridColumn&gt;
        &lt;AgGridColumn field="country"
                      width=<span ng-non-bindable>{</span>150}
                      pinned editable cellRenderer=<span ng-non-bindable>{</span>RichGridDeclarativeExample.countryCellRenderer}
                      filterParams=<span ng-non-bindable>{</span><span ng-non-bindable>{</span>cellRenderer: RichGridDeclarativeExample.countryCellRenderer, cellHeight:20}}&gt;&lt;/AgGridColumn&gt;
    &lt;/AgGridColumn&gt;
&lt;/AgGridReact&gt;
</snippet>

<h2 id="grid-api">Access the Grid & Column API</h2>
<p>
    When the grid is initialised, it will fire the <code>gridReady</code> event. If you want to
    use the API of the grid, you should put an <code>onGridReady(params)</code> callback onto
    the grid and grab the api from the params. You can then call this api at a later
    stage to interact with the grid (on top of the interaction that can be done by
setting and changing the props).</p>
<snippet language="jsx">
// provide gridReady callback to the grid
&lt;AgGridReact
    onGridReady={this.onGridReady}
    .../&gt;

// in onGridReady, store the api for later use
onGridReady = (params) => {
    this.api = params.api;
    this.columnApi = params.columnApi;
}

// use the api some point later!
somePointLater() {
    this.api.selectAll();
    this.columnApi.setColumnVisible('country', visible);
}</snippet>
<p>
    The <code>api</code> and <code>columnApi</code> are also stored inside the React backing object
    of the grid. So you can also look up the backing object via React and access the
    <code>api</code> and <code>columnApi</code> that way.
</p>


    <h3>Working Examples</h3>
    <p>You can find fully working examples at our <a href="https://github.com/ag-grid/ag-grid-react-example/">ag Grid React Example</a>.
        The example demonstrates a legacy setup (without <code>reactNext</code>, as well as a simple Redux and Hooks examples.</p>

</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
