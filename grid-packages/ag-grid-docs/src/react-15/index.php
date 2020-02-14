<?php
$pageTitle = "React 15";
$pageDescription = "React 15 as some difference. To use ag-Grid with React 15 there are some things you need to konw";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
<div>

    <h1 id="react-15">ag-Grid with React 15.x.x</h1>

    <note>Version 21.2.0 of <code>AgGridReact</code> is the last version that supports both React 15.x.x and React 16.x.x. <br/><br/>Version 22 onwards of <code>AgGridReact</code> will support React 16+ only.</note>

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
