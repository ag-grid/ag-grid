import type { BeanCollection, IExpansionService, NamedBean, RowNode } from 'ag-grid-community';
import { ExpansionService } from 'ag-grid-community';
export declare class ServerSideExpansionService extends ExpansionService implements NamedBean, IExpansionService {
    beanName: "expansionService";
    private serverSideRowModel;
    wireBeans(beans: BeanCollection): void;
    private queuedRowIds;
    postConstruct(): void;
    checkOpenByDefault(rowNode: RowNode): void;
    expandRows(rowIds: string[]): void;
    expandAll(value: boolean): void;
    onGroupExpandedOrCollapsed(): void;
}
