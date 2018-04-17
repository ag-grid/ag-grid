<?php
$pageTitle = "Cell Editing: A Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Cell Editing. Users can update data with Cell Editing. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Cell Editors";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Cell Editing</h1>

    <p class="lead">
        Cell Renderer's are for displaying data and Cell Editors are for editing data.
        If your application is for showing data only, such as a reporting application, then you will not
        need to use cell editors. If you are editing your data like a spreadsheet, then you will
        need Cell Editors to do the editing.
    </p>

    <p>
        You configure cell editors as part of the column definition and can be one of the following:
    </p>

    <ul class="content">
        <li><code>undefined / null</code>: The grid uses the default text cell editor.</li>
        <li>
            <code>string</code>: The name of a cell renderer registered with the grid.
        </li>
        <li><code>Class</code>: Provide your own cell renderer component directly without registering.</li>
    </ul>

    <h2>Enabling editing in a column</h2>

    <p>
        The simplest way to enable editing is by providing <code>colDef.editable=true</code> by doing so all the cells
        in the column will be editable.
    </p>

    <p>
        It is possible to have only a few cells in a column editable, to do so, instead of <code>colDef.editable=true</code>,
        you can specify a callback that will get called for each cell displayed for that column. If you return true the
        cell will be editable. The params for the callback are:
