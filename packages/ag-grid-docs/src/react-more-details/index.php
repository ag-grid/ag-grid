<?php
$pageTitle = "ag-Grid Reference: React Datagrid - Overview";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers setting up the ag-Grid React Component, ag-Grid React dependency and getting through some of the fundamental setup.";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
<div>
    <h1>
    Ag-Grid React Overview
    </h1>
    <h2 id="ag-Grid-react-features">ag-Grid React Features</h2>
    <p>
        Every feature of ag-Grid is available when using the ag-Grid React Component. The React Component wraps the
        functionality of ag-Grid so you gain all the features of ag-Grid along with all good stuff that React provides.
    </p>
    <h2>
        Table of Contents
    </h2>
    <div class="row">
        <div class="col">
            <ol style="columns: 2">
                <li><a href="#configuring-aggridreact-component">Configuring the ag-Grid React Component</li></a>
                <li><a href="#grid-api">Access the Grid & Column API</li></a>
                <li><a href="#loading-css">Loading CSS & Applying a Theme</li></a>
                <li><a href="#react-redux-hoc">Redux / Higher Order Components</a>
                <li><a href="#context-api">React Context API</li></a>
                <li><a href="#react-hooks">React Hooks</li></a>
                <li><a href="#react-row-data-control">Row Data Control</li></a>
                <li><a href="#react-grid-resources">Resources</li></a>
            </ol>
        </div>
    </div>
    <hr>
    <h2 id="configuring-aggridreact-component">Configuring the ag-Grid React Component</h2>
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

    <h2 id="loading-css">Loading CSS</h2>
    <p>ag-Grid requires the core ag-Grid CSS as well as a theme.</p>
<snippet>
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
</snippet>
    <p>If you're using webpack you can configure an alias to allow for absolute imports (this isn't necessary when using <code>create-react-app</code>:</p>
    <snippet>
