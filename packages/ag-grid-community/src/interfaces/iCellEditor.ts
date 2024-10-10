import type { ColDef } from '../entities/colDef';
import type { Column } from '../interfaces/iColumn';
import type { GetCellsParams } from './iCellsParams';
import type { AgGridCommon } from './iCommon';
import type { IPopupComponent } from './iPopupComponent';
import type { IRowNode } from './iRowNode';

export interface BaseCellEditor {
    /** Optional: Gets called once after initialised. If you return true, the editor will not be
     * used and the grid will continue editing. Use this to make a decision on editing
     * inside the init() function, eg maybe you want to only start editing if the user
     * hits a numeric key, but not a letter, if the editor is for numbers.
     */
    isCancelBeforeStart?(): boolean;

    /** Optional: Gets called once after editing is complete. If your return true, then the new
     * value will not be used. The editing will have no impact on the record. Use this
     * if you do not want a new value from your gui, i.e. you want to cancel the editing.
     */
    isCancelAfterEnd?(): boolean;

    /**
     * Optional: If doing full line edit, then gets called when focus should be put into the editor
     */
    focusIn?(): void;

    /**
     * Optional: If doing full line edit, then gets called when focus is leaving the editor
     */
    focusOut?(): void;
}

export interface ICellEditor<TValue = any> extends BaseCellEditor {
    /**
     * Return the final value - called by the grid once after editing is complete
     */
    getValue(): TValue | null | undefined;

    /**
     * Optional: Gets called with the latest cell editor params every time they update
     */
    refresh?(params: ICellEditorParams<any, TValue>): void;

    /**
     * Optional: A hook to perform any necessary operation just after the GUI for this component has been rendered on the screen.
     * This method is called each time the edit component is activated.
     * This is useful for any logic that requires attachment before executing, such as putting focus on a particular DOM element.
     */
    afterGuiAttached?(): void;

    /** Optional: Gets called once after initialised. If you return true, the editor will
     * appear in a popup, so is not constrained to the boundaries of the cell.
     * This is great if you want to, for example, provide you own custom dropdown list
     * for selection. Default is false (ie if you don't provide the method).
     */
    isPopup?(): boolean;

    /** Optional: Gets called once, only if isPopup() returns true. Return "over" if the popup
     * should cover the cell, or "under" if it should be positioned below leaving the
     * cell value visible. If this method is not present, the default is "over".
     */
    getPopupPosition?(): 'over' | 'under' | undefined;
}

export interface ICellEditorParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** Current value of the cell */
    value: TValue | null | undefined;
    /** Key value of key that started the edit, eg 'Enter' or 'F2' - non-printable
     *  characters appear here */
    eventKey: string | null;
    /** Grid column */
    column: Column<TValue>;
    /** Column definition */
    colDef: ColDef<TData, TValue>;
    /** Row node for the cell */
    node: IRowNode<TData>;
    /** Row data */
    data: TData;
    /** Editing row index */
    rowIndex: number;
    /** If doing full row edit, this is true if the cell is the one that started the edit
     *  (eg it is the cell the use double clicked on, or pressed a key on etc). */
    cellStartedEdit: boolean;
    /** callback to tell grid a key was pressed - useful to pass control key events (tab,
     *  arrows etc) back to grid - however you do */
    onKeyDown: (event: KeyboardEvent) => void;
    /** Callback to tell grid to stop editing the current cell. Call with input parameter
     * true to prevent focus from moving to the next cell after editing stops in case the
     * grid property `enterNavigatesVerticallyAfterEdit=true` */
    stopEditing: (suppressNavigateAfterEdit?: boolean) => void;
    /** A reference to the DOM element representing the grid cell that your component
     *  will live inside. Useful if you want to add event listeners or classes at this level.
     *  This is the DOM element that gets browser focus when selecting cells. */
    eGridCell: HTMLElement;
    /** Utility function to parse a value using the column's `colDef.valueParser` */
    parseValue: (value: string) => TValue | null | undefined;
    /** Utility function to format a value using the column's `colDef.valueFormatter` */
    formatValue: (value: TValue | null | undefined) => string;
}

export interface ICellEditorComp<TData = any, TValue = any, TContext = any>
    extends ICellEditor<TValue>,
        IPopupComponent<ICellEditorParams<TData, TValue, TContext>> {}

/** This is only used internally within the grid */
export interface DefaultProvidedCellEditorParams {
    suppressPreventDefault?: boolean;
}

export interface GetCellEditorInstancesParams<TData = any> extends GetCellsParams<TData> {}
