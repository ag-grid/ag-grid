[[only-angular]]
|## Cell Editor Component
|
|The interface for the cell editor component is as follows:
|
|```ts
|interface ICellEditorAngularComp {
|    // Optional - Params for rendering
|    agInit(params: ICellRendererParams): void;
|
|    // Should return the final value to the grid, the result of the editing
|    getValue(): any;
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
|The interface for the `params` argument passed to `agInit` is as follows:
