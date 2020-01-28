<h2 id="react-header-rendering">
    React Header Rendering
</h2>

<h3 id="header-component">Header Component</h3>

<p>
    Implementing a header component in React differs from the standard header component in the following ways:
</p>

<ul class="content">
    <li>Implement <code>IHeaderReactComp</code> instead of <code>IHeaderComp</code>.</li>
    <li>Use <code>colDef.headerComponentFramework</code> instead of <code>colDef.headerComponent</code>.</li>
</ul>

<p>
    The interface <code>IHeaderReactComp</code> is empty. The params object (IHeaderCompParams) is passed as a
    constructor to your React component.
</p>


<h3 id="header-group-component">Header Group Component</h3>

<p>
    Implementing a header group component in React differs from the standard header group component in the following ways:
</p>

<ul class="content">
    <li>Implement <code>IHeaderGroupReactComp</code> instead of <code>IHeaderGroupComp</code>.</li>
    <li>Use <code>colDef.headerGroupComponentFramework</code> instead of <code>colDef.headerGroupComponent</code>.</li>
</ul>

<p>
    The interface <code>IHeaderReactComp</code> is empty. The params object (IHeaderGroupCompParams) is passed as a
    constructor to your React component.
</p>

<p>
    For a full working example of Header Components in React see
    <a href="https://github.com/ag-grid/ag-grid-react-example">React Example</a>.
</p>

<?= example('Header component', 'header-component', 'generated', array("extras" => array("fontawesome"), "showResult" => true, 'onlyShow' => 'react')) ?>