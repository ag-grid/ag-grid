// Type definitions for ag-grid v14.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export declare class RowNodeFactory {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private columnController;
    create(data: any[]): RowNode;
}
