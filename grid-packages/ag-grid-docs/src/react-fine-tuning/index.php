<?php
$pageTitle = "Fine Tuning ag-Grid & React";
$pageDescription = "This page covers finer control of ag-Grid with react";
$pageKeywords = "React Grid Control";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
<h1 id="react-grid-api">More Control of ag-Grid with React</h1>

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

    <h2 id="react-cell-rendering">Cell Component Rendering</h2>

    <p>React renders components asynchronously and although this is fine in the majority of use cases it can be the case
        that in certain circumstances a very slight flicker can be seen where an old component is destroyed but the new
        one is not yet rendered by React.</p>

    <p>In order to eliminate this behaviour the Grid will "pre-render" cell components and replace them with the real component
    once they are ready.</p>

    <p>What this means is that the <code>render</code> method on a given Cell Component will be invoked twice, once for the pre-render
    and once for the actual component creation.</p>

    <p>In the vast majority of cases this will result in overall improved performance but if you wish to disable this behaviour
        you can do so by setting the <code>disableStaticMarkup</code> property on the <code>AgGridReact</code> component to <code>true</code>:</p>

<snippet language="jsx">
&lt;AgGridReact
    disableStaticMarkup={true}
</snippet>

    <p>Note that this pre-render only applies to Cell Components - other types of Components are unaffected.</p>

    <h2 id="react-row-data-control">Row Data & Column Def Control</h2>
    <p>By default the ag-Grid React component will check props passed in to determine if data has changed and will only re-render based on actual changes.</p>

    <p>For <code>rowData</code> and <code>columnDefs</code> we provide an option for you to override this behaviour by the <code>rowDataChangeDetectionStrategy</code>
        and <code>columnDefsChangeDetectionStrategy</code> properties respectively:</p>

    <snippet>

    &lt;AgGridReact
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}
        rowData=<span ng-non-bindable>{</span>this.state.rowData}
        rowDataChangeDetectionStrategy='IdentityCheck'
        columnDefsChangeDetectionStrategy='NoCheck'
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

    <p>For <code>rowData</code> the default value for this setting is:</p>
    <table class="theme-table reference ng-scope">
        <tbody>
        <tr>
            <th>ImmutableData</th>
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

    <p>If you're using Redux or larger data sets then a default of <code>IdentityCheck</code> is a good idea <span>provided</span> you
    ensure you make a copy of thew new row data and do not mutate the <code>rowData</code> passed in.</p>

    <p>For <code>columnDefs</code> the default value for this setting is <code>NoCheck</code> - this allows the grid to determine
    if a column configuration change is to be applied or not. This is the preferred and most performant choice.</p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
