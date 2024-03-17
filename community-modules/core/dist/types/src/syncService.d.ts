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
