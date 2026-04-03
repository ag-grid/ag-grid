import type {
    GetNoteParams,
    INotesDataService,
    NamedBean,
    NotesDataSource,
    NotesDataSourceParams,
    SetNoteParams,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams } from 'ag-grid-community';

import { cloneCellNote } from './notesUtils';

export class NotesDataService extends BeanStub implements INotesDataService, NamedBean {
    public readonly beanName = 'notesDataSvc' as const;

    private dataSource?: NotesDataSource;

    public postConstruct(): void {
        this.setDataSource(this.gos.get('notesDataSource'));
        this.addManagedPropertyListener('notesDataSource', ({ currentValue }) => {
            this.setDataSource(currentValue);
            this.beans.notesSvc?.onDataSourceChanged();
        });
    }

    public hasDataSource(): boolean {
        return !!this.dataSource;
    }

    public getNote(params: GetNoteParams) {
        const {
            beans: { colModel },
            dataSource,
        } = this;
        const column = colModel.getCol(params.column);

        if (!column) {
            return undefined;
        }

        return cloneCellNote(
            dataSource?.getNote({
                ...params,
                column,
            })
        );
    }

    public setNote(params: SetNoteParams): void {
        const {
            beans: { colModel },
            dataSource,
        } = this;
        const { column: colKey, note } = params;
        const column = colModel.getCol(colKey);

        if (!column) {
            return;
        }

        dataSource?.setNote({
            ...params,
            column,
            note: cloneCellNote(note),
        });
    }

    private setDataSource(dataSource?: NotesDataSource): void {
        if (this.dataSource === dataSource) {
            return;
        }

        this.dataSource?.destroy?.();
        this.dataSource = dataSource;
        dataSource?.init?.(this.createInitParams());
    }

    private createInitParams(): NotesDataSourceParams {
        return _addGridCommonParams(this.gos, {});
    }

    public override destroy(): void {
        this.dataSource?.destroy?.();
        super.destroy();
    }
}
