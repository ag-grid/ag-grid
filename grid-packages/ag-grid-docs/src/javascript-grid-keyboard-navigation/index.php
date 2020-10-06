<?php
$pageTitle = "Keyboard Interaction: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Keyboard Interaction. With Keyboard Navigation users can use cursor keys and tab keys to navigate between cells. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Keyboard Interaction";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="keyboard-navigation">Keyboard Interaction</h1>

    <p class="lead">
        The grid responds to keyboard interactions from the user as well as emitting events when
        key presses happen on the grid cells. Below shows all the keyboards interactions that can
        be done with the grid.
    </p>

    <h2>Navigation</h2>

    <p>
        Use the <b>arrow keys</b> to move focus up, down, left and right. If the focused cell is
        already on the boundary for that position (eg if on the first column and the left key is pressed)
        then the key press has no effect. Use <b>ctrl + left and right</b> to move to start and end of the
        line.
    </p>

    <p>
        If a cell on the first grid row is focused and you you press <code>arrow up</code>, the focus will be moved into
        the grid header.
        The header navigation focus navigation works the same as the grid's, arrows will move up/down/left/right, tab will
        move the focus horizontally until the last header cell and the move on to the next row.
    </p>

    <p>
        Use <b>page up</b> and <b>page down</b> to move the scroll up and down by one page.
        Use <b>home</b> and <b>end</b> to go to the first and last rows.
    </p>

    <note>
        When a header cell is focused, commands like <strong>page up</strong>, <strong>page down</strong>,
        <strong>home</strong>, <strong>end</strong>, <strong>ctrl + left / right</strong> will not work as they
        do when a grid cell is focused.
    </note>

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

    <h2>Header Navigation</h2>

    <p>
        The grid header is supports full keyboard navigation, however, the behaviour my differ based on the type
        of header is currently focused.
    </p>

    <h3>Grouped Headers</h3>

    <p>
        While navigating grouped headers, if the current grouped header is expandable, pressing <code>ENTER</code>
        will toggle the expanded state of the group
    </p>

    <h3>Normal Headers</h3>

    <p>
        Regular header may have selection checkboxes, sorting functions and menus, so to access all these functions
        while focusing a header, you can do the following:
        <ul>
            <li>
                Press <code>SPACE</code> to toggle the header checkbox selection.
            </li>
            <li>
                Press <code>ENTER</code> to toggle the sorting state of that column.
            </li>
            <li>
                Press <code>Shift + ENTER</code> to toggle multi-sort for that column.
            </li>
            <li>
                Press <code>Ctrl/Cmd + ENTER</code> to open the menu for the focused header.
            </li>
            <li>
                When a menu is open, simply press <code>ESCAPE</code> to close it and the focus will
                return to the header.
            </li>
        </ul>

    <h3>Floating Filters</h3>

    <p>
        While navigation the floating filters header with the keyboard pressing left/right the focus will move
        from header cell to header cell, if you wish to navigate within the cell, press <code>ENTER</code> to focus
        the first enabled element within the current floating filter cell, and press <code>ESCAPE</code> to return
        the focus to the floating filter cell.
    </p>

    <h2>Example</h2>

    <p>
        The example below has grouped headers, headers and floating filters to demonstrate the features mentioned above:
    </p>

    <?= grid_example('Keyboard Navigation', 'grid-keyboard-navigation', 'generated', ['enterprise' => true]) ?>

    <h2>Custom Navigation</h2>

    <p>
        Most people will be happy with the default navigation the grid does when you use the arrow keys
        and the tab key. Some people will want to override this (ie. you may want the tab key to navigate to the cell 
        below, not the cell to the right). To facilitate this, the grid offers four methods: <code>navigateToNextCell</code>, 
        <code>tabToNextCell</code>, <code>navigateToNextHeader</code> and <code>tabToNextHeader</code>.
    </p>

    <h3>navigateToNextCell</h3>

    <p>
        Provide a callback <code>navigateToNextCell</code> if you want to override the arrow key navigation. The
        parameter object is as follows:
    </p>

