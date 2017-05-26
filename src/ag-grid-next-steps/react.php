<?php if (!isFrameworkAll()) { ?>
    <h2><img style="vertical-align: middle" src="/images/react_small.png" height="25px"/> Next Steps</h2>
<?php } ?>

<?php
$framework_enterprise = 'import React from "react";
import {AgGridReact} from "ag-grid-react";
import "ag-grid-enterprise";
...other dependencies';

include '../javascript-grid-getting-started/ag-grid-enterprise-framework.php'
?>

<h2 id="next-steps">Next Steps</h2>

<p>
    Now would
    be a good time to try it in a simple app and get some data displaying and practice with
    some of the grid settings before moving onto the advanced features of cellRendering
    and custom filtering.
</p>

<h2 id="cell-rendering-cell-editing-and-filtering-using-react">Cell Rendering, Cell Editing and Filtering using
    React</h2>

<p>
    It is possible to build <a href="../javascript-grid-cell-rendering/#reactCellRendering">cellRenderers</a>,
    <a href="../javascript-grid-cell-editing/#reactCellEditing">cellEditors</a> and
    <a href="../javascript-grid-filtering/#reactFiltering">filters</a> using React. Doing each of these
    is explained in the section on each.
</p>

<h2 id="react-redux">Using ag-Grid, React and Redux</h2>

<p>
    You can use ag-Grid together with React and Redux and get the best of all of these great tools, but there are a few
    pitfalls to be aware of.
</p>

<p>First, you can use Redux as is and it will work fine, but if you use our new <code>enableImmutableMode</code> you'll
    be able to only apply delta updates - this means ag-Grid will only re-render the row nodes that have changed.</p>

<h3>Using plain React-Redux</h3>

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