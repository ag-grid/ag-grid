<?php
$pageTitle = "ag-Grid APIs";
$pageDescription = "This page covers using React Hooks with ag-Grid";
$pageKeyboards = "React Grid Hook";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 id="react-grid-api">React Hooks with ag-Grid</h1>

    <h3 id="react-hooks">React Hooks</h3>
    <p>React Hooks are fully supported within ag-Grid - please refer to our working example in <a
                href="https://github.com/ag-grid/ag-grid-react-example/">GitHub</a>.</p>

    <p>We can break down the type of Hooks you can use within ag-Grid into two broad categories - those that have lifecycle
        methods (such as Filters) and those that don't (such as Cell Renderers).</p>

    <h2 id="hooks-without-methods">Hooks without Lifecycle Methods</h2>

    <p>Cell Renderers, Loading Cell Renderers and Overlay Components are examples of components without lifecycle methods.</p>

    <p>For this type of Hook you don't have to do anything special and the Hook should work as expected within ag-Grid,
        although it would often be easier to simply use a functional component in these cases (as there won't be any state to maintain).</p>

    <h2 id="hooks-with-methods">Hooks with Lifecycle Methods</h2>

    <p>Filters, Cell Editors and Floating Filter Components are examples of components that have mandatory lifecycle methods.</p>

    <p>For these types of components you'll need to wrap your hook with <code>forwardRef</code> and then expose Grid
        related lifecycle methods  <code>useImperativeHandle</code>, for example:</p>

    <h4 id="hook-cell-editor">Hook Cell Editor</h4>

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

    <h4 id="hook-cell-filter">Hook Filter</h4>

<snippet>
import React, <span ng-non-bindable>{</span>forwardRef, useImperativeHandle, useRef} from "react";

export default forwardRef((props, ref) => {
    const inputRef = useRef();
    useImperativeHandle(ref, () => {
        return {
            isFilterActive() {
                return inputRef.current.value !== '';
            },

            doesFilterPass: (params) => {
                return params.data.price.toString() === inputRef.current.value;
            }
        };
    });

    return &lt;input type="text" ref={inputRef} onChange={() => props.filterChangedCallback()}/>;
})
</snippet>

<p>The same applies to any other component to be used within the grid that requires lifecycle methods to be present.</p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
