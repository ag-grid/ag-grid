import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { CellPosition } from '../../interfaces/iCellPosition';
import { CellEditingModel } from './cellEditingModel';

export class RowEditingModel {
    public rowId: string;
    public editorCount = 0;
    public editorModels: Record<string, CellEditingModel> = {};

    constructor(rowId: string) {
        this.rowId = rowId;
    }

    public getEditModel(columnId: string): CellEditingModel {
        console.warn('RowEditingModel: getEditModel', columnId);
        return this.editorModels[columnId];
    }

    public createEditModel(columnId: string): boolean {
        console.warn('RowEditingModel: createEditModel', columnId);

        const cellModel = this.editorModels[columnId];

        if (!cellModel) {
            this.editorModels[columnId] = new CellEditingModel(this.rowId, columnId);
            this.editorCount++;
            return true;
        }
        return false;
    }

    public getEditModelCount(): number {
        return this.editorCount;
    }

    public removeEditModel(columnId: string): boolean {
        console.warn('RowEditingModel: removeEditModel', columnId);
        if (!this.editorModels[columnId]) {
            return false;
        }

        delete this.editorModels[columnId];
        this.editorCount--;
        return true;
    }

    public getEditModels(): CellEditingModel[] {
        return Object.values(this.editorModels);
    }

    public isEditing(colId?: string): boolean {
        if (colId) {
            return !!this.editorModels[colId];
        }
        return this.editorCount > 0;
    }

    destroy() {
        console.warn('RowEditingModel: destroy', this.rowId);
        Object.keys(this.editorModels).forEach((key) => this.removeEditModel(key));
    }
}
