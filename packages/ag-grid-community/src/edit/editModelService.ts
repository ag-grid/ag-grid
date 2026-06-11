import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { Column } from '../interfaces/iColumn';
import type {
    EditMap,
    EditPositionValue,
    EditRow,
    EditRowValidationMap,
    EditState,
    EditValidation,
    EditValidationMap,
    EditValue,
    GetEditsParams,
} from '../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import { UNEDITED } from './utils/editors';

export class EditModelService extends BeanStub implements NamedBean {
    public beanName = 'editModelSvc' as const;

    private readonly edits: EditMap = new Map();
    private cellValidations: EditCellValidationModel = new EditCellValidationModel();
    private rowValidations: EditRowValidationModel = new EditRowValidationModel();

    // during some operations, we want to always return false from `hasEdits`
    private suspendEdits = false;

    public suspend(suspend: boolean): void {
        this.suspendEdits = suspend;
    }

    public removeEdits({ rowNode, column }: EditPosition): void {
        if (!this.hasEdits({ rowNode }) || !rowNode) {
            return;
        }

        const editRow = this.getEditRow(rowNode)!;

        if (column) {
            editRow.delete(column);
        } else {
            editRow.clear();
        }

        if (editRow.size === 0) {
            this.edits.delete(rowNode);
        }
    }

    public getEditRow(rowNode: IRowNode, params: GetEditsParams = {}): EditRow | undefined {
        if (this.suspendEdits) {
            return undefined;
        }

        if (this.edits.size === 0) {
            return undefined;
        }

        const edits = rowNode && this.edits.get(rowNode);

        if (edits) {
            return edits;
        }

        if (params.checkSiblings) {
            const pinnedSibling = (rowNode as RowNode).pinnedSibling;
            if (pinnedSibling) {
                return this.getEditRow(pinnedSibling);
            }
        }

        return undefined;
    }

    public getEditRowDataValue(rowNode: IRowNode, { checkSiblings }: GetEditsParams = {}): any {
        if (!rowNode || this.edits.size === 0) {
            return undefined;
        }

        // don't check siblings via getEditRow parameter, as we want to combine edits from the row and its siblings
        const editRow = this.getEditRow(rowNode);
        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        const siblingRow = checkSiblings && pinnedSibling && this.getEditRow(pinnedSibling);

        if (!editRow && !siblingRow) {
            return undefined;
        }

        const data: any = { ...rowNode.data };

        const applyEdits = (edits: EditRow, data: any) =>
            edits.forEach(({ editorValue, pendingValue }, column) => {
                const value = editorValue === undefined ? pendingValue : editorValue;
                if (value !== UNEDITED) {
                    data[column.getColId()] = value;
                }
            });

        if (editRow) {
            applyEdits(editRow, data);
        }

        if (siblingRow) {
            applyEdits(siblingRow, data);
        }

        return data;
    }

    public getEdit(position: EditPosition = {}, params?: GetEditsParams): EditValue | undefined {
        const { rowNode, column } = position;
        const edits = this.edits;
        if (this.suspendEdits || edits.size === 0 || !rowNode || !column) {
            return undefined; // no edits or incomplete position
        }

        // Check the row's edits first
        const edit = edits.get(rowNode)?.get(column);
        if (edit) {
            return edit; // found edit for the cell
        }

        // If checkSiblings, also check the pinned sibling for the column
        if (params?.checkSiblings) {
            const pinnedSibling = (rowNode as RowNode).pinnedSibling;
            if (pinnedSibling) {
                return edits.get(pinnedSibling)?.get(column); // return edit from pinned sibling if found
            }
        }

        return undefined;
    }

    public getEditMap(copy = true): EditMap {
        if (this.suspendEdits || this.edits.size === 0) {
            return new Map();
        }

        if (!copy) {
            return this.edits;
        }

        const map = new Map<IRowNode, Map<Column, EditValue>>();
        this.edits.forEach((editRow, rowNode) => {
            const newEditRow = new Map<Column, EditValue>();
            editRow.forEach(({ editorState: _, ...cellData }, column) =>
                // Ensure we copy the cell data to avoid reference issues
                newEditRow.set(column, { ...cellData } as EditValue)
            );
            map.set(rowNode, newEditRow);
        });
        return map;
    }

