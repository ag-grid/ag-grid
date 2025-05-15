import type { BeanName } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import type { CellFocusedEvent } from '../../events';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { CellIdPositions } from '../editModelService';
import { _resolveControllers, _resolveRowController } from '../utils/controllers';
import { BaseEditStrategy } from './baseEditStrategy';

export class FullRowEditStrategy extends BaseEditStrategy {
    override beanName = 'fullRow' as BeanName | undefined;
    private rowNode?: RowNode | null;

    public updateStyles(rowNode?: IRowNode | null, _column?: Column | null, newState?: boolean): void {
        if (!rowNode || !_column) {
            return;
        }

        const rowCtrl = _resolveRowController(this.beans, {
            rowNode,
        })!;

        rowCtrl.forEachGui(undefined, (gui) => {
            gui.rowComp.toggleCss('ag-row-editing', newState ?? false);
            gui.rowComp.toggleCss('ag-row-batch-edit', (this.gos.get('batchEdit') && newState) ?? false);
        });

        this.rowNode = newState ? rowCtrl.rowNode : undefined;

        const event = newState
            ? rowCtrl.createRowEvent('rowEditingStarted')
            : rowCtrl.createRowEvent('rowEditingStopped');

        this.eventSvc.dispatchEvent(event);
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

    public override startEditing(
        rowNode: IRowNode,
        column?: Column,
        _key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        _source: 'api' | 'ui' = 'ui'
    ): boolean {
        if (this.rowNode !== rowNode) {
            super.cleanupEditors();
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
            this.editModel.startEditing(position.rowNode, position.column);
        });

        this.updateStyles(rowNode, column, true);

        return this.finishStartEdit(cells, rowNode, column, undefined, true, event);
    }

    public override stopEditing(): boolean {
        for (const rowNode of this.editModel.getPendingUpdates().keys()) {
            this.updateStyles(rowNode!, undefined, false);
        }

        super.stopEditing();

        return true;
    }

    public onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        const { focusSvc } = this.beans;
        const { rowIndex, rowPinned, column } = event;

        const rowFocused = focusSvc.isRowFocused(rowIndex!, rowPinned);

        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, {
            rowIndex,
            column,
        });

        // if we are editing, then moving the focus out of a row will stop editing
        if (
            !rowFocused &&
            this.editModel.hasPending(rowCtrl!.rowNode, cellCtrl?.column) &&
            !this.gos.get('batchEdit')
        ) {
            this.beans.editSvc?.stopEditing(rowCtrl!.rowNode, cellCtrl?.column);
        }
    }

    // returns null if no navigation should be performed
    public override moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
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
            if (!this.gos.get('batchEdit')) {
                this.beans.editSvc?.stopEditing(previousCell.rowNode);
            }

            this.beans.editSvc?.startEditing(nextCell.rowNode, nextCell.column, null, true, event);
        }

        if (nextEditable) {
            this.setFocusInOnEditor(nextCell);
            nextCell.focusCell();
        } else {
            nextCell.focusCell(true);
        }

        return true;
    }

    public override destroy(): void {
        super.destroy();
        this.rowNode = undefined;
    }
}
