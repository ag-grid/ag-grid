<?php
$key = "Icons";
$pageTitle = "ag-Grid Icons";
$pageDescription = "ag-Grid comes with default icons that are created using SVG. You can provide your own icons for the grid to use.";
$pageKeyboards = "ag-Grid Pinning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="icons">Icons</h2>

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

    <pre><span class="codeComment">// column header items</span>
menu
filter
columns
sortAscending
sortDescending
sortUnSort

<span class="codeComment">// expand / contract row group</span>
groupExpanded
groupContracted

<span class="codeComment">// expand / contract column group</span>
columnGroupOpened
columnGroupClosed

<span class="codeComment">// tool panel column group open / close</span>
columnSelectOpen
columnSelectClosed

<span class="codeComment">// row checkbox selection and tool panel column selection</span>
checkboxChecked
checkboxUnchecked
checkboxIndeterminate

<span class="codeComment">// tool panel column selection, when read only (ie disabled checkboxes)</span>
checkboxCheckedReadOnly
checkboxUncheckedReadOnly
checkboxIndeterminateReadOnly

<span class="codeComment">// when moving columns</span>
columnMovePin <span class="codeComment">// when column is to the left, before it gets pinned</span>
columnMoveAdd <span class="codeComment">// when adding a column</span>
columnMoveHide <span class="codeComment">// when removing a column</span>
columnMoveMove <span class="codeComment">// when moving a column</span>
columnMoveLeft <span class="codeComment">// when moving and scrolling left</span>
columnMoveRight <span class="codeComment">// when moving and scrolling right</span>
columnMoveGroup <span class="codeComment">// when about to drop into group panel</span>
columnMoveValue <span class="codeComment">// when about to drop into value panel</span>
columnMovePivot <span class="codeComment">// when about to drop into pivot panel</span>
dropNotAllowed <span class="codeComment">// when trying to drop column into group/value/pivot panel and column doesn't support it</span>

<span class="codeComment">// menu</span>
menuPin <span class="codeComment">// beside the column pin menu item</span>
menuValue <span class="codeComment">// beside the column value menu item</span>
menuAddRowGroup <span class="codeComment">// beside the column row group menu item</span>
menuRemoveRowGroup <span class="codeComment">// beside the column row group menu item</span>
clipboardCopy <span class="codeComment">// beside the copy to clipboard menu item</span>
clipboardPaste <span class="codeComment">// beside the paste from clipboard menu item</span>

<span class="codeComment"></span>// column drop panels
rowGroupPanel <span class="codeComment">// beside where to drop columns for row group</span>
pivotPanel <span class="codeComment">// beside where to drop columns for pivot</span>
valuePanel <span class="codeComment">// beside where to drop columns for value</span>
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

    <show-example example="exampleIcons"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
