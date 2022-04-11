import { RowNode } from "../entities/rowNode";
import { BeanStub } from "../context/beanStub";
export declare class SelectableService extends BeanStub {
    private groupSelectsChildren;
    private isRowSelectableFunc?;
    init(): void;
    updateSelectableAfterGrouping(rowNode: RowNode): void;
    private recurseDown;
}