    public setEditMap(newEdits: EditMap): void {
        this.edits.clear();
        newEdits.forEach((editRow, rowNode) => {
            const newRow = new Map<Column, EditValue>();
            editRow.forEach((cellData, column) =>
                // Ensure we copy the cell data to avoid reference issues
                newRow.set(column, { ...cellData })
            );
            this.edits.set(rowNode, newRow);
        });
    }

    public setEdit(position: Required<EditPosition>, edit: Partial<EditValue>): Readonly<EditValue> {
        const edits = this.edits;
        if (edits.size === 0 || !edits.has(position.rowNode)) {
            edits.set(position.rowNode, new Map());
        }

        const currentEdit = this.getEdit(position);

        const updatedEdit: EditValue = {
            editorState: {
                isCancelAfterEnd: undefined,
                isCancelBeforeStart: undefined,
            },
            ...currentEdit,
            ...edit,
        } as EditValue;

        this.getEditRow(position.rowNode)!.set(position.column, updatedEdit);

        return updatedEdit;
    }

    public clearEditValue(position: EditPosition): void {
        const { rowNode, column } = position;
        if (!rowNode) {
            return; // no row specified, cannot clear
        }

        const update = (edit: EditValue) => {
            edit.editorValue = undefined;
            edit.pendingValue = edit.sourceValue;
            // Reverting to sourceValue is always 'changed' (i.e. "no longer editing").
            // The value matches source so _sourceAndPendingDiffer will return false and nothing commits.
            edit.state = 'changed';
        };

        if (!column) {
            this.getEditRow(rowNode)?.forEach(update); // clear all columns in the row
            return;
        }

        const edit = this.getEdit(position);
        if (edit) {
            update(edit); // clear specific cell
        }
    }

    public getState(position: EditPosition): EditState | undefined {
        if (this.suspendEdits) {
            return undefined;
        }

        return this.getEdit(position)?.state;
    }

    public getEditPositions(editMap?: EditMap): EditPositionValue[] {
        if (this.suspendEdits || (editMap ?? this.edits).size === 0) {
            return [];
        }

        const positions: EditPositionValue[] = [];
        (editMap ?? this.edits).forEach((editRow, rowNode) => {
            for (const column of editRow.keys()) {
                const { editorState: _, ...rest } = editRow.get(column)!;
                positions.push({
                    rowNode,
                    column,
                    ...rest,
                } as EditPositionValue);
            }
        });

        return positions;
    }

    public hasRowEdits(rowNode: IRowNode, params?: GetEditsParams): boolean {
        if (this.suspendEdits) {
            return false;
        }

        if (this.edits.size === 0) {
            return false;
        }

        const rowEdits = this.getEditRow(rowNode, params);
        return !!rowEdits;
    }

    public hasEdits(position: EditPosition = {}, params: GetEditsParams = {}): boolean {
        if (this.suspendEdits) {
            return false;
        }

        if (this.edits.size === 0) {
            return false;
        }

        const { rowNode, column } = position;
        const { withOpenEditor } = params;
        if (rowNode) {
            const rowEdits = this.getEditRow(rowNode, params);
            if (!rowEdits) {
                return false;
            }

            if (column) {
                if (withOpenEditor) {
                    return this.getEdit(position)?.state === 'editing';
                }
                return rowEdits.has(column);
            }

            if (rowEdits.size !== 0) {
                if (withOpenEditor) {
                    return Array.from(rowEdits.values()).some(({ state }) => state === 'editing');
                }
                return true;
            }

            return false;
        }

        if (withOpenEditor) {
            return this.getEditPositions().some(({ state }: any) => state === 'editing');
        }

        return this.edits.size > 0;
    }

    public start(position: Required<EditPosition>): void {
        const map = this.getEditRow(position.rowNode) ?? new Map<Column, EditValue>();
        const { rowNode, column } = position;
        if (column && !map.has(column)) {
            map.set(column, {
                editorValue: undefined,
                pendingValue: UNEDITED,
                sourceValue: this.beans.valueSvc.getValueFromData(column as AgColumn, rowNode),
                state: 'editing',
                editorState: {
                    isCancelAfterEnd: undefined,
                    isCancelBeforeStart: undefined,
                },
            });
        }
        this.edits.set(rowNode, map);
    }

