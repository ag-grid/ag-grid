import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { GridOptionsService } from '../gridOptionsService';
import type { IRowNode } from '../interfaces/iRowNode';
export declare function _isEventFromPrintableCharacter(event: KeyboardEvent): boolean;
/**
 * Allows user to tell the grid to skip specific keyboard events
 * @param {GridOptionsService} gos
 * @param {KeyboardEvent} keyboardEvent
 * @param {IRowNode} rowNode
 * @param {Column} column
 * @param {boolean} editing
 * @returns {boolean}
 */
export declare function _isUserSuppressingKeyboardEvent(gos: GridOptionsService, keyboardEvent: KeyboardEvent, rowNode: IRowNode, column: AgColumn, editing: boolean): boolean;
export declare function _isUserSuppressingHeaderKeyboardEvent(gos: GridOptionsService, keyboardEvent: KeyboardEvent, headerRowIndex: number, column: AgColumn | AgColumnGroup): boolean;
export declare function _normaliseQwertyAzerty(keyboardEvent: KeyboardEvent): string;
export declare function _isDeleteKey(key: string, alwaysReturnFalseOnBackspace?: boolean): boolean;
