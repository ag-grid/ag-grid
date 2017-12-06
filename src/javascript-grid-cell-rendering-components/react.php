<!-- React from here on -->
<h2 id="reactCellRendering">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Cell Rendering
</h2>

<p>
    It is possible to provide a React cell renderer for ag-Grid to use. All of the information above is
    relevant to React cell renderer's. This section explains how to apply this logic to your React component.
</p>

<h3 id="specifying-a-react-cell-renderer"><img src="../images/react_large.png" style="width: 20px;"/> Specifying a React Cell Renderer</h3>

<p>
    If you are using the ag-grid-react component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cell renderer's
    as React components.
</p>

<snippet>
// create your cell renderer as a React component
class NameCellRenderer extends React.Component {
    render() {
    // put in render logic
        return &lt;span&gt;{this.props.value}&lt;/span&gt;;
    }
}

// then reference the Component in your colDef like this
colDef = {

    // instead of cellRenderer we use cellRendererFramework
    cellRendererFramework: NameCellRenderer

    // specify all the other fields as normal
    headerName: 'Name',
    field: 'firstName',
    ...
}</snippet>

<p>
    By using <code>colDef.cellRendererFramework</code> (instead of <code>colDef.cellRenderer</code>) the grid
    will know it's a React component, based on the fact that you are using the React version of
    ag-Grid.
</p>

<p>
    This same mechanism can be to use a React Component in the following locations:
<ul>
    <li>colDef.cellRenderer<b>Framework</b></li>
    <li>colDef.floatingCellRenderer<b>Framework</b></li>
    <li>gridOptions.fullWidthCellRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowInnerRenderer<b>Framework</b></li>
</ul>
In other words, wherever you specify a normal cell renderer, you can now specify a React cell renderer
in the property of the same name excepting ending 'Framework'. As long as you are using the React ag-Grid component,
the grid will know the framework to use is React.
</p>

<h3 id="example-rendering-using-react-components">Example: Rendering using React Components</h3>
<p>
    Using React Components in the Cell Renderer's
</p>

<?= example('Simple Dynamic Component', 'dynamic-components', 'generated', array('enterprise' => false, 'extras' => array('fontawesome', "bootstrap")), "react") ?>

<h3 id="react-props"><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

<p>
    The React component will get the 'Cell Renderer Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.

<snippet>
// React Cell Renderer Component
class NameCellRenderer extends React.Component {

    // did you know that React passes props to your component constructor??
    constructor(props) {
        super(props);
        // from here you can access any of the props!
        console.log('The value is ' + props.value);
        // we can even call grid API functions, if that was useful
        props.api.selectAll();
    }

    render() {
        // or access props using 'this'
        return &lt;span&gt;{this.props.value}&lt;/span&gt;;
    }
}</snippet>
</p>

<h3 id="react-methods-lifecycle"><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the React Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
    <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
        any cleanup you need to do.</li>
    <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
</ul>

<h3 id="handling-refresh"><img src="../images/react_large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