resolve: {
    alias: {
        "ag-grid-community": path.resolve('./node_modules/ag-grid-community')
</snippet>

    <h2 id="applying-theme">Applying a Theme</h2>
    <p>
        You need to set a theme for the grid. You do this by giving the grid a CSS class, one
        of <code>ag-theme-balham</code>, <code>ag-theme-material</code>, <code>ag-theme-fresh</code>, <code>ag-theme-blue</code> or <code>ag-theme-dark</code>. You must have the CSS loaded as specified above
        for this to work.
    </p>
    <snippet language="jsx">
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
...</snippet>

    <p>Putting the CSS and theme all together you'll end up with something like this:</p>

<snippet language="jsx">
// a react component
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class GridComponent extends Component {
    render() {
        return (
            &lt;div className="ag-theme-balham"&gt;
                &lt;AgGridReact
                    onGridReady={this.onGridReady}
                    rowData={this.state.rowData}
                    ...other bindings/properties
                &gt;
                    &lt;AgGridColumn field="athlete" width={30}&gt;&lt;/AgGridColumn&gt;
                    ...other column definitions
                &lt;/AgGridReact&gt;
        )
    }
}
</snippet>

    <h2 id="cell-components">Customising the Grid with React Components</h2>
<p>
    It is possible to customise the grid with React components (for example, <a href="../javascript-grid-cell-rendering-components/#react-cell-rendering">cell renderers</a>,
    <a href="../javascript-grid-cell-editor/#react-cell-editing">cell editors</a> and
    <a href="../javascript-grid-filter-component/#react-filtering">filters</a> and so on using React. For the full list of available grid components and how to configure them
    please refer to the <a href="../javascript-grid-components/">components</a> documentation</p>

    <h2 id="react-16">ag-Grid with React 16+</h2>
    <note>All of the documentation in this section apply to React 16+. For documentation for React 15+ please see <a
                href="#react-15">here.</a></note>
    <p>With React 16 <a href="https://reactjs.org/docs/portals.html">Portals</a> were introduced and these are the official way to create React components dynamically within React so
        this is what we use internally for component creation within the grid.</p>
    <p>If you use React 16+ you'll need to enable <code>reatNext </code> as follows:</p>
<snippet>
// Grid Definition
&lt;AgGridReact
    reactNext={true}
    ...other bindings
</snippet>

    <p>In a future release we'll switch to make <code>reactNext</code> the default, but for now this needs to be made explicit.</p>

    <h3>Control React Components Container</h3>
    <p>By default user supplied React components will be wrapped in a <code>div</code> but it is possible to have your component
    wrapped in a container of your choice (i.e. a <code>span</code> etc), perhaps to override/control a third party component.</p>

    <p>For example, assuming a user component as follows:</p>

<snippet>
class CellRenderer extends Component {
    render() {
        return(
            <span>Age: {props.value}</span>
        )
    }
}
</snippet>

    <p>The default behaviour will render the following within the grid:</p>

<snippet language="html">
&lt;div class="ag-react-container"&gt;&lt;span&gt;Hello World&lt;/span&gt;&lt;/div&gt;
</snippet>

    <p>In order to override this default behaviour and can specify a <code>componentWrappingElement</code>:</p>

<snippet>
&lt;AgGridReact
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}
    rowData=<span ng-non-bindable>{</span>this.state.rowData}
    componentWrappingElement='span'
    ...other properties
</snippet>

    <p>Doing this would result in the following being rendered:</p>
<snippet language="html">
&lt;span class="ag-react-container"&gt;&lt;span&gt;Hello World&lt;/span&gt;&lt;/span&gt;
</snippet>

    <p>If you wish to override the style of this div you can either provide an implementation of the <code>ag-react-container</code> class, or
        via the <code>reactContainer</code> property that will be made available via <code>props</code>:</p>
    <snippet>
constructor(props) {
        super(props);
        // change the containing div to be inline-block (instead of the default block for a div)
        this.props.reactContainer.style.display = "inline-block";
        // change the background color of the containing div to be red
        this.props.reactContainer.style.backgroundColor = "red";
}</snippet>
    <p>You can see an example of this in the
        <a href="https://github.com/ceolter/ag-grid-react-example/blob/master/src/groupedRowInnerRendererExample/MedalRenderer.jsx">Grouped Row Example</a>
        where we change the display of the <code>groupRowInnerRendererFramework</code> to <code>inline-block</code> so that the +/- and label are inline.</p>


    <note>Functional/Stateless Components will have a wrapping container (a <code>div</code> by default) provided due to technical constraints.</note>

    <h3 id="react-redux-hoc">Redux / Higher Order Components (HOC)</h3>

    <note>We provide a guide on how to use ag-Grid with Redux in our <a
                href="../react-redux-integration-pt1/">React/Redux Integration Guide </a></note>
    <p>If you use <code>connect</code> to use Redux, or if you're using a Higher Order Component (HOC) to wrap the grid React component at all,
        you'll also need to ensure the grid can get access to the newly created component. To do this you need to ensure <code>forwardRef</code>
    is set:</p>
    <snippet>
export default connect(
    (state) => {
        return {
            currencySymbol: state.currencySymbol,
            exchangeRate: state.exchangeRate
        }
    },
    null,
    null,
    { forwardRef: true } // must be supplied for react/redux when using GridOptions.reactNext
)(PriceRenderer);
    </snippet>

    <h3 id="context-api">React Context API</h3>
    <p>If you're using the new React Context API then you can access the context in the components used within the grid.</p>

    <p>First, let's create a context we can use in our components:</p>

    <snippet>
    import React from "react";
    export default React.createContext('normal');
    </snippet>
    <p>Next we need to provide the context in a parent component (at the Grid level, or above) - for example:</p>
<snippet>
&lt;FontContext.Provider value="bold"&gt;
    &lt;GridComponent/&gt;
&lt;/FontContext.Provider&gt;
</snippet>

    <p>Finally, we need to consume the context within our component:</p>

    <snippet>
class StyledRenderer extends Component {
    render() {
        return (<span ng-non-bindable>
            &lt;FontContext.Consumer&gt;
                {fontWeight =&gt; &lt;span style={{fontWeight}}&gt;Stylised Component!&lt;/span&gt; }
            &lt;/FontContext.Consumer&gt;</span>
        );
    }
}
</snippet>

    <h3 id="react-hooks">React Hooks</h3>
    <p>React Hooks are fully supported as cell renderers - please refer to our working example in <a
                href="https://github.com/ag-grid/ag-grid-react-example/">GitHub</a>.</p>

    <note>You can currently use Hooks for renderers only - support for React Hooks in Editors/Filter etc is not currently supported.</note>

    <h2 id="react-row-data-control">Row Data Control</h2>
    <p>By default the ag-Grid React component will check props passed in to deteremine if data has changed and will only re-render based on actual changes.</p>

    <p>For <code>rowData</code> we provide an option for you to override this behaviour by the <code>rowDataChangeDetectionStrategy</code> property:</p>

<snippet>
&lt;AgGridReact
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}
    rowData=<span ng-non-bindable>{</span>this.state.rowData}
    rowDataChangeDetectionStrategy='IdentityCheck'
    ...other properties
</snippet>

    <p>The following table illustrates the different possible combinations:</p>

    <table class="theme-table reference ng-scope">
        <tbody>
        <tr>
            <th>Strategy</th>
            <th>Behaviour</th>
            <th>Notes</th>
        </tr>
        <tr>
            <td><code>IdentityCheck</code></td>
            <td>Checks if the new prop is exactly the same as the old prop (i.e. <code>===</code>)</td>
            <td>Quick, but can result in re-renders if no actual data has changed</td>
        </tr>
        <tr>
            <td><code>DeepValueCheck</code></td>
            <td>Performs a deep value check of the old and new data</td>
            <td>Can have performance implication for larger data sets</td>
        </tr>
        <tr>
            <td><code>NoCheck</code></td>
            <td>Does no checking - passes the new value as is down to the grid</td>
            <td>Quick, but can result in re-renders if no actual data has changed</td>
        </tr>
        </tbody>
    </table>

    <p>The default value for this setting is:</p>
    <table class="theme-table reference ng-scope">
        <tbody>
        <tr>
            <th>DeltaRowDataMode</th>
            <th>Default</th>
        </tr>
        <tr>
            <td><code>true</code></td>
            <td><code>IdentityCheck</code></td>
        </tr>
        <tr>
            <td><code>false</code></td>
            <td><code>DeepValueCheck</code></td>
        </tr>
        </tbody>
    </table>

    <p>If you're using Redux or larger data sets thena default of <code>IdentityCheck</code> is a good idea <span>provided</span> you
    ensure you make a copy of thew new row data and do not mutate the <code>rowData</code> passed in.</p>

    <div class="accordion" id="react-15" style="padding-top: 20px">
        <div class="card" style="border-radius: 0.25rem">
            <div class="card-header" id="react15Heading" style="padding-left: 5px">
                <h5 class="mb-0">
                    <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#react-15-content" aria-expanded="true" aria-controls="react-15-content" style="padding-left: 0">
                        <span style="font-weight:400; font-size: 1.7rem">ag-Grid with React 15+</span>
                    </button>
                </h5>
            </div>

            <div id="react-15-content" class="collapse hide" aria-labelledby="react15Heading" data-parent="#react-15" style="border: 1px solid rgba(0, 0, 0, 0.125);">
                <div class="card-body" style="padding: 5px;">
                    <h3>Control React Components Container</h3>
                    <p>By default user supplied React components will be rendered with a <code>div</code> container but it is possible to have your specify
                        a container (i.e. a <code>div</code>, <code>span</code> etc), perhaps to override/control a third party component.</p>

                    <p>For example, assuming a user component as follows:</p>

<snippet>
class CellRenderer extends Component {
    render() {
        return(
            <div>Age: {props.value}</div>
        )
    }
}
</snippet>

                    <p>The default behaviour will render the following within the grid:</p>

<snippet language="html">
&lt;div class="ag-react-container"&gt;&lt;span&gt;Age: 24&lt;/span&gt;&lt;/div&gt;
</snippet>

                    <p>In order to override this default behaviour and can specify a <code>componentWrappingElement</code>:</p>

                    <snippet>
&lt;AgGridReact
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}
    rowData=<span ng-non-bindable>{</span>this.state.rowData}
    componentWrappingElement='span'
    ...other properties
