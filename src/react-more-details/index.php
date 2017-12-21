<?php
$pageTitle = "React Datagrid";
$pageDescription = "ag-Grid can be used as a data grid inside your React application. This page details how to get started.";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1 heading-react">
        React Datagrid - More Details
    </h1>

    <note>Full working examples of ag-Grid and React can be found in <a href="https://github.com/ceolter/ag-grid-react-example">Github</a>, illustrating
        (amongst others) Rich Grids, Filtering with React Components Grid and so on.</note>

    <h3>Downloading the ag-Grid React Component</h3>

    <p style="margin-top: 5px">
        Using ReactJS with ag-Grid introduces a dependency on React. For this reason:
    <ul>
        <li>You need to include the additional project ag-grid-react, which has the React dependency.</li>
        <li>You cannot use the bundled version of ag-Grid. You must use the CommonJS distribution.</li>
    </ul>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <table>
                    <tr>
                        <td><b>Bower</b></td>
                    </tr>
                    <tr>
                        <td>bower install ag-grid</td>
                    </tr>
                    <tr>
                        <td>bower install ag-grid-react</td>
                    </tr>
                </table>
            </td>

            <td style="width: 215px;"/>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <table>
                    <tr>
                        <td><b>NPM</b></td>
                    </tr>
                    <tr>
                        <td>npm install ag-grid</td>
                    </tr>
                    <tr>
                        <td>npm install ag-grid-react</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p>You can then reference the dependency as follows in the top of your component:</p>

    <snippet>
import {AgGridReact} from 'ag-grid-react';</snippet>

    <h3 class="heading-enterprise">Downloading the ag-Grid React Enterprise Dependency</h3>

    <p>If you're using the ag-Grid Enterprise features, then in addition to the ag-Grid React dependency above, you also require
    the ag-Grid React Enterprise dependency:</p>

    <h3>Download ag-Grid-Enterprise</h3>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                bower install ag-grid-enterprise
            </td>

            <td style="width: 180px;"/>


            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                npm install ag-grid-enterprise
            </td>
        </tr>
    </table>

    <p>The Enterprise dependency has to be made available before any Grid related component, so we suggest importing it in your
    React bootstrap file (typically named index.js) before kicking off the actual application - for example:</p>

<snippet>
import React from "react";
import {render} from "react-dom";

// only necessary if you're using ag-Grid-Enterprise features
import "ag-grid-enterprise";

    // our application
import SimpleGridExample from "./SimpleGridExample";

render(
    &lt;SimpleGridExample>&lt;/SimpleGridExample>,
    document.querySelector('#root')
);
</snippet>

    <h2 id="ag-Grid-react-features">ag-Grid React Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid React Component. The React Component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        React ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-aggridreact-component">Configuring the AgGridReact Component</h2>

    <p>After the importing the <code>AgGridReact</code>  you can then reference the component inside your JSX definitions.
        An example of the Grid Component can be seen below:</p>
<snippet language="html" >
&lt;-- Grid Definition -->
&lt;AgGridReact
    // listening for events
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}

    // binding to array properties
    rowData=<span ng-non-bindable>{</span>this.state.rowData}

    // no binding, just providing hard coded strings for the properties
    // boolean properties will default to true if provided (ie enableColResize =&gt; enableColResize="true")
    rowSelection="multiple"
    enableColResize

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
/&gt;
</snippet>
    </p>

    <h2 id="configuring-aggridreact-columns">Configuring AgGridColumns</h2>
    <p>Columns can be defined in three ways: declaratively (i.e. via markup), via <code>GridOptions</code> or by binding to
        <code>columnDefs</code> on the <code>AgGridReact</code> component.</p>

    <p>In all cases all <a href="">column definition properties</a> can be defined to make up a column definition.</p>

    <p>Defining columns declaratively:</p>

