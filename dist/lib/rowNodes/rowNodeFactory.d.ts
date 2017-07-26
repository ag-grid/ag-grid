// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
export declare class RowNodeFactory {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private columnController;
    create(data: any[]): RowNode;
}
