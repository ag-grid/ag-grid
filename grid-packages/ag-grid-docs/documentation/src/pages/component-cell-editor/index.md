---
title: "Cell Editors"
---

Create your own cell editor by providing a cell editor component.

The interface for the cell editor component is as follows:

```ts
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

    // Gets called once, only if isPopup() returns true. Return "over" if the
    // popup should cover the cell, or "under" if it should be positioned below
    // leaving the cell value visible. If this method is not present, the
    // default is "over"
    getPopupPosition?(): string;

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
```

The params object provided to the init method of the cell editor has the following interface:

```ts
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
```

Below is a simple example of Cell Editor:

```js
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
```

## Complementing Cell Editor Params

Again like cell renderers, cell editors can also be provided with additional parameters. Do this using `cellEditorParams` like in the following example which will pass 'Ireland' as the 'country' parameter:

```js
// define cell renderer to be reused
var myCellEditor = .....

// use with a color
colDef.cellEditor = ... // provide cellEditor as before
colDef.cellEditorParams = {
    country: 'Ireland'
}
```

## Registering Cell Renderers with Columns

See the section [registering custom components](../grid-components/#registering-custom-components) for details on registering and using custom cell renderers.

## Keyboard Navigation While Editing

If you provide a cell editor, you may wish to disable some of the grids keyboard navigation. For example, if you are providing a simple text editor, you may wish the grid to do nothing when you press the right and left arrows (the default is the grid will move to the next / previous cell) as you may want the right and left arrows to move the cursor inside your editor. In other cell editors, you may wish the grid to behave as normal.

Because different cell editors will have different requirements on what the grid does, it is up to the cell editor to decide which event it wants the grid to handle and which it does not.

You have two options to stop the grid from doing it's default action on certain key events:

1. Stop propagation of the event to the grid in the cell editor.
1. Tell the grid to do nothing via the `colDef.suppressKeyEvent()` callback.

### Option 1 - Stop Propagation

If you don't want the grid to act on an event, call `event.stopPropagation()`. The advantage of this method is that your cell editor takes care of everything, good for creating reusable cell editors.

The follow code snippet is one you could include for a simple text editor, which would stop the grid from doing navigation.


```js
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
```

### Option 2 - Suppress Keyboard Event

If you implement `colDef.suppressKeyboardEvent()`, you can tell the grid which events you want process and which not. The advantage of this method of the previous method is it takes the responsibility out of the cell editor and into the column definition. So if you are using a reusable, or third party, cell editor, and the editor doesn't have this logic in it, you can add the logic via configuration.


```js
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
```

The params for `suppressKeyboardEvent( )` are as follows:

```ts
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
```

## Cell Editing Example

The example below illustrates:

- 'Gender' column uses a Component cell editor that allows choices via a 'richSelect' (ag-Grid-Enterprise only), with values supplied by complementing the editor parameters.
- 'Age' column uses a Component cell editor that allows simple integer input only.
- 'Mood' column uses a custom Component cell editor and renderer that allows choice of mood based on image selection.
- 'Address' column uses a Component cell editor that allows input of multiline text via a 'largeText'. Tab & Esc (amongst others) will exit editing in this field, Shift+Enter will allow newlines.
- 'Country' columns shows using 'richSelect' for a complex object - the cell renderer takes care of only rendering the country name.

<grid-example title='Editor Component' name='vanilla-editor-component' type='vanilla' options='{ "enterprise": true }'></grid-example>

## Accessing Cell Editor Instances

After the grid has created an instance of a cell editor for a cell it is possible to access that instance. This is useful if you want to call a method that you provide on the cell editor that has nothing to do with the operation of the grid. Accessing cell editors is done using the grid API `getCellEditorInstances(params)`.

```ts
// function takes params to identify what cells and returns back a list of cell editors
function getCellEditorInstances(params: GetCellEditorInstancesParams): ICellRendererComp[];

// params object for the above
interface GetCellEditorInstancesParams {
    // an optional list of row nodes
    rowNodes?: RowNode[];
    // an optional list of columns
    columns?: (string|Column)[];
}
```

If you are doing normal editing, then only on cell is editable at any given time. For this reason if you call `getCellEditorInstances()` with no params, it will return back the editing cell's editor if a cell is editing, or an empty list if no cell is editing.

An example of calling `getCellEditorInstances()` is as follows:

```js
var instances = gridOptions.api.getCellRendererInstances(params);
if (instances.length > 0) {
    var instance = instances[0];
}
```

The example below shows using `getCellEditorInstances`. The following can be noted:

- All cells are editable.
- **First Name** and **Last Name** use the default editor.
- All other columns use the provided `MySimpleCellEditor` editor.
- The example sets an interval to print information from the active cell editor. There are three results: 1) No editing 2) Editing with default cell renderer and 3) editing with the custom cell editor. All results are printed to the developer console.


<grid-example title='Get Editor Instance' name='get-editor-instance' type='vanilla' options='{ "enterprise": true }'></grid-example>

If your are using a framework component (detailed below), then the returned object is a wrapper and you can get the underlying cell editor using `getFrameworkComponentInstance()`


