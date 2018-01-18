<?php
$pageTitle = "React Redux Integration";
$pageDescription = "ag-Grid can be used as a data grid inside your React application. This page details how to get started.";
$pageKeyboards = "React Redux Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
    <h1>
        Redux Integration
    </h1>

    <p>This section provides details on how to integrate ag-Grid with a Redux store within a React application.</p>

    <h2 id="react-redux">Using ag-Grid, React and Redux</h2>

    <p>
        You can use ag-Grid together with React and Redux and get the best of all of these great tools, but there are a few
        pitfalls to be aware of.
    </p>

    <p>First, you can use Redux as is and it will work fine, but if you use our new <code>deltaRowDataMode</code> you'll
        be able to only apply delta updates - this means ag-Grid will only re-render the row nodes that have changed.</p>

    <h3>Using plain React-Redux</h3>

    <note>Please take a look at our <a href="../example-react-redux/">Simple Redux Example</a> for an example of using ag-Grid
        and Redux in practice.</note>

    <p>To use React and Redux we'll make use of <code>react-redux</code>. If we (in this example) only listen of rowData
        changes
        then the following will suffice:</p>

<snippet>
const mapStateToProps = (state) => ({rowData: state.rows});
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators(actions, dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(MyGrid);
</snippet>


    <p>If we bind to this on our grid definition then any changes to Redux will be reflected within the grid:</p>

    <snippet language="jsx">
&lt;AgGridReact
    columnDefs={this.state.columnDefs}
    rowData={this.props.rowData}
    onGridReady={this.onGridReady}&gt;
&lt;/AgGridReact&gt;</snippet>

    <p>The problem with this approach is that any change to the rowData will trigger a full refresh of the Grid as it
        doesn't know which row nodes have changed.</p>

    <h3 id="react-delta-changes">Using React-Redux with <code>deltaRowDataMode</code></h3>

    <p>As before, we listen to changes in react-redux in the normal way:</p>
    <snippet>
export default connect(
    (state) =&gt; {
    return {
        rowData: state.fxData
    }
})(FxQuoteMatrix);</snippet>

    <p>This time however, we enable <code>deltaRowDataMode</code>. We also specify <code>getRowNodeId</code> which will
        allow the Grid to determine if rows have changed, by providing each row with a unique ID:</p>

    <snippet language="jsx">
&lt;AgGridReact
    columnDefs={this.state.columnDefs}
    rowData={this.props.rowData}
    deltaRowDataMode="true"
    getRowNodeId={this.getRowNodeId}
    onGridReady={this.onGridReady}&gt;
&lt;/AgGridReact&gt;
</snippet>

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


    <h2>Example - Redux File Browser</h2>

    <p>
        Below shows a simple file browser that uses Redux. From the example you can notice the following:
    </p>

    <ul class="content">
        <li>Right Click on a folder for option to delete the folder or add a new file.</li>
        <li>Right Click on a file for option to delete the file.</li>
        <li>Click and Drag on the move icon to reorganise file structure.</li>
    </ul>

    <?= example('Redux File Browser', 'redux-file-browser', 'react', array("enterprise" => 1, "extras" => array( "fontawesome" ))) ?>

    <?php include '../documentation-main/documentation_footer.php'; ?>
