[[only-vue]]
|## Cell Renderer Component
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `this.params`.
|
|The editor interface is as follows:
|
|```
|interface {
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
