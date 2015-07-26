<?php
$key = "Resizing";
$pageTitle = "AngularJS Angular Grid Resizing";
$pageDescription = "AngularJS Angular Grid Resizing";
$pageKeyboards = "AngularJS Angular Grid Resizing";
include '../documentation_header.php';
?>

<div>

    <h2>Resizing</h2>

    <h4>Enable Resizing</h4>

    Turn column resizing on for the grid by enabling resizing in the grid options.

    <p/>

    Resize a column by dragging it's right hand border.

    <p/>

    <show-example example="example1"></show-example>

    <h4>Size to Fit</h4>

    <p>
        Call api.sizeColumnsToFit() to make the currently visible columns fit the screen.
        The columns will scale (growing or shrinking) to fit the available width.
    </p>
    <p>
        If you don't want a particular column to be included in the auto resize, then
        set the column definition <i>suppressSizeToFit</i> attribute to true. This is helpful
        if, for example, you want the first column to remain fixed with, but all other
        columns to fill the width of the table.
    </p>
    <p>
        In the example below, the first column is fixed with (ie suppressSizeToFit = true),
        which means it's size does not change when sizeColumnsToFit is called. Also of note
        is the second column, which has both a min and max size set, which is also respected
        with sizeColumnsToFit. The remaining columns will spread to fill the remaining space
        after you press the button.
    </p>

    <show-example example="example2"></show-example>

</div>

<?php include '../documentation_footer.php';?>
