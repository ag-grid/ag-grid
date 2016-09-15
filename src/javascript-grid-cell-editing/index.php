<?php
$key = "Cell Editing";
$pageTitle = "ag-Grid Cell Editing";
$pageDescription = "You can integrate your own editors into ag-Grid that will bind into the grids navigation.";
$pageKeyboards = "ag-Grid Cell Editors";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Cell Editors</h2>

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
            want to use a built in editor or you want to register your own cellEditors
            for reuse.</li>
    </ul>
    </p>

    <p>
        This is similar to cellRender, but cellRenderers have an additional 'method' option with no lifecycle
        methods. There is no equivalent for cellEditors as lifecycle is integral to how they work as the
        grid needs to ask 'what is the new value' after editing has stopped. A cellEditor
        without a lifecycle doesn't make sense.
    </p>

    <h3>Default Editing</h3>

    <p>
        To get simple string editing, you do not need to provide an editor. The grid by default allows simple
        string editing on cells. The default editor is used if you have <i>colDef.editable=true</i> but do
        not provide a cellEditor.
    </p>

    <h3>cellEditor Component</h3>

    <p>
        Create your own cellEditor by providing a cellEditor component.
    </p>

    <note>
        Like cellRenderers, cellEditor components have nothing to do with Angular or React or any other
        framework components. The are called components because they follow similar concepts. All you
        need to do to create an ag-Grid cellRenderer component is implement the required methods in
        your class.
    </note>

    <p>
        The interface for the cellEditor component is as follows:
    </p>

    <pre>interface ICellEditor {

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
    isCancelBeforeEnd?(): boolean;
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


    <h3>
        cellEditor Params
    </h3>

    <p>
        The cellEditor component takes parameters in it's init() method and contain the following:
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
    </table>

    <h3>Complementing cellEditor Params</h3>

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

    <h3>Start Editing</h3>

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
            that will allow single click to start editing instead of double click.</li>
        <li><b>api.startEditing()</b>: If you call startEditing() on the grid API</li>
    </ul>
    </p>

    <h3>Stop / End Editing</h3>

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

    <h3>Popup vs In Cell</h3>

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

    <h3>Provided cellEditors</h3>

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
        strings. You register cellRenders in one of the following ways:
    <ul>
        <li>Provide <i>cellEditors</i> property to the grid as a map of key=>cellEditor pairs.
            This property is used once during grid initialisation.</li>
        <li>Register the cellEditor by calling <i>gridApi.addCellEditor(key, cellEditor)</i>.
            This can be called at any time during the lifetime of the grid.</li>
    </ul>
    </p>-->

    <p>If you have many instances of a grid, you must register the cellEditors with each one.</p>

    <h4>Callback: New Value Handlers</h4>

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

    <h4>Event: Cell Value Changed</h4>

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

    <h3>Editing API</h3>

    <p>
        There are two api methods for editing, <code>startEditing()</code> and <code>stopEditing(params)</code>.
    </p>

    <p>
        <b>startEditing(params)</b><br/>
        Starts editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. Parameters are as follows:
        <ul>
        <li><b>rowIndex</b>: The row index of the row to start editing.</li>
        <li><b>colKey</b>: The column key of the column to start editing.</li>
        <li><b>keyPress, charPress</b>: The keyPress and charPress that are passed to the cellEditor</li>
    </ul>
    </p>

    <p>
        <b>stopEditing()</b><br/>
        Takes no parameters and stops the current editing. If not editing, then does nothing.
    </p>

    <h3>Cell Editing Example</h3>

    <p>The example below illustrates:
    <ul>
        <li>'Gender' column uses a Component cell editor that allows choices via a 'richSelect' (ag-Grid-Enterprise only), with values supplied by complementing the editor parameters.</li>
        <li>'Age' column uses a Component cell editor that allows simple integer input only.</li>
        <li>'Mood' column uses a custom Component cell editor and renderer that allows choice of mood based on image selection.</li>
        <li>'Address' column uses a Component cell editor that allows input of multiline text via a 'largeText'. Tab & Esc (amongst others) will exit editing in this field, Shift+Enter will allow newlines.</li>
        <li>The buttons a the top demonstrate different usages of the editing API.</li>
    </ul>
    </p>

    <show-example example="exampleCellEditing"></show-example>

    <h2 id="reactCellEditing">
        <img src="../images/react_large.png" style="width: 60px;"/>
        React Cell Editing
    </h2>

    <p>
        It is possible to provide a React cellEditor for ag-Grid to use. All of the information above is
        relevant to React cellEditors. This section explains how to apply this logic to your React component.
    </p>

    <p>
        For an example of React cellEditing, see the
        <a href="https://github.com/ceolter/ag-grid-react-example">ag-grid-react-example</a> on Github.
        In the example, the 'name' column uses a React cellEditor.</p>
    </p>

    <h3><img src="../images/react_large.png" style="width: 20px;"/> Specifying a React cellEditor</h3>

    <p>
        If you are using the ag-grid-react component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cellEditors
        as React components.
    </p>

    <pre><span class="codeComment">// create your cellEditor as a React component</span>
class NameCellEditor extends React.Component {

    <span class="codeComment">// constructor gets the props</span>
    constructor(props) {
        <span class="codeComment">// set initial state to be the value to be edited</span>
        this.state = {value: props.value};
    }

    render() {
    <span class="codeComment">// put in render logic</span>
        return &lt;input type="text" value="{this.state.value}">&lt;/input>;
    }

    <span class="codeComment">// more logic is needed, but enough for now to show the general setup</span>
}

<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {

    <span class="codeComment">// instead of cellRenderer we use cellRendererFramework</span>
    cellEditorFramework: NameCellEditor

    <span class="codeComment">// specify all the other fields as normal</span>
    cellRendererFramework: NameCellRenderer     <span class="codeComment">// if you have a React cellRenderer</span>
    headerName: 'Name',
    field: 'firstName',
    ...
}</pre>

    <p>
        By using <i>colDef.cellEditorFramework</i> (instead of <i>colDef.cellEditor</i>) the grid
        will know it's a React component, based on the fact that you are using the React version of
        ag-Grid.
    </p>


    <h3><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

    <p>
        The React component will get the 'cellEditor Params' as described above as it's React Props.
        Therefore you can access all the parameters as React Props.

    <h3><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle</h3>

    <p>
        All of the methods in the ICellEditor interface described above are applicable
        to the React Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
        <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
            any cleanup you need to do.</li>
        <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), isCancelBeforeStart(), isCancelBeforeEnd(), afterGuiAttached()</i> etc)
        should be put onto your React component and will work as normal.
    </p>

    <h2 id="ng2CellEditing">
        <img src="../images/angular2_large.png" style="width: 60px;"/>
        Angular 2 Cell Editing
    </h2>

    <p>
        It is possible to provide a Angular 2 cellEditor for ag-Grid to use. All of the information above is
        relevant to Angular 2 cellEditors. This section explains how to apply this logic to your Angular 2 component.
    </p>

    <p>
        For an example of Angular 2 cellEditing, see the
        <a href="https://github.com/ceolter/ag-grid-ng2-example">ag-grid-ng2-example</a> on Github.
    </p>

    <h3><img src="../images/angular2_large.png" style="width: 20px;"/> Specifying a Angular 2 cellEditor</h3>

    <p>
        If you are using the ag-grid-ng2 component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cellEditors
        as Angular 2 components.
    </p>

    <pre ng-non-bindable><span class="codeComment">// create your cellEditor as a Angular 2 component</span>