<snippet language="html">
// column definitions
&lt;AgGridColumn field="make">&lt;/AgGridColumn>
&lt;AgGridColumn field="model">&lt;/AgGridColumn>
&lt;AgGridColumn field="price">&lt;/AgGridColumn>
</snippet>

    <p>Defining columns via <code>GridOptions</code>:</p>
<snippet>
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
&lt;AgGridReact
    gridOptions={this.state.gridOptions}
</snippet>

    <p>Defining columns by binding to a property:</p>
<snippet>
// before render/grid initialisation
this.state = {
    columnDefs: [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ]
}

// in the render method
&lt;AgGridReact
    columnDefs={this.state.columnDefs}
</snippet>

    <p>Column definitions via markup or on <code>GridOptions</code> are one-off definitions. Subsequent updates will not be
    reflected on the Grid. Updates using property binding will be reflected on the Grid.</p>

    <p>A full working Grid definition is shown below, illustrating various Grid & Column property definitions:</p>

<snippet language="html" >
&lt;AgGridReact
    // listening for events
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}

    // binding to array properties
    rowData=<span ng-non-bindable>{</span>this.state.rowData}

    // no binding, just providing hard coded strings for the properties
    // boolean properties will default to true if provided (ie enableColResize =&gt; enableColResize="true")
    rowSelection="multiple"
    enableColResize

    // setting grid wide date component
    dateComponentFramework=<span ng-non-bindable>{</span>DateComponent}

    // setting default column properties
    defaultColDef=<span ng-non-bindable>{{</span>
        headerComponentFramework: SortableHeaderComponent,
        headerComponentParams: <span ng-non-bindable>{</span>
            menuIcon: 'fa-bars'
        }
    }}&gt;

    &lt;AgGridColumn headerName="#" width=<span ng-non-bindable>{</span>30} checkboxSelection suppressSorting suppressMenu suppressFilter pinned&gt;&lt;/AgGridColumn&gt;
    &lt;AgGridColumn headerName="Employee" headerGroupComponentFramework=<span ng-non-bindable>{</span>HeaderGroupComponent}&gt;
        &lt;AgGridColumn field="name" width=<span ng-non-bindable>{</span>150} pinned editable cellEditorFramework=<span ng-non-bindable>{</span>NameCellEditor}&gt;&lt;/AgGridColumn&gt;
        &lt;AgGridColumn field="country"
                      width=<span ng-non-bindable>{</span>150}
                      pinned editable cellRenderer=<span ng-non-bindable>{</span>RichGridDeclarativeExample.countryCellRenderer}
                      filterParams=<span ng-non-bindable>{</span><span ng-non-bindable>{</span>cellRenderer: RichGridDeclarativeExample.countryCellRenderer, cellHeight:20}}&gt;&lt;/AgGridColumn&gt;
    &lt;/AgGridColumn&gt;
&lt;/AgGridReact&gt;
</snippet>

    <h2 id="loading-css">Loading CSS</h2>

    <p>You need 1) the core ag-Grid css and 2) a theme. These are stored in css files packaged
        in the core ag-Grid. To access them, first up we need to define an alias to use inside
        webpack.config.js:
    <snippet>