<snippet>
interface NavigateToNextCellParams {

    // the keycode for the arrow key pressed, left = 37, up = 38, right = 39, down = 40
    key: number;

    // the cell that currently has focus
    previousCellPosition: CellPosition;

    // the cell the grid would normally pick as the next cell for this navigation
    nextCellPosition: CellPosition;

    event: KeyboardEvent;
}</snippet>

    <h3>tabToNextCell</h3>

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
    previousCellPosition: CellPosition;

    // the cell the grid would normally pick as the next cell for this navigation
    nextCellPosition: CellPosition;
}</snippet>

    <h3>CellPosition</h3>

    <p>
        Both functions above use CellPosition. This is an object that represents a cell in the grid. Its
        interface is as follows:
    </p>

<snippet>
interface CellPosition {

    // either 'top', 'bottom' or undefined/null (for not pinned)
    rowPinned: string;

    // a positive number from 0 to n, where n is the last row the grid is rendering
    // or -1 if you want to navigate to the grid header
    rowIndex: number;

    // the grid column
    column: Column;
}</snippet>

    <p>
        The functions take a CellPosition for current and next cells, as well as returning a CellPosition object.
        The returned CellPosition will be the one the grid puts focus on next. Return the provided <code>nextCellPosition</code>
        to stick with the grid default behaviour. Return null/undefined to skip the navigation.
    </p>

    <h3>navigateToNextHeader</h3>

    <p>
        Provide a callback <code>navigateToNextHeader</code> if you want to override the arrow key navigation. The
        parameter object is as follows:
    </p>

<snippet>
interface NavigateToNextHeaderParams {

    // the key for the arrow key pressed, left = 'ArrowLeft', up = 'ArrowUp', right = 'ArrowRight', down = 'ArrowDown'
    key: string;

    // the header that currently has focus
    previousHeaderPosition: HeaderPosition;

    // the header the grid would normally pick as the next header for this navigation
    nextHeaderPosition: HeaderPosition;

    // the number of header rows present in the grid
    headerRowCount: number;

    event: KeyboardEvent;
}</snippet>

    <h3>tabToNextHeader</h3>

    <p>
        Provide a callback <code>tabToNextHeader</code> if you want to override the tab key navigation. The
        parameter object is as follows:
    </p>

<snippet>
interface TabToNextHeaderParams {

    // true if the shift key is also down
    backwards: boolean;

    // the header that currently has focus
    previousHeaderPosition: HeaderPosition;

    // the header the grid would normally pick as the next header for this navigation
    nextHeaderPosition: HeaderPosition;

    // the number of header rows present in the grid
    headerRowCount: number;
}</snippet>

    <h3>HeaderPosition</h3>

    <p>
        Both <code>navigateToNextHeader</code> and <code>tabToNextHeader</code> use HeaderPosition. This is an object that 
        represents a header in the grid. Its interface is as follows:
    </p>

<snippet>
interface HeaderPosition {

    // a number from 0 to n, where n is the last header row the grid is rendering
    headerRowIndex: number;

