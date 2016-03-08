// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from '../logger';
import { AbstractColDef } from "../entities/colDef";
export declare class BalancedColumnTreeBuilder {
    private gridOptionsWrapper;
    private columnUtils;
    private context;
    private logger;
    agWire(loggerFactory: LoggerFactory): void;
    createBalancedColumnGroups(abstractColDefs: AbstractColDef[]): any;
    private balanceColumnTree(unbalancedTree, currentDept, columnDept, columnKeyCreator);
    private findMaxDept(treeChildren, dept);
    private recursivelyCreateColumns(abstractColDefs, level, columnKeyCreator);
    private checkForDeprecatedItems(colDef);
    private isColumnGroup(abstractColDef);
}
