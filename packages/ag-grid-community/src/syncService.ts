import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { ColDef, ColGroupDef } from './entities/colDef';
import { _logIfDebug } from './utils/log';

export class SyncService extends BeanStub implements NamedBean {
    beanName = 'syncSvc' as const;

    /** Set while a grid created without columns waits for its first `columnDefs` to start its rows. */
    public waitingForColumns: boolean = false;

    public start(): void {
        // we wait until the UI has finished initialising before setting in columns and rows
        this.beans.ctrlsSvc.whenReady(this, () => {
            const columnDefs = this.gos.get('columnDefs');
            if (columnDefs) {
                this.startWithColumns(columnDefs);
            } else {
                this.waitingForColumns = true;
            }
            this.gridReady();
        });
    }

    private gridReady(): void {
        const { eventSvc, gos } = this;
        eventSvc.dispatchEvent({
            type: 'gridReady',
        });
        _logIfDebug(gos, `initialised successfully, enterprise = ${gos.isModuleRegistered('EnterpriseCore')}`);
    }

    /** Starts the grid's columns and rows with its first `columnDefs`. */
    public startWithColumns(columnDefs: (ColDef | ColGroupDef)[]): void {
        this.waitingForColumns = false;
        const { colModel, rowModel } = this.beans;
        colModel.setColumnDefs(columnDefs, 'gridInitializing', false);
        rowModel.start();
    }
}
