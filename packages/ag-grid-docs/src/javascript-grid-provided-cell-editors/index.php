<?php
$pageTitle = "ag-Grid Provided Cell Renderers";
$pageDescription = "The grid provides cell renderers out of the box. Here we explain what they are.";
$pageKeyboards = "JavaScript grid provided cell renderers";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

    <h1>Provided Cell Editors</h1>

    <p class="lead">
        The grid comes with some provided cell editors out of the box. These cell editors
        are listed here.
    </p>

    <p>
        The provided cell editors are as follows:
    </p>

    <ul class="content">
        <li><code>agTextCellEditor</code>: Simple text editor that uses standard HTML Input. This is the default.</li>
        <li><code>agPopupTextCellEditor</code>: Same as 'text' but as popup.</li>
        <li><code>agLargeTextCellEditor</code>: A text popup that for inputting larger, multi-line text.</li>
        <li><code>agSelectCellEditor</code>: Simple editor that uses standard HTML Select.</li>
        <li><code>agPopupSelectCellEditor</code>: Same as 'select' but as popup.</li>
        <li><code>agRichSelectCellEditor (ag-Grid-Enterprise only)</code>: - A rich select popup that uses row virtualisation
    </ul>

    <h3><code>agTextCellEditor</code> / <code>agPopupTextCellEditor</code></h3>

    <p>
        Simple text editors that use the standard HTML 'input' tag. <code>agTextCellEditor</code> is the default
        used if you do not explicitly set a cell editor.
    </p>
    <p>
        The only parameter for text cell editors is <code>useFormatter</code>. If set to true then the
        grid will use the provided colDef.cellFormatter if one is provided.
    </p>

    <h3><code>agLargeTextCellEditor</code></h3>

    <p>
        Simple editor that uses the standard HTML 'textarea' tag.
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
        Simple editors that use standard HTML 'select' tag.
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
        We have found the standard HTML <code>select</code> to behave odd when in the grid. This is because the browser
        doesn't have a great API for opening and closing the select's popup. We advise you don't use
        it unless you have to - that is we advise against <code>agSelectCellEditor</code> and <code>agPopupSelectCellEditor</code> as
        they give poor user experience, especially if using keyboard navigation. If using ag-Grid Enterprise,
        then you should use the provided <code>agRichSelectCellEditor</code>.
    </note>

    <h3><code>agRichSelectCellEditor</code></h3>

    <p>
        Available in ag-Grid Enterprise only. An alternative to using the browsers 'select' tag for drop downs
        inside the grid.
    </p>

    <p>
        The <code>agRichSelectCellEditor</code> has the following benefits of the browsers 'select' tag:
    <ul>
        <li>Uses DOM row visualisation so very large lists can be displayed.</li>
        <li>Integrates with the grid perfectly, no glitches as seen with the standard select.</li>
        <li>Uses HTML to render the values - you can provide cell renderers to cusomise what each value looks like.</li>
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
            <code>cellRenderer</code>: The cell renderer to use to draw each value. Cell renderers are useful to rendering rich
            html values, or when processing complex data.
            See <a href="../javascript-grid-cell-rendering-components/">Cell Rendering Components</a>
            for creating custom cell renderers.
        </li>
    </ul>
    </p>


<?php include '../documentation-main/documentation_footer.php';?>