    public stop(position: Required<EditPosition>, preserveBatch: boolean, cancel: boolean): void {
        if (!this.hasEdits(position)) {
            return;
        }

        if (preserveBatch) {
            // Keep edits that were actually changed; remove unchanged ones.
            const edit = this.getEditRow(position.rowNode)?.get(position.column);
            if (edit && (edit.pendingValue === UNEDITED || edit.pendingValue === edit.sourceValue)) {
                this.removeEdits(position);
            } else if (edit && cancel) {
                // Clear the transient editorValue so the cell renderer shows pendingValue.
                // No event dispatch is needed here — editorValue is an internal field only
                // consumed while an editor is open, and the editor has already been destroyed
                // by the caller (_destroyEditor dispatched cellEditingStopped). The visible
                // pendingValue is preserved and any UI refresh is handled by the caller's
                // bulkRefresh call afterward.
                edit.editorValue = undefined;
            }
        } else {
            this.removeEdits(position);
        }
    }

    public clear(): void {
        for (const pendingRowEdits of this.edits.values()) {
            pendingRowEdits.clear();
        }
        this.edits.clear();
    }

    public getCellValidationModel(): EditCellValidationModel {
        return this.cellValidations;
    }

    public getRowValidationModel(): EditRowValidationModel {
        return this.rowValidations;
    }

    public setCellValidationModel(model: EditCellValidationModel): void {
        this.cellValidations = model;
    }

    public setRowValidationModel(model: EditRowValidationModel): void {
        this.rowValidations = model;
    }

    public override destroy(): void {
        super.destroy();
        this.clear();
    }
}

export class EditCellValidationModel {
    private cellValidations: EditValidationMap = new Map();

    public getCellValidation(position?: EditPosition): EditValidation | undefined {
        const { rowNode, column } = position || {};
        return this.cellValidations?.get(rowNode!)?.get(column!);
    }

    public hasCellValidation(position?: EditPosition): boolean {
        if (!position?.rowNode || !position.column) {
            return this.cellValidations.size > 0;
        }
        return !!this.getCellValidation(position);
    }

    public setCellValidation(position: Required<EditPosition>, validation: EditValidation): void {
        const { rowNode, column } = position;
        if (!this.cellValidations.has(rowNode)) {
            this.cellValidations.set(rowNode, new Map());
        }
        this.cellValidations.get(rowNode)!.set(column, validation);
    }

    public clearCellValidation(position: Required<EditPosition>): void {
        const { rowNode, column } = position;
        this.cellValidations.get(rowNode)?.delete(column);
    }

    public setCellValidationMap(validationMap: EditValidationMap): void {
        this.cellValidations = validationMap;
    }

    public getCellValidationMap(): EditValidationMap {
        return this.cellValidations;
    }

    public clearCellValidationMap(): void {
        this.cellValidations.clear();
    }
}
export class EditRowValidationModel {
    private rowValidations: EditRowValidationMap = new Map();

    public getRowValidation(position?: EditRowPosition): EditValidation | undefined {
        const { rowNode } = position || {};
        return this.rowValidations.get(rowNode!);
    }

    public hasRowValidation(position?: EditRowPosition): boolean {
        if (!position?.rowNode) {
            return this.rowValidations.size > 0;
        }
        return !!this.getRowValidation(position);
    }

    public setRowValidation({ rowNode }: Required<EditRowPosition>, rowValidation: EditValidation): void {
        this.rowValidations.set(rowNode, rowValidation);
    }

    public clearRowValidation({ rowNode }: Required<EditRowPosition>): void {
        this.rowValidations.delete(rowNode);
    }

    public setRowValidationMap(validationMap: EditRowValidationMap): void {
        this.rowValidations = validationMap;
    }
    public getRowValidationMap(): EditRowValidationMap {
        return this.rowValidations;
    }
    public clearRowValidationMap(): void {
        this.rowValidations.clear();
    }
}