    // the grid column or column group
    column: Column | ColumnGroup;

}</snippet>

    <p>
        You should return the <code>HeaderPosition</code> you want in the <code>navigateToNextHeader</code> and <code>tabToNextHeader</code> functions
        to have it focused. Returning <code>null</code> or <code>undefined</code> in <code>navigateToNextHeader</code> will do nothing (same as focusing 
        the current focused cell), however, doing the same thing in <code>tabToNextHeader</code> will allow the browser default behavior for tab to happen.
        This is useful for tabbing outside of the grid from the last cell or <code>shift</code> tabbing out of the grid from the first cell.
    </p>

    <note>
        The <code>navigateToNextCell</code> and <code>tabToNextCell</code> are only called while navigating across grid cells, while
        <code>navigateToNextHeader</code> and <code>tabToNextHeader</code> are only called while navigating across grid headers.
        If you need to navigate from one container to another, pass <strong>rowIndex: -1</strong> in <code>CellPosition</code> 
        or <strong>headerRowIndex: -1</strong> in <code>HeaderPosition</code>.
    </note>

    <h2>Example Custom Cell Navigation</h2>

    <p>
        The example below shows how to use <code>navigateToNextCell</code>, <code>tabToNextCell</code>, 
        <code>navigateToNextHeader</code> and <code>tabToNextHeader</code> in practice.

    </p>

    <p>
        Note the following: 
        <ul>
            <li><code>navigateToNextCell</code> swaps the up and down arrow keys.</li>
            <li><code>tabToNextCell</code> uses tabbing to go up and down rather than right and left.</li>
            <li><code>navigateToNextHeader</code> swaps the up and down arrow keys.</li>
            <li><code>tabToNextHeader</code> uses tabbing to go up and down rather than right and left.</li>
            <li>
                When a cell in the first grid row is focused, pressing the down arrow will navigate to 
                the header by passing <strong>rowIndex: -1</strong>.
            </li>
            <li>
                When a header cell in the last header row is focused, pressing the up arrow will navigate 
                to the first grid row by passing <strong>headerRowIndex: -1</strong>.
            </li>
            <li>
                Tabbing/Shift tabbing will move the focus until the first header or the last grid row, but 
                focus will not leave the grid.
            </li>
            
        </ul>
    </p>

    <?= grid_example('Custom Keyboard Navigation', 'custom-keyboard-navigation', 'generated') ?>


    <h2>Tabbing into the Grid</h2>

    <p>
        In applications where the grid is embedded into a larger page, by default, when tabbing into the grid,
        the first column header will be focused.
    </p>

    <p>
        You could override this behavior to focus the first grid cell, if that is a preferred scenario using a combination
        of DOM event listeners and Grid API calls shown in the following code snippet:
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

    <h3>Example: Tabbing into the Grid</h3>

    <p>
        In the following example there is an input box provided to test tabbing into the grid. Notice the following:
    </p>

        <ul class="content">
            <li>
                Tabbing out of the first input box will gain focus on the first grid cell.
            </li>
            <li>
                When the first cell is out of view due to either scrolling down (rows) or across (columns), tabbing out
                of the first input will cause the grid to navigate to the first cell.
            </li>
            <li>
                Tabbing out of the second input box will have the default behavior which is to focus the first grid header.
            </li>
            <li>
                When the first header is out of view due to horizontal scroll, tabbing into the grid will cause the grid
                to scroll to focus the first header.
            </li>
            <li>
                Shift-Tabbing out third input (below the grid) will have the default focus behavior, which is to focus
                the last element of the grid. This element will vary depending on how many features have been enabled
                (eg. Row Pagination, Tool Panels, etc...).
            </li>
        </ul>


    <?= grid_example('Tabbing into the Grid', 'tabbing-into-grid', 'vanilla') ?>

    <h2>Keyboard Events</h2>

    <p>
        It is possible to add custom behaviour to any key event that you want using the grid
        events <code>cellKeyPress</code> (gets called when a DOM keyPress event fires on a cell)
        and <code>cellKeyDown</code> (gets called when a DOM keyDown event fires on a cell).
    </p>

    <note>
        These keyboard events are monitored by the grid panel, so they will not be fired 
        when the keydown or keypress happen inside of a popup editor, as popup elements are
        rendered in a different DOM tree.
    </note>

    <p>
        The grid events wrap the DOM events and provides additional information such as row
        and column details.
    </p>

    <p>
        The example below shows processing grid cell keyboard events. The following can be noted:
    </p>

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

    <?= grid_example('Keyboard Events', 'keyboard-events', 'generated', ['enterprise' => true]) ?>

    <h2 id="suppressKeyboardEvents">Suppress Keyboard Events</h2>

    <p>
        It is possible to stop the grid acting on particular events. To do this implement <code>suppressHeaderKeyboardEvent</code> 
        and/or <code>suppressKeyboardEvent</code> callback. The callback should return true if the grid should suppress 
        the events, or false to continue as normal.
    </p>

    <h3>suppressHeaderKeyboardEvent</h3>

    <p>
        The callback has the following signature:
    </p>

