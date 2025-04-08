import type { BeanCollection } from '../../context/context';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { CellEditingModel } from './cellEditingModel';
import { RowEditingModel } from './rowEditingModel';

export class GridEditingModel {
    private rowModels: Record<string, RowEditingModel> = {};
    private editorCount = 0;

    private beans: BeanCollection;

    constructor(beans: BeanCollection) {
        this.beans = beans;
    }

    public createEditModel(rowId: string, columnId: string) {
        console.warn('EditingModel: createEditModel', columnId);

        const rowModel = this.rowModels[rowId]
            ? this.rowModels[rowId]
            : (this.rowModels[rowId] = new RowEditingModel(rowId));
        const cellModel = rowModel.getEditModel(columnId);
        if (!cellModel) {
            const succedd = rowModel.createEditModel(columnId);
            if (succedd) {
                this.editorCount++;
            }
        }
    }

    public removeEditModel(rowId: string, columnId: string): void {
        console.warn('EditingModel: removeEditModel', columnId);

        const rowModel = this.rowModels[rowId];

        if (!rowModel) {
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
}
