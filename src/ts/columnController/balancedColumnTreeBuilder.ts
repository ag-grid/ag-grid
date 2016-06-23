import {GridOptionsWrapper} from '../gridOptionsWrapper';
import {Logger, LoggerFactory} from '../logger';
import {ColumnUtils} from '../columnController/columnUtils';
import {AbstractColDef} from "../entities/colDef";
import {ColumnKeyCreator} from "./columnKeyCreator";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {ColGroupDef} from "../entities/colDef";
import {ColDef} from "../entities/colDef";
import {Column} from "../entities/column";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {Autowired} from "../context/context";
import {Context} from "../context/context";

// takes in a list of columns, as specified by the column definitions, and returns column groups
@Bean('balancedColumnTreeBuilder')
export class BalancedColumnTreeBuilder {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('context') private context: Context;

    private logger: Logger;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
    }

    public createBalancedColumnGroups(abstractColDefs: AbstractColDef[], primaryColumns: boolean): any {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that cold be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        var columnKeyCreator = new ColumnKeyCreator();

        // create am unbalanced tree that maps the provided definitions
        var unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, columnKeyCreator, primaryColumns);
        var treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        var balancedTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);

        this.columnUtils.deptFirstOriginalTreeSearch(balancedTree, (child: OriginalColumnGroupChild)=> {
            if (child instanceof OriginalColumnGroup) {
                (<OriginalColumnGroup>child).calculateExpandable();
            }
        });

        return {
            balancedTree: balancedTree,
            treeDept: treeDept
        };
    }

    private balanceColumnTree(unbalancedTree: OriginalColumnGroupChild[], currentDept: number,
                              columnDept: number, columnKeyCreator: ColumnKeyCreator): OriginalColumnGroupChild[] {

        var result: OriginalColumnGroupChild[] = [];

        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        unbalancedTree.forEach( (child: OriginalColumnGroupChild)=> {
            if (child instanceof OriginalColumnGroup) {
                var originalGroup = <OriginalColumnGroup> child;
                var newChildren = this.balanceColumnTree(
                    originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            } else {
                var newChild = child;
                for (var i = columnDept-1; i>=currentDept; i--) {
                    var newColId = columnKeyCreator.getUniqueKey(null, null);
                    var paddedGroup = new OriginalColumnGroup(null, newColId);
                    paddedGroup.setChildren([newChild]);
                    newChild = paddedGroup;
                }
                result.push(newChild);
            }
        });

        return result;
    }

    private findMaxDept(treeChildren: OriginalColumnGroupChild[], dept: number): number {
        var maxDeptThisLevel = dept;
        for (var i = 0; i<treeChildren.length; i++) {
            var abstractColumn = treeChildren[i];
            if (abstractColumn instanceof OriginalColumnGroup) {
                var originalGroup = <OriginalColumnGroup> abstractColumn;
                var newDept = this.findMaxDept(originalGroup.getChildren(), dept+1);
                if (maxDeptThisLevel<newDept) {
                    maxDeptThisLevel = newDept;
                }
            }
        }
        return maxDeptThisLevel;
    }

    private recursivelyCreateColumns(abstractColDefs: AbstractColDef[], level: number,
                                     columnKeyCreator: ColumnKeyCreator, primaryColumns: boolean): OriginalColumnGroupChild[] {

        var result: OriginalColumnGroupChild[] = [];

        if (!abstractColDefs) {
            return result;
        }

        abstractColDefs.forEach( (abstractColDef: AbstractColDef)=> {
            this.checkForDeprecatedItems(abstractColDef);
            if (this.isColumnGroup(abstractColDef)) {
                var groupColDef = <ColGroupDef> abstractColDef;
                var groupId = columnKeyCreator.getUniqueKey(groupColDef.groupId, null);
                var originalGroup = new OriginalColumnGroup(groupColDef, groupId);
                var children = this.recursivelyCreateColumns(groupColDef.children, level + 1, columnKeyCreator, primaryColumns);
                originalGroup.setChildren(children);
                result.push(originalGroup);
            } else {
                var colDef = <ColDef> abstractColDef;
                var colId = columnKeyCreator.getUniqueKey(colDef.colId, colDef.field);
                var column = new Column(colDef, colId, primaryColumns);
                this.context.wireBean(column);
                result.push(column);
            }
        });

        return result;
    }

    private checkForDeprecatedItems(colDef: AbstractColDef) {
        if (colDef) {
            var colDefNoType = <any> colDef; // take out the type, so we can access attributes not defined in the type
            if (colDefNoType.group !== undefined) {
                console.warn('ag-grid: colDef.group is invalid, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.headerGroup !== undefined) {
                console.warn('ag-grid: colDef.headerGroup is invalid, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.headerGroupShow !== undefined) {
                console.warn('ag-grid: colDef.headerGroupShow is invalid, should be columnGroupShow, please check documentation on how to do grouping as it changed in version 3');
            }

            if (colDefNoType.suppressRowGroup !== undefined) {
                console.warn('ag-grid: colDef.suppressRowGroup is deprecated, please use colDef.type instead');
            }
            if (colDefNoType.suppressAggregation !== undefined) {
                console.warn('ag-grid: colDef.suppressAggregation is deprecated, please use colDef.type instead');
            }

            if (colDefNoType.suppressRowGroup || colDefNoType.suppressAggregation) {
                console.warn('ag-grid: colDef.suppressAggregation and colDef.suppressRowGroup are deprecated, use allowRowGroup, allowPivot and allowValue instead');
            }

            if (colDefNoType.displayName) {
                console.warn("ag-grid: Found displayName " + colDefNoType.displayName + ", please use headerName instead, displayName is deprecated.");
                colDefNoType.headerName = colDefNoType.displayName;
            }
        }
    }

    // if object has children, we assume it's a group
    private isColumnGroup(abstractColDef: AbstractColDef): boolean {
        return (<ColGroupDef>abstractColDef).children !== undefined;
    }

}