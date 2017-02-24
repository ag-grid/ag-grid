// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnController";
import { IComponent } from "../../interfaces/iComponent";
export interface ICellEditor {
    /** Return the final value - called by the grid once after editing is complete */
    getValue(): any;
    /** Gets called once after initialised. If you return true, the editor will appear in a popup, so is not constrained
     *  to the boundaries of the cell. This is great if you want to, for example, provide you own custom dropdown list
     *  for selection. Default is false (ie if you don't provide the method). */
    isPopup?(): boolean;
    /** Gets called once after initialised. If you return true, the editor will not be used and the grid will continue
     *  editing. Use this to make a decision on editing inside the init() function, eg maybe you want to only start
     *  editing if the user hits a numeric key, but not a letter, if the editor is for numbers.
     * */
    isCancelBeforeStart?(): boolean;
    /** Gets called once after editing is complete. If your return true, then the new value will not be used. The
     *  editing will have no impact on the record. Use this if you do not want a new value from your gui, i.e. you
     *  want to cancel the editing. */
    isCancelAfterEnd?(): boolean;
    /** If doing full line edit, then gets called when focus should be put into the editor */
    focusIn?(): void;
    /** If doing full line edit, then gets called when focus is leaving the editor */
    focusOut?(): void;
}
export interface ICellEditorComp extends ICellEditor, IComponent<ICellEditorParams> {
}
/** Gets called once after editor is created. Params contains teh following:
 value: current value of the cell
 keyPress: key code of key that started the edit, eg 'Enter' or 'Delete' - non-printable characters appear here
 charPress: the string that started the edit, eg 'a' if letter a was pressed, or 'A' if shift + letter a
 - only printable characters appear here
 column: grid column
 node: grid row node
 api: grid api
 columnApi: grid column api
 context: grid context
 onKeyDown: callback to tell grid a key was pressed - useful to pass control key events (tab, arrows etc) back to grid - however you do
 not need to call this as the grid is already listening for the events as they propagate. this is only required if
 you are preventing event propagation
 stopRowOrCellEdit: call this if you want to stop editing the cell (eg if you are doing your own edit and are happy with the selection)
 */
export interface ICellEditorParams {
    value: any;
    keyPress: number;
    charPress: string;
    column: Column;
    node: RowNode;
    rowIndex: number;
    api: GridApi;
    columnApi: ColumnApi;
    cellStartedEdit: boolean;
    context: any;
    $scope: any;
    onKeyDown: (event: KeyboardEvent) => void;
    stopEditing: () => void;
    eGridCell: HTMLElement;
}
