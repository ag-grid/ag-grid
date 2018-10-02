import {GridOptionsWrapper} from '../gridOptionsWrapper';
import {Logger, LoggerFactory} from '../logger';
import {ColumnUtils} from './columnUtils';
import {AbstractColDef, ColDef, ColGroupDef} from "../entities/colDef";
import {ColumnKeyCreator} from "./columnKeyCreator";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {Column} from "../entities/column";
import {Autowired, Bean, Context, Qualifier} from "../context/context";
import {Utils as _} from "../utils";
import { DefaultColumnTypes } from "../entities/defaultColumnTypes";

// takes ColDefs and ColGroupDefs and turns them into Columns and OriginalGroups
@Bean('columnFactory')
export class ColumnFactory {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('context') private context: Context;

    private logger: Logger;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ColumnFactory');
    }

    public createColumnTree(defs: (ColDef|ColGroupDef)[], primaryColumns: boolean, existingColumns?: Column[])
        : {columnTree: OriginalColumnGroupChild[], treeDept: number} {

        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that could be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        let columnKeyCreator = new ColumnKeyCreator();
        if (existingColumns) {
            let existingKeys: string[] = existingColumns.map( col => col.getId() );
            columnKeyCreator.addExistingKeys(existingKeys);
        }

        // we take a copy of the columns as we are going to be removing from them
        let existingColsCopy = existingColumns ? existingColumns.slice() : null;

        // create am unbalanced tree that maps the provided definitions
        let unbalancedTree = this.recursivelyCreateColumns(defs, 0, primaryColumns,
            existingColsCopy, columnKeyCreator);
        let treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        let res = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);

        this.columnUtils.depthFirstOriginalTreeSearch(res, (child: OriginalColumnGroupChild)=> {
            if (child instanceof OriginalColumnGroup) {
                (<OriginalColumnGroup>child).setupExpandable();
            }
        });

        return {
            columnTree: res,
            treeDept: treeDept
        };
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
                true,
                i);
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

    private balanceColumnTree(unbalancedTree: OriginalColumnGroupChild[], currentDept: number,
                              columnDept: number, columnKeyCreator: ColumnKeyCreator): OriginalColumnGroupChild[] {

        let result: OriginalColumnGroupChild[] = [];

        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        unbalancedTree.forEach( (child: OriginalColumnGroupChild)=> {
            if (child instanceof OriginalColumnGroup) {
                let originalGroup = <OriginalColumnGroup> child;
                let newChildren = this.balanceColumnTree(originalGroup.getChildren(),
                    currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            } else {
                let newChild = child;
                for (let i = columnDept-1; i>=currentDept; i--) {
                    let newColId = columnKeyCreator.getUniqueKey(null, null);
                    let colGroupDefMerged = this.createMergedColGroupDef(null);
                    let paddedGroup = new OriginalColumnGroup(colGroupDefMerged, newColId, true, currentDept);
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

    private recursivelyCreateColumns(defs: (ColDef|ColGroupDef)[], level: number,
                                     primaryColumns: boolean, existingColsCopy: Column[],
                                     columnKeyCreator: ColumnKeyCreator): OriginalColumnGroupChild[] {

        let result: OriginalColumnGroupChild[] = [];

        if (!defs) {
            return result;
        }

        defs.forEach( (def: ColDef|ColGroupDef)=> {
            let newGroupOrColumn: OriginalColumnGroupChild;
            if (this.isColumnGroup(def)) {
                newGroupOrColumn = this.createColumnGroup(primaryColumns, <ColGroupDef> def, level, existingColsCopy, columnKeyCreator);
            } else {
                newGroupOrColumn = this.createColumn(primaryColumns, <ColDef> def, existingColsCopy, columnKeyCreator);
            }
            result.push(newGroupOrColumn);
        });

        return result;
    }

    private createColumnGroup(primaryColumns: boolean, colGroupDef: ColGroupDef, level: number,
                              existingColumns: Column[], columnKeyCreator: ColumnKeyCreator): OriginalColumnGroup {
        let colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);

        let groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId, null);
        let originalGroup = new OriginalColumnGroup(colGroupDefMerged, groupId, false, level);
        this.context.wireBean(originalGroup);
        let children = this.recursivelyCreateColumns(colGroupDefMerged.children,
            level + 1, primaryColumns, existingColumns, columnKeyCreator);

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

    private createColumn(primaryColumns: boolean, colDef: ColDef,
                         existingColsCopy: Column[], columnKeyCreator: ColumnKeyCreator): Column {
        let colDefMerged = this.mergeColDefs(colDef);
        this.checkForDeprecatedItems(colDefMerged);

        // see if column already exists
        let column = this.findExistingColumn(colDef, existingColsCopy);

        // no existing column, need to create one
        if (!column) {
            let colId = columnKeyCreator.getUniqueKey(colDefMerged.colId, colDefMerged.field);
            column = new Column(colDefMerged, colDef, colId, primaryColumns);
            this.context.wireBean(column);
        }

        return column;
    }

    private findExistingColumn(colDef: ColDef, existingColsCopy: Column[]): Column {

        let res: Column = _.find(existingColsCopy, col => {
            let oldColDef = col.getUserProvidedColDef();
            if (!oldColDef) { return false; }

            // first check object references
            if (oldColDef===colDef) {
                return true;
            }
            // second check id's
            let oldColHadId = oldColDef.colId !== null && oldColDef.colId !== undefined;
            if (oldColHadId) {
                return oldColDef.colId === colDef.colId;
            } else {
                return false;
            }
        });

        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef's with common id
        if (res) {
            _.removeFromArray(existingColsCopy, res);
        }

        return res;
    }

    public mergeColDefs(colDef: ColDef) {
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