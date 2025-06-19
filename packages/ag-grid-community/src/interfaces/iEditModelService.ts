import type { Column } from './iColumn';
import type { EditPosition, EditRowPosition } from './iEditService';
import type { IRowNode } from './iRowNode';

export type EditState = 'editing' | 'changed';

export type EditValidation = {
    errorMessages?: string[];
};

export type EditValue = {
    newValue: any;
    oldValue: any;
    state: EditState;
} & EditValidation;

export type EditRow<C = Column, V = EditValue> = Map<C, V>;
export type EditMap<R = IRowNode, C = Column, V = EditValue> = Map<R, EditRow<C, V>>;

export type GetEditsParams = {
    checkSiblings?: boolean;
    includeParents?: boolean;
    withOpenEditor?: boolean;
};

export interface IEditModelService {
    removeEdits({ rowNode, column }: EditPosition): void;

    getEdit(position: EditPosition): EditValue | undefined;
    getEditPositions(): Required<EditPosition>[];
    getEditRow({ rowNode }: EditRowPosition, params?: GetEditsParams): EditRow | undefined;
    getEditRowDataValue({ rowNode }: Required<EditRowPosition>, params?: GetEditsParams): any;
    getEditMap(copy?: boolean): EditMap;

    setEdit(position: Required<EditPosition>, edit: EditValue): void;
    setEditMap(edits: EditMap): void;
    setState(position: EditPosition, state: EditState): void;

    clearEditValue(position: EditPosition): void;
    clear(): void;

    getState(position: EditPosition): EditState | undefined;

    hasRowEdits({ rowNode }: Required<EditRowPosition>, params?: GetEditsParams): boolean;
    hasEdits(position?: EditPosition, params?: GetEditsParams): boolean;

    start(position: Required<EditPosition>): void;
    stop(position?: Required<EditPosition>): void;

    setErrors(position: Required<EditPosition>, errors: string[]): void;
    clearErrors(position: Required<EditPosition>): void;
    getErrors(position: EditPosition): string[] | undefined;
}