</p>

    <table class="table reference">
    <tr>
        <th>node</th>
        <td>The RowNode of the row being rendered.</td>
    </tr>
    <tr>
        <th>column</th>
        <td>The column been rendered (in ag-Grid, each colDef is wrapped by a Column).</td>
    </tr>
    <tr>
        <th>colDef</th>
        <td>The colDef been rendered.</td>
    </tr>
    <tr>
        <th>context</th>
        <td>The context as set on the gridOptions.</td>
    </tr>
    <tr>
        <th>api</th>
        <td>A reference to the grid api.</td>
    </tr>
    <tr>
        <th>columnApi</th>
        <td>A reference to the column api.</td>
    </tr>

    </table>

    <h2>Default Editing</h2>

    <p>
        To get simple string editing, you do not need to provide an editor. The grid by default allows simple
        string editing on cells. The default editor is used if you do not provide a cell editor.
    </p>

    <h2>Start Editing</h2>

    <p>
        If you have <code>colDef.editable=true</code> set for a column then editing will start upon any of the following:
        Editing can start in the following ways:
    </p>

        <ul class="content">
        <li><b>Edit Key Pressed</b>: One of the following is pressed: Enter, F2, Backspace, Delete. If this
        happens then params.keyPress will contain the key code of the key that started the edit. The default editor
        will clear the contents of the cell if Backspace or Delete are pressed.</li>
        <li><b>Printable Key Pressed</b>: Any of the following characters are pressed:
            &quote;qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&amp;*()_+-=[];\'#,./\|<>?:@~{}&quote; <br/>
            If this happens then <code>params.charPress</code> will contain the character that started the edit. The default editor
            places this character into the edit field so that the user experience is they are typing into the cell.</li>
        <li><b>Mouse Double Click</b>: If the mouse is double clicked. There is a grid property <code>singleClickEdit</code>
            that will allow single click to start editing instead of double click. Another property <code>suppressClickEdit</code>
            will prevent both single click and double click from starting the edit - use this if you want to have
            your own way of starting editing only, such as clicking a button in your custom cell renderer.</li>
        <li><b>api.startEditingCell()</b>: If you call <code>startEditingCell()</code> on the grid API</li>
    </ul>
    <h2>Stop / End Editing</h2>

    <p>
        The grid will stop editing when any of the following happen:
    </p>

        <ul class="content">
        <li><b>Callback stopEditing</b>: The callback <code>stopEditing</code> (from the params above) gets called by the
            editor. This is how your cell editor informs the grid to stop editing.</li>
        <li><b>Other Cell Focus</b>: If focus in the grid goes to another cell, the editing will stop.</li>
        <li><b>Enter Key Down</b>: If the grid receives an 'Enter' key press event on the cell. If you do NOT
        want to stop editing when Enter is pressed, then listen for the event and stop propagation so the grid
        does not act on the event.</li>
        <li><b>Escape Key Down</b>: Similar to Enter, if Escape key is pressed, editing will stop. Unlike Enter,
        Escape action will not take the new value, it will discard changes.</li>
        <li><b>Tab Key Down</b>: Editing will stop, accepting changes, and editing will move to the next cell, or
            the previous cell if 'shift' is also pressed.</li>
        <li><b>Navigation Key Down</b>: Editing will stop, accepting changes, and editing will move to the next cell
            in the direction of the navigation key.</li>
        <li><b>Popup Editor Closed</b>: If using popup editor, the popup is configured to close if you click
            outside the editor. Closing the popup triggers the grid to stop editing.</li>
        <li><b>gridApi.stopEditing()</b>: If you call <code>stopEditing()</code> on the grid API.</li>
    </ul>
    <h2>Popup vs In Cell</h2>

    <p>
        An editor can be in a popup or in cell.
    </p>

    <h3>In Cell</h3>

    <p>
        In Cell editing means the contents of the cell will be cleared and the editor will appear
        inside the cell. The editor will be constrained to the boundaries of the cell, if it is larger
        that the provided area it will be clipped. When editing is finished, the editor will be removed
        and the renderer will be placed back inside the cell again.
    </p>

    <h3>Popup</h3>

    <p>
        If you want your editor to appear in a popup (such as a dropdown list), then you can have it appear
        in a popup. The popup will behave like a menu in that any mouse interaction outside of the popup
        will close the popup. The popup will appear over the cell, however it will not change the contents
        of the cell. Behind the popup the cell will remain intact until after editing is finished which
        will result in the cell being refreshed.
    </p>

    <p>
        From a lifecycle and behaviour point of view, 'in cell' and 'popup' have no impact on the editor. So you
        can create a cell editor and change this property and observe how your editor behaves in each way.
    </p>

    <p>
        To have an editor appear in a popup, have the <code>isPopup()</code> method return true. If you want editing
        to be done within a cell, either return false or don't provide this method at all.
    </p>

    <h2>Tab Navigation</h2>

    <p>
        While editing, if you hit tab, the editing will stop on the current cell and start on the next cell.
        If you hold down shift+tab, the same will happen except the previous cell will start editing rather than
        the next. This is in line with editing data in Excel.
    </p>

    <p>
        The next and previous cells can also be navigated using the API functions <code>api.tabToNextCell()</code>
        and <code>api.tabToPreviousCell()</code>. Both of these methods will return true if the navigation was
        successful, otherwise false.
    </p>

    <h2>Value Parser and Value Setter</h2>

    <p>
        <a href="../javascript-grid-value-setters/">Value setter and value parsers</a> are the inverse of a
        value getters and formatters. If you want to parse the data, or set the value into your data in
        ways other than just using the field, see the sections
        <a href="../javascript-grid-value-setters/">Value setter and value parsers</a>.
    </p>

    <h2>Event: Cell Value Changed</h2>

    <p>
        After a cell has been changed with default editing (ie not your own custom cell renderer),
        then <code>cellValueChanged</code> event is fired. You can listen for this event in the normal
        way, or additionally you can add a <code>onCellValueChanged()</code> callback to the colDef.
        This is used if your application needs to do something after a value has been changed.
    </p>
    <p>
        The <code>cellValueChanged</code> event contains the same parameters as <code>newValueHandler</code> with one difference,
        the <code>newValue</code>. If 'field' is in the column definition, the <code>newValue</code> contains the value
        in the data after the edit. So for example, if the <code>onCellValueChanged</code> converts the provided
        string value into a number, then <code>newValue</code> for <code>newValueHandler</code> will have the string, and
        <code>newValue</code> for <code>onCellValueChanged</code> will have the number.
    </p>

    <h2 id="editing-api">Editing API</h2>

    <p>
        The grid has the following API methods for editing:
        <ul>
            <li>
                <code>startEditingCell(params)</code>: Starts editing the provided cell. If another cell is editing,
                the editing will be stopped in that other cell. Parameters are as follows:
                <ul>
                    <li><b>rowIndex</b>: The row index of the row to start editing.</li>
                    <li><b>colKey</b>: The column key of the column to start editing.</li>
                    <li><b>rowPinned</b>: Set to 'top' or 'bottom' to started editing a pinned row.</li>
                    <li><b>keyPress, charPress</b>: The keyPress and charPress that are passed to the cell editor.</li>
                </ul>
            </li>
            <li>
                <code>stopEditing(cancel)</code>: If the grid is editing then editing is stopped. Passing
                <code>cancel=true</code> will keep the cells original value and passing <code>cancel=false</code>
                will take the latest value from the cell editor.
            </li>
            <li>
                <code>getEditingCells()</code>: If the grid is editing, returns back details of the editing cell(s).
                The result is an array of objects. If only one cell is editing (the default) then the array will have
                one entry. If multiple cells are editing (eg <a href="./#fullRowEdit">Full Row Edit</a>) then the
                array contains all editing cells.
            </li>
        </ul>
    </p>

    <p>
        Below is a code example of using the editing API methods.
    </p>

