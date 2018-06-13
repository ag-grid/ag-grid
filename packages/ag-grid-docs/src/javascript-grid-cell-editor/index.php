<?php
$pageTitle = "ag-Grid Components: Cell Editors";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It supports the use of components, one of which is Cell Editors. Users can update data with Cell Editing. Use one of the provided cell editors or create your own to suit your business needs.";
$pageKeyboards = "ag-Grid Cell Editor Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Cell Editors</h1>

<p class="lead">
    Create your own cell editor by providing a cell editor component.
</p>

<p>
    The interface for the cell editor component is as follows:
</p>

<snippet>
interface ICellEditorComp {

    // gets called once after the editor is created
    init?(params: ICellEditorParams): void;

    // Gets called once after GUI is attached to DOM.
    // Useful if you want to focus or highlight a component
    // (this is not possible when the element is not attached)
    afterGuiAttached?(): void;

    // Return the DOM element of your editor, this is what the grid puts into the DOM
    getGui(): HTMLElement;

    // Should return the final value to the grid, the result of the editing
    getValue(): any;

    // Gets called once by grid after editing is finished
    // if your editor needs to do any cleanup, do it here
    destroy?(): void;

    // Gets called once after initialised.
    // If you return true, the editor will appear in a popup
    isPopup?(): boolean;

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart?(): boolean;

    // Gets called once when editing is finished (eg if enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    isCancelAfterEnd?(): boolean;

    // If doing full row edit, then gets called when tabbing into the cell.
    focusIn?(): boolean;

    // If doing full row edit, then gets called when tabbing out of the cell.
    focusOut?(): boolean;
}
</snippet>

<p>
    The params object provided to the init method of the cell editor has the following interface:
</p>

<snippet>
interface ICellEditorParams {

    // current value of the cell
    value: any;

    // key code of key that started the edit, eg 'Enter' or 'Delete' - non-printable characters appear here
    keyPress: number;

    // the string that started the edit, eg 'a' if letter a was pressed, or 'A' if shift + letter a
    // - only printable characters appear here
    charPress: string;

    // grid column
    column: Column;

    // grid row node
    node: RowNode;

    // editing row index
    rowIndex: number,

    // grid API
    api: GridApi;

    // column API
    columnApi: ColumnApi;

    // If doing full row edit, this is true if the cell is the one that started the edit (eg it is the cell the
    // use double clicked on, or pressed a key on etc).
    cellStartedEdit: boolean;

    // the grid's context object
    context: any;

    // angular 1 scope - null if not using angular 1, this is legacy and not used if not using angular 1
    $scope: any;

    // callback to tell grid a key was pressed - useful to pass control key events (tab, arrows etc)
    // back to grid - however you do
    onKeyDown: (event: KeyboardEvent)=>void;

    // Callback to tell grid to stop editing the current cell. pass 'false' to prevent navigation moving
    // to the next cell if grid property enterMovesDownAfterEdit=true
    stopEditing: (suppressNavigateAfterEdit?: boolean)=>void;

    // A reference to the DOM element representing the grid cell that your component will live inside. Useful if you
    // want to add event listeners or classes at this level. This is the DOM element that gets browser focus when selecting cells.
    eGridCell: HTMLElement;

    // Utility function to parse a value using the column's colDef.valueParser
    parseValue: (value: any) => any;

    // Utility function to format a value using the column's colDef.valueFormatter
    formatValue: (value: any) => any;
}
</snippet>

<p>
    Below is a simple example of Cell Editor:
</p>

<snippet>
// function to act as a class
function MyCellEditor () {}

// gets called once before the renderer is used
MyCellEditor.prototype.init = function(params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;
};

// gets called once when grid ready to insert the element
MyCellEditor.prototype.getGui = function() {
    return this.eInput;
};

// focus and select can be done after the gui is attached
MyCellEditor.prototype.afterGuiAttached = function() {
    this.eInput.focus();
    this.eInput.select();
};

// returns the new value after editing
MyCellEditor.prototype.getValue = function() {
    return this.eInput.value;
};

