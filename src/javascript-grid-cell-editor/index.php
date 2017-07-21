<?php
$key = "Cell Editor";
$pageTitle = "ag-Grid Cell Editor Component";
$pageDescription = "You can integrate your own editors into ag-Grid that will bind into the grids navigation.";
$pageKeyboards = "ag-Grid Cell Editor Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h2 id="cell-editors">Cell Editors</h2>

<p>
    Create your own cellEditor by providing a cellEditor component.
</p>

<p>
    The interface for the cellEditor component is as follows:
</p>

<pre>interface ICellEditorComp {

    <span class="codeComment">// gets called once after the editor is created</span>
    init?(params: ICellEditorParams): void;

    <span class="codeComment">// Gets called once after GUI is attached to DOM.</span>
    <span class="codeComment">// Useful if you want to focus or highlight a component</span>
    <span class="codeComment">// (this is not possible when the element is not attached)</span>
    afterGuiAttached?(): void;

    <span class="codeComment">// Return the DOM element of your editor, this is what the grid puts into the DOM</span>
    getGui(): HTMLElement;

    <span class="codeComment">// Should return the final value to the grid, the result of the editing</span>
    getValue(): any;

    <span class="codeComment">// Gets called once by grid after editing is finished</span>
    <span class="codeComment">// if your editor needs to do any cleanup, do it here</span>
    destroy?(): void;

    <span class="codeComment">// Gets called once after initialised.</span>
    <span class="codeComment">// If you return true, the editor will appear in a popup</span>
    isPopup?(): boolean;

    <span class="codeComment">// Gets called once before editing starts, to give editor a chance to</span>
    <span class="codeComment">// cancel the editing before it even starts.</span>
    isCancelBeforeStart?(): boolean;

    <span class="codeComment">// Gets called once when editing is finished (eg if enter is pressed).</span>
    <span class="codeComment">// If you return true, then the result of the edit will be ignored.</span>
    isCancelAfterEnd?(): boolean;

    <span class="codeComment">// If doing full row edit, then gets called when tabbing into the cell.</span>
    focusIn?(): boolean;

    <span class="codeComment">// If doing full row edit, then gets called when tabbing out of the cell.</span>
    focusOut?(): boolean;
}</pre>

<p>
    Below is a simple example of cellEditor class:
</p>

<pre><code><span class="codeComment">// function to act as a class</span>
function MyCellEditor () {}

<span class="codeComment">// gets called once before the renderer is used</span>
MyCellEditor.prototype.init = function(params) {
    <span class="codeComment">// create the cell</span>
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;
};

<span class="codeComment">// gets called once when grid ready to insert the element</span>
MyCellEditor.prototype.getGui = function() {
    return this.eInput;
};

<span class="codeComment">// focus and select can be done after the gui is attached</span>
MyCellEditor.prototype.afterGuiAttached = function() {
    this.eInput.focus();
    this.eInput.select();
};

<span class="codeComment">// returns the new value after editing</span>
MyCellEditor.prototype.getValue = function() {
    return this.eInput.value;
};

<span class="codeComment">// any cleanup we need to be done here</span>
MyCellEditor.prototype.destroy = function() {
    <span class="codeComment">// but this example is simple, no cleanup, we could</span>
    <span class="codeComment">// even leave this method out as it's optional</span>
};

<span class="codeComment">// if true, then this editor will appear in a popup </span>
MyCellEditor.prototype.isPopup = function() {
    <span class="codeComment"> and we could leave this method out also, false is the default</span>
    return false;
};</code></pre>


<h3 id="cell-editor-params">
    cellEditor Params
</h3>

<p>
    The cellEditor component takes parameters in its init() method and contain the following:
</p>

<table class="table">
    <tr>
        <th>Value</th>
        <th>Description</th>
    </tr>
    <tr>
        <th>value</th>
        <td>The initial data value to be edited.</td>
    </tr>
    <tr>
        <th>keyPress</th>
        <td>If editing was started by a function key press, contains the key code.</td>
    </tr>
    <tr>
        <th>charPress</th>
        <td>If editing was started by a printable character, contains the string of the printable character.</td>
    </tr>
    <tr>
        <th>column</th>
        <td>The column the cell belongs to.</td>
    </tr>
    <tr>
        <th>node</th>
        <td>The row node the row is rendering.</td>
    </tr>
    <tr>
        <th>api</th>
        <td>Grid API</td>
    </tr>
    <tr>
        <th>columnApi</th>
        <td>Column API</td>
    </tr>
    <tr>
        <th>context</th>
        <td>Grid context</td>
    </tr>
    <tr>
        <th>$scope</th>
        <td>If compiling to Angular, is the row's child scope, otherwise null.</td>
    </tr>
    <tr>
        <th>onKeyDown</th>
        <td>Callback to tell grid a key was pressed - useful to pass control key events (tab, arrows etc) back to grid - however you do
            not need to call this as the grid is already listening for the events as they propagate. This is only required if
            you are preventing event propagation.</td>
    </tr>
    <tr>
        <th>stopEditing</th>
        <td>Callback to tell grid to stop editing the current cell.</td>
    </tr>
    <tr>
        <th>eGridCell</th>
        <td>A reference to the DOM element representing the grid cell that your component will live inside.
            Useful if you want to add event listeners or classes at this level. This is the DOM element that
            gets browser focus when selecting cells.</td>
    </tr>
    <tr>
        <th>cellStartedEdit</th>
        <td>
            If doing full row edit, this is true if the cell is the one that started the edit (eg it is
            the cell the use double clicked on, or pressed a key on etc).
        </td>
    </tr>
</table>

<h3 id="complementing-cell-editor-params">Complementing cellEditor Params</h3>

<p>
    Again like cellRenderers, cellEditors can also be provided with additional parameters.
    Do this using cellEditorParams like in the following example which will pass 'Ireland'
    as the 'country' parameter:
</p>

<pre><code><span class="codeComment">// define cellRenderer to be reused</span>
var myCellEditor = .....

<span class="codeComment">// use with a color</span>
colDef.cellEditor = ... <span class="codeComment">// provide cellEditor as before</span>
colDef.cellEditorParams = {
    country: 'Ireland'
}
</code></pre>

<h3 id="cell-editing-example">Cell Editing Example</h3>

<p>The example below illustrates:
<ul>
    <li>'Gender' column uses a Component cell editor that allows choices via a 'richSelect' (ag-Grid-Enterprise only), with values supplied by complementing the editor parameters.</li>
    <li>'Age' column uses a Component cell editor that allows simple integer input only.</li>
    <li>'Mood' column uses a custom Component cell editor and renderer that allows choice of mood based on image selection.</li>
    <li>'Address' column uses a Component cell editor that allows input of multiline text via a 'largeText'. Tab & Esc (amongst others) will exit editing in this field, Shift+Enter will allow newlines.</li>
    <li>'Country' columns shows using 'richSelect' for a complex object - the cellRenderer takes care of only rendering the country name.</li>
</ul>
</p>

<show-example example="exampleEditorComponent"></show-example>

<?php if (isFrameworkAngular2()) { ?>
    <?php include './angular.php';?>
<?php } ?>

<?php if (isFrameworkReact()) { ?>
    <?php include './react.php';?>
<?php } ?>

<?php if (isFrameworkPolymer()) { ?>
    <?php include './polymer.php';?>
<?php } ?>

<?php if (isFrameworkVue()) { ?>
    <?php include './vuejs.php';?>
<?php } ?>

<?php if (isFrameworkAurelia()) { ?>
    <?php include './aurelia.php';?>
<?php } ?>


<?php include '../documentation-main/documentation_footer.php';?>
