<?php
$key = "Tool Panel";
$pageTitle = "AngularJS Angular Grid Tool Panel";
$pageDescription = "The tool panel allows you to work with the columns at run time, but showing and hiding, and grouping.";
$pageKeyboards = "AngularJS Angular Grid Show Hide Column Tool Panel";
include '../documentation_header.php';
?>

<div>

    <h2>Tool Panel</h2>

    <p>
        The tool panel is where you can change the state of the columns. This includes show / hide, move
        and group / pivot.
    </p>

    <p>
        The tool panel panel can be shown by default by setting 'showToolPanel=true' in the gridOptions,
        or after the grid is initialised by calling the api function <i>showToolPanel(show)</i>. You can query if
        the tool panel is showing with the api <i>isToolPanelShowing()</i>.
    </p>

    <h3>Show & Hide Columns</h3>

    <p>
        All columns are visible by default. To hide a column when first displaying the grid, mark
        the column definition with <i>hide = true</i>.
    </p>

    <p>
        To hide a column using the tool panel, click the icon beside the columns name.
    </p>

    <p>
        To group by a column, drag the column down to the pivot GUI.
    </p>

    <p>
        To reorder the groups (either the displayed groups, or the pivoted groups),
        drag the column to a new location in the list.
    </p>

    <p>
        To show and hide columns via the API, use the methods:
        <ul>
        <li><b>hideColumn(colId, hide)</b>: To show / hide a specific column, where colId = the id of the
            column you want to show / hide and hide = true to hide, false to show.</li>
        <li><b>hideColumns(colIds, hide)</b>: Same as above, but you pass a list of column id's in.</li>
    </ul>

    </p>

    <show-example example="toolPanelExample"></show-example>
</div>

<?php include '../documentation_footer.php';?>