// any cleanup we need to be done here
MyCellEditor.prototype.destroy = function() {
    // but this example is simple, no cleanup, we could
    // even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
MyCellEditor.prototype.isPopup = function() {
    // and we could leave this method out also, false is the default
    return false;
};
</snippet>

<h2 id="complementing-cell-editor-params">Complementing Cell Editor Params</h2>

<p>
    Again like cell renderers, cell editors can also be provided with additional parameters.
    Do this using <code>cellEditorParams</code> like in the following example which will pass 'Ireland'
    as the 'country' parameter:
</p>

<snippet>
// define cell renderer to be reused
var myCellEditor = .....

// use with a color
colDef.cellEditor = ... // provide cellEditor as before
colDef.cellEditorParams = {
    country: 'Ireland'
}
</snippet>

<h2>Registering Cell Renderers with Columns</h2>

<p>
    See the section <a href="../javascript-grid-components/#registering-custom-components">
        registering custom components</a> for details on registering and using custom cell renderers.
</p>

<h2>Keyboard Navigation While Editing</h2>

<p>
    If you provide a cell editor, you may wish to disable some of the grids keyboard navigation.
    For example, if you are providing a simple text editor, you may wish the grid to do nothing
    when you press the right and left arrows (the default is the grid will move to the next / previous
    cell) as you may want the right and left arrows to move the
    cursor inside your editor. In other cell editors, you may wish the grid to behave as normal.
</p>

<p>
    Because different cell editors will have different requirements on what the grid does,
    it is up to the cell editor to decide which event it wants the grid to handle and which
    it does not.
</p>

<p>
    You have two options to stop the grid from doing it's default action on certain key events:
</p>

<ol class="content">
    <li>Stop propagation of the event to the grid in the cell editor.</li>
    <li>Tell the grid to do nothing via the <code>colDef.suppressKeyEvent()</code> callback.</li>
</ol>

<h3>Option 1 - Stop Propagation</h3>

<p>
    If you don't want the grid to act on an event, call <code>event.stopPropagation()</code>.
    The advantage of this method is that your cell editor takes care of everything, good for
    creating reusable cell editors.
</p>

<p>
    The follow code snippet is one you could include for a simple text editor, which would
    stop the grid from doing navigation.
</p>

<snippet>
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_PAGE_UP = 33;
var KEY_PAGE_DOWN = 34;
var KEY_PAGE_HOME = 36;
var KEY_PAGE_END = 35;

eInputDomElement.addEventListener('keydown', function(event) {
    var keyCode = event.keyCode;

    var isNavigationKey = keyCode===KEY_LEFT || keyCode===KEY_RIGHT || keyCode===KEY_UP
    || keyCode===KEY_DOWN || keyCode===KEY_PAGE_DOWN || keyCode===KEY_PAGE_UP
    || keyCode===KEY_PAGE_HOME || keyCode===KEY_PAGE_END;

    if (isNavigationKey) {
        // this stops the grid from receiving the event and executing keyboard navigation
        event.stopPropagation();
    }
}
</snippet>

<h3 id="suppress-keyboard-event">Option 2 - Suppress Keyboard Event</h3>

<p>
    If you implement <code>colDef.suppressKeyboardEvent()</code>, you can tell the grid
    which events you want process and which not. The advantage of this method of the previous
    method is it takes the responsibility out of the cell editor and into the column
    definition. So if you are using a reusable, or third party, cell editor, and the editor doesn't have
    this logic in it, you can add the logic via configuration.
</p>

<snippet>
var KEY_UP = 38;
var KEY_DOWN = 40;

colDef.suppressKeyboardEvent = function(params) {
    console.log('cell is editing: ' + params.editing);
    console.log('keyboard event:', params.event);

    // return true (to suppress) if editing and user hit up/down keys
    var keyCode = params.event.keyCode;
    var gridShouldDoNothing = params.editing && (keyCode===KEY_UP || keyCode===KEY_DOWN);
    return gridShouldDoNothing;
}
</snippet>

<p>The params for <code>suppressKeyboardEvent( )</code> are as follows:</p>

<snippet>
interface SuppressKeyboardEventParams {

    // the keyboard event the grid received
    event: KeyboardEvent;

    // whether the cell is editing or not
    editing: boolean;

    // these are same as normal
    node: RowNode;
    column: Column;
    colDef: ColDef;
    context: any;
    api: GridApi;
    columnApi: Co lumnApi;
}
</snippet>

<h2>Cell Editing Example</h2>

<p>The example below illustrates:<p>

<ul class="content">
    <li>'Gender' column uses a Component cell editor that allows choices via a 'richSelect' (ag-Grid-Enterprise only),
        with values supplied by complementing the editor parameters.
    </li>
    <li>'Age' column uses a Component cell editor that allows simple integer input only.</li>
    <li>'Mood' column uses a custom Component cell editor and renderer that allows choice of mood based on image
        selection.
    </li>
    <li>'Address' column uses a Component cell editor that allows input of multiline text via a 'largeText'. Tab & Esc
        (amongst others) will exit editing in this field, Shift+Enter will allow newlines.
    </li>
    <li>'Country' columns shows using 'richSelect' for a complex object - the cell renderer takes care of only rendering
        the country name.
    </li>
</ul>

<?= example('Editor Component', 'vanilla-editor-component', 'vanilla', array("enterprise" => 1)) ?>

<h2 id="accessing-cell-editor-instances">Accessing Cell Editor Instances</h2>

<p>
    After the grid has created an instance of a cell editor for a cell it is possible to access that instance.
    This is useful if you want to call a method that you provide on the cell editor that has nothing to do
    with the operation of the grid. Accessing cell editors is done using the grid API
    <code>getCellEditorInstances(params)</code>.
</p>

<snippet>// function takes params to identify what cells and returns back a list of cell editors
function getCellEditorInstances(params: GetCellEditorInstancesParams): ICellRendererComp[];

// params object for the above
interface GetCellEditorInstancesParams {
    // an optional list of row nodes
    rowNodes?: RowNode[];
    // an optional list of columns
    columns?: (string|Column)[];
}</snippet>

<p>
    If you are doing normal editing, then only on cell is editable at any given time. For this reason
    if you call <code>getCellEditorInstances()</code> with no params, it will return back the editing
    cell's editor if a cell is editing, or an empty list if no cell is editing.
</p>

<p>
    An example of calling <code>getCellEditorInstances()</code> is as follows:
</p>

<snippet>
var instances = gridOptions.api.getCellRendererInstances(params);
if (instances.length > 0) {
    var instance = instances[0];
}
</snippet>

<p>
    The example below shows using <code>getCellEditorInstances</code>. The following can be noted:
    <ul>
        <li>All cells are editable.</li>
        <li><b>First Name</b> and <b>Last Name</b> use the default editor.</li>
        <li>All other columns use the provided <code>MySimpleCellEditor</code> editor.</li>
        <li>The example sets an interval to print information from the active cell editor.
        There are three results: 1) No editing 2) Editing with default cell renderer and 3)
        editing with the custom cell editor. All results are printed to the developer console.</li>
    </ul>
</p>

<?= example('Get Editor Instance', 'get-editor-instance', 'vanilla', array("enterprise" => 1)) ?>

<p>
    If your are using a framework component (detailed below), then the returned object
    is a wrapper and you can get the underlying cell editor using <code>getFrameworkComponentInstance()</code>
</p>

<snippet>
// example - get cell editor
var instances = gridOptions.api.getCellEditorInstances(params);
if (instances.length > 0) {
    // got it, user must be scrolled so that it exists
    var wrapperInstance = instances[0];
    var frameworkInstance = wrapperInstance.getFrameworkComponentInstance();
}
</snippet>

<?php include './angular.php'; ?>

<?php include './react.php'; ?>

<?php include './polymer.php'; ?>

<?php include './vuejs.php'; ?>

<?php include './aurelia.php'; ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
