<?php
$key = "More Detail React";
$pageTitle = "React Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your React application. This page details how to get started.";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="/images/react_small.png" height="25px"/>
        React Grid
    </h1>
    <h2>More Details</h2>

    <note>Full working examples of ag-Grid and React can be found in <a href="https://github.com/ceolter/ag-grid-react-example">Github</a>, illustrating
        (amongst others) Rich Grids, Filtering with React Components, Master/Detail Grid and so on.</note>

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

    <pre><code>import {AgGridReact} from 'ag-grid-react';</code></pre>

    <h3><img src="../images/enterprise_50.png" style="height: 22px;margin-right: 5px"/>Downloading the ag-Grid React Enterprise Dependency</h3>

    <p>If you're using the ag-Grid Enteprise features, then in addition to the ag-Grid React dependency above, you also require
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

<pre>
import React from "react";
import {render} from "react-dom";

<span class="codeComment">// only necessary if you're using ag-Grid-Enterprise features</span>
import "ag-grid-enterprise";

    // our application
import SimpleGridExample from "./SimpleGridExample";

document.addEventListener('DOMContentLoaded', () => {
    render(
        &lt;SimpleGridExample/>,
        document.querySelector('#app')
    );
});

</pre>

    <h2 id="ag-Grid-react-features">ag-Grid React Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid React Component. The React Component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        React ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-aggridreact-component">Configuring AgGridReact Component</h2>

    <p>After the importing the <code>AgGridReact</code>  you can then reference the component inside your JSX definitions.
        An example of the Grid Component can be seen below:</p>
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

    <h2 id="applying-theme">Applying A Theme</h2>

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


    <p>
        Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h2 id="cell-rendering-cell-editing-and-filtering-using-react">Cell Rendering, Cell Editing and Filtering using
        React</h2>

    <p>
        It is possible to build <a href="../javascript-grid-cell-rendering-components/#reactCellRendering">cellRenderers</a>,
        <a href="../javascript-grid-cell-editing/#reactCellEditing">cellEditors</a> and
        <a href="../javascript-grid-filtering/#reactFiltering">filters</a> using React. Doing each of these
        is explained in the section on each.
    </p>

    <h2>Override React Components Container Style</h2>

    <p>When you provide a React Component to ag-Grid for use within the grid it will create a <code>div</code> for the component
    to live in. If you wish to override the style of this div you can do so via the <code>reactContainer</code> property
    made available via <code>props</code>:</p>

<pre>
constructor(props) {
    super(props);

    <span class="codeComment">// change the containing div to be inline-block (instead of the default block for a div)</span>
    this.props.reactContainer.style.display = "inline-block";
    <span class="codeComment">// change the background color of the containing div to be red</span>
    this.props.reactContainer.style.backgroundColor = "red";
}
</pre>

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
    <pre>
export default connect(
    (state) => {
        return {
            rowData: state.fxData
        }
    }
)(FxQuoteMatrix);</pre>

    <p>If we bind to this on our grid definition then any changes to Redux will be reflected within the grid:</p>

    <pre>
&lt;AgGridReact
    // properties
    columnDefs={this.state.columnDefs}
    rowData={this.props.columnDefs}

    // events
    onGridReady={this.onGridReady}&gt;
&lt;/AgGridReact&gt;
</pre>

    <p>The problem with this approach is that any change to the rowData will trigger a full refresh of the Grid as it
        doesn't know which row nodes have changed.</p>

    <h3 id="react-delta-changes">Using React-Redux with <code>enableImmutableMode</code></h3>

    <p>As before, we listen to changes in react-redux in the normal way:</p>
    <pre>
export default connect(
    (state) => {
        return {
            rowData: state.fxData
        }
    }
)(FxQuoteMatrix);</pre>

    <p>This time however, we enable <code>enableImmutableMode</code>. We also specify <code>getRowNodeId</code> which will
        allow the Grid to determine if rows have changed, by providing each row with a unique ID:</p>

    <pre>
&lt;AgGridReact
    // properties
    columnDefs={this.state.columnDefs}
    rowData={this.props.rowData}

    enableImmutableMode="true"
    getRowNodeId={this.getRowNodeId}

    // events
    onGridReady={this.onGridReady}&gt;
&lt;/AgGridReact&gt;
</pre>

    <p>For this to work, each row has to have something that can uniquely identify it. In our
        <a href="/ag-grid-react-trader-dashboard">Trader Dashboard</a> example, the Top Movers panel (bottom right) uses
        this
        technique and each row can uniquely be identified by the FX curreny code:</p>

    <pre>
getRowNodeId(data) {
    return data.symbol;
}
</pre>

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
    <pre>
&lt;AgGridReact
    // events
    onGridReady={this.onGridReady.bind(this)}&gt;
    ... rest of the configuration
</pre>
    <p>Then everytime the component renders, a new instance of <code>onGridReady</code> will be passed to ag-Grid and it will believe
        that it's a different function. To avoid this, do the binding separately (in the constructor for example):</p>

    <pre>
class TopMoversGrid extends Component {
    constructor(props) {
        super(props);

        // grid events
        this.onGridReady = this.onGridReady.bind(this);
    }

    render() {
        return (
            <div className="ag-fresh">
                &lt;AgGridReact
                    // events
                    onGridReady={this.onGridReady}&gt;
                ... rest of the component
</pre>

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

    <pre>
class TopMoversGrid extends Component {
    constructor(props) {
        super(props);
    }

    cleanData() {
        return this.props.rowData.filter(data => data.isClean)
    }

    render() {
        return (
            &lt;AgGridReact
                rowData={this.cleanData}
                ...rest of the component
</pre>

    <p>As above, this call will result in ag-Grid believing that the rowData has changed each time the component renders as the filtering
        operation will return a new array each time. Again to alleviate this behaviour extract data that isn't likely to change and pre-process it only once.</p>

    <h2 id="next-steps">Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>


<?php include '../documentation-main/documentation_footer.php'; ?>
