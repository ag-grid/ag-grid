<?php
$pageTitle = "ag-Grid Components: Status Panel Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page describes how to implement custom status panel components for ag-Grid";
$pageKeyboards = "JavaScript Grid Status Panel Components";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Status Panel Components</h1>

<p>
    Status Panel components allow you to add your own components to the grid's Status Panel. Use this when the provided
    status panel components do not meet your requirements.
</p>

<h2>Status Panel Component Interface</h2>

<snippet>
interface IStatusPanelItem {
    /** The init(params) method is called on the status panel component once.
        See below for details on the parameters. */
    init?(params: T): void;

    /** A hook to perform any necessary operation just after the gui for this component has been
        renderered in the screen. */
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;

    /** Gets called when the grid is destroyed - if your status panel componetns needs to do any
        cleanup, do it here */
    destroy?(): void;
}
</snippet>

 <h2 id="istatus-panel-params">Status Panel Component Parameters</h2>
<p>
    The method init(params) takes a params object with the items listed below. If the user provides
    params via the <code>componentParams</code> attribute (see <a href="#configure-components"></a> Configuring Status Panel
    Components below), these will be additionally added to the params object, overriding items of the same name if a name
    clash exists.
</p>

<snippet>
interface IStatusPanelItemParams {
    // The grid API
    api: GridApi,

    // The colum API
    columnApi: ColumnApi,

    // The context for this grid. See section on Context
    context: any;
}
</snippet>

<h2 id="configure-components">Configuring Status Panel Components</h2>

<p>In order to add new components to the Status Panel (or to configure the provided <code>agAggregationComponent</code>
    component) you need to provide the components and any associated information to <code>statusPanel</code>:
</p>

<snippet>
var gridOptions = {
    statusPanel: {
        items: [
            {
                component: 'statusPanelComponent'
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

<p>In the configuration above we've specified a custom component (<code>statusPanelComponent</code>) as well as the provided
    <code>agAggregationComponent</code> component.</p>

<p>Order is important here - the order of the components provided will determine the order in which they're rendered, from
    left to right.</p>

<?= example('Status Panel Component', 'custom-component', 'generated', array("enterprise" => 1)) ?>


<h2 id="accessing-status-panel-comp-instances">Accessing Status Panel Component Instances</h2>

<p>
    After the grid has created an instance of a status panel component it is possible to access that instance.
    This is useful if you want to call a method that you provide on the status panel component that has nothing to do
    with the operation of the grid. Accessing a status panel component is done using the grid API
    <code>getStatusPanelComponent(key)</code>.
</p>

<p>
    If your are using a framework component then the returned object
    is a wrapper and you can get the underlying status panel component using <code>getFrameworkComponentInstance()</code>
</p>

<snippet>
// example - get status panel component
let statusPanelComponent = gridOptions.api.getStatusPanelComponent('statusPanelCompKey');
if (statusPanelComponent) {
    componentInstance = statusPanelComponent.getFrameworkComponentInstance();
}
</snippet>

<p>
    The example below shows using <code>getStatusPanelComponent</code>:
</p>

<?= example('Get Status Panel Component Instance', 'component-instance', 'generated', array("enterprise" => 1)) ?>


<?php 

include '../documentation-main/documentation_footer.php'; 
?>
