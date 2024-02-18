import { BeanStub } from "../context/beanStub";
import { IExpansionService } from "../interfaces/iExpansionService";
import { IRowNode } from "../interfaces/iRowNode";
export declare class ExpansionService extends BeanStub implements IExpansionService {
    private readonly rowModel;
    private isClientSideRowModel;
    protected postConstruct(): void;
    expandRows(rowIds: string[]): void;
    getExpandedRows(): string[];
    expandAll(value: boolean): void;
    setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean): void;
    onGroupExpandedOrCollapsed(): void;
}
