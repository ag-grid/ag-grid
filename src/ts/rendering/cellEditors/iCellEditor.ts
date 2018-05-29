import {Column} from "../../entities/column";
import {RowNode} from "../../entities/rowNode";
import {GridApi} from "../../gridApi";
import {ColumnApi} from "../../columnController/columnApi";
import {IComponent} from "../../interfaces/iComponent";


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

export interface ICellEditorParams {
    // current value of the cell
    value: any;
    // key code of key that started the edit, eg 'Enter' or 'Delete' - non-printable characters appear here
    keyPress: number;
    // the string that started the edit, eg 'a' if letter a was pressed, or 'A' if shift + letter a - only printable characters appear here
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
    // If doing full row edit, this is true if the cell is the one that started the edit (eg it is the cell the use double clicked on, or pressed a key on etc).
    cellStartedEdit: boolean;
    // the grid's context object
    context: any;
    // angular 1 scope - null if not using angular 1, this is legacy and not used if not using angular 1
    $scope: any;
    // callback to tell grid a key was pressed - useful to pass control key events (tab, arrows etc) back to grid - however you do
    onKeyDown: (event: KeyboardEvent)=>void;
    // Callback to tell grid to stop editing the current cell. pass 'false' to prevent navigation moving to the next cell if grid property enterMovesDownAfterEdit=true
    stopEditing: (suppressNavigateAfterEdit?: boolean)=>void;
    // A reference to the DOM element representing the grid cell that your component will live inside. Useful if you want to add event listeners or classes at this level. This is the DOM element that gets browser focus when selecting cells.
    eGridCell: HTMLElement;
    // Utility function to parse a value using the column's colDef.valueParser
    parseValue: (value: any) => any;
    // Utility function to format a value using the column's colDef.valueFormatter
    formatValue: (value: any) => any;
}
