<?php
$pageTitle = "ag-Grid Components: Status Bar Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page describes how to implement custom status bar components for ag-Grid";
$pageKeyboards = "JavaScript Grid Status Bar Components";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Status Bar Components</h1>

<p>
    Status Bar components allow you to add your own components to the ag-Grid Status Bar. Use this when the provided
    status bar components do not meet your requirements.
</p>

<h2>Status Bar Component Interface</h2>

<snippet>
interface IStatusBar&lt;IStatusBarParams&gt; {
    /** Return the DOM element of your component, this is what the grid puts into the DOM */
    getGui(): HTMLElement;

    /** Gets called once by grid when destroying the component - do any necessary cleanup here  */
    destroy?(): void;

    /** The init(params) method is called on the component once. See below for details on the parameters. */
    init?(params: IStatusBarParams): Promise&lt;void&gt; | void;
}
</snippet>

<h2 id="istatus-bar-params">IStatusBarParams</h2>
<p>
    The method init(params) takes a params object with the items listed below. If the user provides
    params via the <code>statusParams</code> attribute (see <a href="#configure-components"></a> Configuring Status Bar
    Components below), these will be additionally added to the params object, overriding items of the same name if a name
    clash exists.
</p>

<snippet>
interface IStatusBarParams {
    // The grid API
    api: GridApi,

    // The colum API
    columnApi: ColumnApi,

    // The context for this grid. See section on Context
    context: any;
}
</snippet>

<h2 id="configure-components">Configuring Status Bar Components</h2>

<p>In order to add new components to the Status Bar (or to configure the provided <code>agAggregationComponent</code>
    component) you need to provide the components and any associated information to <code>statusPanel</code>:
</p>

<snippet>
var gridOptions = {
    statusPanel: {
        components: [
            {
                component: 'statusBarComponent'
            },
            {
                component: 'agAggregationComponent',
                componentParams : {
                    // only show count and sum ('min', 'max', 'avg' won't be shown)
                    aggFuncs: ['count', 'sum']
                }
            }
        ]
    },
    ...other properties
</snippet>

<p>In the configuration above we've specified a custom component (<code>statusBarComponent</code>) as well as the provided
    <code>agAggregationComponent</code> component.</p>

<p>Order is important here - the order of the components provided will determine the order in which they're rendered, from
    left to right.</p>

<?= example('Status Bar Component', 'custom-component', 'generated', array("enterprise" => 1)) ?>

<?php 

include '../documentation-main/documentation_footer.php'; 
?>
