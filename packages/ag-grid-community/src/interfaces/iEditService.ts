import type { Column } from './iColumn';
import type { IRowNode } from './iRowNode';

export type EditInputEvents = KeyboardEvent | MouseEvent | null | undefined;

export type EditNavOnValidationResult = 'block-stop' | 'revert-continue' | 'continue';

export type EditSource = 'api' | 'ui' | 'paste' | 'rangeSvc' | 'fillHandle' | 'cellClear' | 'edit' | 'bulk';

/**
 * How to resolve a cell's raw value when edits are pending.
 * - `'edit'`: the current editing value, including live editor typing and pending batch values (the default).
 * - `'batch'`: pending batch values but excluding live editor typing (useful for dependent valueGetters).
 * - `'data'`: the stored data value, ignoring all edit state.
 */
export type CellValueResolveFrom = 'edit' | 'batch' | 'data';

export interface StartEditWithPositionParams extends StartEditParams {
    position: Required<EditPosition>;
}

export type StartEditParams = {
    startedEdit?: boolean | null;
    event?: EditInputEvents;
    source?: EditSource;
    ignoreEventKey?: boolean;
    silent?: boolean;
    continueEditing?: boolean;
    /** If true, skip checking if the cell is editable by invoking the editable user callback */
    editable?: boolean;
};

export type StopEditParams = {
    event?: EditInputEvents;
    cancel?: boolean;
    commit?: boolean;
    source?: EditSource;
    forceStop?: boolean;
    forceCancel?: boolean;
    suppressNavigateAfterEdit?: boolean;
};

export type IsEditingParams = {
    checkSiblings?: boolean;
    withOpenEditor?: boolean;
};

export type EditRowPosition = {
    rowNode?: IRowNode;
};

export interface EditPosition extends EditRowPosition {
    column?: Column;
}
export interface _SetEditingCellsParams {
    /** Update existing cells, omit or set `false` to replace currently editing cells. */
    update?: boolean;

    /** Force the cells that are being marked as edited to be refreshed and only these cells not others */
    forceRefreshOfEditCellsOnly?: boolean;
}
