import type { BeanName } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent, CommonCellFocusParams } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { CellIdPositions } from '../editModelService';
import { _resolveRowController } from '../utils/controllers';
import { _setupEditor } from '../utils/editors';
import { BaseEditStrategy } from './baseEditStrategy';

export class FullRowEditStrategy extends BaseEditStrategy {
    override beanName = 'fullRow' as BeanName | undefined;
    private rowNode?: IRowNode | null;

    protected override updateRowStyle(rowCtrl?: RowCtrl | null, newState?: boolean, batchEdit?: boolean): void {
        rowCtrl?.forEachGui(undefined, (gui) => {
            gui.rowComp.toggleCss('ag-row-editing', newState ?? false);
            gui.rowComp.toggleCss('ag-row-batch-edit', (newState && batchEdit) ?? false);
        });
    }

    public override isCellEditable(
        _rowNode: IRowNode<any>,
        _column: AgColumn<any>,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        const editable = super.isCellEditable(_rowNode, _column, source);

        if (editable === true || source === 'ui') {
            return editable;
        }

        // check if other cells in row are editable, so starting edit on uneditable cell will still work
        const columns = this.beans.colModel.getCols();
        return columns.some((col) => super.isCellEditable(_rowNode, col, source));
    }

    public override shouldStopEditing(
        rowNode?: IRowNode | undefined,
        _column?: Column | undefined,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const oldRowCtrl = _resolveRowController(this.beans, {
            rowNode: this.rowNode,
        });

        if (!oldRowCtrl) {
            return true;
        }

        const res = super.shouldStopEditing(this.rowNode, undefined, key, event, _source);
        if (res !== null) {
            return res;
        }

        if (!this.rowNode) {
            return false;
        }

        // stop editing if we've changed rows
        return rowNode !== this.rowNode;
    }

    public override shouldAcceptMidBatchInteractions(
        rowNode: IRowNode | undefined,
        _column: Column | undefined
    ): boolean {
        if (!rowNode) {
            return false;
        }

        return this.editModel.hasPending(rowNode);
    }

    public clearPendingEditors(rowNode?: IRowNode, _column?: Column): void {
        this.editModel.clearPendingValue(rowNode, undefined);
    }

    public override startEditing(
        rowNode: IRowNode,
        column?: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui',
        silent?: boolean
    ): boolean {
        if (this.rowNode !== rowNode) {
            super.cleanupEditors();
        }

        if (!this.editModel.hasPending(rowNode) && !silent) {
            this.dispatchRowEvent(rowNode, 'rowEditingStarted');
        }

        const columns = this.beans.colModel.getCols();
        const cells: CellIdPositions[] = [];

        columns.forEach((rowColumn) => {
            if (!rowColumn.isCellEditable(rowNode)) {
                return;
            }
            const position: CellIdPositions = {
                rowNode,
                column: rowColumn,
            };
            cells.push(position);

            if (!this.editModel.hasPending(rowNode, rowColumn)) {
                this.editModel.startEditing(rowNode, rowColumn);
                if (!silent) {
                    this.dispatchCellEvent(rowNode, rowColumn, event, 'cellEditingStarted');
                }
            }
        });

        this.rowNode = rowNode;

        return this.setupEditors(cells, rowNode, column, key, true, event);
    }

    public override stopEditing(): boolean {
        if (!this.editModel.hasPending(this.rowNode)) {
            return false;
        }

        super.stopEditing();

        this.rowNode = undefined;

        return true;
    }

    public override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { rowIndex } = event;
        const previous = (event as any)['previousParams']! as CommonCellFocusParams;

        if (previous?.rowIndex === rowIndex || event.sourceEvent instanceof KeyboardEvent) {
            return;
        }

        super.onCellFocusChanged(event);
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        const previousPos = previousCell.cellPosition;

        // find the next cell to start editing
        const nextCell = this.beans.navigation?.findNextCellToFocusOn(previousPos, backwards, true) as CellCtrl | false;
        if (nextCell === false) {
            return null;
        }
        if (nextCell == null) {
            return false;
        }

        const nextPos = nextCell.cellPosition;

        const previousEditable = previousCell.isCellEditable();
        const nextEditable = nextCell.isCellEditable();

        const rowsMatch =
            nextPos && previousPos.rowIndex === nextPos.rowIndex && previousPos.rowPinned === nextPos.rowPinned;

        if (previousEditable) {
            this.setFocusOutOnEditor(previousCell);
        }

        if (!rowsMatch) {
            this.beans.editSvc?.startEditing(nextCell.rowNode, nextCell.column, null, true, event, source);
        }

        if (nextEditable) {
            if (!nextCell.comp?.getCellEditor()) {
                // editor missing because it was outside the viewport during creating phase, attempt to create it now
                _setupEditor(this.beans, nextCell.rowNode, nextCell.column, undefined, true);
            }
            this.setFocusInOnEditor(nextCell);
            nextCell.focusCell(false, event);
        } else {
            nextCell.focusCell(true, event);
        }

        return true;
    }

    public override destroy(): void {
        super.destroy();
        this.rowNode = undefined;
    }
}
