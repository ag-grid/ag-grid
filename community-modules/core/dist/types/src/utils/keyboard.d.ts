import { Column } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { GridOptionsService } from '../gridOptionsService';
import { IRowNode } from '../interfaces/iRowNode';
export declare function isEventFromPrintableCharacter(event: KeyboardEvent): boolean;
/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsService} gos
 * @param {KeyboardEvent} keyboardEvent
 * @param {IRowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export declare function isUserSuppressingKeyboardEvent(gos: GridOptionsService, keyboardEvent: KeyboardEvent, rowNode: IRowNode, column: Column, editing: boolean): boolean;
export declare function isUserSuppressingHeaderKeyboardEvent(gos: GridOptionsService, keyboardEvent: KeyboardEvent, headerRowIndex: number, column: Column | ColumnGroup): boolean;
export declare function normaliseQwertyAzerty(keyboardEvent: KeyboardEvent): string;
export declare function isDeleteKey(key: string, alwaysReturnFalseOnBackspace?: boolean): boolean;
