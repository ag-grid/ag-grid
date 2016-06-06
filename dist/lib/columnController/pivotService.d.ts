// Type definitions for ag-grid v4.2.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColGroupDef, ColDef } from "../entities/colDef";
import { RowNode } from "../entities/rowNode";
export declare class PivotService {
    private rowModel;
    private valueService;
    private columnController;
    private eventService;
    private uniqueValues;
    private pivotColumnGroupDefs;
    private pivotColumnDefs;
    private mapRowNode(rowNode);
    getUniqueValues(): any;
    private mapChildren(children, pivotColumns, pivotIndex, uniqueValues);
    execute(rootNode: RowNode): any;
    getPivotColumnGroupDefs(): (ColDef | ColGroupDef)[];
    getPivotColumnDefs(): ColDef[];
    private createPivotColumnDefs();
}
