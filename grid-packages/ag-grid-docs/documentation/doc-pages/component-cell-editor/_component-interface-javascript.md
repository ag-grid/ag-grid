[[only-javascript]]
|## Cell Editor Component
|
|The interface for the cell editor component is as follows:
|
|```ts
|interface ICellEditorComp {
|
|    // gets called once after the editor is created
|    init?(params: ICellEditorParams): void;
|
|    // Gets called once after GUI is attached to DOM.
|    // Useful if you want to focus or highlight a component
|    // (this is not possible when the element is not attached)
|    afterGuiAttached?(): void;
|
|    // Mandatory - Return the DOM element of your editor, this is what the grid puts into the DOM
|    getGui(): HTMLElement;
|
|    // Mandatory - Return the final value - called by the grid once after editing is complete
|    getValue(): any;
|
|    // Gets called once by grid after editing is finished
|    // if your editor needs to do any cleanup, do it here
|    destroy?(): void;
|
|    // Gets called once after initialised. If you return true, the editor will
|    // appear in a popup, so is not constrained to the boundaries of the cell.
|    // This is great if you want to, for example, provide you own custom dropdown list
|    // for selection. Default is false (ie if you don't provide the method).
|    isPopup?(): boolean;
|
|    // Gets called once, only if isPopup() returns true. Return "over" if the
|    // popup should cover the cell, or "under" if it should be positioned below
|    // leaving the cell value visible. If this method is not present, the
|    // default is "over"
|    getPopupPosition?(): string;
|
|    // Gets called once after initialised. If you return true, the editor will not be
|    // used and the grid will continue editing. Use this to make a decision on editing
|    // inside the init() function, eg maybe you want to only start editing if the user
|    // hits a numeric key, but not a letter, if the editor is for numbers.
|    isCancelBeforeStart?(): boolean;
|
|    // Gets called once after editing is complete. If your return true, then the new
|    // value will not be used. The editing will have no impact on the record. Use this
|    // if you do not want a new value from your gui, i.e. you want to cancel the editing.
|    isCancelAfterEnd?(): boolean;
|
|    // If doing full line edit, then gets called when focus should be put into the editor
|    focusIn?(): boolean;
|
|    // If doing full line edit, then gets called when focus is leaving the editor
|    focusOut?(): boolean;
|}
|```
|The params object provided to the `init` method of the cell editor has the following interface:


