<?php
$key = "Cell Editing";
$pageTitle = "ag-Grid Cell Editing";
$pageDescription = "You can integrate your own editors into ag-Grid that will bind into the grids navigation.";
$pageKeyboards = "ag-Grid Cell Editors";
include '../documentation-main/documentation_header.php';
?>

    <h2 id="cell-editing">Cell Editing</h2>

    <p>
        cellRenderers and cellEditors, the former for showing the data, the latter for editing the data.
        If your application is for showing data only, such as a reporting application, then you will not
        need to use cellEditors. If you are editing your data like a spreadsheet, then cellEditors are
        going to be your best friend as you build your application using ag-Grid.
    </p>

    <p>
        Use cellEditors to provide editing functionality to your data through the grid that ties in
        with the grid navigation, refresh and general data management.
    </p>

    <p>
        You configure cellEditors as part of the column definition and can be one of the following:
    <ul>
        <li>component: The grid will call 'new' on the provided class and treat the object as a component, using
            lifecycle methods.</li>
        <li>string: The cellEditor is looked up from the provided cellEditors. Use this if you
            want to use a built in editor.</li>
    </ul>
    </p>

    <h3 id="default-editing">Default Editing</h3>

    <p>
        To get simple string editing, you do not need to provide an editor. The grid by default allows simple
        string editing on cells. The default editor is used if you have <i>colDef.editable=true</i> but do
        not provide a cellEditor.
    </p>

    <h3 id="start-editing">Start Editing</h3>

    <p>
        If you have <i>colDef.editable=true</i> set for a column then editing will start upon any of the following:
        Editing can start in the following ways:
        <ul>
        <li><b>Edit Key Pressed</b>: One of the following is pressed: Enter, F2, Backspace, Delete. If this
        happens then params.keyPress will contain the key code of the key that started the edit. The default editor
        will clear the contents of the cell if Backspace or Delete are pressed.</li>
        <li><b>Printable Key Pressed</b>: Any of the following characters are pressed:
            "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&*()_+-=[];\'#,./\|<>?:@~{}"<br/>
            If this happens then params.charPress will contain the character that started the edit. The default editor
            places this character into the edit field so that the user experience is they are typing into the cell.</li>
        <li><b>Mouse Double Click</b>: If the mouse is double clicked. There is a grid property <i>singleClickEdit</i>
            that will allow single click to start editing instead of double click. Another property <i>suppressClickEdit</i>
            will prevent both single click and double click from starting the edit - use this if you want to have
            your own way of starting editing only, such as clicking a button in your custom cellRenderer.</li>
        <li><b>api.startEditingCell()</b>: If you call startEditingCell() on the grid API</li>
    </ul>
    </p>

    <h3 id="stop-end-editing">Stop / End Editing</h3>

    <p>
        The grid will stop editing when any of the following happen:
        <ul>
        <li><b>Callback stopEditing</b>: The callback <i>stopEditing</i> (from the params above) gets called by the
            editor. This is how your cellEditor informs the grid to stop editing.</li>
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
        <li><b>gridApi.stopEditing()</b>: If you call stopEditing() on the grid API.</li>
    </ul>
    </p>

    <h3 id="popup-vs-in-cell">Popup vs In Cell</h3>

    <p>
        An editor can be in a popup or in cell.
    </p>

    <p><b>In Cell</b></p>

    <p>
        In Cell editing means the contents of the cell will be cleared and the editor will appear
        inside the cell. The editor will be constrained to the boundaries of the cell, if it is larger
        that the provided area it will be clipped. When editing is finished, the editor will be removed
        and the renderer will be placed back inside the cell again.
    </p>

    <p><b>Popup</b></p>

    <p>
        If you want your editor to appear in a popup (such as a dropdown list), then you can have it appear
        in a popup. The popup will behave like a menu in that any mouse interaction outside of the popup
        will close the popup. The popup will appear over the cell, however it will not change the contents
        of the cell. Behind the popup the cell will remain intact until after editing is finished which
        will result in the cell being refreshed.
    </p>

    <p>
        From a lifecycle and behaviour point of view, 'in cell' and 'popup' have no impact on the editor. So you
        can create a cellEditor and change this property and observe how your editor behaves in each way.
    </p>

    <p>
        To have an editor appear in a popup, have the <i>isPopup()</i> method return true. If you want editing
        to be done within a cell, either return false or don't provide this method at all.
    </p>

    <h3 id="tab-navigation">Tab Navigation</h3>

    <p>
        While editing, if you hit tab, the editing will stop on the current cell and start on the next cell.
        If you hold down shift+tab, the same will happen except the previous cell will start editing rather than
        the next. This is in line with editing data in Excel.
    </p>

    <p>
        The next and previous cells can also be navigated using the API functions <i>api.tabToNextCell()</i>
        and <i>api.tabToPreviousCell()</i>. Both of these methods will return true if the navigation was
        successful, otherwise false.
    </p>

    <h3 id="provided-celleditors">Provided cellEditors</h3>

    <p>
        The grid, out of the box, comes with the following editors:
        <ul>
        <li><b>text</b>: Simple text editor that uses standard HTML Input. This is the default.</li>
        <li><b>select</b>: Simple editor that uses standard HTML Select.</li>
        <li><b>popupText</b>: Same as 'text' but as popup.</li>
        <li><b>popupSelect</b>: Same as 'select' but as popup.</li>
        <li><b>largeText</b>: - A text popup that for inputting larger, multi-line text.</li>
        <li><b>richSelect (ag-Grid-Enterprise only)</b>: - A rich select popup that uses row virtualisation
    </ul>
    </p>

    <note>We have found the standard HTML 'select' to behave odd when in the grid. This is because the browser
    doesn't have a great API for opening and closing the select's popup. We advise you don't use
    it unless you have to - that is we advise against 'select' and 'popupSelect' as
    they give poor user experience, especially if using keyboard navigation. If using ag-Grid Enterprise, then you should use the provided
    richSelect.</note>

    <p>
        The default text cellEditor takes no parameters. The select cellEditor takes a list of values
        from which the user can select. The example below shows configuring the select cellEditor.
    </p>

    <pre>colDef.cellEditor = 'select';
