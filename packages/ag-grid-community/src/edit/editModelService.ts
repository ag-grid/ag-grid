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
    ReadonlyEditMap,
} from '../interfaces/iEditModelService';
import type { EditPosition, EditRowPosition } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import { UNEDITED } from './utils/editors';

export class EditModelService extends BeanStub implements NamedBean {
    public beanName = 'editModelSvc' as const;

    private readonly edits: EditMap = new Map();
    // O(1) count of 'editing'-state edits so hasOpenEditors avoids scanning the map (`state` is the truth).
    private editingCount = 0;
    private cellValidations: EditCellValidationModel = new EditCellValidationModel();
    private rowValidations: EditRowValidationModel = new EditRowValidationModel();

    // during some operations, we want to always return false from `hasEdits`
    private suspendEdits = false;

    public suspend(suspend: boolean): void {
        this.suspendEdits = suspend;
    }

    public hasOpenEditors(): boolean {
        return this.editingCount > 0;
    }

    public removeEdits({ rowNode, column }: EditPosition): void {
        if (!this.hasEdits({ rowNode }) || !rowNode) {
            return;
        }

        const editRow = this.getEditRow(rowNode)!;

        if (column) {
            if (editRow.get(column)?.state === 'editing') {
                this.editingCount--;
            }
            editRow.delete(column);
        } else {
            editRow.forEach((edit) => {
                if (edit.state === 'editing') {
                    this.editingCount--;
                }
            });
            editRow.clear();
        }

        if (editRow.size === 0) {
            this.edits.delete(rowNode);
        }
    }

    public getEditRow(rowNode: IRowNode, checkSiblings?: boolean): EditRow | undefined {
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

        if (checkSiblings) {
            const pinnedSibling = (rowNode as RowNode).pinnedSibling;
            if (pinnedSibling) {
                return this.getEditRow(pinnedSibling);
            }
        }

        return undefined;
    }

    public getEditRowDataValue(rowNode: IRowNode): any {
        if (!rowNode || this.edits.size === 0) {
            return undefined;
        }

        // Merge the row AND its pinned sibling, so we can't use getEditRow's checkSiblings (returns one or the other).
        const editRow = this.getEditRow(rowNode);
        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        const siblingRow = pinnedSibling ? this.getEditRow(pinnedSibling) : undefined;

        if (!editRow && !siblingRow) {
            return undefined;
        }

        const data: any = { ...rowNode.data };
        if (editRow) {
            applyEditsToData(editRow, data);
        }
        if (siblingRow) {
            applyEditsToData(siblingRow, data);
        }

        return data;
    }

    public getEdit(position: EditPosition = {}): EditValue | undefined {
        return this.getCellEdit(position.rowNode, position.column);
    }

    /** Direct single-cell lookup — allocation-free, no pinned-sibling fallback (see {@link getCellEditWithSibling}). */
    public getCellEdit(rowNode: IRowNode | null | undefined, column: Column | null | undefined): EditValue | undefined {
        const edits = this.edits;
        if (edits.size === 0 || this.suspendEdits || !rowNode || !column) {
            return undefined; // no edits or incomplete position
        }
        return edits.get(rowNode)?.get(column);
    }

    /** Single-cell lookup that falls back to the pinned sibling, since pinned rows mirror their sibling's edits. */
    public getCellEditWithSibling(
        rowNode: IRowNode | null | undefined,
        column: Column | null | undefined
    ): EditValue | undefined {
        return this.getCellEdit(rowNode, column) ?? this.getCellEdit((rowNode as RowNode)?.pinnedSibling, column);
    }

    /** The live edit map, or null while edits are suspended. Read-only: mutating it would break editingCount. */
    public getEditMap(): ReadonlyEditMap | null {
        return this.suspendEdits ? null : this.edits;
    }

    /** A deep copy of the edit map — a mutable snapshot, safe to hold and mutate across model changes. */
    public getEditMapCopy(): EditMap {
        const map: EditMap = new Map();
        if (this.suspendEdits) {
            return map;
        }
        this.edits.forEach((editRow, rowNode) => {
            const newEditRow = new Map<Column, EditValue>();
            editRow.forEach(({ editorState: _, ...cellData }, column) =>
                // Copy the cell data so the snapshot is decoupled from the live model.
                newEditRow.set(column, { ...cellData } as EditValue)
            );
            map.set(rowNode, newEditRow);
        });
        return map;
    }

    public setEditMap(newEdits: ReadonlyEditMap): void {
        // newEdits may alias this.edits (getEditMap returns it), so build the copy before clearing.
        const rebuilt = new Map<IRowNode, Map<Column, EditValue>>();
        let editingCount = 0;
        newEdits.forEach((editRow, rowNode) => {
            const newRow = new Map<Column, EditValue>();
            editRow.forEach((cellData, column) => {
                if (cellData.state === 'editing') {
                    editingCount++;
                }
                newRow.set(column, { ...cellData });
            });
            rebuilt.set(rowNode, newRow);
        });

        const edits = this.edits;
        edits.clear();
        rebuilt.forEach((row, rowNode) => edits.set(rowNode, row));
        this.editingCount = editingCount;
    }

