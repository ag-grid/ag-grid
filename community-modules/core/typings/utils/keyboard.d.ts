import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
export declare function isKeyPressed(event: KeyboardEvent, keyToCheck: number): boolean;
export declare function isEventFromPrintableCharacter(event: KeyboardEvent): boolean;
/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsWrapper} gridOptionsWrapper
 * @param {KeyboardEvent} keyboardEvent
 * @param {RowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export declare function isUserSuppressingKeyboardEvent(gridOptionsWrapper: GridOptionsWrapper, keyboardEvent: KeyboardEvent, rowNode: RowNode, column: Column, editing: boolean): boolean;
export declare function isUserSuppressingHeaderKeyboardEvent(gridOptionsWrapper: GridOptionsWrapper, keyboardEvent: KeyboardEvent, headerRowIndex: number, column: Column | ColumnGroup): boolean;