colDef.cellEditorParams = {
    values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
}</pre>
<!--
    TAKING OUT as we want to reconsider how to register components

    <h3>Registering cellEditors</h3>

    <p>
        Like cellRenderers, cellEditors can also be registered with ag-Grid and referenced by
        strings. You register cellRenderers in one of the following ways:
    <ul>
        <li>Provide <i>cellEditors</i> property to the grid as a map of key=>cellEditor pairs.
            This property is used once during grid initialisation.</li>
        <li>Register the cellEditor by calling <i>gridApi.addCellEditor(key, cellEditor)</i>.
            This can be called at any time during the lifetime of the grid.</li>
    </ul>
    </p>-->

    <p>If you have many instances of a grid, you must register the cellEditors with each one.</p>

    <h4 id="callback-new-value-handlers">Callback: New Value Handlers</h4>

    <p>
        If you want to use the simple text editing, but want to format the result in some way
        before inserting into the row, then you can provide a <i>newValueHandler</i> to the column.
        This will allow you to add additional validation or conversation to the value. The example
        below shows the newValueHandler in action in the 'Upper Case Only' column.
    </p>

    <p>
        newValueHandler is provided a params object with attributes:<br/>
        <b>node: </b>The grid node in question.<br/>
        <b>data: </b>The row data in question.<br/>
        <b>oldValue: </b>If 'field' is in the column definition, contains the value in the data before the edit.<br/>
        <b>newValue: </b>The string value entered into the default editor.<br/>
        <b>rowIndex: </b>The index of the virtualised row.<br/>
        <b>colDef: </b>The column definition.<br/>
        <b>context: </b>The context as set in the gridOptions.<br/>
        <b>api: </b>A reference to the ag-Grid API.<br/>
    </p>

    <h4 id="event-cell-value-changed">Event: Cell Value Changed</h4>

    <p>
        After a cell has been changed with default editing (ie not your own custom cell renderer),
        then <i>cellValueChanged</i> event is fired. You can listen for this event in the normal
        way, or additionally you can add a <i>onCellValueChanged()</i> callback to the colDef.
        This is used if your application needs to do something after a value has been changed.
    </p>
    <p>
        The <i>cellValueChanged</i> event contains the same parameters as newValueHandler with one difference,
        the <i>newValue</i>. If 'field' is in the column definition, the newValue contains the value
        in the data after the edit. So for example, if the onCellValueChanged converts the provided
        string value into a number, then newValue for newValueHandler will have the string, and
        newValue for onCellValueChanged will have the number.
    </p>

    <h3 id="editing-api">Editing API</h3>

    <p>
        There are two api methods for editing, <code>startEditingCell()</code> and <code>stopEditing(params)</code>.
    </p>

    <p>
        <b>api.startEditingCell(params)</b><br/>
        Starts editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. Parameters are as follows:
        <ul>
        <li><b>rowIndex</b>: The row index of the row to start editing.</li>
        <li><b>colKey</b>: The column key of the column to start editing.</li>
        <li><b>keyPress, charPress</b>: The keyPress and charPress that are passed to the cellEditor</li>
    </ul>
    </p>

    <p>
        <b>api.stopEditing(cancel)</b><br/>
        If the grid is editing this will stop editing.
    </p>
    <p>
        Pass true to cancel editing, i.e. revert any changes.
    </p>

    <h3 id="start-stop-editing-events">Start / Stop Editing Events</h3>

    <p>
        The following events are fired as editing starts and stops:
        <ul>
        <li><b>cellEditingStarted: </b> editing has started on a cell.</li>
        <li><b>cellEditingStopped: </b> editing has stopped on a row.</li>
        <li><b>rowEditingStarted: </b> editing has started on a row. Only for full row editing.</li>
        <li><b>rowEditingStopped: </b> editing has stopped on a row. Only for full row editing.</li>
    </ul>
    </p>

    <h3 id="cell-editing-example">Cell Editing Example</h3>

    <p>
        The example below illustrates different parts of the editing API using the buttons at the top.
    </p>

    <show-example example="exampleCellEditing"></show-example>

    <h3 id="datepicker-cell-editing-example">Datepicker Cell Editing Example</h3>

    <p>The example below illustrates:
    <ul>
        <li>'Date' column uses a Component cell editor that allows you to pick a date using jQuery UI Datepicker.</li>
    </ul>

     <show-example example="exampleDatepicker"></show-example>

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
        <ul>
        <li><b>focusIn:</b> If your cellEditor has a focusIn method, it will get called when the
            user tabs into the cell. This should be used to put the focus on the particular item
            to be focused, eg the textfield within your cellEditor.</li>
        <li><b>focusOut:</b> If your cellEditor has a focusOut method, it will get called when the
            user tabs out of the cell. No intended use for this, is just there to compliment the
            focusIn method, maybe you will have a reason to use it.</li>
        <li><b>Events: </b> When a row stops editing, the <i>cellValueChanged</i> event gets called
            for each column and <i>rowValueChanged</i> gets called once for the row.</li>
    </ul>
    </p>

    <h4 id="full-row-edit-and-popup-editors">Full Row Edit and Popup Editors</h4>

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

    <h4 id="fullRowEditExample">Full Row Edit Example</h4>

    <p>
        The example below shows full row editing. In addition to standard full row editing,
        the following should also be noted:
        <ul>
            <li>
                The 'Price' column has a custom editor demonstrating how you should implement
                the <i>'focusIn'</i> method. Both <i>focusIn</i> and <i>focusOut</i> for this
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
                <i>cellValueChanged</i> and <i>rowValueChanged</i> events are logged to console.
            </li>
            <li>
                The CSS class <i>ag-row-editing</i> changes the background color to highlight
                the editing row.
            </li>
        </ul>
    </p>

    <show-example example="exampleFullRowEditing"></show-example>

    <h2 id="groupEditing">Group Editing</h2>

    <p>
        By default, the grid does not let you edit group rows. This is to cater for the scenario where groups
        are aggregations of the children (ie a group rows values could be the sum of the children, so editing
        the group doesn't make sense).
    </p>

    <p>
        In other scenarios, editing groups does make sense. For example if implementing a file explorer,
        editing a folder name or owner does make sense in isolation to the contained files. Thus to cater
        for this, you can enable editing of groups with the property <i>enableGroupEdit=true</i>.
    </p>

    <p>
        The example below shows using <i>enableGroupEdit=true</i> along with tree data to allow editing of group data.
    </p>

    <show-example example="exampleEditingGroups"></show-example>

    <h2 id="singleClickEditing">Single Click, Double Click, No Click Editing</h2>

    <h4 id="double-click-editing">
        Double Click Editing
    </h4>
    <p>
        The default is for the grid to enter editing when you double click on a cell.
    </p>
    <h4 id="single-click-editing">
        Single Click Editing
    </h4>
    <p>
        To change the default so that a single click starts editing, set the property <i>singleClickEdit=true</i>.
        This is useful when you want a cell to enter edit mode as soon as you click on it, similar to the experience
        you get when inside Excel.
    </p>
    <h4 id="no-click-editing">
        No Click Editing
    </h4>
    <p>
        To change the default so that neither single or double click starts editing, set the property
        <i>suppressClickEdit=true</i>. This is useful when you want to start the editing in another way,
        such as including a button in your cellRenderer.
    </p>

    <h3 id="single-click-and-no-click-example">Single Click and No Click Example</h3>

    <show-example example="exampleSingleClickEditing"></show-example>

    <h3>Stop Editing When Grid Looses Focus</h3>

    <p>
        By default, the grid will not stop editing the currently editing cell when the grid
        loses focus. This can be bad if, for example, you have a save button, and you need
        the grid to stop editing before you execute your save function (eg you want to make
        sure the edit is saved into the grids state).
    </p>
    <p>
        If you want the grid to stop editing when focus leaves, set the grid property
        <i>stopEditingWhenGridLosesFocus=true</i>.
    </p>
    <p>
        By default, the grid not stop editing if you focus outside. The default is
        good for custom popup cell editors as these can have the focus leave the grid
        (eg if using a popup calendar widget). This would be bad as the grid would stop
        editing as soon as your external popup appeared.
    </p>

    <show-example example="exampleStopEditWhenGridLosesFocus"></show-example>

    <note>Cell Editing can also be done via Cell Editor Components - please see <a href="../javascript-grid-cell-editor">
            Cell Editor Components</a> for more information.</note>


<?php include '../documentation-main/documentation_footer.php';?>
