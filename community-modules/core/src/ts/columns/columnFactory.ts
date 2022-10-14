import { Logger, LoggerFactory } from '../logger';
import { ColumnUtils } from './columnUtils';
import { AbstractColDef, ColDef, ColGroupDef } from "../entities/colDef";
import { ColumnKeyCreator } from "./columnKeyCreator";
import { IProvidedColumn } from "../entities/iProvidedColumn";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Column } from "../entities/column";
import { Autowired, Bean, Qualifier } from "../context/context";
import { DefaultColumnTypes } from "../entities/defaultColumnTypes";
import { BeanStub } from "../context/beanStub";
import { Constants } from "../constants/constants";
import { iterateObject, mergeDeep } from '../utils/object';
import { attrToNumber, attrToBoolean } from '../utils/generic';
import { removeFromArray } from '../utils/array';

// takes ColDefs and ColGroupDefs and turns them into Columns and OriginalGroups
@Bean('columnFactory')
export class ColumnFactory extends BeanStub {

    @Autowired('columnUtils') private columnUtils: ColumnUtils;

    private logger: Logger;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ColumnFactory');
    }

    public createColumnTree(defs: (ColDef | ColGroupDef)[] | null, primaryColumns: boolean, existingTree?: IProvidedColumn[])
        : { columnTree: IProvidedColumn[], treeDept: number; } {

        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that could be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        const columnKeyCreator = new ColumnKeyCreator();

        const {existingCols, existingGroups, existingColKeys} = this.extractExistingTreeData(existingTree);
        columnKeyCreator.addExistingKeys(existingColKeys);

        // create am unbalanced tree that maps the provided definitions
        const unbalancedTree = this.recursivelyCreateColumns(defs, 0, primaryColumns,
            existingCols, columnKeyCreator, existingGroups);
        const treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        const columnTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);

        const deptFirstCallback = (child: IProvidedColumn, parent: ProvidedColumnGroup) => {
            if (child instanceof ProvidedColumnGroup) {
                child.setupExpandable();
            }
            // we set the original parents at the end, rather than when we go along, as balancing the tree
            // adds extra levels into the tree. so we can only set parents when balancing is done.
            child.setOriginalParent(parent);
        };

        this.columnUtils.depthFirstOriginalTreeSearch(null, columnTree, deptFirstCallback);

        return {
            columnTree,
            treeDept
        };
    }

    private extractExistingTreeData(existingTree?: IProvidedColumn[]):
        {
            existingCols: Column[],
            existingGroups: ProvidedColumnGroup[],
            existingColKeys: string[]
        }  {

        const existingCols: Column[] = [];
        const existingGroups: ProvidedColumnGroup[] = [];
        const existingColKeys: string[] = [];

        if (existingTree) {
            this.columnUtils.depthFirstOriginalTreeSearch(null, existingTree, (item: IProvidedColumn) => {
                if (item instanceof ProvidedColumnGroup) {
                    const group = item;
                    existingGroups.push(group);
                } else {
                    const col = item as Column;
                    existingColKeys.push(col.getId());
                    existingCols.push(col);
                }
            });
        }

        return {existingCols, existingGroups, existingColKeys};
    }

    public createForAutoGroups(autoGroupCols: Column[], gridBalancedTree: IProvidedColumn[]): IProvidedColumn[] {
        return autoGroupCols.map((col) => this.createAutoGroupTreeItem(gridBalancedTree, col));
    }

    private createAutoGroupTreeItem(balancedColumnTree: IProvidedColumn[], column: Column): IProvidedColumn {
        const dept = this.findDepth(balancedColumnTree);

        // at the end, this will be the top of the tree item.
        let nextChild: IProvidedColumn = column;

        for (let i = dept - 1; i >= 0; i--) {
            const autoGroup = new ProvidedColumnGroup(
                null,
                `FAKE_PATH_${column.getId()}}_${i}`,
                true,
                i
            );
            this.context.createBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild.setOriginalParent(autoGroup);
            nextChild = autoGroup;
        }

        // at this point, the nextChild is the top most item in the tree
        return nextChild;
    }

    private findDepth(balancedColumnTree: IProvidedColumn[]): number {
        let dept = 0;
        let pointer = balancedColumnTree;

        while (pointer && pointer[0] && pointer[0] instanceof ProvidedColumnGroup) {
            dept++;
            pointer = (pointer[0] as ProvidedColumnGroup).getChildren();
        }
        return dept;
    }

    private balanceColumnTree(
        unbalancedTree: IProvidedColumn[],
        currentDept: number,
        columnDept: number,
        columnKeyCreator: ColumnKeyCreator
    ): IProvidedColumn[] {

        const result: IProvidedColumn[] = [];

        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        for (let i = 0; i < unbalancedTree.length; i++) {
            const child = unbalancedTree[i];
            if (child instanceof ProvidedColumnGroup) {
                // child is a group, all we do is go to the next level of recursion
                const originalGroup = child;
                const newChildren = this.balanceColumnTree(originalGroup.getChildren(),
                    currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            } else {
                // child is a column - so here we add in the padded column groups if needed
                let firstPaddedGroup: ProvidedColumnGroup | undefined;
                let currentPaddedGroup: ProvidedColumnGroup | undefined;

                // this for loop will NOT run any loops if no padded column groups are needed
                for (let j = columnDept - 1; j >= currentDept; j--) {
                    const newColId = columnKeyCreator.getUniqueKey(null, null);
                    const colGroupDefMerged = this.createMergedColGroupDef(null);

                    const paddedGroup = new ProvidedColumnGroup(colGroupDefMerged, newColId, true, currentDept);
                    this.context.createBean(paddedGroup);

                    if (currentPaddedGroup) {
                        currentPaddedGroup.setChildren([paddedGroup]);
                    }

                    currentPaddedGroup = paddedGroup;

                    if (!firstPaddedGroup) {
                        firstPaddedGroup = currentPaddedGroup;
                    }
                }

                // likewise this if statement will not run if no padded groups
                if (firstPaddedGroup && currentPaddedGroup) {
                    result.push(firstPaddedGroup);
                    const hasGroups = unbalancedTree.some(leaf => leaf instanceof ProvidedColumnGroup);

                    if (hasGroups) {
                        currentPaddedGroup.setChildren([child]);
                        continue;
                    } else {
                        currentPaddedGroup.setChildren(unbalancedTree);
                        break;
                    }
                }

                result.push(child);
            }
        }

        return result;
    }

    private findMaxDept(treeChildren: IProvidedColumn[], dept: number): number {
        let maxDeptThisLevel = dept;

        for (let i = 0; i < treeChildren.length; i++) {
            const abstractColumn = treeChildren[i];
            if (abstractColumn instanceof ProvidedColumnGroup) {
                const originalGroup = abstractColumn;
                const newDept = this.findMaxDept(originalGroup.getChildren(), dept + 1);
                if (maxDeptThisLevel < newDept) {
                    maxDeptThisLevel = newDept;
                }
            }
        }

        return maxDeptThisLevel;
    }

    private recursivelyCreateColumns(
        defs: (ColDef | ColGroupDef)[] | null,
        level: number,
        primaryColumns: boolean,
        existingColsCopy: Column[],
        columnKeyCreator: ColumnKeyCreator,
        existingGroups: ProvidedColumnGroup[]
    ): IProvidedColumn[] {
        return (defs || []).map((def) => {
            if (this.isColumnGroup(def)) {
                return this.createColumnGroup(primaryColumns, def as ColGroupDef, level, existingColsCopy,
                    columnKeyCreator, existingGroups);
            } else {
                return this.createColumn(primaryColumns, def as ColDef, existingColsCopy, columnKeyCreator);
            }
        });
    }

    private createColumnGroup(
        primaryColumns: boolean,
        colGroupDef: ColGroupDef,
        level: number,
        existingColumns: Column[],
        columnKeyCreator: ColumnKeyCreator,
        existingGroups: ProvidedColumnGroup[]
    ): ProvidedColumnGroup {
        const colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);
        const groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId || null, null);
        const existingGroup = this.findExistingGroup(colGroupDef, existingGroups);

        let providedGroup: ProvidedColumnGroup;

        if (existingGroup) {
            providedGroup = existingGroup;
            providedGroup.reset(colGroupDefMerged, level);
            removeFromArray(existingGroups, existingGroup);
        } else {
            providedGroup = new ProvidedColumnGroup(colGroupDefMerged, groupId, false, level);
            this.context.createBean(providedGroup);    
        }

        const children = this.recursivelyCreateColumns(colGroupDefMerged.children,
            level + 1, primaryColumns, existingColumns, columnKeyCreator, existingGroups);

        providedGroup.setChildren(children);

        return providedGroup;
    }

    private createMergedColGroupDef(colGroupDef: ColGroupDef | null): ColGroupDef {
        const colGroupDefMerged: ColGroupDef = {} as ColGroupDef;
        Object.assign(colGroupDefMerged, this.gridOptionsWrapper.getDefaultColGroupDef());
        Object.assign(colGroupDefMerged, colGroupDef);
        this.checkForDeprecatedItems(colGroupDefMerged);

        return colGroupDefMerged;
    }

    private createColumn(
        primaryColumns: boolean,
        colDef: ColDef,
        existingColsCopy: Column[] | null,
        columnKeyCreator: ColumnKeyCreator
    ): Column {
        const colDefMerged = this.mergeColDefs(colDef);

        this.checkForDeprecatedItems(colDefMerged);

        // see if column already exists
        let column = this.findExistingColumn(colDef, existingColsCopy);

        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (existingColsCopy && column) {
            removeFromArray(existingColsCopy, column);
        }

        if (!column) {
            // no existing column, need to create one
            const colId = columnKeyCreator.getUniqueKey(colDefMerged.colId, colDefMerged.field);
            column = new Column(colDefMerged, colDef, colId, primaryColumns);
            this.context.createBean(column);
        } else {
            column.setColDef(colDefMerged, colDef);
            this.applyColumnState(column, colDefMerged);
        }

        return column;
    }

    public applyColumnState(column: Column, colDef: ColDef): void {
        // flex
        const flex = attrToNumber(colDef.flex);
        if (flex !== undefined) {
            column.setFlex(flex);
        }

        // width - we only set width if column is not flexing
        const noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            const width = attrToNumber(colDef.width);
            if (width != null) {
                column.setActualWidth(width);
            } else {
                // otherwise set the width again, in case min or max width has changed,
                // and width needs to be adjusted.
                const widthBeforeUpdate = column.getActualWidth();
                column.setActualWidth(widthBeforeUpdate);
            }
        }

        // sort - anything but undefined will set sort, thus null or empty string will clear the sort
        if (colDef.sort !== undefined) {
            if (colDef.sort == Constants.SORT_ASC || colDef.sort == Constants.SORT_DESC) {
                column.setSort(colDef.sort);
            } else {
                column.setSort(undefined);
            }
        }

        // sorted at - anything but undefined, thus null will clear the sortIndex
        const sortIndex = attrToNumber(colDef.sortIndex);
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }

        // hide - anything but undefined, thus null will clear the hide
        const hide = attrToBoolean(colDef.hide);
        if (hide !== undefined) {
            column.setVisible(!hide);
        }

        // pinned - anything but undefined, thus null or empty string will remove pinned
        if (colDef.pinned !== undefined) {
            column.setPinned(colDef.pinned);
        }
    }

    private findExistingColumn(newColDef: ColDef, existingColsCopy: Column[] | null): Column | undefined {
        return (existingColsCopy || []).find(existingCol => {

            const existingColDef = existingCol.getUserProvidedColDef();
            if (!existingColDef) { return false; }

            const newHasId = newColDef.colId != null;
            const newHasField = newColDef.field != null;

            if (newHasId) {
                return existingCol.getId() === newColDef.colId;
            }

            if (newHasField) {
                return existingColDef.field === newColDef.field;
            }

            // if no id or field present, then try object equivalence.
            if (existingColDef === newColDef) { return true; }

            return false;
        });
    }

    private findExistingGroup(newGroupDef: ColGroupDef, existingGroups: ProvidedColumnGroup[]): ProvidedColumnGroup | undefined {
        return existingGroups.find(existingGroup => {

            const existingDef = existingGroup.getColGroupDef();
            if (!existingDef) { return false; }

            const newHasId = newGroupDef.groupId != null;

            if (newHasId) {
                return existingGroup.getId() === newGroupDef.groupId;
            }

            return false;
        });
    }

    public mergeColDefs(colDef: ColDef): ColDef {
        // start with empty merged definition
        const colDefMerged: ColDef = {} as ColDef;

        // merge properties from default column definitions
        const defaultColDef = this.gridOptionsWrapper.getDefaultColDef();
        mergeDeep(colDefMerged, defaultColDef, false, true);

        // merge properties from column type properties
        let columnType = colDef.type;

        if (!columnType) {
            columnType = defaultColDef && defaultColDef.type;
        }

        // if type of both colDef and defaultColDef, then colDef gets preference
        if (columnType) {
            this.assignColumnTypes(columnType, colDefMerged);
        }

        // merge properties from column definitions
        mergeDeep(colDefMerged, colDef, false, true);

        const autoGroupColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        const isSortingCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        if (colDef.rowGroup && autoGroupColDef && isSortingCoupled) {
            // override the sort for row group columns where the autoGroupColDef defines these values.
            mergeDeep(colDefMerged, { sort: autoGroupColDef.sort, initialSort: autoGroupColDef.initialSort } as ColDef, false, true);
        }

        return colDefMerged;
    }

    private assignColumnTypes(type: string | string[], colDefMerged: ColDef) {
        let typeKeys: string[] = [];

        if (type instanceof Array) {
            const invalidArray = type.some(a => typeof a !== 'string');
            if (invalidArray) {
                console.warn("AG Grid: if colDef.type is supplied an array it should be of type 'string[]'");
            } else {
                typeKeys = type;
            }
        } else if (typeof type === 'string') {
            typeKeys = type.split(',');
        } else {
            console.warn("AG Grid: colDef.type should be of type 'string' | 'string[]'");
            return;
        }

        // merge user defined with default column types
        const allColumnTypes = Object.assign({}, DefaultColumnTypes);
        const userTypes = this.gridOptionsWrapper.getColumnTypes() || {};

        iterateObject(userTypes, (key, value) => {
            if (key in allColumnTypes) {
                console.warn(`AG Grid: the column type '${key}' is a default column type and cannot be overridden.`);
            } else {
                allColumnTypes[key] = value;
            }
        });

        typeKeys.forEach((t) => {
            const typeColDef = allColumnTypes[t.trim()];
            if (typeColDef) {
                mergeDeep(colDefMerged, typeColDef, false, true);
            } else {
                console.warn("AG Grid: colDef.type '" + t + "' does not correspond to defined gridOptions.columnTypes");
            }
        });
    }

    private checkForDeprecatedItems(colDef: AbstractColDef) {
        if (colDef) {
            const colDefNoType = colDef as any; // take out the type, so we can access attributes not defined in the type
            if (colDefNoType.group !== undefined) {
                console.warn('AG Grid: colDef.group is invalid, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.headerGroup !== undefined) {
                console.warn('AG Grid: colDef.headerGroup is invalid, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.headerGroupShow !== undefined) {
                console.warn('AG Grid: colDef.headerGroupShow is invalid, should be columnGroupShow, please check documentation on how to do grouping as it changed in version 3');
            }

            if (colDefNoType.suppressRowGroup !== undefined) {
                console.warn('AG Grid: colDef.suppressRowGroup is deprecated, please use colDef.type instead');
            }
            if (colDefNoType.suppressAggregation !== undefined) {
                console.warn('AG Grid: colDef.suppressAggregation is deprecated, please use colDef.type instead');
            }

            if (colDefNoType.suppressRowGroup || colDefNoType.suppressAggregation) {
                console.warn('AG Grid: colDef.suppressAggregation and colDef.suppressRowGroup are deprecated, use allowRowGroup, allowPivot and allowValue instead');
            }

            if (colDefNoType.displayName) {
                console.warn("AG Grid: Found displayName " + colDefNoType.displayName + ", please use headerName instead, displayName is deprecated.");
                colDefNoType.headerName = colDefNoType.displayName;
            }
        }
    }

    // if object has children, we assume it's a group
    private isColumnGroup(abstractColDef: ColDef | ColGroupDef): boolean {
        return (abstractColDef as ColGroupDef).children !== undefined;
    }
}