@Component({
    selector: 'editor-cell',
    template: `
        &lt;div #container class="mood" tabindex="0" (keydown)="onKeyDown($event)">
            &lt;img src="../images/smiley.png" (click)="setHappy(true)" [ngClass]="{'selected' : happy, 'default' : !happy}">
            &lt;img src="../images/smiley-sad.png" (click)="setHappy(false)" [ngClass]="{'selected' : !happy, 'default' : happy}">
        &lt;/div>
    `,
    styles: [`
        .mood {
            border-radius: 15px;
            border: 1px solid grey;
            background: #e6e6e6;
            padding: 15px;
            text-align:center;
            display:inline-block;
            outline:none
        }

        .default {
            padding-left:10px;
            padding-right:10px;
            border: 1px solid transparent;
            padding: 4px;
        }

        .selected {
            padding-left:10px;
            padding-right:10px;
            border: 1px solid lightgreen;
            padding: 4px;
        }
    `]
})
class MoodEditorComponent implements AgEditorComponent, AfterViewInit {
    private params:any;

    @ViewChild('container', {read: ViewContainerRef}) container;
    private happy:boolean = false;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.container.element.nativeElement.focus();
    }

    agInit(params:any):void {
        this.params = params;
        this.setHappy(params.value === "Happy");
    }

    getValue():any {
        return this.happy ? "Happy" : "Sad";
    }

    isPopup():boolean {
        return true;
    }

    setHappy(happy:boolean):void {
        this.happy = happy;
    }

    toggleMood():void {
        this.setHappy(!this.happy);
    }

    onKeyDown(event):void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}
<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {
        headerName: "Mood",
        field: "mood",
        <span class="codeComment">// instead of cellEditor we use cellEditorFramework</span>
        cellEditorFramework: {
            component: MoodEditorComponent,
            moduleImports: [CommonModule]
        },

        <span class="codeComment">// specify all the other fields as normal</span>
        editable: true,
        width: 150
    }
}</pre>

    <p>Your Angular 2 components need to implement <code>AgEditorComponent</code>.</p>

    <p>When specifying Angular 2 Components you can optionally specify Component dependencies, as well as which modules you wish to import.
        The latter is important if your component uses built in Angular 2 components (such as ngIf, ngStyle etc).</p>

    <pre>
cellEditorFramework: {
    component: YourComponent,

    // optional - these go into module.declarations
    dependencies: [YourChildComponent1, YourChildComponent2],

    // optional - these go into module.imports
    moduleImports: [CommonModule, FormsModule]
}
</pre>

    <p>
        By using <i>colDef.cellEditorFramework</i> (instead of <i>colDef.cellEditor</i>) the grid
        will know it's a Angular 2 component, based on the fact that you are using the Angular 2 version of
        ag-Grid.
    </p>


    <h3><img src="../images/angular2_large.png" style="width: 20px;"/> Angular 2 Parameters</h3>

    <p>Your Angular 2 components need to implement <code>AgEditorComponent</code>.
        The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the cell <code>params</code>.</p>

    <h3><img src="../images/angular2_large.png" style="width: 20px;"/> Angular 2 Methods / Lifecycle</h3>

    <p>
        All of the methods in the ICellEditor interface described above are applicable
        to the Angular 2 Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
        <li><i>destroy()</i> is not used. Instead implement the Angular 2<code>OnDestroy</code> interface (<code>ngOnDestroy</code>) for
            any cleanup you need to do.</li>
        <li><i>getGui()</i> is not used. Instead do normal Angular 2 magic in your Component via the Angular 2 template.</li>
        <li><i>afterGuiAttached()</i> is not used. Instead implement <code>AfterViewInit</code> (<code>ngAfterViewInit</code>) for any post Gui setup (ie to focus on an element).</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), getValue(), isCancelBeforeStart(), isCancelBeforeEnd()()</i> etc)
        should be put onto your Angular 2 component and will work as normal.
    </p>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
