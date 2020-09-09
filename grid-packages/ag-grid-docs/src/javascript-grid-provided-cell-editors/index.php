<?php
$pageTitle = "ag-Grid Provided Cell Renderers";
$pageDescription = "The grid provides cell renderers out of the box. Here we explain what they are.";
$pageKeywords = "JavaScript grid provided cell renderers";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1>Provided Cell Editors</h1>

<p class="lead">
    The grid comes with some cell editors provided out of the box. These cell editors are listed here.
</p>

<p>
    The provided cell editors are as follows:
</p>

<ul class="content">
    <li><code>agTextCellEditor</code>: Simple text editor that uses a standard HTML <code>input</code>. This is the default.</li>
    <li><code>agPopupTextCellEditor</code>: Same as 'text' but as popup.</li>
    <li><code>agLargeTextCellEditor</code>: A text popup for inputting larger, multi-line text.</li>
    <li><code>agSelectCellEditor</code>: Simple editor that uses a standard HTML <code>select</code>.</li>
    <li><code>agPopupSelectCellEditor</code>: Same as 'select' but as popup.</li>
    <li><code>agRichSelectCellEditor (ag-Grid Enterprise only)</code>: A rich select popup that uses row virtualisation
</ul>

<h3><code>agTextCellEditor</code> / <code>agPopupTextCellEditor</code></h3>

<p>
    Simple text editors that use the standard HTML <code>input</code> tag. <code>agTextCellEditor</code> is the default
    used if you do not explicitly set a cell editor.
</p>
<p>
    The only parameter for text cell editors is <code>useFormatter</code>. If set to <code>true</code>, the
    grid will use the provided <code>colDef.cellFormatter</code> (if one is present).
</p>

<h3><code>agLargeTextCellEditor</code></h3>

<p>
    Simple editor that uses the standard HTML <code>textarea</code> tag.
</p>

<p>
    The <code>agLargeTextCellEditor</code> takes the following parameters:

    <ul>
        <li>
            <code>maxLength</code>: Max number of characters to allow. Default is 200.
        </li>
        <li>
            <code>rows</code>: Number of character rows to display. Default is 10.
        </li>
        <li>
            <code>cols</code>: Number of character columns to display. Default is 60.
        </li>
    </ul>
</p>

<h3><code>agSelectCellEditor</code> / <code>agPopupSelectCellEditor</code></h3>

<p>
    Simple editors that use the standard HTML <code>select</code> tag.
</p>

<p>
    The only parameter for text cell editors is <code>values</code>. Use this to provide a list of
    values to the cell editor.
</p>

<snippet>
colDef.cellEditor = 'agSelectCellEditor';
colDef.cellEditorParams = {
    values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
}
</snippet>

<note>
    <p>
        We have found the standard HTML Select doesn't have an API that's rich enough to play 
        properly with the grid. When a cell is double clicked to start editing, it is desired that 
        the Select is a) shown and b) opened ready for selection. There is no API to open a browsers 
        Select. For this reason to edit there are two interactions needed 1) double click to start 
        editing and 2) single click to open the Select.
    </p>
    <p>
        We also observed different results while using keyboard navigation to control editing, e.g.
        while using Enter to start editing. Some browsers would open the Select, others would not.
        This is down to the browser implementation and given there is no API for opening the
        Select, there is nothing the grid can do.
    </p>
    <p>
        If you are unhappy with the additional click required, we advise you don't depend on the 
        browsers standard Select (ie avoid <code>agSelectCellEditor</code> and 
        <code>agPopupSelectCellEditor</code>) and instead use <code>agRichSelectCellEditor</code> or 
        create your own using a <a href="../javascript-grid-cell-editor/">Cell Editor Component</a>.
    </p>
</note>

<h3><code>agRichSelectCellEditor</code></h3>

<p>
    Available in ag-Grid Enterprise only. An alternative to using the browser's <code>select</code> popup for dropdowns
    inside the grid.
</p>

<p>
    The <code>agRichSelectCellEditor</code> has the following benefits over the browser's <code>select</code> popup:
<ul>
    <li>Uses DOM row visualisation so very large lists can be displayed.</li>
    <li>Integrates with the grid perfectly, avoiding glitches seen with the standard select.</li>
    <li>Uses HTML to render the values: you can provide cell renderers to customise what each value looks like.</li>
</ul>
</p>

<p>
    The <code>agRichSelectCellEditor</code> takes the following parameters:

    <ul>
        <li>
            <code>values</code>: List of values to be selected from.
        </li>
        <li>
            <code>cellHeight</code>: The row height, in pixels, of each value.
        </li>
        <li>
            <code>formatValue</code>: A callback function that allows you to change the displayed value for simple data.
        </li>
        <li>
            <code>cellRenderer</code>: The cell renderer to use to render each value. Cell renderers are useful for rendering rich
            HTML values, or when processing complex data.
            See <a href="../javascript-grid-cell-rendering-components/">Cell Rendering Components</a>
            for creating custom cell renderers.
        </li>
    </ul>
</p>

<?php /*

<h3><code>agDateTimeCellEditor</code></h3>

<p>
    Available in ag-Grid Enterprise only. A highly configurable editor for date and time values.
</p>

<?= grid_example('agDateTimeCellEditor', 'date-time-cell-editor', 'generated', ['enterprise' => true]) ?>

*/ ?>

<?php include '../documentation-main/documentation_footer.php';?>

