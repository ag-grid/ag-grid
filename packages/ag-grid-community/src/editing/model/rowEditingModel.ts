import { CellEditingModel } from './cellEditingModel';

export class RowEditingModel {
    private models: Map<string, CellEditingModel> = new Map();

    public getEditModel(columnId: string): CellEditingModel | undefined {
        return this.models.get(columnId);
    }

    public createEditModel(columnId: string): CellEditingModel {
        if (this.models.has(columnId)) {
            return this.models.get(columnId)!;
        }

        const model = new CellEditingModel(columnId);
        this.models.set(columnId, model);
        return model;
    }

    public getEditModelCount(): number {
        return this.models.size;
    }

    public removeEditModel(columnId: string): boolean {
        if (!this.models.has(columnId)) {
            return false;
        }

        this.models.delete(columnId);
        return true;
    }

    public getEditModels(): CellEditingModel[] {
        return Array.from(this.models.values());
    }

    public isEditing(colId?: string): boolean {
        if (colId) {
            return this.models.has(colId);
        }
        return this.getEditModelCount() > 0;
    }

    destroy() {
        this.models.clear();
    }
}
