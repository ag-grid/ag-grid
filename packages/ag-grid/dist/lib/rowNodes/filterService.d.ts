// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export declare class FilterService {
    private filterManager;
    private gridOptionsWrapper;
    private doingTreeData;
    private postConstruct();
    filterAccordingToColumnState(rowNode: RowNode): void;
    filter(rowNode: RowNode, filterActive: boolean): void;
    private setAllChildrenCountTreeData(rowNode);
    private setAllChildrenCountGridGrouping(rowNode);
    private setAllChildrenCount(rowNode);
}
