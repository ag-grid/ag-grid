import type { BeanCollection } from '../../context/context';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { EditingStateUpdates } from '../strategy/iEditStrategy';
import type { CellEditingModel } from './cellEditingModel';
import { RowEditingModel } from './rowEditingModel';

export class GridEditingModel {
    private rowModels: Record<string, RowEditingModel> = {};

    constructor(private readonly beans: BeanCollection) {}

    public createEditModel(rowId: string, columnId: string) {
        console.warn('GridEditingModel: createEditModel', columnId);

        const rowModel = this.rowModels[rowId]
            ? this.rowModels[rowId]
            : (this.rowModels[rowId] = new RowEditingModel(rowId));
        const cellModel = rowModel.getEditModel(columnId);
        if (!cellModel) {
            rowModel.createEditModel(columnId);
        }

        this.startEditing(rowId, columnId);
    }

    public removeEditModel(rowId: string, columnId?: string): void {
        console.warn('GridEditingModel: removeEditModel', rowId, columnId);

        const rowModel = this.rowModels[rowId];

        if (!rowModel) {
            return;
        }

        if (!columnId) {
            rowModel.destroy();
            delete this.rowModels[rowId];
            return;
        }

        rowModel.removeEditModel(columnId);

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

    public isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this._isEditing(rowCtrl?.rowId, cellCtrl?.column.colId);
    }

    private _isEditing(rowId?: string | null, colId?: string | null): boolean {
        if (rowId) {
            return this.rowModels[rowId!]?.isEditing(colId ?? undefined) ?? false;
        }
        return Object.keys(this.rowModels).length > 0;
    }

    public startEditing(rowId: string, columnId: string): EditingStateUpdates {
        console.warn('GridEditingModel: startEditing', rowId, columnId);
        const rowModel = this.rowModels[rowId]
            ? this.rowModels[rowId]
            : (this.rowModels[rowId] = new RowEditingModel(rowId));
        const cellModel = rowModel.getEditModel(columnId);

        if (!cellModel) {
            rowModel.createEditModel(columnId);
        }
        const locations: EditingStateUpdates = {};
        locations[rowId] = {
            status: true,
            cells: {},
        };
        locations[rowId].cells[columnId] = true;
        return locations;
    }

    public stopEditing(rowId?: string | null, colId?: string | null): EditingStateUpdates {
        console.warn('GridEditingModel: stopEditing', rowId, colId);

        if (!this._isEditing(rowId, colId)) {
            return {};
        }

        const locations: EditingStateUpdates = {};

        if (rowId) {
            const rowModel = this.rowModels[rowId];
            if (rowModel) {
                locations[rowId] = {
                    status: false,
                    cells: {},
                };
                if (colId) {
                    locations[rowId].cells[colId] = false;
                    rowModel.removeEditModel(colId);
                } else {
                    rowModel.getEditModels().forEach(({ columnId }) => {
                        locations[rowId].cells[columnId] = false;
                    });
                    rowModel.destroy();
                    delete this.rowModels[rowId];
                }

                if (rowModel.getEditModelCount() === 0) {
                    rowModel.destroy();
                    delete this.rowModels[rowId];
                }

                locations[rowId].status = rowModel.isEditing();
            }
        } else {
            Object.keys(this.rowModels).forEach((key) => {
                const rowModel = this.rowModels[key];
                locations[key] = {
                    status: false,
                    cells: {},
                };
                if (rowModel) {
                    rowModel.getEditModels().forEach(({ columnId }) => {
                        locations[key].cells[columnId] = false;
                    });
                    rowModel.destroy();
                    delete this.rowModels[key];
                }
            });
        }

        return locations;
    }

    public cancelEditing(rowId?: string | null, colId?: string | null): EditingStateUpdates {
        console.warn('GridEditingModel: cancelEditing', rowId, colId);

        if (!this._isEditing(rowId, colId)) {
            return {};
        }

        const locations: EditingStateUpdates = {};

        if (rowId) {
            const rowModel = this.rowModels[rowId];
            locations[rowId] = {
                status: false,
                cells: {},
            };
            if (rowModel) {
                if (colId) {
                    locations[rowId].cells[colId] = false;
                    rowModel.removeEditModel(colId);
                } else {
                    rowModel.getEditModels().forEach(({ columnId }) => {
                        locations[rowId].cells[columnId] = false;
                    });
                    rowModel.destroy();
                    delete this.rowModels[rowId];
                }
                locations[rowId].status = rowModel.isEditing();
            }
        } else {
            Object.keys(this.rowModels).forEach((key) => {
                const rowModel = this.rowModels[key];
                locations[key] = {
                    status: false,
                    cells: {},
                };
                if (rowModel) {
                    rowModel.getEditModels().forEach(({ columnId }) => {
                        locations[key].cells[columnId] = false;
                    });
                    rowModel.destroy();
                    delete this.rowModels[key];
                }
            });
        }

        return locations;
    }

    public destroy(): void {
        this.stopEditing();
    }
}
