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
    IEditCellValidationModel,
    IEditModelService,
    IEditRowValidationModel,
} from '../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import { UNEDITED } from './utils/editors';

export class EditModelService extends BeanStub implements NamedBean, IEditModelService {
    beanName = 'editModelSvc' as const;

    private edits: EditMap = new Map();
    private cellValidations: IEditCellValidationModel = new EditCellValidationModel();
    private rowValidations: IEditRowValidationModel = new EditRowValidationModel();

    // during some operations, we want to always return false from `hasEdits`
    private suspendEdits = false;

    public suspend(suspend: boolean): void {
        this.suspendEdits = suspend;
    }

    public removeEdits({ rowNode, column }: EditPosition): void {
        if (!this.hasEdits({ rowNode }) || !rowNode) {
            return;
        }

        const editRow = this.getEditRow({ rowNode })!;

        if (column) {
            editRow.delete(column);
        } else {
            editRow.clear();
        }

        if (editRow.size === 0) {
            this.edits.delete(rowNode);
        }
    }

    public getEditRow({ rowNode }: EditRowPosition, params: GetEditsParams = {}): EditRow | undefined {
        if (this.suspendEdits) {
            return undefined;
        }

        const edits = rowNode && this.edits.get(rowNode);

        if (edits) {
            return edits;
        }

        if (params.checkSiblings) {
            const pinnedSibling = (rowNode as RowNode).pinnedSibling;
            if (pinnedSibling) {
                return this.getEditRow({ rowNode: pinnedSibling });
            }
        }

        return undefined;
    }

    public getEditRowDataValue({ rowNode }: Required<EditRowPosition>, { checkSiblings }: GetEditsParams = {}): any {
        const editRow = this.getEditRow({ rowNode });
        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        const siblingRow = checkSiblings && pinnedSibling && this.getEditRow({ rowNode: pinnedSibling });

        if (!editRow && !siblingRow) {
            return rowNode.data;
        }

        const data: any = Object.assign({}, rowNode.data);

        const applyEdits = (edits: EditRow, data: any) =>
            edits.forEach(({ newValue }, column) => {
                if (newValue !== UNEDITED) {
                    data[column.getColId()] = newValue;
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

    public getEdit(position: EditPosition): EditValue | undefined {
        if (this.suspendEdits) {
            return undefined;
        }
        return position.column && this.getEditRow(position)?.get(position.column);
    }

    public getEditMap(copy = true): EditMap {
        if (this.suspendEdits) {
            return new Map();
        }

        if (!copy) {
            return this.edits;
        }

        const map = new Map<IRowNode, Map<Column, EditValue>>();
        this.edits.forEach((editRow, rowNode) => map.set(rowNode, new Map<Column, EditValue>(editRow)));
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

    public setEdit(position: Required<EditPosition>, edit: EditValue): void {
        const { rowNode, column } = position;
        !this.edits.has(rowNode) && this.edits.set(rowNode, new Map());

        this.getEditRow(position)!.set(column, edit);
    }

    public clearEditValue(position: EditPosition): void {
        const { rowNode, column } = position;
        if (rowNode) {
            if (column) {
                const edit = this.getEdit(position);
                if (edit) {
                    edit.newValue = edit.oldValue;
                    edit.state = 'changed';
                }
            } else {
                this.getEditRow(position)?.forEach((cellData) => {
                    cellData.newValue = cellData.oldValue;
                    cellData.state = 'changed';
                });
            }
        }
    }

    public setState(position: EditPosition, state: EditState): void {
        if (!position.rowNode || !position.column) {
            return;
        }

        const { rowNode, column } = position;

        let editRow = this.getEditRow(position);

        const edit = editRow?.get(column);
        if (edit) {
            edit.state = state;
        } else {
            if (!editRow) {
                editRow = new Map<Column, EditValue>();
                this.edits.set(rowNode, editRow);
            }
            editRow.set(column, { newValue: undefined, oldValue: undefined, state });
        }
    }

    public getState(position: EditPosition): EditState | undefined {
        if (this.suspendEdits) {
            return undefined;
        }

        return this.getEdit(position)?.state;
    }

    public getEditPositions(editMap?: EditMap): EditPositionValue[] {
        if (this.suspendEdits) {
            return [];
        }

        const positions: EditPositionValue[] = [];
        (editMap ?? this.edits).forEach((editRow, rowNode) => {
            for (const column of editRow.keys()) {
                positions.push({
                    rowNode,
                    column,
                    ...editRow.get(column)!,
                });
            }
        });

        return positions;
    }

    public hasRowEdits({ rowNode }: Required<EditRowPosition>, params?: GetEditsParams): boolean {
        if (this.suspendEdits) {
            return false;
        }

        const rowEdits = this.getEditRow({ rowNode }, params);
        return !!rowEdits;
    }

    public hasEdits(position: EditPosition = {}, params: GetEditsParams = {}): boolean {
        if (this.suspendEdits) {
            return false;
        }

        const { rowNode, column } = position;
        const { withOpenEditor } = params;
        if (rowNode) {
            const rowEdits = this.getEditRow(position, params);
            if (!rowEdits) {
                return false;
            }

            if (column) {
                if (withOpenEditor) {
                    return this.getEdit(position)?.state === 'editing';
                }
                return rowEdits.has(column) ?? false;
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
        const map = this.getEditRow(position) ?? new Map<Column, EditValue>();
        const { rowNode, column } = position;
        if (column && !map.has(column)) {
            map.set(column, {
                newValue: UNEDITED,
                oldValue: this.beans.valueSvc.getValue(column as AgColumn, rowNode, true, 'api'),
                state: 'editing',
            });
        }
        this.edits.set(rowNode, map);
    }

    public stop(position?: Required<EditPosition>): void {
        if (!this.hasEdits(position)) {
            return;
        }

        if (position) {
            this.removeEdits(position);
        } else {
            this.clear();
        }
        return;
    }

    public clear(): void {
        for (const pendingRowEdits of this.edits.values()) {
            pendingRowEdits.clear();
        }
        this.edits.clear();
    }

    public getCellValidationModel(): IEditCellValidationModel {
        return this.cellValidations;
    }

    public getRowValidationModel(): IEditRowValidationModel {
        return this.rowValidations;
    }

    public setCellValidationModel(model: IEditCellValidationModel): void {
        this.cellValidations = model;
    }

    public setRowValidationModel(model: IEditRowValidationModel): void {
        this.rowValidations = model;
    }

    public override destroy(): void {
        super.destroy();
        this.clear();
    }
}

export class EditCellValidationModel implements IEditCellValidationModel {
    private cellValidations: EditValidationMap = new Map();

    public getCellValidation(position?: EditPosition): EditValidation | undefined {
        const { rowNode, column } = position || {};
        return this.cellValidations?.get(rowNode!)?.get(column!);
    }

    public hasCellValidation(position?: EditPosition): boolean {
        if (!position || !position.rowNode || !position.column) {
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

    setCellValidationMap(validationMap: EditValidationMap): void {
        this.cellValidations = validationMap;
    }

    public getCellValidationMap(): EditValidationMap {
        return this.cellValidations;
    }

    clearCellValidationMap(): void {
        this.cellValidations.clear();
    }
}
export class EditRowValidationModel implements IEditRowValidationModel {
    private rowValidations: EditRowValidationMap = new Map();

    public getRowValidation(position?: EditRowPosition): EditValidation | undefined {
        const { rowNode } = position || {};
        return this.rowValidations.get(rowNode!);
    }

    public hasRowValidation(position?: EditRowPosition): boolean {
        if (!position || !position.rowNode) {
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
