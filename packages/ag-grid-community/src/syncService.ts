import type { ColumnModel } from './columns/columnModel';
import { convertSourceType } from './columns/columnModel';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { CtrlsService } from './ctrlsService';
import type { ColDef, ColGroupDef } from './entities/colDef';
import type { PropertyValueChangedEvent } from './gridOptionsService';
import type { IRowModel } from './interfaces/iRowModel';
import { _logIfDebug } from './utils/function';

export class SyncService extends BeanStub implements NamedBean {
    beanName = 'syncService' as const;

    private ctrlsService: CtrlsService;
    private columnModel: ColumnModel;
    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.ctrlsService = beans.ctrlsService;
        this.columnModel = beans.columnModel;
        this.rowModel = beans.rowModel;
    }

    private waitingForColumns: boolean = false;

    public postConstruct(): void {
        this.addManagedPropertyListener('columnDefs', (event) => this.setColumnDefs(event));
    }

    public start(): void {
        // we wait until the UI has finished initialising before setting in columns and rows
        this.ctrlsService.whenReady(this, () => {
            const columnDefs = this.gos.get('columnDefs');
            if (columnDefs) {
                this.setColumnsAndData(columnDefs);
            } else {
                this.waitingForColumns = true;
            }
            this.gridReady();
        });
    }

    private setColumnsAndData(columnDefs: (ColDef | ColGroupDef)[]): void {
        this.columnModel.setColumnDefs(columnDefs ?? [], 'gridInitializing');
        this.rowModel.start();
    }

    private gridReady(): void {
        this.eventService.dispatchEvent({
            type: 'gridReady',
        });
        _logIfDebug(
            this.gos,
            `initialised successfully, enterprise = ${this.gos.isModuleRegistered('EnterpriseCoreModule')}`
        );
    }

    private setColumnDefs(event: PropertyValueChangedEvent<'columnDefs'>): void {
        const columnDefs = this.gos.get('columnDefs');
        if (!columnDefs) {
            return;
        }

        if (this.waitingForColumns) {
            this.waitingForColumns = false;
            this.setColumnsAndData(columnDefs);
            return;
        }

        this.columnModel.setColumnDefs(columnDefs, convertSourceType(event.source));
    }
}