</snippet>

                    <p>Doing this would result in the following being rendered:</p>
<snippet language="html">
&lt;span class="ag-react-container"&gt;&lt;span&gt;Age: 24&lt;/span&gt;&lt;/span    &gt;
</snippet>

                    <p>If you wish to override the style of this div you can either provide an implementation of the <code>ag-react-container</code> class, or
                        via the <code>reactContainer</code> property that will be made available via <code>props</code>:</p>
<snippet>
constructor(props) {
    super(props);
    // change the containing div to be inline-block (instead of the default block for a div)
    this.props.reactContainer.style.display = "inline-block";
    // change the background color of the containing div to be red
    this.props.reactContainer.style.backgroundColor = "red";
}</snippet>
                    <p>You can see an example of this in the
                        <a href="https://github.com/ceolter/ag-grid-react-example/blob/master/src/groupedRowInnerRendererExample/MedalRenderer.jsx">Grouped Row Example</a>
                        where we change the display of the <code>groupRowInnerRendererFramework</code> to <code>inline-block</code> so that the +/- and label are inline.</p>
                </div>
            </div>
        </div>
    </div>

    <h3>Working Examples</h3>
    <p>You can find fully working examples at our <a href="https://github.com/ag-grid/ag-grid-react-example/">ag Grid React Example</a>.
        The example demonstrates a legacy setup (without <code>reactNext</code>, as well as a simple Redux and Hooks examples.</p>

    <div class="card" style="background-color: aliceblue">
        <div class="card-body">
            <h2 id="react-grid-resources" style="margin-top: 10px">
                React Grid Resources
            </h2>
            <br/>
            <ul>
                <li>
                    Learn how to customize our React Grid in this <a href="https://blog.ag-grid.com/learn-to-customize-react-grid-in-less-than-10-minutes/" target="_blank">guide</a>.
                </li>
                <br/>
                <li>
                    Browse our <strong><a href="../best-react-data-grid/" target="_blank">React Grid</a></strong> page to discover all major benefits in using ag-Grid React.
                </li>
                <br>
                <li>
                    Visit our <strong><a href="https://blog.ag-grid.com/tag/react/">blog</a></strong> to discover all our React content.
            </ul>
        </div>
    </div>
    <h2 id="next-steps">Next Steps</h2>
<p>
    Now you can go to our react grid <a href="../javascript-grid-reference-overview/">reference</a>
    to learn about accessing all the features of the grid.
</p>

<br>
<div>
  <a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg btn-block">Start Free Trial</button></a>
</div>

</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
