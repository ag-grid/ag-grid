import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { IExpansionService } from '../interfaces/iExpansionService';
import type { IRowNode } from '../interfaces/iRowNode';
export declare class ExpansionService extends BeanStub implements NamedBean, IExpansionService {
    beanName: "expansionService";
    private rowModel;
    wireBeans(beans: BeanCollection): void;
    private isClientSideRowModel;
    postConstruct(): void;
    expandRows(rowIds: string[]): void;
    getExpandedRows(): string[];
    expandAll(value: boolean): void;
    setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean, forceSync?: boolean): void;
    onGroupExpandedOrCollapsed(): void;
}