resolve: {
    alias: {
        "ag-grid": path.resolve('./node_modules/ag-grid')
</snippet>
    Once this is done, we can then access the two css files that we need as follows:
    <snippet>
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid-root/dist/styles/ag-theme-fresh.css';</snippet>
    You will also need to configure CSS loaders for Webpack - you can find a full working example of this in our <a
                href="https://github.com/ag-grid/ag-grid-react-example">React Examples</a>  Repo on Github.
    </p>

    <h2 id="applying-theme">Applying A Theme</h2>

    <p>
        You need to set a theme for the grid. You do this by giving the grid a CSS class, one
        of ag-theme-fresh, ag-theme-blue or ag-theme-dark. You must have the CSS loaded as specified above
        for this to work.
    </p>

    <snippet>
// a parent container of the grid, you could put this on your body tag
// if you only every wanted to use one style of grid

// HTML
&lt;div class="ag-theme-fresh"&gt;
    ...

// OR JSX
&lt;div className="ag-theme-fresh"&gt;
    ...

    // then later, use the grid
    &lt;AgGridReact
        ...</snippet>

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
    </p>

    <p>
        The <i>api</i> and <i>columnApi</i> are also stored inside the React backing object
        of the grid. So you can also look up the backing object via React and access the
        <i>api</i> and <i>columnApi</i> that way.
    </p>

    <p>
        Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h2 id="cell-rendering-cell-editing-and-filtering-using-react">Cell Rendering, Cell Editing and Filtering using
        React</h2>

    <p>
        It is possible to build <a href="../javascript-grid-cell-rendering-components/#reactCellRendering">cell renderer's</a>,
        <a href="../javascript-grid-cell-editing/#reactCellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#reactFiltering">filters</a> using React. Doing each of these
        is explained in the section on each.
    </p>

    <h2>Override React Components Container Style</h2>

    <p>When you provide a React Component to ag-Grid for use within the grid it will create a <code>div</code> for the component
    to live in. If you wish to override the style of this div you can do so via the <code>reactContainer</code> property
    made available via <code>props</code>:</p>

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

    <h2 id="react-redux">Using ag-Grid, React and Redux</h2>

    <p>
        You can use ag-Grid together with React and Redux and get the best of all of these great tools, but there are a few
        pitfalls to be aware of.
    </p>

    <p>First, you can use Redux as is and it will work fine, but if you use our new <code>enableImmutableMode</code> you'll
        be able to only apply delta updates - this means ag-Grid will only re-render the row nodes that have changed.</p>

    <h3>Using plain React-Redux</h3>

    <note>Please take a look at our <a href="../example-react-redux/">Simple Redux Example</a> for an example of using ag-Grid
        and Redux in practice.</note>

    <p>To use React and Redux we'll make use of <code>react-redux</code>. If we (in this example) only listen of rowData
        changes
        then the following will suffice:</p>
    <snippet>
export default connect(
    (state) =&gt; {
        return {
            rowData: state.fxData
        }
    }
)(FxQuoteMatrix);</snippet>

    <p>If we bind to this on our grid definition then any changes to Redux will be reflected within the grid:</p>

    <snippet>
&lt;AgGridReact
    // properties
    columnDefs={this.state.columnDefs}
    rowData={this.props.rowData}

    // events
    onGridReady={this.onGridReady}&gt;
&lt;/AgGridReact&gt;</snippet>

    <p>The problem with this approach is that any change to the rowData will trigger a full refresh of the Grid as it
        doesn't know which row nodes have changed.</p>

    <h3 id="react-delta-changes">Using React-Redux with <code>enableImmutableMode</code></h3>

    <p>As before, we listen to changes in react-redux in the normal way:</p>
    <snippet>
export default connect(
    (state) =&gt; {
        return {
            rowData: state.fxData
        }
    }
)(FxQuoteMatrix);</snippet>

    <p>This time however, we enable <code>enableImmutableMode</code>. We also specify <code>getRowNodeId</code> which will
        allow the Grid to determine if rows have changed, by providing each row with a unique ID:</p>

    <snippet>
&lt;AgGridReact
    // properties
    columnDefs={this.state.columnDefs}
    rowData={this.props.rowData}

    enableImmutableMode="true"
    getRowNodeId={this.getRowNodeId}

    // events
    onGridReady={this.onGridReady}&gt;
&lt;/AgGridReact&gt;</snippet>

    <p>For this to work, each row has to have something that can uniquely identify it. In our
        <a href="/ag-grid-react-trader-dashboard" target="_blank">Trader Dashboard <i class="fa fa-external-link"></i></a> example, the Top Movers panel (bottom right) uses
        this
        technique and each row can uniquely be identified by the FX curreny code:</p>

    <snippet>
getRowNodeId(data) {
    return data.symbol;
}</snippet>

    <p>By adding these two small pieces of configuration, we are now able to prevent ag-Grid from re-rendering all visible
        rows,
        and only render the rows have have actually changed. Brilliant!</p>

    <h2>Performance Pitfalls</h2>

    <p>If you find that ag-Grid is re-rendering everything and you're not expecting this, then you're probably changing a
        property
        unexpectedly - below we document some common pitfalls that are easily avoided:</p>

    <p>
    <ul>
        <li>Binding to methods in the React binding</li>
        <li>Changing references to colDefs (even if the contents are the same)</li>
        <li>Changing references to rowData (even if the contents are the same)</li>
        <li>Processing data before passing it down to ag-Grid</li>
    </ul>

    <h3>Binding to methods in the React binding</h3>
    <p>If you have something like:</p>
    <snippet>
&lt;AgGridReact
    // events
    onGridReady={this.onGridReady.bind(this)}&gt;
    ... rest of the configuration</snippet>
    <p>Then everytime the component renders, a new instance of <code>onGridReady</code> will be passed to ag-Grid and it will believe
        that it's a different function. To avoid this, do the binding separately (in the constructor for example):</p>

    <snippet>
class TopMoversGrid extends Component {
    constructor(props) {
        super(props);

        // grid events
        this.onGridReady = this.onGridReady.bind(this);
    }

    render() {
        return (
            &lt;div className="ag-theme-fresh"&gt;
                &lt;AgGridReact
                    // events
                    onGridReady={this.onGridReady}&gt;
                ... rest of the component</snippet>

    <p>Now ag-Grid will get the same function everytime the component renders.</p>

    <h3>Changing references to colDefs (even if the contents are the same)</h3>

    <p>This happens most commonly when using redux - even if the actual colDefs aren't changing, ag-Grid gets a new reference
        to each time there are changes, which causes a change cycle to occur.</p>
    <p>To alleviate this extract the colDefs from the changing state (i.e. if the columns aren't likely to change extract them
        into a component variable, and pass this to ag-Grid).</p>

    <h3>Changing references to rowData (even if the contents are the same)</h3>

    <p>As above, you can either extract this rowData into a separate variable if the data isn't actually changing, or make use of the
        <a href="#react-delta-changes">enableImmutableMode</a> above.</p>

    <h3>Processing data before passing it down to ag-Grid</h3>

    <p>Similar to the items above, processing data and then passing this to ag-Grid, even if the resulting data hasn't changes, can
        result is ag-Grid changing state.</p>

    <p>A common scenario might be where you pre-process your row data before passing it to ag-Grid - for example:</p>

    <snippet>
class TopMoversGrid extends Component {
    constructor(props) {
        super(props);
    }

    cleanData = () =>  {
        return this.props.rowData.filter(data =&gt; data.isClean)
    }

    render() {
        return (
            &lt;AgGridReact
                rowData={this.cleanData()}
                ...rest of the component</snippet>

    <p>As above, this call will result in ag-Grid believing that the rowData has changed each time the component renders as the filtering
        operation will return a new array each time. Again to alleviate this behaviour extract data that isn't likely to change and pre-process it only once.</p>

    <h2>React & TypeScript</h2>

    <p>We provide a seed project for both "plain" React as well as when using React with TypeScript.</p>

    <snippet>
git clone https://github.com/ag-grid/ag-grid-react-seed</snippet>

    <p>Within this repo you'll find two projects: <code>react</code> and <code>react-typescript</code>. The latter provides
    a working example of getting up and running with ag-Grid together with React & TypeScript.</p>

    <h2 id="next-steps">Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-reference-overview/">reference</a>
        to learn about accessing all the features of the grid.
    </p>

</div>


<?php include '../documentation-main/documentation_footer.php'; ?>
