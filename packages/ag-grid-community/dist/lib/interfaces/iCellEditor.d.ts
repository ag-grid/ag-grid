// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { ColDef } from "../entities/colDef";
import { IPopupComponent } from "./iPopupComponent";
export interface ICellEditor {
    /**
     * Return the final value - called by the grid once after editing is complete
     */
    getValue(): any;
    /** Gets called once after initialised. If you return true, the editor will
     * appear in a popup, so is not constrained to the boundaries of the cell.
     * This is great if you want to, for example, provide you own custom dropdown list
     * for selection. Default is false (ie if you don't provide the method).
     */
    isPopup?(): boolean;
    /** Gets called once after initialised. If you return true, the editor will not be
     * used and the grid will continue editing. Use this to make a decision on editing
     * inside the init() function, eg maybe you want to only start editing if the user
     * hits a numeric key, but not a letter, if the editor is for numbers.
     */
    isCancelBeforeStart?(): boolean;
    /** Gets called once after editing is complete. If your return true, then the new
     * value will not be used. The editing will have no impact on the record. Use this
     * if you do not want a new value from your gui, i.e. you want to cancel the editing.
     */
    isCancelAfterEnd?(): boolean;
    /**
     * If doing full line edit, then gets called when focus should be put into the editor
     */
    focusIn?(): void;
    /**
     * If doing full line edit, then gets called when focus is leaving the editor
     */
    focusOut?(): void;
    /** If using a framework this returns the underlying component instance, so you can call
     * methods on it if you want.
     */
    getFrameworkComponentInstance?(): any;
}
export interface ICellEditorParams {
    value: any;
    keyPress: number | null;
    charPress: string | null;
    column: Column;
    colDef: ColDef;
    node: RowNode;
    data: any;
    rowIndex: number;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    cellStartedEdit: boolean;
    context: any;
    $scope: any;
    onKeyDown: (event: KeyboardEvent) => void;
    stopEditing: (suppressNavigateAfterEdit?: boolean) => void;
    eGridCell: HTMLElement;
    parseValue: (value: any) => any;
    formatValue: (value: any) => any;
}
export interface ICellEditorComp extends ICellEditor, IPopupComponent<ICellEditorParams> {
}
