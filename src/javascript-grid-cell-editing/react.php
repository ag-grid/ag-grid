<?php
$key = "Cell Editing React";
$pageTitle = "ag-Grid Cell Editing React";
$pageDescription = "You can integrate your own editors into ag-Grid that will bind into the grids navigation.";
$pageKeyboards = "ag-Grid Cell Editors React";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="reactCellEditing">
        <img src="../images/react_large.png" style="width: 60px;"/>
        React Cell Editing
    </h2>

    <p>
        It is possible to provide a React cellEditor for ag-Grid to use. All of the information above is
        relevant to React cellEditors. This section explains how to apply this logic to your React component.
    </p>

    <p>
        For an example of React cellEditing, see the
        <a href="https://github.com/ceolter/ag-grid-react-example">ag-grid-react-example</a> on Github.
        In the example, the 'name' column uses a React cellEditor.</p>
    </p>

    <h3><img src="../images/react_large.png" style="width: 20px;"/> Specifying a React cellEditor</h3>

    <p>
        If you are using the ag-grid-react component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cellEditors
        as React components.
    </p>

    <pre><span class="codeComment">// create your cellEditor as a React component</span>
class NameCellEditor extends React.Component {

    <span class="codeComment">// constructor gets the props</span>
    constructor(props) {
        <span class="codeComment">// set initial state to be the value to be edited</span>
        this.state = {value: props.value};
    }

    render() {
    <span class="codeComment">// put in render logic</span>
        return &lt;input type="text" value={this.state.value}>&lt;/input>;
    }

    <span class="codeComment">// more logic is needed, but enough for now to show the general setup</span>
}

<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {

    <span class="codeComment">// instead of cellRenderer we use cellRendererFramework</span>
    cellEditorFramework: NameCellEditor

    <span class="codeComment">// specify all the other fields as normal</span>
    cellRendererFramework: NameCellRenderer     <span class="codeComment">// if you have a React cellRenderer</span>
    headerName: 'Name',
    field: 'firstName',
    ...
}</pre>

    <p>
        By using <i>colDef.cellEditorFramework</i> (instead of <i>colDef.cellEditor</i>) the grid
        will know it's a React component, based on the fact that you are using the React version of
        ag-Grid.
    </p>


    <h3><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

    <p>
        The React component will get the 'cellEditor Params' as described above as it's React Props.
        Therefore you can access all the parameters as React Props.

    <h3><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle</h3>

    <p>
        All of the methods in the ICellEditor interface described above are applicable
        to the React Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
        <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
            any cleanup you need to do.</li>
        <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), isCancelBeforeStart(), isCancelAfterEnd(), afterGuiAttached()</i> etc)
        should be put onto your React component and will work as normal.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
