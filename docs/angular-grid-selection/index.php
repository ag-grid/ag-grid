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
        All the currently selected rows are stored on the grid options. Firstly in an array <b>selectedRows</b>
        that stores the data. Secondly is <b>selectedNodesById</b> that is a map of node id's (node id's are
        created by the grid) to selected nodes.
    </p>

    <p>
        Use <b>selectedRows</b> to get list of the data items you provided, with the node information.
        This was implemented to give a familiar feel to people using ui-grid.</p>

    <p>
        Use <b>selectedNodesById</b> if you want to work with the ag-grid nodes. This is preferred over
        selectedRows, as it provide you with more information and maps better to the internal representation
        of ag-grid.
    </p>

    <h3>Single Row Selection</h3>

    <p>
        The example below shows single row selection.
    </p>

    <show-example example="example1" example-height="450px"></show-example>

    <h3>Multiple Row Selection</h3>

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
        selects the group. The group itself will never appear in the <i>selectedRows</i>
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

    <h3>Click De-Selection</h3>

    <p>
        Normal behaviour with the grid disallows deselection of nodes (ie once a node is selected,
        it remains selected until another row is selected in it's place). To allow deselection,
        set rowDeselection=true in the grid options.
    </p>

    <h3>Using <i>forEachInMemory</i></h3>

    <p>
        There is an api function <i>forEachInMemory</i>. This is useful for doing group selections
        on a business key. The example below shows selecting all rows with country = 'United States'.
        This method is also useful when you load data and need to know the node equivalent of the
        data for selection purposes.
    </p>

    <show-example example="example4" example-height="450px"></show-example>

    <h3>Selection Callbacks</h3>

    <p>
        There are two callbacks with regards selection:<br/>
        rowSelected(row): Gets called when a row is selected and passes the selected row.<br/>
        selectionChanged(): Gets called when a row is selected or deselected.<br/>
    </p>

    <show-example example="example3" example-height="450px"></show-example>

</div>

<?php include '../documentation_footer.php';?>
