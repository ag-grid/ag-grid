// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "./context/beanStub";
export declare class SyncService extends BeanStub {
    private readonly ctrlsService;
    private readonly columnModel;
    private readonly rowModel;
    private waitingForColumns;
    private postConstruct;
    start(): void;
    private setColumnsAndData;
    private gridReady;
    private dispatchGridReadyEvent;
    private setColumnDefs;
}
