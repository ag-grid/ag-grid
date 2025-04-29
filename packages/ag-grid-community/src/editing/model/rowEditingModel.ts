import { CellEditingModel } from './cellEditingModel';

export class RowEditingModel {
    public rowId: string;
    public editorModels: Map<string, CellEditingModel> = new Map();

    constructor(rowId: string) {
        this.rowId = rowId;
    }

    public getEditModel(columnId: string): CellEditingModel | undefined {
        return this.editorModels.get(columnId);
    }

    public createEditModel(columnId: string): CellEditingModel {
        if (this.editorModels.has(columnId)) {
            return this.editorModels.get(columnId)!;
        } else {
            const model = new CellEditingModel(this.rowId, columnId);
            this.editorModels.set(columnId, model);
            return model;
        }
    }

    public getEditModelCount(): number {
        return this.editorModels.size;
    }

    public removeEditModel(columnId: string): boolean {
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
        this.editorModels.clear();
    }
}
