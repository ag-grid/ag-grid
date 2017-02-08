<?php
$key = "Header Rendering React";
$pageTitle = "ag-Grid Header Rendering React";
$pageDescription = "";
$pageKeyboards = "ag-Grid Header Rendering React";
include '../documentation-main/documentation_header.php';
?>

<h2>
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    React Header Rendering
</h2>

<p>
    This section outlines how to use React components inside the header. You should read about how
    <a href="../javascript-grid-header-rendering/">Header Components</a> work in ag-Grid first before trying to
    understand this section. For a full working example of Header Components in React see
    <a href="https://github.com/ceolter/ag-grid-react-example">React Example</a>.
</p>

<h3>Header Component</h3>

<p>
    Implementing a header component in React differs from the standard header component in the following ways:
<ul>
    <li>Implement <i>IHeaderReactComp</i> instead of <i>IHeaderComp</i>.</li>
    <li>Use <i>colDef.headerComponentFramework</i> instead of <i>colDef.headerComponent</i>.</li>
</ul>
</p>

<p>
    The interface <i>IHeaderReactComp</i> is empty. The params object (IHeaderCompParams) is passed as a
    constructor to your React component.
</p>


<h3>Header Group Component</h3>

<p>
    Implementing a header group component in React differs from the standard header group component in the following ways:
<ul>
    <li>Implement <i>IHeaderGroupReactComp</i> instead of <i>IHeaderGroupComp</i>.</li>
    <li>Use <i>colDef.headerGroupComponentFramework</i> instead of <i>colDef.headerGroupComponent</i>.</li>
</ul>
</p>

<p>
    The interface <i>IHeaderReactComp</i> is empty. The params object (IHeaderGroupCompParams) is passed as a
    constructor to your React component.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
