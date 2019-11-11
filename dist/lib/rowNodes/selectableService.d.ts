import { RowNode } from "../entities/rowNode";
export declare class SelectableService {
    private gridOptionsWrapper;
    private groupSelectsChildren;
    private isRowSelectableFunc?;
    init(): void;
    updateSelectableAfterGrouping(rowNode: RowNode): void;
    updateSelectableAfterFiltering(rowNode: RowNode): void;
    private recurseDown;
}
