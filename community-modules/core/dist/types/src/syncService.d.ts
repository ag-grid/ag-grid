import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
export declare class SyncService extends BeanStub implements NamedBean {
    beanName: "syncService";
    private ctrlsService;
    private columnModel;
    private rowModel;
    wireBeans(beans: BeanCollection): void;
    private waitingForColumns;
    postConstruct(): void;
    start(): void;
    private setColumnsAndData;
    private gridReady;
    private dispatchGridReadyEvent;
    private setColumnDefs;
}
