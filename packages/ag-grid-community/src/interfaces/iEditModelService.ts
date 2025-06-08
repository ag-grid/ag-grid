import type { Column } from './iColumn';
import type { EditPosition, EditRowPosition } from './iEditService';
import type { IRowNode } from './iRowNode';

export type EditState = 'editing' | 'changed';

export type EditValue = {
    newValue: any;
    oldValue: any;
    state: EditState;
};

export type EditRow = Map<Column, EditValue>;
export type EditMap = Map<IRowNode, EditRow>;

export type HasEditsParams = {
    checkSiblings?: boolean;
    includeParents?: boolean;
    withOpenEditor?: boolean;
};

export interface IEditModelService {
    removeEdits({ rowNode, column }: EditPosition): void;

    getEdit(position: EditPosition): EditValue | undefined;
    getEditPositions(): Required<EditPosition>[];
    getEditRow({ rowNode }: EditRowPosition): EditRow | undefined;
    getEditSiblingRow({ rowNode }: Required<EditRowPosition>): IRowNode | undefined;
    getEditMap(copy?: boolean): EditMap;

    setEdit(position: Required<EditPosition>, edit: EditValue): void;
    setEditMap(edits: EditMap): void;
    setState(position: EditPosition, state: EditState): void;

    clearEditValue(position: EditPosition): void;
    clear(): void;

    getState(position: EditPosition): EditState | undefined;

    hasRowEdits({ rowNode }: Required<EditRowPosition>): boolean;
    hasEdits(position?: EditPosition, params?: HasEditsParams): boolean;

    start(position: Required<EditPosition>): void;
    stop(position?: Required<EditPosition>): void;
}