<?= createSnippet(<<<SNIPPET
function suppressHeaderKeyboardEvent(params: SuppressHeaderKeyboardEventParams) => boolean;

interface SuppressKeyboardEventParams {
    api: GridApi; // grid API
    columnApi: ColumnApi; // column API
    context: any; // context object
    event: KeyboardEvent; // the keyboard event the grid received. inspect this to see what key was pressed
    headerRowIndex: number; // the index of the header row of the current focused header
    column: Column | ColumnGroup; // the current Column or Column Group
    colDef: ColDef | ColGroupDef; // Column Definition or Column Group Definition
}
SNIPPET
, 'ts') ?>


    <h3>suppressKeyboardEvent</h3>

    <p>
        The callback has the following signature:
    </p>

<?= createSnippet(<<<SNIPPET
function suppressKeyboardEvent(params: SuppressKeyboardEventParams) => boolean;

interface SuppressKeyboardEventParams {
// the keyboard event the grid received. inspect this to see what key was pressed
event: KeyboardEvent;

// whether the cell is editing or not. sometimes you might want to suppress event
// only when cell is editing.
editing: boolean;

node: RowNode; // row node
data: any; // row data
column: Column; // column
colDef: ColDef; // column definition
context: any; // context object
api: GridApi | null | undefined; // grid API
columnApi: ColumnApi | null | undefined; // column API
}
SNIPPET
, 'ts') ?>

    <p>
        The callback is available as a <a href="../javascript-grid-column-properties/">column callback</a>
        (set on the column definition). If you provide the callback on both
        the grid and column definition, then if either return 'true' the event
        will be suppressed.
    </p>

    <h3>Example: Suppress Keyboard Navigation</h3>

    <p>
        The example below demonstrates suppressing the following keyboard events:
    </p>

    <ul>
        <li>On the Athlete column cells only:
            <ul>
                <li><kbd>Enter</kbd> will not start or stop editing.</li>
            </ul>
        </li>
        <li>
            On the Country column cells only:
            <ul>
                <li><kbd>&uarr;</kbd> <kbd>&darr;</kbd> arrow keys are allowed. This is the only column that allows navigation from the grid to the header.</li>
            </ul>
        </li>
        <li>On all cells (including the cells of the Athlete Column):
            <ul>
                <li><kbd>Ctrl & A</kbd> will not select all cells into a range.</li>
                <li><kbd>Ctrl & C</kbd> will not copy to clipboard.</li>
                <li><kbd>Ctrl & V</kbd> will not paste from clipboard.</li>
                <li><kbd>Ctrl & D</kbd> will not copy range down.</li>
                <li><kbd>Page Up</kbd> and <kbd>Page Down</kbd> will not get handled by the grid.</li>
                <li><kbd>Home</kbd> will not focus top left cell.</li>
                <li><kbd>End</kbd> will not focus bottom right cell.</li>
                <li><kbd>&larr;</kbd> <kbd>&uarr;</kbd> <kbd>&rarr;</kbd> <kbd>&darr;</kbd> Arrow keys will not navigate focused cell.</li>
                <li><kbd>F2</kbd> will not start editing.</li>
                <li><kbd>Delete</kbd> will not start editing.</li>
                <li><kbd>Backspace</kbd> will not start editing.</li>
                <li><kbd>Escape</kbd> will not cancel editing.</li>
                <li><kbd>Space</kbd> will not select current row.</li>
                <li><kbd>Tab</kbd> will not be handled by the grid.</li>
            </ul>
        </li>
        <li>
            On the Country header only:
            <ul>
                <li>
                    Navigation is blocked from the left to right using arrows but is allowed using tab.
                </li>
                <li>
                    Navigation up and down is allowed. This is the only header that allows navigation from the header to the grid cells.
                </li>
            </ul>
        </li>
        <li>
            On all headers (excluding country):
            <ul>
                <li>Navigation is blocked up and down, but navigation left / right is allowed using arrows and tab.
            </ul>
        </li>
    </ul>

    <?= grid_example('Suppress Keys', 'suppress-keys', 'generated', ['enterprise' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
