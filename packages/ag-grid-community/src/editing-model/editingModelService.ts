import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { CellEditingModel } from './model/cellEditingModel';
import { RowEditingModel } from './model/rowEditingModel';

export class EditingModelService extends BeanStub implements NamedBean {
    beanName = 'editingModelSvc' as const;
    private rowModels: Record<string, RowEditingModel> = {};
    private editorCount = 0;

    public createEditModel(rowId: string, columnId: string) {
        console.warn('EditingModelService: createEditModel', columnId);

        const rowModel = this.rowModels[rowId]
            ? this.rowModels[rowId]
            : (this.rowModels[rowId] = new RowEditingModel(rowId));
        const cellModel = rowModel.getEditModel(columnId);
        if (!cellModel) {
            const success = rowModel.createEditModel(columnId);
            if (success) {
                this.editorCount++;
            }
        }
    }

    public removeEditModel(rowId: string, columnId?: string): void {
        console.warn('EditingModelService: removeEditModel', rowId, columnId);

        const rowModel = this.rowModels[rowId];

        if (!rowModel) {
            return;
        }

        if (!columnId) {
            this.editorCount -= rowModel.getEditModelCount();
            rowModel.destroy();
            delete this.rowModels[rowId];
            return;
        }

        const success = rowModel.removeEditModel(columnId);
        if (success) {
            this.editorCount--;
        }

        if (rowModel.getEditModelCount() === 0) {
            delete this.rowModels[rowId];
        }
    }

    public getEditModels(rowId: string, columnId?: string): CellEditingModel[] {
        if (columnId) {
            return [this.rowModels[rowId]?.getEditModel(columnId) ?? []];
        }

        const cellModels = this.rowModels[rowId]?.getEditModels();
        if (!cellModels) {
            return [];
        }
        return cellModels;
    }

    public getEditingCellPositions(): CellPosition[] {
        const positions: CellPosition[] = [];

        Object.keys(this.rowModels).forEach((rowId) => {
            const rowNode = this.beans.rowModel.getRowNode(rowId!)!;
            this.rowModels[rowId]?.getEditModels().forEach(({ columnId }) =>
                positions.push({
                    column: this.beans.colModel.getCol(columnId)!,
                    rowIndex: rowNode.rowIndex!,
                    rowPinned: rowNode.rowPinned,
                })
            );
        });

        return positions;
    }

    public isEditing(rowId?: string, colId?: string): boolean {
        if (rowId) {
            return this.rowModels?.[rowId]?.isEditing(colId) ?? false;
        }
        return this.editorCount > 0;
    }

    public stopEditing(rowId?: string, colId?: string): void {
        console.warn('EditingModelService: stopEditing', rowId, colId);
        if (rowId) {
            const rowModel = this.rowModels[rowId];
            if (rowModel) {
                if (colId) {
                    rowModel.removeEditModel(colId);
                } else {
                    rowModel.destroy();
                    delete this.rowModels[rowId];
                }
            }
        } else {
            Object.keys(this.rowModels).forEach((key) => {
                const rowModel = this.rowModels[key];
                if (rowModel) {
                    rowModel.destroy();
                    delete this.rowModels[key];
                }
            });
        }
    }

    public override destroy(): void {
        super.destroy();
        this.stopEditing();
    }
}
