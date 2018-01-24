import {GridOptionsWrapper} from '../gridOptionsWrapper';
import {Logger, LoggerFactory} from '../logger';
import {ColumnUtils} from '../columnController/columnUtils';
import {AbstractColDef, ColDef, ColGroupDef} from "../entities/colDef";
import {ColumnKeyCreator} from "./columnKeyCreator";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {Column} from "../entities/column";
import {Autowired, Bean, Context, Qualifier} from "../context/context";
import {Utils as _} from "../utils";
import { DefaultColumnTypes } from "../entities/defaultColumnTypes";

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

    public createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroupChild[] {

        let autoColBalancedTree: OriginalColumnGroupChild[] = [];
        autoGroupCols.forEach( col => {
            let fakeTreeItem = this.createAutoGroupTreeItem(gridBalancedTree, col);
            autoColBalancedTree.push(fakeTreeItem);
        });

        return autoColBalancedTree;
    }

    private createAutoGroupTreeItem(balancedColumnTree: OriginalColumnGroupChild[], column: Column): OriginalColumnGroupChild {

        let dept = this.findDept(balancedColumnTree);

        // at the end, this will be the top of the tree item.
        let nextChild: OriginalColumnGroupChild = column;

        for (let i = dept - 1; i>=0; i--) {
            let autoGroup = new OriginalColumnGroup(
                null,
                `FAKE_PATH_${column.getId()}}_${i}`,
                true);
            this.context.wireBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild = autoGroup;
        }

        // at this point, the nextChild is the top most item in the tree
        return nextChild;
    }

    private findDept(balancedColumnTree: OriginalColumnGroupChild[]): number {
        let dept = 0;
        let pointer = balancedColumnTree;
        while (pointer && pointer[0] && pointer[0] instanceof OriginalColumnGroup) {
            dept++;
            pointer = (<OriginalColumnGroup>pointer[0]).getChildren();
        }
        return dept;
    }

    public createBalancedColumnGroups(abstractColDefs: (ColDef|ColGroupDef)[], primaryColumns: boolean): any {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that cold be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        let columnKeyCreator = new ColumnKeyCreator();

        // create am unbalanced tree that maps the provided definitions
        let unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, columnKeyCreator, primaryColumns);
        let treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        let balancedTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);

        this.columnUtils.depthFirstOriginalTreeSearch(balancedTree, (child: OriginalColumnGroupChild)=> {
            if (child instanceof OriginalColumnGroup) {
                (<OriginalColumnGroup>child).setupExpandable();
            }
        });

        return {
            balancedTree: balancedTree,
            treeDept: treeDept
        };
    }

    private balanceColumnTree(unbalancedTree: OriginalColumnGroupChild[], currentDept: number,
                              columnDept: number, columnKeyCreator: ColumnKeyCreator): OriginalColumnGroupChild[] {

        let result: OriginalColumnGroupChild[] = [];

        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        unbalancedTree.forEach( (child: OriginalColumnGroupChild)=> {
            if (child instanceof OriginalColumnGroup) {
                let originalGroup = <OriginalColumnGroup> child;
                let newChildren = this.balanceColumnTree(
                    originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            } else {
                let newChild = child;
                for (let i = columnDept-1; i>=currentDept; i--) {
                    let newColId = columnKeyCreator.getUniqueKey(null, null);
                    let colGroupDefMerged = this.createMergedColGroupDef(null);
                    let paddedGroup = new OriginalColumnGroup(colGroupDefMerged, newColId, true);
                    this.context.wireBean(paddedGroup);
                    paddedGroup.setChildren([newChild]);
                    newChild = paddedGroup;
                }
                result.push(newChild);
            }
        });

        return result;
    }

    private findMaxDept(treeChildren: OriginalColumnGroupChild[], dept: number): number {
        let maxDeptThisLevel = dept;
        for (let i = 0; i<treeChildren.length; i++) {
            let abstractColumn = treeChildren[i];
            if (abstractColumn instanceof OriginalColumnGroup) {
                let originalGroup = <OriginalColumnGroup> abstractColumn;
                let newDept = this.findMaxDept(originalGroup.getChildren(), dept+1);
                if (maxDeptThisLevel<newDept) {
                    maxDeptThisLevel = newDept;
                }
            }
        }
        return maxDeptThisLevel;
    }

    private recursivelyCreateColumns(abstractColDefs: (ColDef|ColGroupDef)[], level: number,
                                     columnKeyCreator: ColumnKeyCreator, primaryColumns: boolean): OriginalColumnGroupChild[] {

        let result: OriginalColumnGroupChild[] = [];

        if (!abstractColDefs) {
            return result;
        }

        abstractColDefs.forEach( (abstractColDef: ColDef|ColGroupDef)=> {
            let newGroupOrColumn: OriginalColumnGroupChild;
            if (this.isColumnGroup(abstractColDef)) {
                newGroupOrColumn = this.createColumnGroup(columnKeyCreator, primaryColumns, <ColGroupDef> abstractColDef, level);
            } else {
                newGroupOrColumn = this.createColumn(columnKeyCreator, primaryColumns, <ColDef> abstractColDef);
            }
            result.push(newGroupOrColumn);
        });

        return result;
    }

    private createColumnGroup(columnKeyCreator: ColumnKeyCreator,  primaryColumns: boolean, colGroupDef: ColGroupDef, level: number): OriginalColumnGroup {
        let colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);

        let groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId, null);
        let originalGroup = new OriginalColumnGroup(colGroupDefMerged, groupId, false);
        this.context.wireBean(originalGroup);
        let children = this.recursivelyCreateColumns(colGroupDefMerged.children, level + 1, columnKeyCreator, primaryColumns);

        originalGroup.setChildren(children);

        return originalGroup;
    }

    private createMergedColGroupDef(colGroupDef: ColGroupDef): ColGroupDef {
        let colGroupDefMerged: ColGroupDef = <ColGroupDef> {};
        _.assign(colGroupDefMerged, this.gridOptionsWrapper.getDefaultColGroupDef());
        _.assign(colGroupDefMerged, colGroupDef);
        this.checkForDeprecatedItems(colGroupDefMerged);
        return colGroupDefMerged;
    }

    private createColumn(columnKeyCreator: ColumnKeyCreator,  primaryColumns: boolean, colDef: ColDef): Column {
        let colDefMerged = this.mergeColDefs(colDef);
        this.checkForDeprecatedItems(colDefMerged);
        let colId = columnKeyCreator.getUniqueKey(colDefMerged.colId, colDefMerged.field);
        let column = new Column(colDefMerged, colId, primaryColumns);
        this.context.wireBean(column);
        return column;
    }

    private mergeColDefs(colDef: ColDef) {
        // start with empty merged definition
        let colDefMerged: ColDef = <ColDef> {};

        // merge properties from default column definitions
        _.assign(colDefMerged, this.gridOptionsWrapper.getDefaultColDef());

        // merge properties from column type properties
        if (colDef.type) {
            this.assignColumnTypes(colDef, colDefMerged);
        }

        // merge properties from column definitions
        _.assign(colDefMerged, colDef);

        return colDefMerged;
    }

    private assignColumnTypes(colDef: ColDef, colDefMerged: ColDef) {
        let typeKeys: string[];

        if (colDef.type instanceof Array) {
            let invalidArray = colDef.type.some(a => typeof a !== 'string');
            if (invalidArray) {
                console.warn("ag-grid: if colDef.type is supplied an array it should be of type 'string[]'");
            } else {
                typeKeys = colDef.type;
            }
        } else if (typeof colDef.type === 'string') {
            typeKeys = colDef.type.split(',');
        } else {
            console.warn("ag-grid: colDef.type should be of type 'string' | 'string[]'");
            return;
        }

        // merge user defined with default column types
        let allColumnTypes = _.assign({}, this.gridOptionsWrapper.getColumnTypes(), DefaultColumnTypes);

        typeKeys.forEach((t) => {
            let typeColDef = allColumnTypes[t.trim()];
            if (typeColDef) {
                _.assign(colDefMerged, typeColDef);
            } else {
                console.warn("ag-grid: colDef.type '" + t + "' does not correspond to defined gridOptions.columnTypes");
            }
        });
    }

    private checkForDeprecatedItems(colDef: AbstractColDef) {
        if (colDef) {
            let colDefNoType = <any> colDef; // take out the type, so we can access attributes not defined in the type
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
    private isColumnGroup(abstractColDef: ColDef|ColGroupDef): boolean {
        return (<ColGroupDef>abstractColDef).children !== undefined;
    }

}