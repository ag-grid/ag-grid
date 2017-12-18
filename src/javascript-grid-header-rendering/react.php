<h2 id="react-header-rendering">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Header Rendering
</h2>

<h3 id="header-component">Header Component</h3>

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


<h3 id="header-group-component">Header Group Component</h3>

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

<p>
    For a full working example of Header Components in React see
    <a href="https://github.com/ag-grid/ag-grid-react-example">React Example</a>.
</p>

<?= example('Header component', 'header-component', 'generated', array("extras" => array("fontawesome"), "showResult" => true, 'onlyShow' => 'react')) ?>