<snippet>
// start editing country cell on first row
api.startEditing({
    rowIndex: 0,
    colKey: 'country'
});

// stop editing
api.stopEditing();

// print details of editing cell
var cellDefs = gridOptions.api.getEditingCells();
cellDefs.forEach( function(cellDef) {
    console.log(cellDef.rowIndex);
    console.log(cellDef.column.getId());
    console.log(cellDef.floating);
});
</snippet>

    <h2>Start / Stop Editing Events</h2>

    <p>
        The following events are fired as editing starts and stops:
    </p>
    <ul class="content">
        <li><code>cellEditingStarted: </code> editing has started on a cell.</li>
        <li><code>cellEditingStopped: </code> editing has stopped on a row.</li>
        <li><code>rowEditingStarted: </code> editing has started on a row. Only for full row editing.</li>
        <li><code>rowEditingStopped: </code> editing has stopped on a row. Only for full row editing.</li>
    </ul>

    <h2>Cell Editing Example</h2>

    <p>
        The example below illustrates different parts of the editing API. Each button starts
        editing the 'Last Name' column of the first row with the following differences:
    </p>
        <ul class="content">
            <li>
                <code>edit()</code>: Normal editing start.
            </li>
            <li>
                <code>edit(Delete)</code>: Edit as if delete button was pressed (clears contents first).
            </li>
            <li>
                <code>edit('T')</code>: Edit as if 'T' was pressed (places 'T' into cell).
            </li>
            <li>
                <code>edit(top)</code>: Edits top pinned row.
            </li>
            <li>
                <code>edit(bottom)</code>: Edits bottom pinned row.
            </li>
        </ul>
        <p>The example then demonstrates the following buttons for edit navigation:</p>
        <ul class="content">
            <li>
                <code>stop()</code>: Stops editing.
            </li>
            <li>
                <code>next()</code>: Edits the next cell.
            </li>
            <li>
                <code>previous()</code>: Edits the previous cell.
            </li>
        </ul>
        <p>Finally the example demonstrates querying what cell is editing:</p>
        <ul class="content">
            <li>
                <code>which()</code>: If the grid is editing, prints to the console which cell is in edit mode.
            </li>
        </ul>

    <?= example('Cell Editing', 'cell-editing', 'generated', array("processVue" => true)) ?>

    <h2>Many Editors One Column</h2>

    <p>It is also possible to use different editors for different rows in the same column.
        Typically an application might check the rows contents and choose and editor accordingly.
        To configure this set <code>colDef.cellEditorSelector</code>
        to a function that returns the name of the component to be used as an editor
        and optionally the custom params to be passed into it<p>

    <p>The parameters that these functions will receive are:<p>
    <snippet>
interface DynamicComponentParams {
    data: any,
    node: RowNode,
    colDef: ColDef,
    column: Column,
    rowIndex: number,
    api: GridApi,
    columnApi: ColumnApi
}
    </snippet>

    <p>The following example illustrates how to use different editors and parameters in the same column. Note that:</p>

    <ul class="content">
        <li>The column 'Value' holds data of different types as shown in the column 'Type' (numbers/genders/moods).
        </li>
        <li><code>colDef.cellEditorSelector</code> is a function that returns the name of the component to use to edit based on the
            type of data for that row
        </li>
        <snippet>
cellEditorSelector:function (params){

    if (params.data.type === 'age') return {
        component: 'numericCellEditor'
    };

    if (params.data.type === 'gender') return {
        component: 'agRichSelect',
        params: {values: ['Male', 'Female']}
    };

    if (params.data.type === 'mood') return {
        component: 'agRichSelect'
    };

    return null;
}</snippet>
        <li>
            Edit a cell by double clicking to observe the different editors used.
        </li>
    </ul>

    <?= example('Dynamic Editor Component', 'dynamic-editor-component', 'vanilla', array("enterprise" => 1, "exampleHeight" => 250)) ?>


    <h2 id="provided-cell-editors">Provided Cell Editors</h2>

    <p>
        The grid, out of the box, comes with the following editors:
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
            <code>cellRenderer</code>: The cell renderer to use to draw each value.
            See <a href="../javascript-grid-cell-rendering-components/">Cell Rendering Components</a>
            for creating custom cell renderers.
        </li>
    </ul>
    </p>

    <h2 id="dynamic-parameters">Dynamic Parameters</h2>

    <p>
        Parameters for cell editors can be dynamic to allow different selections based on what cell is getting edited.
        For example you might have a 'City' column that has values based on the 'Country' column. To do this,
        provide a function that returns parameters for the property <code>cellEditorParams</code>
    </p>

