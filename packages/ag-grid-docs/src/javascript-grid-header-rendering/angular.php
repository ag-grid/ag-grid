<h2 id="angular-header-component"> Angular Header Component </h2>


<h3 id="header-component">Header Component</h3>

<p>
    Implementing a header component in Angular differs from the standard header component in the following ways:
</p>

<ul class="content">
    <li>Implement <code>IHeaderAngularComp</code> instead of <code>IHeaderComp</code>.</li>
    <li>Use <code>colDef.headerComponentFramework</code> instead of <code>colDef.headerComponent</code>.</li>
</ul>

<p>
    The interface <code>IHeaderAngularComp</code> is as follows:
</p>

<snippet>
interface IHeaderAngularComp {

    // equivalent of init in IHeaderComp
    // IHeaderCompParams is same as non Angular version
    agInit?(params: IHeaderCompParams): void;

    // no getGui() or destroy(), all handled by Angular
}</snippet>

<!-- Header Component -->
<h3 id="header-group-component">Header Group Component</h3>

<p>
    Implementing a header group component in Angular differs from the standard header group component in the following ways:
</p>

<ul class="content">
    <li>Implement <code>IHeaderGroupAngularComp</code> instead of <code>IHeaderGroupComp</code>.</li>
    <li>Use <code>colDef.headerGroupComponentFramework</code> instead of <code>colDef.headerGroupComponent</code>.</li>
</ul>

<p>
    The interface <code>IHeaderGroupAngularComp</code> is as follows:
</p>

<snippet>
interface IHeaderGroupAngularComp {

    // equivalent of init in IHeaderGroupComp,
    // IHeaderGroupCompParams is same as non Angular version
    agInit?(params: IHeaderGroupCompParams): void;

    // no getGui() or destroy(), all handled by Angular
}</snippet>

<p>For a full working example of Header Components in Angular see
    <a href="https://github.com/ag-grid/ag-grid-angular-example">Angular Example</a>.
</p>

<?= example('Header component', 'header-component', 'generated', array("extras" => array("fontawesome"), "showResult" => true, 'onlyShow' => 'angular')) ?>