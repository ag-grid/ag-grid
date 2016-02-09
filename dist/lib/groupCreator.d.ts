// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import ValueService from "./valueService";
import GridOptionsWrapper from "./gridOptionsWrapper";
import { RowNode } from "./entities/rowNode";
import Column from "./entities/column";
export default class GroupCreator {
    private valueService;
    private gridOptionsWrapper;
    init(valueService: ValueService, gridOptionsWrapper: GridOptionsWrapper): void;
    group(rowNodes: RowNode[], groupedCols: Column[], expandByDefault: number): RowNode[];
    isExpanded(expandByDefault: any, level: any): boolean;
}
