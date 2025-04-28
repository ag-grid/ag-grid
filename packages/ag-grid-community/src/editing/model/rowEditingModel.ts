import { CellEditingModel } from './cellEditingModel';

export class RowEditingModel {
    public rowId: string;
    public editorModels: Map<string, CellEditingModel> = new Map();

    constructor(rowId: string) {
        this.rowId = rowId;
    }

    public getEditModel(columnId: string): CellEditingModel | undefined {
        // console.warn('RowEditingModel: getEditModel', columnId);
        return this.editorModels.get(columnId);
    }

    public createEditModel(columnId: string): boolean {
        // console.warn('RowEditingModel: createEditModel', columnId);

        if (!this.editorModels.has(columnId)) {
            this.editorModels.set(columnId, new CellEditingModel(this.rowId, columnId));
            return true;
        }
        return false;
    }

    public getEditModelCount(): number {
        return this.editorModels.size;
    }

    public removeEditModel(columnId: string): boolean {
        // console.warn('RowEditingModel: removeEditModel', columnId);
        if (!this.editorModels.has(columnId)) {
            return false;
        }

        this.editorModels.delete(columnId);
        return true;
    }

    public getEditModels(): CellEditingModel[] {
        return Array.from(this.editorModels.values());
    }

    public isEditing(colId?: string): boolean {
        if (colId) {
            return this.editorModels.has(colId);
        }
        return this.getEditModelCount() > 0;
    }

    destroy() {
        // console.warn('RowEditingModel: destroy', this.rowId);
        this.editorModels.clear();
    }
}
