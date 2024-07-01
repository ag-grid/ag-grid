import type { BeanCollection, IImmutableService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class ImmutableService extends BeanStub implements NamedBean, IImmutableService {
    beanName: "immutableService";
    private rowModel;
    private selectionService;
    wireBeans(beans: BeanCollection): void;
    private clientSideRowModel;
    postConstruct(): void;
    isActive(): boolean;
    setRowData(rowData: any[]): void;
    private createTransactionForRowData;
    private onRowDataUpdated;
}
