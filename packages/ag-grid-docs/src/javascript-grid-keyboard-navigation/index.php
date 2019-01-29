<?php
$pageTitle = "Keyboard Interaction: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Keyboard Interaction. With Keyboard Navigation users can use cursor keys and tab keys to navigate between cells. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Keyboard Interaction";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="keyboard-navigation">Keyboard Interaction</h1>

    <p class="lead">
        The grid responds to keyboard interactions from the user as well as emitting events when
        key presses happen on the grid cells. Below shows all the keyboards interactions that can
        be done wiht the grid.
    </p>

    <h2>Navigation</h2>

    <p>
        Use the <b>arrow keys</b> to move focus to the selection up, down, left and right. If the selected cell is
        already on the boundary for that position (eg if on the first column and the left key is pressed)
        then the key press has no effect. User <b>ctrl + left and right</b> to move to start and end of the
        line.
    </p>

    <p>
        Use <b>page up</b> and <b>page down</b> to move the scroll up and down by one page.
        Use <b>home</b> and <b>end</b> to go to the first and last rows.
    </p>

    <p>
        If using grouping and <code>groupUseEntireRow=true</code>, then the group row is not focusable. When
        navigating, the grouping row is skipped.
    </p>

    <h2>Groups</h2>

    <p>
        If on a group element, hitting the <b>enter key</b> will expand or collapse the group. This only works
        when displaying groups in a column (<code>groupUseEntireRow=false</code>), as otherwise the group cell
        is not selectable.
    </p>

    <h2>Editing</h2>

    <p>
        Pressing the <b>enter key</b> on a cell will put the cell into edit mode, if editing is allowed on the cell.
        This will work for the default cell editor.
    </p>

    <h2>Selection</h2>

    <p>
        Pressing the <b>space key</b> on a cell will select the cells row, or deselect the row if already selected.
        If multi-select is enabled, then the selection will not remove any previous selections.
    </p>

    <h2>Suppress Cell Selection</h2>

    <p>
        If you want keyboard navigation turned off, then set <code>suppressCellSelection=true</code> in the <code>gridOptions</code>.
    </p>

    <h2>Example</h2>

    <p>
        All the items above (navigation, editing, groups, selection) are observable in the test drive.
        As such, a separate example is not provided here.
    </p>

    <h2>Custom Navigation</h2>

    <p>
        Most people will be happy with the default navigation the grid does when you use the arrow keys
        and the tab key. Some people will want to override this - for example maybe you want the tab key
        to navigate to the cell below, not the cell to the right. To facilitate this, the grid offers
        two methods: <code>navigateToNextCell</code> and <code>tabToNextCell</code>.
    </p>

    <h2><code>navigateToNextCell</code></h2>

    <p>
        Provide a callback <code>navigateToNextCell</code> if you want to override the arrow key navigation. The
        function signature is as follows:
    </p>

    <snippet>
interface NavigateToNextCellParams {

    // the keycode for the arrow key pressed, left = 37, up = 38, right = 39, down = 40
    key: number;

    // the cell that currently has focus
    previousCellDef: GridCellDef;

    // the cell the grid would normally pick as the next cell for this navigation
    nextCellDef: GridCellDef;
}</snippet>

    <h2><code>tabToNextCell</code></h2>

    <p>
        Provide a callback <code>tabToNextCell</code> if you want to override the tab key navigation. The
        parameter object is as follows:
    </p>

    <snippet>
interface TabToNextCellParams {

    // true if the shift key is also down
    backwards: boolean;

    // true if the current cell is editing (you may want to skip cells that are not editable,
    // as the grid will enter the next cell in editing mode also if tabbing)
    editing: boolean;

    // the cell that currently has focus
    previousCellDef: GridCellDef;

    // the cell the grid would normally pick as the next cell for this navigation
    nextCellDef: GridCellDef;
}</snippet>

    <h2><code>GridCellDef</code></h2>

    <p>
        Both functions above use GridCellDef. This is an object that represents a cell in the grid. Its
        interface is as follows:
    </p>

    <snippet>
interface GridCellDef {

    // either 'top', 'bottom' or undefined/null (for not floating)
    floating: string;

    // a positive number from 0 to n, where n is the last row the grid is rendering
    rowIndex: number;

    // the grid column
    column: Column;
}</snippet>

    <p>
        The functions take a GridCellDef for current and next cells, as well as returning a GridCellDef object.
        The returned GridCellDef will be the one the grid puts focus on next. Return the provided <code>nextCellDef</code>
        to stick with the grid default behaviour. Return null/undefined to skip the navigation.
    </p>

    <h2>Example Custom Navigation</h2>

    <p>
        The example below shows both <code>navigateToNextCell</code> and <code>tabToNextCell</code> in practice.
        <code>navigateToNextCell</code> swaps the up and down arrow keys. <code>tabToNextCell</code> uses tabbing
        to go up and down rather than right and left.
    </p>

    <?= example('Custom Keyboard Navigation', 'custom-keyboard-navigation', 'generated', array('processVue' => true)) ?>


    <h2>Tabbing into the Grid</h2>

    <p>
        In applications where the grid is embedded into a larger page it may be useful to tab into grid from another
        element or user action such as a button click.
    </p>

    <p>
        This can be achieved by using a combination of DOM event listeners and Grid API calls shown in the following code
        snippet:
    </p>

    <snippet>
// obtain reference to input element
var myInput = document.getElementById("my-input");

// intercept key strokes within input element
myInput.addEventListener("keydown", function (event) {
    // code for tab key
    var tabKeyCode = 9;

    // ignore non tab key strokes
    if(event.keyCode !== tabKeyCode) return;

    // prevents tabbing into the url section
    event.preventDefault();

    // scrolls to the first row
    gridOptions.api.ensureIndexVisible(0);

    // scrolls to the first column
    var firstCol = gridOptions.columnApi.getAllDisplayedColumns()[0];
    gridOptions.api.ensureColumnVisible(firstCol);

    // sets focus into the first grid cell
    gridOptions.api.setFocusedCell(0, firstCol);

}, true);
</snippet>

    <h3>Example - Tabbing into the Grid</h3>

    <p>
        In the following example there is an input box provided to test tabbing into the grid. Notice the following:
    </p>
        <ul class="content">
            <li>
                Tabbing out of the input box will gain focus on the first grid cell.
            </li>
            <li>
                When the first cell is out of view due to either scrolling down (rows) or across (columns), tabbing out
                of the input will cause the grid to navigate to the first cell.
            </li>
        </ul>


    <?= example('Tabbing into the Grid', 'tabbing-into-grid', 'vanilla') ?>

    <h2>Keyboard Events</h2>

    <p>
        It is possible to add custom behaviour to any key event that you want using the grid
        events <code>cellKeyPress</code> (gets called when a DOM keyPress event fires on a cell)
        and <code>cellKeyDown</code> (gets called when a DOM keyDown event fires on a cell).
    </p>

    <p>
        The grid events wrap the DOM events and provides additional information such as row
        and column details.
    </p>

    <p>
        The example below shows processing grid cell keyboard events. The following can be noted:
        <ul>
            <li>
                Each time a <code>cellKeyPress</code> or <code>cellKeyDown</code> is fired, the
                details of the event are logged to the console.
            </li>
            <li>
                When the user hits 's' on a row, the row selection is toggled. This is achieved
                through the <code>cellKeyPress</code> listener.
            </li>
        </ul>
    </p>

    <?= example('Keyboard Events', 'keyboard-events', 'generated', array('processVue' => true)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
