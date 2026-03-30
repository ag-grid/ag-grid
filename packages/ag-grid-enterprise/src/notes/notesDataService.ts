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
        const dataSource = this.gos.get('notesDataSource');
        if (dataSource) {
            this.setDataSource(dataSource);
        }
    }

    public hasDataSource(): boolean {
        return !!this.dataSource;
    }

    public getNote(params: GetNoteParams) {
        return cloneCellNote(this.dataSource?.getNote(params));
    }

    public setNote(params: SetNoteParams): void {
        this.dataSource?.setNote({
            ...params,
            note: cloneCellNote(params.note),
        });
    }

    private setDataSource(dataSource: NotesDataSource): void {
        this.dataSource = dataSource;
        dataSource.init?.(this.createInitParams());
    }

    private createInitParams(): NotesDataSourceParams {
        return _addGridCommonParams(this.gos, {});
    }

    public override destroy(): void {
        this.dataSource?.destroy?.();
        super.destroy();
    }
}
