import type { RowPosition } from './iRowPosition';

export interface CellPendingPosition extends RowPosition {
    /** Column key */
    colKey: string;

    /** New pending value */
    newValue?: any;

    /** Existing value, used only when retrieving current editing state */
    oldValue?: any;
}
