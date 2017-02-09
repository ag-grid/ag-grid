<?php
$key = "Header Rendering Angular";
$pageTitle = "ag-Grid Cell Editing Angular";
$pageDescription = "";
$pageKeyboards = "ag-Grid Cell Editors Angular";
include '../documentation-main/documentation_header.php';
?>

<h2>
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Header Component
</h2>

<p>
    This section outlines how to use Angular components inside the header. You should read about how
    <a href="../javascript-grid-header-rendering/">Header Components</a> work in ag-Grid first before trying to
    understand this section. For a full working example of Header Components in Angular see
    <a href="https://github.com/ceolter/ag-grid-ng2-example">Angular Example</a>.
</p>

<h3>Header Component</h3>

<p>
    Implementing a header component in Angular differs from the standard header component in the following ways:
    <ul>
        <li>Implement <i>IHeaderAngularComp</i> instead of <i>IHeaderComp</i>.</li>
        <li>Use <i>colDef.headerComponentFramework</i> instead of <i>colDef.headerComponent</i>.</li>
    </ul>
</p>

<p>
    The interface <i>IHeaderAngularComp</i> is as follows:
</p>

<pre>interface IHeaderAngularComp {

    <span class="codeComment">// equivalent of init in IHeaderComp</span>
    <span class="codeComment">// IHeaderCompParams is same as non Angular version</span>
    agInit?(params: IHeaderCompParams): void;

    <span class="codeComment">// no getGui() or destroy(), all handled by Angular</span>
}</pre>

<!-- Header Component -->
<h3>Header Group Component</h3>

<p>
    Implementing a header group component in Angular differs from the standard header group component in the following ways:
<ul>
    <li>Implement <i>IHeaderGroupAngularComp</i> instead of <i>IHeaderGroupComp</i>.</li>
    <li>Use <i>colDef.headerGroupComponentFramework</i> instead of <i>colDef.headerGroupComponent</i>.</li>
</ul>
</p>

<p>
    The interface <i>IHeaderGroupAngularComp</i> is as follows:
</p>

<pre>interface IHeaderGroupAngularComp {

    <span class="codeComment">// equivalent of init in IHeaderGroupComp,</span>
    <span class="codeComment">// IHeaderGroupCompParams is same as non Angular version</span>
    agInit?(params: IHeaderGroupCompParams): void;

    <span class="codeComment">// no getGui() or destroy(), all handled by Angular</span>
}</pre>

<?php include '../documentation-main/documentation_footer.php';?>
