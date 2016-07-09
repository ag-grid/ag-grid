<?php
$key = "Icons";
$pageTitle = "ag-Grid Icons";
$pageDescription = "ag-Grid comes with default icons that are created using SVG. You can provide your own icons for the grid to use.";
$pageKeyboards = "ag-Grid Pinning";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Icons</h2>

    <p>
        ag-Grid comes with default icons that are created using SVG. You can provide your own icons for the grid to use.
    </p>

    <p>
        The icons can either be set on the grid options (all icons) or on the column definition (all except group).
        If defined in both the grid options and column definitions, the column definition will get used. This
        allows you to specify defaults in the grid options to fall back on, and then provide individual icons for
        specific columns. This is handy if, for example, you want to include 'A..Z' as string sort icons and just
        the simple arrow for other columns.
    </p>

    <p>
        The icons are set as follows:
    </p>

    <pre>
    // column header items
    menu
    filter
    sortAscending
    sortDescending
    sortUnSort
        
    // expand / contract row group
    groupExpanded
    groupContracted

    // expand / contract column group
    columnGroupOpened
    columnGroupClosed

    // tool panel column group open / close
    columnSelectOpen
    columnSelectClosed

    // row checkbox selection and tool panel column selection
    checkboxChecked
    checkboxUnchecked
    checkboxIndeterminate

    // tool panel column selection, when read only (ie disabled checkboxes)
    checkboxCheckedReadOnly
    checkboxUncheckedReadOnly
    checkboxIndeterminateReadOnly

    // when moving columns
    columnMovePin // when column is to the left, before it gets pinned
    columnMoveAdd // when adding a column
    columnMoveHide // when removing a column
    columnMoveMove // when moving a column
    columnMoveLeft // when moving and scrolling left
    columnMoveRight // when moving and scrolling right
    columnMoveGroup // when about to drop into group panel
    columnMoveValue // when about to drop into value panel
    columnMovePivot // when about to drop into pivot panel
    dropNotAllowed // when trying to drop column into group/value/pivot panel and column doesn't support it
}
</pre>

    <p>
        Setting the icons on the column definitions is identical, except group icons are not used in column definitions.
    </p>

    <p>
        The icon can be any of the following:
        <ul>
            <li>
                <b>String:</b> The string will be treated as html. Use to return just text, or HTML tags.
            </li>
            <li>
                <b>Function:</b> A function that returns either a String or a DOM node or element.
            </li>
        </ul>
    </p>

    <p>
        The example below shows a mixture of different methods for providing icons. The grouping is done with images,
        and the header icons use a mix of Font Awesome and strings.
    </p>

    <p>
        (note: the example below uses ag-Grid-Enterprise, this is to demonstrate the icons for grouping only)
    </p>

    <show-example example="icons"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
