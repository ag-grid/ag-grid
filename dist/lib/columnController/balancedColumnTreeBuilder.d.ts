// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from '../gridOptionsWrapper';
import { LoggerFactory } from '../logger';
import ColumnUtils from '../columnController/columnUtils';
import { AbstractColDef } from "../entities/colDef";
export default class BalancedColumnTreeBuilder {
    private gridOptionsWrapper;
    private logger;
    private columnUtils;
    init(gridOptionsWrapper: GridOptionsWrapper, loggerFactory: LoggerFactory, columnUtils: ColumnUtils): void;
    createBalancedColumnGroups(abstractColDefs: AbstractColDef[]): any;
    private balanceColumnTree(unbalancedTree, currentDept, columnDept, columnKeyCreator);
    private findMaxDept(treeChildren, dept);
    private recursivelyCreateColumns(abstractColDefs, level, columnKeyCreator);
    private checkForDeprecatedItems(colDef);
    private isColumnGroup(abstractColDef);
}
