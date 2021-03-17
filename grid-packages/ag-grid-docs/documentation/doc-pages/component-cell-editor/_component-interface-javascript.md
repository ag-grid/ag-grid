[[only-javascript]]
|## Cell Renderer Component
|
|The interface for the cell renderer component is as follows:
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
|    // Return the DOM element of your editor, this is what the grid puts into the DOM
|    getGui(): HTMLElement;
|
|    // Should return the final value to the grid, the result of the editing
|    getValue(): any;
|
|    // Gets called once by grid after editing is finished
|    // if your editor needs to do any cleanup, do it here
|    destroy?(): void;
|
|    // Gets called once after initialised.
|    // If you return true, the editor will appear in a popup
|    isPopup?(): boolean;
|
|    // Gets called once, only if isPopup() returns true. Return "over" if the
|    // popup should cover the cell, or "under" if it should be positioned below
|    // leaving the cell value visible. If this method is not present, the
|    // default is "over"
|    getPopupPosition?(): string;
|
|    // Gets called once before editing starts, to give editor a chance to
|    // cancel the editing before it even starts.
|    isCancelBeforeStart?(): boolean;
|
|    // Gets called once when editing is finished (eg if Enter is pressed).
|    // If you return true, then the result of the edit will be ignored.
|    isCancelAfterEnd?(): boolean;
|
|    // If doing full row edit, then gets called when tabbing into the cell.
|    focusIn?(): boolean;
|
|    // If doing full row edit, then gets called when tabbing out of the cell.
|    focusOut?(): boolean;
|}
|```
|The params object provided to the `init` method of the cell editor has the following interface:


