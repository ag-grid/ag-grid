// Type definitions for ag-grid v10.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
export declare class RowNodeFactory {
    private gridOptionsWrapper;
    private eventService;
    private context;
    create(data: any[]): RowNode;
}
