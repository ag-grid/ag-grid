import type { BeanCollection } from '../../context/context';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _getRowById } from '../strategy/utils';
import type { CellEditingModel } from './cellEditingModel';
import { RowEditingModel } from './rowEditingModel';

export type CellIdPositions = {
    rowId: string;
    columnId: string;
};

export class GridEditingModel {
    private rowModels: Map<string, RowEditingModel> = new Map();

    constructor(private readonly beans: BeanCollection) {}

    private createEditModel(rowId: string, columnId: string) {
        console.warn('GridEditingModel: createEditModel', columnId);

        const rowModel = this.rowModels.get(rowId) ?? this.createRowModel(rowId);
        const cellModel = rowModel.getEditModel(columnId);
        if (!cellModel) {
            rowModel.createEditModel(columnId);
        }
    }

    public removeEditModel(rowId: string, columnId?: string): void {
        const rowModel = this.rowModels.get(rowId);

        if (!rowModel) {
            return;
        }

        console.warn('GridEditingModel: removeEditModel', rowId, columnId);

        if (!columnId) {
            rowModel.destroy();
            this.rowModels.delete(rowId);
            return;
        }

        rowModel.removeEditModel(columnId);

        if (rowModel.getEditModelCount() === 0) {
            this.rowModels.delete(rowId);
        }
    }

    public getEditModels(rowId?: string | null, columnId?: string | null): CellEditingModel[] {
        const models: CellEditingModel[] = [];
        if (!rowId) {
            this.rowModels.forEach((rowModel) => {
                models.push(...rowModel.getEditModels());
            });
            return models;
        }

        if (columnId) {
            const model = this.rowModels.get(rowId)?.getEditModel(columnId);
            if (model) {
                models.push(model);
            }
            return models;
        }

        const cellModels = this.rowModels.get(rowId)?.getEditModels();
        if (cellModels) {
            models.push(...cellModels);
        }
        return models;
    }

    public getEditingCellIds(): CellIdPositions[] {
        const ids: { rowId: string; columnId: string }[] = [];
        this.rowModels.forEach((rowModel, rowId) => {
            rowModel.getEditModels().forEach(({ columnId }) => ids.push({ rowId, columnId }));
        });
        return ids;
    }

    public getEditingCellPositions(): CellPosition[] {
        const positions: CellPosition[] = [];
        const cellIds = this.getEditingCellIds();
        cellIds.forEach(({ rowId, columnId }) => {
            const rowNode = _getRowById(this.beans, rowId);
            if (rowNode) {
                positions.push({
                    column: this.beans.colModel.getCol(columnId)!,
                    rowIndex: rowNode.rowIndex!,
                    rowPinned: rowNode.rowPinned,
                });
            }
        });

        return positions;
    }

    public isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this._isEditing(rowCtrl?.rowId, cellCtrl?.column.colId);
    }

    private _isEditing(rowId?: string | null, colId?: string | null): boolean {
        if (rowId) {
            return this.rowModels.get(rowId)?.isEditing(colId ?? undefined) ?? false;
        }
        return this.rowModels.size > 0;
    }

    public startEditing(rowId: string, columnId: string): void {
        console.warn('GridEditingModel: startEditing', rowId, columnId);

        this.createEditModel(rowId, columnId);
    }

    public stopEditing(rowId?: string | null, colId?: string | null): void {
        if (!this._isEditing(rowId, colId)) {
            return;
        }

        console.warn('GridEditingModel: stopEditing', rowId, colId);

        if (rowId) {
            const rowModel = this.rowModels.get(rowId);
            if (rowModel) {
                if (colId) {
                    rowModel.removeEditModel(colId);
                } else {
                    rowModel.destroy();
                    this.rowModels.delete(rowId);
                }

                if (rowModel.getEditModelCount() === 0) {
                    rowModel.destroy();
                    this.rowModels.delete(rowId);
                }
            }
        } else {
            this.rowModels.forEach((rowModel, key) => {
                rowModel.destroy();
                this.rowModels.delete(key);
            });
        }
    }

    public cancelEditing(rowId?: string | null, colId?: string | null): void {
        if (!this._isEditing(rowId, colId)) {
            return;
        }

        console.warn('GridEditingModel: cancelEditing', rowId, colId);

        if (rowId) {
            const rowModel = this.rowModels.get(rowId);

            if (rowModel) {
                if (colId) {
                    rowModel.removeEditModel(colId);
                } else {
                    rowModel.destroy();
                    this.rowModels.delete(rowId);
                }
            }
        } else {
            this.rowModels.forEach((rowModel, key) => {
                rowModel.destroy();
                this.rowModels.delete(key);
            });
        }
    }

    public destroy(): void {
        this.stopEditing();
    }

    private createRowModel(rowId: string): RowEditingModel {
        const rowModel = new RowEditingModel(rowId);
        this.rowModels.set(rowId, rowModel);
        return rowModel;
    }
}
