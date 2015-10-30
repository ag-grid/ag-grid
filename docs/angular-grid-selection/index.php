<?php
$key = "Selection";
$pageTitle = "AngularJS Angular Grid Selection";
$pageDescription = "AngularJS Angular Grid Selection";
$pageKeyboards = "AngularJS Angular Grid Selection";
include '../documentation_header.php';
?>

<div>

    <h2>Selection</h2>

    <p>
        When you pass data to the grid, it wraps each data item in an node. This is explained
        in the section <a href="../angular-grid-model/">Grid Model</a>. When you query for
        the selected rows, there are two method types, ones that return nodes, and ones that
        return data items. To get the selected nodes / rows from the grid, use the following
        API methods:
        <ul>
            <li><b>api.getSelectedNodes()</b>: Returns an array of the selected nodes.</li>
            <li><b>api.getSelectedNodesById()</b>: Returns a map of node id's (node id's are
                created by the grid) to selected nodes.</li>
            <li><b>api.getSelectedRows()</b>: Returns a list of selected rows data.</li>
        </ul>
    </p>

    <p>
        Working with the ag-Grid nodes is preferred over the row data as it provide you with
        more information and maps better to the internal representation of ag-grid.
    </p>

    <p>The following properties are relevant to selection:</p>
    <ul>
        <li><b>rowSelection</b>: Type of row selection, set to either 'single' or 'multiple' to
            enable selection.</li>
        <li><b>rowDeselection</b>: Set to true or false. If true, then rows will be deselected if
            you hold down ctrl + click the row. Normal behaviour with the grid disallows deselection
            of nodes (ie once a node is selected, it remains selected until another row is selected
            in it's place).</li>
        <li><b>suppressRowClickSelection</b>: If true, rows won't be selected when clicked. Use, for
            example, when you want checkbox selection, and don't want to also select when the row
            is clicked.</li>
    </ul>

    <h3>Example - Single Row Selection</h3>

    <p>
        The example below shows single row selection.
    </p>

    <show-example example="example1" example-height="450px"></show-example>

    <h3>Example - Multiple Row Selection</h3>

    <p>
        The example below shows multi-row selection.
    </p>

    <show-example example="example2" example-height="450px"></show-example>

    <h3>Checkbox Selection</h3>

    <p>
        Checkbox selection can be used in two places: a) row selection and b) group selection.
    </p>

    <p>
        To include checkbox selection for a column, set the attribute 'checkboxSelection' to true
        on the column definition. You can set this attribute on as many columns as you like, however
        it doesn't make sense to have it in more one column in a table.
    </p>

    <p>
        To enable checkbox selection for groups, set the attribute 'checkbox' to true for the
        group renderer. See the grouping section for details on the group renderer.
    </p>
    <p>
        Selecting groups can have the effect of selecting the group row, or selecting all the children
        in the group. This is done by setting the attribute 'groupSelectsChildren' to true or false.
        When set to <b>false</b>, then selecting the group will
        select the group node. When set to <b>true</b>, then selecting the group will
        either select or deselect all of the children.
    </p>

    <p>
        The example below shows checkbox selection with groups. Selecting the group has the
        effect of selecting the children. Likewise selecting all the children automatically
        selects the group. In this scenario the group itself will never appear in the <i>selectedRows</i>
        list.
    </p>

    <p>
        The example also shows a checkbox for selection on the age column. In practice, it is not
        normal to have more than two columns for selection, the below is just for demonstration.
        Having a checkbox within a non-group row is best for grids that are not using grouping.
    </p>

    <show-example example="groupSelection" example-height="450px"></show-example>

    <p>
        If you select 'group' for the 'groupCheckboxSelection', then the group will be selectable
        as it's own entity.
    </p>

    <h3>Selection Events</h3>

    <p>
        There are three events with regards selection:<br/>
        <ul>
            <li><b>rowSelected / rowDeselected</b>: Gets called when a row is selected deselected.
                The event contains the node in question.</li>
            <li><b>selectionChanged</b>: Gets called when a row is selected or deselected.
                The event contains selectedNodesById and selectedRows (as per the grid api
                methods of similar name).</li>
        </ul>
    </p>

    <show-example example="example3" example-height="450px"></show-example>

    <h3>Deep Drive Example - Using <i>forEachNode</i></h3>

    <p>
        There is an api function <i>forEachNode</i>. This is useful for doing group selections
        on a business key. The example below shows selecting all rows with country = 'United States'.
        This method is also useful when you load data and need to know the node equivalent of the
        data for selection purposes.
    </p>

    <show-example example="example4" example-height="450px"></show-example>

</div>

<?php include '../documentation_footer.php';?>
