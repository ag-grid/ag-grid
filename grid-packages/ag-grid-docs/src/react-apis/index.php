<?php
$pageTitle = "React 16";
$pageDescription = "React 16 as some difference. To use ag-Grid with React 16 there are some things you need to konw";
$pageKeyboards = "React Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="react-components">React APIs with ag-Grid</h1>

    <h3 id="context-api">React Context API</h3>

    <p>If you're using the new React Context API then you can access the context in the components used within the grid.</p>

    <p>First, let's create a context we can use in our components:</p>

    <snippet>
        import React from "react";
        export default React.createContext('normal');
    </snippet>

    <p>Next we need to provide the context in a parent component (at the Grid level, or above) - for example:</p>

    <snippet language="jsx">
        &lt;FontContext.Provider value="bold"&gt;
            &lt;GridComponent/&gt;
        &lt;/FontContext.Provider&gt;
    </snippet>

    <p>Finally, we need to consume the context within our component:</p>

    <snippet  language="jsx">
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
    { forwardRef: true } // must be supplied for react/redux when using AgGridReact
)(PriceRenderer);
    </snippet>


</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
