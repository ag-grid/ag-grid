<?php
$pageTitle = "React Components";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page customising and controlling components in ag-Grid.";
$pageKeyboards = "React Grid Components";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1>Styling React Components in ag-Grid</h1>
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

    <snippet lanuage="jsx">
&lt;AgGridReact
    onGridReady=<span ng-non-bindable>{</span>this.onGridReady}
    rowData=<span ng-non-bindable>{</span>this.state.rowData}
    componentWrappingElement='span'&gt;
&lt;/AgGridReact&gt;
    </snippet>

    <p>Doing this would result in the following being rendered:</p>
    <snippet language="html">
        &lt;span class="ag-react-container"&gt;&lt;span&gt;Hello World&lt;/span&gt;&lt;/span&gt;
    </snippet>

    <p>If you wish to override the style of this div you can either provide an implementation of the <code>ag-react-container</code> class, or
        via the <code>getReactContainerStyle</code> or <code>getReactContainerClasses</code> callbacks on the React component:</p>

    <snippet>
export default class CustomTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }


    getReactContainerStyle() {
        return {
            display: 'inline-block',
            height: '100%'
        };
    }
    </snippet>

    <p>Would result in the following being rendered:</p>

    <snippet language="html">
&lt;div class="ag-react-container custom-tooltip" style="display: inline-block; height: 100%" &gt;
    &lt;span&gt;Hello World&lt;/span&gt;
&lt;/div&gt;
    </snippet>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
