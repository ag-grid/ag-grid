<?php
$key = "Resizing";
$pageTitle = "ag-Grid Resizing";
$pageDescription = "ag-Grid Resizing";
$pageKeyboards = "ag-Grid Resizing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="resizing">Column Resizing</h2>

    <p>
        All columns can be resized by dragging the top right portion of the column.
    </p>

    <h3 id="enable-resizing">Enable Resizing</h3>

    <p>
        Turn column resizing on for the grid by enabling resizing in the grid options.
    </p>

    <p>
        If you wish only some columns to be resizable, enable resizing for the grid,
        then suppress resizing for the particular column by setting <i>suppressResize=true</i>
        on the column definition.
    </p>

    <h3 id="size-columns-to-fit">Size Columns to Fit</h3>

    <p>
        Call api.sizeColumnsToFit() to make the currently visible columns fit the screen.
        The columns will scale (growing or shrinking) to fit the available width.
    </p>
    <p>
        If you don't want a particular column to be included in the auto resize, then
        set the column definition <i>suppressSizeToFit=true</i>. This is helpful
        if, for example, you want the first column to remain fixed with, but all other
        columns to fill the width of the table.
    </p>

    <h3 id="auto-size-columns">Auto-Size Columns</h3>

    <p>
        Just like Excel, each column can be 'auto resized' by double clicking the right side of the header
        rather than dragging it. When you do this, the grid will work out the best width
        to fit the contents of the cells in the column.
    </p>

    <note>
        The grid works out the best width by considering the virtually rendered rows only.
        For example, if your grid has 10,000 rows, but only 50 rendered due to virtualisation
        of rows, then only these 50 will be considered for working out the width
        to display. The rendered rows are all the rows you can see on the screen through the
        horizontal scroll plus a small buffer (default buffer size is 20).
    </note>

    <note>
        <p>
            <i>autoSizeColumns()</i> looks at the rendered cells on the screen, and works out the width based on what it sees.
            It cannot see the columns that are not rendered due to column virtualisation. Thus it is not possible to autosize
            a column that is not visible on the screen.
        </p>

        <p>
            Column Virtualisation is the technique the grid uses to render large amounts of columns with degrading performance by only
            rendering columns that are visible due to the horizontal scroll positions. Eg the grid can have 1000 columns
            with only 10 rendered if the horizontal scroll is only showing 10 columns.
        </p>

        <p>
            To get around this, you can turn off column virtualisation by setting grid property <i>suppressColumnVirtualisation=true</i>.
            So choice is yours - what do you want - column virtualisation working OR auto-size working on off screen columns.
        </p>
    </note>

    <h3 id="resizing-example">Resizing Example</h3>

    <p>
        The example below shows resizing in action. Things to note are as follows:
        <ul>
        <li>Each column can be resized by dragging (or double clicking or auto resize) the
            right side of its header.</li>
        <li>The button 'Size to Fit' calls api.sizeColumnsToFit()</li>
        <li>The button 'Auto-Size All' calls columnApi.autoSizeColumns()</li>
        <li>The first column is fixed with (ie suppressSizeToFit = true),
            which means its size does not change when sizeColumnsToFit is called.</li>
        <li>The 'age' column has both a min and max size set, so resizing the column
            will be restricted by these, regardless of dragging the header or using on
            of the API buttons.</li>
        </ul>
    </p>
    <p>
        In the example below,  Also of note
        is the second column, which has both a min and max size set, which is also respected
        with sizeColumnsToFit. The remaining columns will spread to fill the remaining space
        after you press the button.
    </p>

    <?= example('Column Resizing', 'column-resizing') ?>

    <h3 id="resizing-example">Sizing Columns By Default</h3>

    <p>
        It is possible to have the grid auto size the columns to fill the width by default. Do
        this by calling <i>api.sizeColumnsToFit()</i> on the <i>gridReady</i> event.
    </p>

    <p>
        Note that <i>api.sizeColumnsToFit()</i> needs to know the grid width in order to do it's
        maths. If the grid is not attached to the DOM, then this will be unknown. In the example
        below, the grid is not attached to the DOM when it is created (and hence api.sizeColumnsToFix()
        should fail). The grid checks again after 100ms, and tries to resize again. This is needed
        for some frameworks (eg Angular) as DOM objects are used before getting attached.
    </p>

    <?= example('Default Resizing', 'default-resizing') ?>

    <h3 id="resizing-groups">Resizing Groups</h3>

    <p>
        When you resize a group, it will distribute the extra room to all columns in the group equally.
        The example below the groups can be resizes as follows:
        <ul>
            <li>The group 'Everything Resizes' will resize all columns.</li>
            <li>The group 'Only Year Resizes' will resize only year, because the other columns
                have <code>suppressResize=true</code>.</li>
            <li>The group 'Nothing Resizes' cannot be resized at all because all the columns
                in the groups have <code>suppressResize=true</code>.</li>
        </ul>
    </p>

    <?= example('Resizing Groups', 'resizing-groups') ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