    public setEdit(position: Required<EditPosition>, edit: Partial<EditValue>): Readonly<EditValue> {
        const { rowNode, column } = position;
        const edits = this.edits;
        let editRow = edits.get(rowNode);
        if (!editRow) {
            editRow = new Map<Column, EditValue>();
            edits.set(rowNode, editRow);
        }

        // Matches getEdit's suspend semantics: while suspended there is no current edit to merge onto.
        const existing = editRow.get(column);
        const currentEdit = this.suspendEdits ? undefined : existing;

        const updatedEdit: EditValue = {
            editorState: {
                isCancelAfterEnd: undefined,
                isCancelBeforeStart: undefined,
            },
            ...currentEdit,
            ...edit,
        } as EditValue;

        // Track the 'editing' population from the actual stored state before/after the write.
        const wasEditing = existing?.state === 'editing';
        const nowEditing = updatedEdit.state === 'editing';
        if (wasEditing !== nowEditing) {
            this.editingCount += nowEditing ? 1 : -1;
        }

        editRow.set(column, updatedEdit);

        return updatedEdit;
    }

    public clearEditValue(position: EditPosition): void {
        const { rowNode, column } = position;
        if (!rowNode) {
            return; // no row specified, cannot clear
        }

        const update = (edit: EditValue) => {
            if (edit.state === 'editing') {
                this.editingCount--;
            }
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

    public hasRowEdits(rowNode: IRowNode, checkSiblings?: boolean): boolean {
        if (this.suspendEdits) {
            return false;
        }

        if (this.edits.size === 0) {
            return false;
        }

        const rowEdits = this.getEditRow(rowNode, checkSiblings);
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
            const rowEdits = this.getEditRow(rowNode, params.checkSiblings);
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
            return this.hasOpenEditors();
        }

        return this.edits.size > 0;
    }

    public start(position: Required<EditPosition>): void {
        const { rowNode, column } = position;
        // Read the live row directly (not via getEditRow, which returns undefined while suspended):
        // replacing an existing row here would drop its editing entries without adjusting editingCount.
        let map = this.edits.get(rowNode);
        if (!map) {
            map = new Map<Column, EditValue>();
            this.edits.set(rowNode, map);
        }
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
            this.editingCount++;
        }
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
        this.editingCount = 0;
    }

    /**
     * Side-effect-free "is anything invalid?". Scope follows the position: omitted means the whole grid,
     * a rowNode without a column means that row. Callers that must not repopulate/refresh use this.
     */
    public hasValidationErrors(position?: EditPosition): boolean {
        return this.rowValidations.hasRowValidation(position) || this.cellValidations.hasCellValidation(position);
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

    /** Scope follows the position: no rowNode means the whole grid, a rowNode without a column means that row. */
    public hasCellValidation(position?: EditPosition): boolean {
        const rowNode = position?.rowNode;
        if (!rowNode) {
            return this.cellValidations.size > 0;
        }
        return position.column ? !!this.getCellValidation(position) : this.cellValidations.has(rowNode);
    }

    public setCellValidation(position: Required<EditPosition>, validation: EditValidation): void {
        const { rowNode, column } = position;
        if (!this.cellValidations.has(rowNode)) {
            this.cellValidations.set(rowNode, new Map());
        }
        // validators may reuse and mutate their array; retain the historical result used for change detection.
        this.cellValidations.get(rowNode)!.set(column, { errorMessages: [...validation.errorMessages] });
    }

    public clearCellValidation(position: Required<EditPosition>): void {
        const { rowNode, column } = position;
        const cellValidations = this.cellValidations;
        const rowValidations = cellValidations.get(rowNode);
        if (rowValidations) {
            rowValidations.delete(column);
            if (rowValidations.size === 0) {
                // Drop the emptied row so cellValidations.size stays an accurate "has any error" signal.
                cellValidations.delete(rowNode);
            }
        }
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
        // Validators may reuse and mutate their array; retain the historical result used for change detection.
        this.rowValidations.set(rowNode, { errorMessages: [...rowValidation.errorMessages] });
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

/** Merges a row's pending/editor values into a plain data object, skipping UNEDITED cells. */
const applyEditsToData = (edits: EditRow, data: any): void => {
    edits.forEach(({ editorValue, pendingValue }, column) => {
        const value = editorValue === undefined ? pendingValue : editorValue;
        if (value !== UNEDITED) {
            data[column.getColId()] = value;
        }
    });
};
