import type { ColumnModel } from './columns/columnModel';
import { convertSourceType } from './columns/columnModel';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { CtrlsService } from './ctrlsService';
import type { ColDef, ColGroupDef } from './entities/colDef';
import type { GridReadyEvent } from './events';
import type { PropertyValueChangedEvent } from './gridOptionsService';
import type { WithoutGridCommon } from './interfaces/iCommon';
import type { IRowModel } from './interfaces/iRowModel';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { _log } from './utils/function';

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
        this.dispatchGridReadyEvent();
        const isEnterprise = ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.gridId);
        if (this.gos.get('debug')) {
            _log(`initialised successfully, enterprise = ${isEnterprise}`);
        }
    }

    private dispatchGridReadyEvent(): void {
        const readyEvent: WithoutGridCommon<GridReadyEvent> = {
            type: 'gridReady',
        };
        this.eventService.dispatchEvent(readyEvent);
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
