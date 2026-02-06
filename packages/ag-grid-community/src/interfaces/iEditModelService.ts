import type { ICellEditor } from './iCellEditor';
import type { Column } from './iColumn';
import type { EditPosition } from './iEditService';
import type { IRowNode } from './iRowNode';

export type EditState = 'editing' | 'changed';

export type EditValidation = {
    errorMessages: string[];
};

export type EditValue = {
    editorValue: any;
    pendingValue: any;
    sourceValue: any;
    state: EditState;
    editorState: {
        cellStartedEditing?: boolean;
        cellStoppedEditing?: boolean;
        isCancelAfterEnd?: ReturnType<NonNullable<ICellEditor['isCancelAfterEnd']>>;
        isCancelBeforeStart?: ReturnType<NonNullable<ICellEditor['isCancelBeforeStart']>>;
    };
};

export type EditPositionValue = Required<EditPosition> & EditValue;

export type EditRow<C = Column, V = EditValue> = Map<C, V>;
export type EditMap = Map<IRowNode, Map<Column, EditValue>>;

export type EditValidationMap = Map<IRowNode, Map<Column, EditValidation>>;
export type EditRowValidationMap = Map<IRowNode, EditValidation>;

export type GetEditsParams = {
    checkSiblings?: boolean;
    includeParents?: boolean;
    withOpenEditor?: boolean;
};
