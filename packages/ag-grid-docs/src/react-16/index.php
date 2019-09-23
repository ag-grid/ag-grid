<?php
$pageTitle = "React 16";
$pageDescription = "React 16 as some difference. To use ag-Grid with React 16 there are some things you need to konw";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="react-16">ag-Grid with React 16+</h1>

    <p>With React 16 <a href="https://reactjs.org/docs/portals.html">Portals</a> were introduced and these are the official way to create React components dynamically within React so
        this is what we use internally for component creation within the grid.</p>
    <p>If you use React 16+ you'll need to enable <code>reactNext </code> as follows:</p>

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


    <h3 id="react-redux-hoc">Redux / Higher Order Components (HOC)</h3>

    <note>We provide a guide on how to use ag-Grid with Redux in our <a
            href="../react-redux-integration-pt1/">React/Redux Integration Guide </a></note>

    <p>
        If you use <code>connect</code> to use Redux, or if you're using a Higher Order Component (HOC) to wrap the grid React component at all,
        you'll also need to ensure the grid can get access to the newly created component. To do this you need to ensure <code>forwardRef</code>
        is set:
    </p>

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

    <note>You can currently use Hooks for renderers and editors only - support for React Hooks in Filters is not currently supported.</note>
    
    <h4>Hook Cell Editor</h4>
    
    <p>In order to use a hook as a Cell Editor you'll need to wrap your hook with <code>forwardRef</code> and then expose Grid related lifecycle methods
    with <code>useImperativeHandle</code>, for example:</p>
    
<snippet>
import React, <span ng-non-bindable>{</span>useEffect, forwardRef, useImperativeHandle, useRef} from "react";

export default forwardRef((props, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
        return {
            getValue: () => {
                return inputRef.current.value;
            }
        };
    });
    return &lt;input type="text" ref={inputRef} defaultValue={props.value}/&gt;;
})
</snippet>

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

    <p>If you're using Redux or larger data sets then a default of <code>IdentityCheck</code> is a good idea <span>provided</span> you
    ensure you make a copy of thew new row data and do not mutate the <code>rowData</code> passed in.</p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