<snippet>
cellEditorParams: function(params) {
    var selectedCountry = params.data.country;
    if (selectedCountry==='Ireland') {
        return {
            values: ['Dublin','Cork','Galway']
        };
    } else {
        return {
            values: ['New York','Los Angeles','Chicago','Houston']
        };
    }
}
</snippet>

    <h2 id="example-dynamic-parameters">Example Rich Cell Editor / Dynamic Parameters</h2>

    <p>
        Below shows an example with dynamic editor parameters. The following can be noted:
        <ul>
            <li>Column <b>Gender</b> uses a cell renderer for both the grid and the editor.</li>
            <li>Column <b>Country</b> allows country selection. If the selection doesn't match the city, the city cell is cleared.</li>
            <li>Column <b>City</b> uses dynamic parameters to display values for the selected country.</li>
            <li>Column <b>Address</b> uses the rich text area editor.</li>
        </ul>
    </p>

    <?= example('Dynamic Parameters', 'dynamic-parameters', 'generated', array("enterprise" => 1)) ?>


    <h2 id="enter-key-down">Enter Key Navigation</h2>

    <p>
        By default pressing <b>Enter</b> will start editing on a cell, or stop editing
        on an editing cell. It will not navigate to the cell below.
    </p>

    <p>
        To allow consistency with Excel the grid has the following properties:
        <ul>
            <li><code>enterMovesDown</code>: Set to true to have Enter key move focus to the cell
            below if not editing. The default is Enter key starts editing the currently focused cell.</li>
            <li><code>enterMovesDownAfterEdit:</code> Set to true to have Enter key move
                focus to the cell below after Enter is pressed while editing. The default
            is editing will stop and focus will remain on the editing cell.</li>
        </ul>
    </p>

    <p>
        The example below demonstrates the focus moving down when <b>Enter</b> is pressed.
    </p>

    <?= example('Enter Key Navigation', 'enter-key-navigation', 'generated', array("processVue" => true)) ?>

    <h2>Datepicker Cell Editing Example</h2>

    <p>The example below illustrates:
    <ul class="content">
        <li>'Date' column uses a Component cell editor that allows you to pick a date using jQuery UI Datepicker.</li>
    </ul>

    <?= example('Datepicker Cell Editing', 'datepicker-cell-editing', 'generated', array("processVue" => true, "enterprise" => 1, "extras" => array('jquery', 'jqueryui', 'bootstrap') )) ?>

    </p>

    <h2 id="fullRowEdit">Full Row Editing</h2>

    <p>
        Full row editing is for when you want all cells in the row to become editable at the same time.
        This gives the impression to the user that the record the row represents is getting edited.
    </p>
    <p>
        To enable full row editing, set the grid option <code>editType = 'fullRow'</code>.
    </p>
    <p>
        If using custom cell editors, the cell editors will work in the exact same way with the
        following additions:
        <ul class="content">
    <li><code>focusIn:</code> If your cell editor has a <code>focusIn()</code> method, it will get called when the
            user tabs into the cell. This should be used to put the focus on the particular item
            to be focused, eg the <code>textfield</code> within your cell editor.</li>
    <li><code>focusOut:</code> If your cell editor has a <code>focusOut()</code> method, it will get called when the
            user tabs out of the cell. No intended use for this, is just there to compliment the
            <code>focusIn()</code> method, maybe you will have a reason to use it.</li>
        <li><code>Events: </code> When a row stops editing, the <code>cellValueChanged</code> event gets called
            for each column and <code>rowValueChanged</code> gets called once for the row.</li>
    </ul>
    </p>

    <h3>Full Row Edit and Popup Editors</h3>

    <p>
        Full row editing is not compatible with popup editors. This is because a) the grid would look
        confusing to pop up an editor for each cell in the row at the same time and b) the complexity
        of navigation and popup is almost impossible to model - thus the grid and your application code
        would be to messy and very error prone. If you are using full row edit, then you are blocked
        from using popup editors.
    </p>

    <p>
        This does not mean that you cannot show a popup from your 'in cell' editor - you are free to
        do that - however the responsibility of showing and hiding the popup belongs with your editor.
        You may want to use the grids focus events to hide the popups when the user tabs or clicks out
        of the cell.
    </p>

    <h3>Full Row Edit Example</h3>

    <p>
        The example below shows full row editing. In addition to standard full row editing,
        the following should also be noted:
    </p>
        <ul class="content">
            <li>
                The 'Price' column has a custom editor demonstrating how you should implement
                the <code>focusIn()</code> method. Both <code>focusIn()</code> and <code>focusOut()</code> for this
                editor are logged to the console.
            </li>
            <li>
                The 'Suppress Navigable' column is not navigable using tab. In other words,
                when tabbing around the grid, you cannot tab onto this cel.
            </li>
            <li>
                The 'Not Editable' column is not editable, so when the row goes into edit mode,
                this column is not impacted. Also when editing, this column is not navigated to
                when tabbing.
            </li>
            <li>
                The button will start editing line two. It uses the api to start editing a cell,
                however the result is the whole row will become editable starting with the
                specified cell.
            </li>
            <li>
                <code>cellValueChanged</code> and <code>rowValueChanged</code> events are logged to console.
            </li>
            <li>
                The CSS class <code>ag-row-editing</code> changes the background color to highlight
                the editing row.
            </li>
        </ul>

    <?= example('Full Row Editing', 'full-row-editing', 'generated', array("processVue" => true, "enterprise" => 1)) ?>

    <h2 id="singleClickEditing">Single Click, Double Click, No Click Editing</h2>

    <h3>
        Double Click Editing
    </h3>
    <p>
        The default is for the grid to enter editing when you double click on a cell.
    </p>
    <h3>
        Single Click Editing
    </h3>
    <p>
        To change the default so that a single click starts editing, set the property <code>singleClickEdit=true</code>.
        This is useful when you want a cell to enter edit mode as soon as you click on it, similar to the experience
        you get when inside Excel.
    </p>
    <h3>
        No Click Editing
    </h3>
    <p>
        To change the default so that neither single or double click starts editing, set the property
        <code>suppressClickEdit=true</code>. This is useful when you want to start the editing in another way,
        such as including a button in your cell renderer.
    </p>

    <p> The grid below has <code>singleClickEdit=true</code> so that editing will start on a cell when you single click on it.  </p>

    <?= example('Single Click Editing', 'single-click-editing', 'generated', array("processVue" => true)) ?>

    <p>The grid below has <code>suppressClickEdit=true</code> so that clicking doesn't started editing. The grid configures a cellRenderer with a button to start editing.</p>

    <?= example('Single Click Editing', 'single-click-editing-renderer', 'generated', array("processVue" => true)) ?>

    <h3 id="losingFocusStopsEditing">Stop Editing When Grid Loses Focus</h3>

    <p>
        By default, the grid will not stop editing the currently editing cell when the grid
        loses focus. This can be bad if, for example, you have a save button, and you need
        the grid to stop editing before you execute your save function (eg you want to make
        sure the edit is saved into the grids state).
    </p>
    <p>
        If you want the grid to stop editing when focus leaves, set the grid property
        <code>stopEditingWhenGridLosesFocus=true</code>.
    </p>
    <p>
        By default, the grid not stop editing if you focus outside. The default is
        good for custom popup cell editors as these can have the focus leave the grid
        (eg if using a popup calendar widget). This would be bad as the grid would stop
        editing as soon as your external popup appeared.
    </p>

    <p>
        The example below shows the editing with <code>stopEditingWhenGridLosesFocus=true</code>.
        Notice the following:
    </p>

        <ul class="content">
            <li>
                Double click to start editing 'Age', then click outside the grid (on the 'Dummy Save'
                button, or the dummy text field) and the grid will stop editing.
            </li>
            <li>
                Double click to start editing 'Year', a custom popup editor appears, you can click
                anywhere on the popup editor, but once you click outside the editor, the popup closes.
            </li>
        </ul>
    <?= example('Stop Editing When Grid Loses Focus', 'stop-edit-when-grid-loses-focus', 'generated', array("processVue" => true)) ?>

    <note>Cell Editing can also be done via Cell Editor Components - please see <a href="../javascript-grid-cell-editor">
            Cell Editor Components</a> for more information.</note>


    <h2>Controlling keyboard while editing</h2>
    <p>
    While editing, the grid will listen to navigation events coming from the keyboard, this includes navigate to next cell,
    next row... If you want to avoid this events from being consumed by the grid you can do so by configuring
    <code>colDef.suppressKeyboardEvent</code>.
    </p>


    <p>
    The following example shows a simple example where each cell contains a number and the arrows are used to manipulate
    its value.

    Note how the arrows are used to increase or decrease the value of the cell while editing and they are not used for
    navigation
    </p>

    <snippet>
suppressKeyboardEvent: function(event){
    if (event.editing) return true;
}</snippet>

    <?= example('Controlling keyboard while editing', 'controlling-keyboard-while-editing', 'generated', array("processVue" => true)) ?>


<?php include '../documentation-main/documentation_footer.php';?>
