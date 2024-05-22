import { ColumnModel, convertSourceType } from './columns/columnModel';
import { BeanStub } from './context/beanStub';
import { Autowired, Bean } from './context/context';
import { CtrlsService } from './ctrlsService';
import { ColDef, ColGroupDef } from './entities/colDef';
import { Events } from './eventKeys';
import { GridReadyEvent } from './events';
import { PropertyValueChangedEvent } from './gridOptionsService';
import { WithoutGridCommon } from './interfaces/iCommon';
import { IRowModel } from './interfaces/iRowModel';
import { Logger } from './logger';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';

@Bean('syncService')
export class SyncService extends BeanStub {
    @Autowired('ctrlsService') private readonly ctrlsService: CtrlsService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('rowModel') private readonly rowModel: IRowModel;

    private waitingForColumns: boolean = false;

    public override postConstruct(): void {
        super.postConstruct();
        this.addManagedPropertyListener('columnDefs', (event) => this.setColumnDefs(event));
    }

    public start(): void {
        // we wait until the UI has finished initialising before setting in columns and rows
        this.ctrlsService.whenReady(() => {
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
        const isEnterprise = ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.context.getGridId());
        const logger = new Logger('AG Grid', () => this.gos.get('debug'));
        logger.log(`initialised successfully, enterprise = ${isEnterprise}`);
    }

    private dispatchGridReadyEvent(): void {
        const readyEvent: WithoutGridCommon<GridReadyEvent> = {
            type: Events.EVENT_GRID_READY,
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