```js
// example - get cell editor
var instances = gridOptions.api.getCellEditorInstances(params);
if (instances.length > 0) {
    // got it, user must be scrolled so that it exists
    var wrapperInstance = instances[0];
    var frameworkInstance = wrapperInstance.getFrameworkComponentInstance();
}
```
[[only-angular]]
| ## Cell Editing
| 
| It is possible to provide Angular cell editors's for ag-Grid to use if you are are using the Angular version of 
| ag-Grid. See [registering framework components](../grid-components/#registering-framework-components) for how to 
| register framework components.
|
| Your components need to implement `AgEditorComponent`. The ag Framework expects to find the `agInit` method 
| on the created component, and uses it to supply the cell `params`.
|
| ###  Methods / Lifecycle
|
| All of the methods in the `ICellEditor` interface described above are applicable to the Component with the 
| following exceptions:
| 
| - `init()` is not used. Instead implement the `agInit` method (on the `AgRendererComponent` interface).
| - `destroy()` is not used. Instead implement the Angular`OnDestroy` interface (`ngOnDestroy`) for any cleanup you 
| need to do.
| - `getGui()` is not used. Instead do normal Angular magic in your Component via the Angular template.
| - `afterGuiAttached()` is not used. Instead implement `AfterViewInit` (`ngAfterViewInit`) for any post Gui setup (ie 
| to focus on an element).
|
| All of the other methods (`isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()` etc) should be put 
| onto your Component and will work as normal.
|
| ### Example: Cell Editing using Components
|
| Using Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
| 
| 
| <grid-example title='Angular Editor Components' name='component-editor' type='mixed' options='{ "enterprise": true, "exampleHeight": 370, "extras": ["bootstrap"] }'></grid-example>

[[only-react]]
| ## Cell Editing
| 
| It is possible to provide React cell editors for ag-Grid to use if you are are using the React version of ag-Grid. 
| See [registering framework components](../grid-components/#registering-framework-components) for how to register 
| framework components.
| 
| ###  React Props
| 
| The React component will get the 'Cell Editor Params' as described above as its React Props. Therefore you can 
| access all the parameters as React Props.
| 
| ###  Methods / Lifecycle 
| 
| All of the methods in the `ICellEditor` interface described above are applicable to the React Component with 
| the following exceptions:
|
| - `init()` is not used. Instead use the React props passed to your Component.
| - `destroy()` is not used. Instead use the React `componentWillUnmount()` method for any cleanup you need to do.
| - `getGui()` is not used. Instead do normal React magic in your `render()` method.
| 
| All of the other methods (`isPopup(), isCancelBeforeStart(), isCancelAfterEnd(), afterGuiAttached()` etc) should 
| be put onto your React component and will work as normal.
| 
| ### Example: Cell Editing using React Components
| Using React Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.  
|
| <grid-example title='React Editor Components' name='component-editor' type='mixed' options='{ "enterprise": true, "exampleHeight": 370, "extras": ["bootstrap"] }'></grid-example>
| 
| Note that in this example we make use of `useImperativeHandle` for lifecycle methods - please see 
| [here](https://www.ag-grid.com/react-hooks/) for more information.


[[only-vue]]
| ##  Cell Editing 
| 
| It is possible to provide VueJS cell editors's for ag-Grid to use if you are are using the VueJS version of 
| ag-Grid. See [registering framework components](../grid-components/#registering-framework-components) for how to 
| register framework components.
| 
| ###  VueJS Parameters
| 
| The Grid cell's value will be made available implicitly in a data value names `params`. This value will be 
| available to you from the `created` VueJS lifecycle hook. You can think of this as you having defined the following:
| 
| ```js
| export default {
|     data () {
|         return {
|             params: null
|         }
|     },
|     ...
| }
| 
| but you do not need to do this - this is made available to you behind the scenes, and contains the cells value.
| 
| ### Methods / Lifecycle
| All of the methods in the `ICellEditor` interface described above are applicable to the VueJS Component with 
| the following exceptions:
| 
| - `init()` is not used. The cells value is made available implicitly via a data field called `params`.
| - `getGui()` is not used. Instead do normal VueJS magic in your Component via the VueJS template.
| - `afterGuiAttached()` is not used. Instead implement the `mounted` VueJS lifecycle hook for any post Gui 
| setup (ie to focus on an element).
| 
| All of the other methods (`isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()` etc) should be 
| put onto your VueJS component and will work as normal.
| 
| ### Example: Cell Editing using VueJS Components
| 
| Using Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
| 
| A Component can be defined in a few different ways (please see 
| [Defining VueJS Components](../vuejs-misc#define_component) for all the options), but in this example we're 
| going to define our editor as a Single File Component:
|
| <grid-example title='Vue Editor Components' name='component-editor' type='mixed' options='{ "enterprise": true, "exampleHeight": 370, "extras": ["bootstrap"] }'></grid-example>

[[only-javascript]]
| ##  Polymer Cell Editing 
| 
| It is possible to provide Polymer cell editors's for ag-Grid to use if you are are using the Polymer version of 
| ag-Grid. See [registering framework components](../grid-components/#registering-framework-components) for how to 
| register framework components.
| 
| ###  Polymer Parameters
| 
| The ag Framework expects to find the `agInit` method on the created component, and uses it to supply 
| the cell `params`.
| 
| ### Polymer Methods / Lifecycle
| 
| All of the methods in the `ICellEditor` interface described above are applicable to the Polymer Component 
| with the following exceptions:
| 
| - `init()` is not used. Instead implement the `agInit` method.
| - `getGui()` is not used. Instead do normal Polymer magic in your Component via the Polymer template.
| 
| All of the other methods (`isPopup(), getValue(), destroy(), afterGuiAttached(), isCancelBeforeStart(), 
| isCancelAfterEnd()` etc) should be put onto your Polymer component and will work as normal.
|
| ### Example: Cell Editing using Polymer Components
| 
| Using Polymer Components in the Cell Editors, illustrating keyboard events, rendering, validation 
| and lifecycle events.
| ```html
| <grid-example title='Polymer Editor Components' name='polymer-editor' type='as-is' options='{ "showImportsDropdown": false, "noPlunker": true, "usePath": "/", "exampleHeight": 450 }'></grid-example>
