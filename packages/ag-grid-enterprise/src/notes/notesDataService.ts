import type {
    FullWidthNotesDataSource,
    GetNoteParams,
    INotesDataService,
    NamedBean,
    NotesDataSource,
    NotesDataSourceParams,
    SetNoteParams,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams } from 'ag-grid-community';

import { isFullWidthRowNoteParams } from './notesShared';
import { cloneNote } from './notesUtils';

export class NotesDataService extends BeanStub implements INotesDataService, NamedBean {
    public readonly beanName = 'notesDataSvc' as const;

    private dataSource?: NotesDataSource | FullWidthNotesDataSource;

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

    public supportsFullWidthRows(): boolean {
        return this.isFullWidthDataSource(this.dataSource);
    }

    public getNote(params: GetNoteParams) {
        const { dataSource } = this;

        if (isFullWidthRowNoteParams(params)) {
            return cloneNote(this.isFullWidthDataSource(dataSource) ? dataSource.getNote(params) : undefined);
        }

        const column = this.beans.colModel.getCol(params.column);
        if (!column) {
            return undefined;
        }

        return cloneNote(dataSource?.getNote({ ...params, column }));
    }

    public setNote(params: SetNoteParams): void {
        const { dataSource } = this;
        const note = cloneNote(params.note);

        if (isFullWidthRowNoteParams(params)) {
            if (this.isFullWidthDataSource(dataSource)) {
                dataSource.setNote({ ...params, note });
            }
            return;
        }

        const column = this.beans.colModel.getCol(params.column);
        if (!column) {
            return;
        }

        dataSource?.setNote({ ...params, column, note });
    }

    private setDataSource(dataSource?: NotesDataSource | FullWidthNotesDataSource): void {
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

    private isFullWidthDataSource(
        dataSource?: NotesDataSource | FullWidthNotesDataSource
    ): dataSource is FullWidthNotesDataSource {
        return !!dataSource && 'supportsFullWidthRows' in dataSource && dataSource.supportsFullWidthRows === true;
    }

    public override destroy(): void {
        this.dataSource?.destroy?.();
        super.destroy();
    }
}
