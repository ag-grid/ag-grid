import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { Column } from '../interfaces/iColumn';
import type {
    EditMap,
    EditRow,
    EditState,
    EditValue,
    GetEditsParams,
    IEditModelService,
} from '../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import { UNEDITED } from './utils/editors';

export class EditModelService extends BeanStub implements NamedBean, IEditModelService {
    beanName = 'editModelSvc' as const;

    private edits: EditMap = new Map();

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
        return position.column && this.getEditRow(position)?.get(position.column);
    }

    public getEditMap(copy = true): EditMap {
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
        return this.getEdit(position)?.state;
    }

    public getEditPositions(): Required<EditPosition>[] {
        const positions: Required<EditPosition>[] = [];
        this.edits.forEach((editRow, rowNode) => {
            for (const column of editRow.keys()) {
                positions.push({
                    rowNode,
                    column,
                    ...editRow.get(column),
                });
            }
        });

        return positions;
    }

    public hasRowEdits({ rowNode }: Required<EditRowPosition>, params?: GetEditsParams): boolean {
        const rowEdits = this.getEditRow({ rowNode }, params);
        return !!rowEdits;
    }

    public hasEdits(position: EditPosition = {}, params: GetEditsParams = {}): boolean {
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

    public setErrors(position: Required<EditPosition>, errorMessages: string[]) {
        const edit = this.getEdit(position);
        if (edit) {
            edit.errorMessages = errorMessages;
        }
    }

    public clearErrors(position: Required<EditPosition>): void {
        const edit = this.getEdit(position);
        if (edit) {
            edit.errorMessages = undefined;
        }
    }

    public getErrors(position: Required<EditPosition>): string[] | undefined {
        return this.getEdit(position)?.errorMessages;
    }

    public override destroy(): void {
        super.destroy();
        this.clear();
    }
}
