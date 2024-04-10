import { convertSourceType } from "./columns/columnModel";
import { BeanStub } from "./context/beanStub";
import { Bean, PostConstruct } from "./context/context";
import { ColDef, ColGroupDef } from "./entities/colDef";
import { Events } from "./eventKeys";
import { GridReadyEvent } from "./events";
import { PropertyValueChangedEvent } from "./gridOptionsService";
import { WithoutGridCommon } from "./interfaces/iCommon";
import { Logger } from "./logger";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";

@Bean('syncService')
export class SyncService extends BeanStub {
    private waitingForColumns: boolean = false;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedPropertyListener('columnDefs', (event) => this.setColumnDefs(event));
    }

    public start(): void {
        // we wait until the UI has finished initialising before setting in columns and rows
        this.beans.ctrlsService.whenReady(() => {
            const columnDefs = this.beans.gos.get('columnDefs');
            if (columnDefs) {
                this.setColumnsAndData(columnDefs);
            } else {
                this.waitingForColumns = true;
            }
            this.gridReady();
        });
    }

    private setColumnsAndData(columnDefs:  (ColDef | ColGroupDef)[]): void {
        this.beans.columnModel.setColumnDefs(columnDefs ?? [], "gridInitializing");
        this.beans.rowModel.start();
    }
    
    private gridReady(): void {
        this.dispatchGridReadyEvent();
        const isEnterprise = ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.beans.context.getGridId());
        const logger = new Logger('AG Grid', () => this.beans.gos.get('debug'));
        logger.log(`initialised successfully, enterprise = ${isEnterprise}`);
    }

    private dispatchGridReadyEvent(): void {
        const readyEvent: WithoutGridCommon<GridReadyEvent> = {
            type: Events.EVENT_GRID_READY,
        };
        this.beans.eventService.dispatchEvent(readyEvent);
    }

    private setColumnDefs(event: PropertyValueChangedEvent<'columnDefs'>): void {
        const columnDefs = this.beans.gos.get('columnDefs');
        if (!columnDefs) { return; }

        if (this.waitingForColumns) {
            this.waitingForColumns = false;
            this.setColumnsAndData(columnDefs);
            return;
        }

        this.beans.columnModel.setColumnDefs(columnDefs, convertSourceType(event.source));
    }
}
