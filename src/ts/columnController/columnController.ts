import _ from '../utils';
import constants from '../constants';
import ColumnGroup from "../entities/columnGroup";
import Column from "../entities/column";
import {ColDef} from "../entities/colDef";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import GridOptionsWrapper from "../gridOptionsWrapper";
import {Grid} from "../grid";
import SelectionRendererFactory from "../selectionRendererFactory";
import ExpressionService from "../expressionService";
import MasterSlaveService from "../masterSlaveService";
import BalancedColumnTreeBuilder from "./balancedColumnTreeBuilder";
import DisplayedGroupCreator from "./displayedGroupCreator";
import AutoWidthCalculator from "../rendering/autoWidthCalculator";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import ValueService from "../valueService";
import EventService from "../eventService";
import ColumnUtils from "./columnUtils";
import {Logger} from "../logger";
import {LoggerFactory} from "../logger";
import {Events} from "../events";
import ColumnChangeEvent from "../columnChangeEvent";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import GroupInstanceIdCreator from "./groupInstanceIdCreator";
import {defaultGroupComparator} from "../functions";

export class ColumnApi {

    constructor(private _columnController: ColumnController) {}
    public sizeColumnsToFit(gridWidth: any): void { this._columnController.sizeColumnsToFit(gridWidth); }
    public setColumnGroupOpened(group: ColumnGroup|string, newValue: boolean, instanceId?: number): void { this._columnController.setColumnGroupOpened(group, newValue, instanceId); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this._columnController.getColumnGroup(name, instanceId); }
    public getDisplayNameForCol(column: any): string { return this._columnController.getDisplayNameForCol(column); }
    public getColumn(key: any): Column { return this._columnController.getColumn(key); }
    public setState(columnState: any): void { return this._columnController.setState(columnState); }
    public getState(): [any] { return this._columnController.getState(); }
    public resetState(): void { this._columnController.resetState(); }
    public isPinning(): boolean { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this._columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this._columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this._columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this._columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: Column|ColDef|String, visible: boolean): void { this._columnController.setColumnVisible(key, visible); }
    public setColumnsVisible(keys: (Column|ColDef|String)[], visible: boolean): void { this._columnController.setColumnsVisible(keys, visible); }
    public setColumnPinned(key: Column|ColDef|String, pinned: string): void { this._columnController.setColumnPinned(key, pinned); }
    public setColumnsPinned(keys: (Column|ColDef|String)[], pinned: string): void { this._columnController.setColumnsPinned(keys, pinned); }

    public getAllColumns(): Column[] { return this._columnController.getAllColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this._columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this._columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this._columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this._columnController.getAllDisplayedColumns(); }
    public getRowGroupColumns(): Column[] { return this._columnController.getRowGroupColumns(); }
    public getValueColumns(): Column[] { return this._columnController.getValueColumns(); }
    public moveColumn(fromIndex: number, toIndex: number): void { this._columnController.moveColumnByIndex(fromIndex, toIndex); }
    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this._columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunction(column: Column, aggFunc: string): void { this._columnController.setColumnAggFunction(column, aggFunc); }
    public setColumnWidth(key: Column | string | ColDef, newWidth: number, finished: boolean = true): void { this._columnController.setColumnWidth(key, newWidth, finished); }
    public removeValueColumn(column: Column): void { this._columnController.removeValueColumn(column); }
    public addValueColumn(column: Column): void { this._columnController.addValueColumn(column); }
    public removeRowGroupColumn(column: Column): void { this._columnController.removeRowGroupColumn(column); }
    public addRowGroupColumn(column: Column): void { this._columnController.addRowGroupColumn(column); }
    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: Column|ColDef|String): void {return this._columnController.autoSizeColumn(key); }
    public autoSizeColumns(keys: (Column|ColDef|String)[]): void {return this._columnController.autoSizeColumns(keys); }

    public columnGroupOpened(group: ColumnGroup|string, newValue: boolean): void {
        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
        this.setColumnGroupOpened(group, newValue);
    }
    public hideColumns(colIds: any, hide: any): void {
        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
        this._columnController.setColumnsVisible(colIds, !hide);
    }
    public hideColumn(colId: any, hide: any): void {
        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
        this._columnController.setColumnVisible(colId, !hide);
    }
}

export class ColumnController {

    private gridOptionsWrapper: GridOptionsWrapper;
    private angularGrid: Grid;
    private selectionRendererFactory: SelectionRendererFactory;
    private expressionService: ExpressionService;
    private masterSlaveController: MasterSlaveService;
    private balancedColumnTreeBuilder: BalancedColumnTreeBuilder;
    private displayedGroupCreator: DisplayedGroupCreator;
    private autoWidthCalculator: AutoWidthCalculator;

    // these are the columns provided by the client. this doesn't change, even if the
    // order or state of the columns and groups change. it will only change if the client
    // provides a new set of column definitions. otherwise this tree is used to build up
    // the groups for displaying.
    private originalBalancedTree: OriginalColumnGroupChild[];
    // these are every single column, regardless of whether they are shown on
    // screen or not (cols can be missing if visible=false or the group they are
    // in is closed). basically it's the leaf level nodes of the tree above (originalBalancedTree)
    private allColumns: Column[]; // every column available

    // these are the columns actually shown on the screen. used by the header renderer,
    // as header needs to know about column groups and the tree structure.
    private displayedLeftColumnTree: ColumnGroupChild[];
    private displayedRightColumnTree: ColumnGroupChild[];
    private displayedCentreColumnTree: ColumnGroupChild[];

    // these are the lists used by the rowRenderer to render nodes. almost the leaf nodes of the above
    // displayed trees, however it also takes into account if the groups are open or not.
    private displayedLeftColumns: Column[] = [];
    private displayedRightColumns: Column[] = [];
    private displayedCenterColumns: Column[] = [];

    private headerRowCount = 0;

    private rowGroupColumns: Column[];
    private valueColumns: Column[];

    private groupAutoColumn: Column;

    private setupComplete = false;
    private valueService: ValueService;

    private eventService: EventService;
    private columnUtils: ColumnUtils;

    private logger: Logger;

    constructor() {
    }

    public init(angularGrid: Grid, selectionRendererFactory: SelectionRendererFactory,
                gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService,
                valueService: ValueService, masterSlaveController: MasterSlaveService,
                eventService: EventService, balancedColumnTreeBuilder: BalancedColumnTreeBuilder,
                displayedGroupCreator: DisplayedGroupCreator, columnUtils: ColumnUtils,
                autoWidthCalculator: AutoWidthCalculator, loggerFactory: LoggerFactory) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.selectionRendererFactory = selectionRendererFactory;
        this.expressionService = expressionService;
        this.valueService = valueService;
        this.masterSlaveController = masterSlaveController;
        this.eventService = eventService;
        this.balancedColumnTreeBuilder = balancedColumnTreeBuilder;
        this.displayedGroupCreator = displayedGroupCreator;
        this.columnUtils = columnUtils;
        this.autoWidthCalculator = autoWidthCalculator;
        this.logger = loggerFactory.create('ColumnController');
    }

    public autoSizeColumns(keys: (Column|ColDef|String)[]): void {
        this.actionOnColumns(keys, (column: Column)=> {
            var requiredWidth = this.autoWidthCalculator.getPreferredWidthForColumn(column);
            if (requiredWidth>0) {
                var newWidth = this.normaliseColumnWidth(column, requiredWidth);
                column.setActualWidth(newWidth);
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_RESIZED).withFinished(true);
        });
    }

    public autoSizeColumn(key: Column|String|ColDef): void {
        this.autoSizeColumns([key]);
    }

    private getColumnsFromTree(rootColumns: OriginalColumnGroupChild[]): Column[] {
        var result: Column[] = [];
        recursiveFindColumns(rootColumns);
        return result;

        function recursiveFindColumns(childColumns: OriginalColumnGroupChild[]): void {
            for (var i = 0; i<childColumns.length; i++) {
                var child = childColumns[i];
                if (child instanceof Column) {
                    result.push(<Column>child);
                } else if (child instanceof OriginalColumnGroup) {
                    recursiveFindColumns((<OriginalColumnGroup>child).getChildren());
                }
            }
        }
    }

    public getAllDisplayedColumnGroups(): ColumnGroupChild[] {
        if (this.displayedLeftColumnTree && this.displayedRightColumnTree && this.displayedCentreColumnTree) {
            return this.displayedLeftColumnTree
                .concat(this.displayedCentreColumnTree)
                .concat(this.displayedRightColumnTree);
        } else {
            return null;
        }
    }

    public getColumnApi(): ColumnApi {
        return new ColumnApi(this);
    }

    public isSetupComplete(): boolean {
        return this.setupComplete;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.headerRowCount;
    }

    // + headerRenderer -> setting pinned body width
    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] {
        return this.displayedLeftColumnTree;
    }
    // + headerRenderer -> setting pinned body width
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] {
        return this.displayedRightColumnTree;
    }
    // + headerRenderer -> setting pinned body width
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] {
        return this.displayedCentreColumnTree;
    }

    // gridPanel -> ensureColumnVisible
    public isColumnDisplayed(column: Column): boolean {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    }

    // + csvCreator
    public getAllDisplayedColumns(): Column[] {
        // order we add the arrays together is important, so the result
        // has the columns left to right, as they appear on the screen.
        return this.displayedLeftColumns
            .concat(this.displayedCenterColumns)
            .concat(this.displayedRightColumns);
    }

    // used by:
    // + angularGrid -> setting pinned body width
    public getPinnedLeftContainerWidth() {
        return this.getWithOfColsInList(this.displayedLeftColumns);
    }
    public getPinnedRightContainerWidth() {
        return this.getWithOfColsInList(this.displayedRightColumns);
    }

    public addRowGroupColumn(column: Column): void {
        if (this.allColumns.indexOf(column) < 0) {
            console.warn('not a valid column: ' + column);
            return;
        }
        if (this.rowGroupColumns.indexOf(column) >= 0) {
            console.warn('column is already a value column');
            return;
        }
        this.rowGroupColumns.push(column);
        // because we could be taking out columns, the displayed
        // columns may differ, so need to work out all the columns again
        this.updateModel();
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
    }

    public removeRowGroupColumn(column: Column): void {
        if (this.rowGroupColumns.indexOf(column) < 0) {
            console.warn('column not a row group');
            return;
        }
        _.removeFromArray(this.rowGroupColumns, column);
        this.updateModel();
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
    }

    public addValueColumn(column: Column): void {
        if (this.allColumns.indexOf(column) < 0) {
            console.warn('not a valid column: ' + column);
            return;
        }
        if (this.valueColumns.indexOf(column) >= 0) {
            console.warn('column is already a value column');
            return;
        }
        if (!column.getAggFunc()) { // defualt to SUM if aggFunc is missing
            column.setAggFunc(Column.AGG_SUM);
        }
        this.valueColumns.push(column);
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGE);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGE, event);
    }

    public removeValueColumn(column: Column): void {
        if (this.valueColumns.indexOf(column) < 0) {
            console.warn('column not a value');
            return;
        }
        _.removeFromArray(this.valueColumns, column);
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGE);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGE, event);
    }

    public getFirstRightPinnedColIndex(): number {
        return this.displayedLeftColumns.length + this.displayedCenterColumns.length;
    }

    // returns the width we can set to this col, taking into consideration min and max widths
    private normaliseColumnWidth(column: Column, newWidth: number): number {
        if (newWidth < column.getMinWidth()) {
            newWidth = column.getMinWidth();
        }

        if (column.isGreaterThanMax(newWidth)) {
            newWidth = column.getMaxWidth();
        }

        return newWidth;
    }

    public setColumnWidth(key: Column | string | ColDef, newWidth: number, finished: boolean): void {
        var column = this.getColumn(key);
        if (!column) {
            return;
        }

        newWidth = this.normaliseColumnWidth(column, newWidth);

        var widthChanged = column.getActualWidth() !== newWidth;

        if (widthChanged) {
            column.setActualWidth(newWidth);
            this.setLeftValues();
        }

        // check for change first, to avoid unnecessary firing of events
        // however we always fire 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will fire change events
        // in all the columns in the group, but only one with get the pixel.
        if (finished || widthChanged) {
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_RESIZED).withColumn(column).withFinished(finished);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_RESIZED, event);
        }
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        column.setAggFunc(aggFunc);
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGE);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGE, event);
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void {
        var column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
    }

    public getColumnIndex(column: Column): number {
        return this.allColumns.indexOf(column);
    }

    public getPathForColumn(column: Column): ColumnGroup[] {
        return this.columnUtils.getPathForColumn(column, this.getAllDisplayedColumnGroups());
    }

    public moveColumns(keys: (Column|ColDef|String)[], toIndex: number): void {
        this.actionOnColumns(keys, (column: Column)=> {
            var fromIndex = this.allColumns.indexOf(column);
            this.allColumns.splice(fromIndex, 1);
            this.allColumns.splice(toIndex, 0, column);
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_MOVED).withToIndex(toIndex);
        });
        this.updateModel();
    }

    public moveColumn(key: string|Column|ColDef, toIndex: number) {
        this.moveColumns([key], toIndex);
    }

    public moveColumnByIndex(fromIndex: number, toIndex: number): void {
        var column = this.allColumns[fromIndex];
        this.moveColumn(column, toIndex);
    }

    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    public getBodyContainerWidth(): number {
        var result = this.getWithOfColsInList(this.displayedCenterColumns);
        return result;
    }

    // + rowController
    public getValueColumns(): Column[] {
        return this.valueColumns;
    }

    // + toolPanel
    public getRowGroupColumns(): Column[] {
        return this.rowGroupColumns;
    }

    // + rowController -> while inserting rows
    public getDisplayedCenterColumns(): Column[] {
        return this.displayedCenterColumns;
    }
    // + rowController -> while inserting rows
    public getDisplayedLeftColumns(): Column[] {
        return this.displayedLeftColumns;
    }
    public getDisplayedRightColumns(): Column[] {
        return this.displayedRightColumns;
    }

    // used by:
    // + inMemoryRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllColumns(): Column[] {
        return this.allColumns;
    }

    public setColumnVisible(key: Column|ColDef|String, visible: boolean): void {
        this.setColumnsVisible([key], visible);
    }

    public setColumnsVisible(keys: (Column|ColDef|String)[], visible: boolean): void {
        this.actionOnColumns(keys, (column: Column)=> {
            column.setVisible(visible);
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_VISIBLE).withVisible(visible);
        });
    }

    public setColumnPinned(key: Column|ColDef|String, pinned: string|boolean): void {
        this.setColumnsPinned([key], pinned);
    }

    public setColumnsPinned(keys: (Column|ColDef|String)[], pinned: string|boolean): void {
        var actualPinned: string;
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            actualPinned = Column.PINNED_LEFT;
        } else if (pinned === Column.PINNED_RIGHT) {
            actualPinned = Column.PINNED_RIGHT;
        } else {
            actualPinned = null;
        }

        this.actionOnColumns(keys, (column: Column)=> {
            column.setPinned(actualPinned);
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_PINNED).withPinned(actualPinned);
        });
    }

    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    private actionOnColumns(keys: (Column|ColDef|String)[],
                            action: (column:Column)=>void,
                            createEvent: ()=>ColumnChangeEvent): void {

        if (!keys || keys.length===0) { return; }

        var updatedColumns: Column[] = [];

        keys.forEach( (key: Column|ColDef|String)=> {
            var column = this.getColumn(key);
            if (!column) {return;}
            action(column);
            updatedColumns.push(column);
        });

        if (updatedColumns.length===0) {return;}

        this.updateModel();
        var event = createEvent();

        event.withColumns(updatedColumns);
        if (updatedColumns.length===1) {
            event.withColumn(updatedColumns[0]);
        }

        this.eventService.dispatchEvent(event.getType(), event);
    }

    // same as getDisplayColBefore, but stays in current container,
    // so if column is pinned left, will only return pinned left columns
    public getDisplayedColBeforeForMoving(col: any): Column {
        if (col===this.groupAutoColumn) {
            return null;
        }
        var beforeCol = this.getDisplayedColBefore(col);
        if (beforeCol===this.groupAutoColumn) {
            return null;
        }
        if (beforeCol && beforeCol.getPinned()===col.getPinned()) {
            return beforeCol;
        } else {
            return null;
        }
    }

    public getPixelsBeforeConsideringPinned(column: Column): number {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var result = 0;
        for (var i = 0; i<allDisplayedColumns.length; i++) {
            var colToConsider = allDisplayedColumns[i];
            if (colToConsider===column) {
                return result;
            }
            if (colToConsider.getPinned()===column.getPinned()) {
                result += colToConsider.getActualWidth();
            }
        }
        // this should never happen, we should of come across our col in the above loop
        return null;
    }

    public getDisplayedColAfterForMoving(col: any): Column {
        if (col===this.groupAutoColumn) {
            return null;
        }
        var afterCol = this.getDisplayedColAfter(col);
        if (afterCol===this.groupAutoColumn) {
            return null;
        }
        if (afterCol && afterCol.getPinned()===col.getPinned()) {
            return afterCol;
        } else {
            return null;
        }
    }

    public getDisplayedColBefore(col: any): Column {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        } else {
            return null;
        }
    }

    // used by:
    // + rowRenderer -> for navigation
    public getDisplayedColAfter(col: Column): Column {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        var oldIndex = allDisplayedColumns.indexOf(col);
        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        } else {
            return null;
        }
    }

    public isPinningLeft(): boolean {
        return this.displayedLeftColumns.length > 0;
    }

    public isPinningRight(): boolean {
        return this.displayedRightColumns.length > 0;
    }

    public clearSortBarThisColumn(columnToSkip: Column): void {
        this.getAllColumnsIncludingAuto().forEach( (columnToClear: any)=> {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(columnToClear === columnToSkip)) {
                columnToClear.sort = null;
            }
        });
    }

    private getAllColumnsIncludingAuto(): Column[] {
        var result = this.allColumns.slice(0);
        if (this.groupAutoColumn) {
            result.push(this.groupAutoColumn);
        }
        return result;
    }

    public getColumnsWithSortingOrdered(): Column[] {
        // pull out all the columns that have sorting set
        var columnsWithSorting = <Column[]> _.filter(this.getAllColumnsIncludingAuto(), (column:Column) => { return !!column.getSort();} );

        // put the columns in order of which one got sorted first
        columnsWithSorting.sort( (a: any, b: any) => { return a.sortedAt - b.sortedAt} );

        return columnsWithSorting;
    }

    // used by row controller, when doing the sorting
    public getSortForRowController(): any[] {
        var columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            var ascending = column.getSort() === Column.SORT_ASC;
            return {
                inverter: ascending ? 1 : -1,
                column: column
            }
        });
    }

    // used by the public api, for saving the sort model
    public getSortModel() {
        var columnsWithSorting = this.getColumnsWithSortingOrdered();

        return _.map(columnsWithSorting, (column: Column) => {
            return {
                colId: column.getColId(),
                sort: column.getSort()
            }
        });
    }

    public setSortModel(sortModel: any) {
        if (!this.gridOptionsWrapper.isEnableSorting()) {
            console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
            return;
        }
        // first up, clear any previous sort
        var sortModelProvided = sortModel && sortModel.length > 0;

        this.getAllColumnsIncludingAuto().forEach( (column: Column)=> {
            var sortForCol: any = null;
            var sortedAt = -1;
            if (sortModelProvided && !column.getColDef().suppressSorting) {
                for (var j = 0; j < sortModel.length; j++) {
                    var sortModelEntry = sortModel[j];
                    if (typeof sortModelEntry.colId === 'string'
                        && typeof column.getColId() === 'string'
                        && sortModelEntry.colId === column.getColId()) {
                        sortForCol = sortModelEntry.sort;
                        sortedAt = j;
                    }
                }
            }

            if (sortForCol) {
                column.setSort(sortForCol);
                column.setSortedAt(sortedAt);
            } else {
                column.setSort(null);
                column.setSortedAt(null);
            }
        });
    }

    public getState(): [any] {
        if (!this.allColumns || this.allColumns.length < 0) {
            return <any>[];
        }
        var result = <any>[];
        for (var i = 0; i < this.allColumns.length; i++) {
            var column = this.allColumns[i];
            var rowGroupIndex = this.rowGroupColumns.indexOf(column);
            var resultItem = {
                colId: column.getColId(),
                hide: !column.isVisible(),
                aggFunc: column.getAggFunc() ? column.getAggFunc() : null,
                width: column.getActualWidth(),
                pinned: column.getPinned(),
                rowGroupIndex: rowGroupIndex >= 0 ? rowGroupIndex : null
            };
            result.push(resultItem);
        }
        return result;
    }

    public resetState(): void {
        // we can't use 'allColumns' as the order might of messed up, so get the original ordered list
        var originalColumns = this.allColumns = this.getColumnsFromTree(this.originalBalancedTree);
        var state: any[] = [];

        if (originalColumns) {
            originalColumns.forEach( (column) => {
                state.push({
                    colId: column.getColId(),
                    aggFunc: column.getColDef().aggFunc,
                    hide: column.getColDef().hide,
                    pinned: column.getColDef().pinned,
                    rowGroupIndex: column.getColDef().rowGroupIndex,
                    width: column.getColDef().width
                });
            });
        }
        this.setState(state);
    }

    public setState(columnState: any[]): void {
        var oldColumnList = this.allColumns;
        this.allColumns = [];
        this.rowGroupColumns = [];
        this.valueColumns = [];

        if (columnState) {
            columnState.forEach( (stateItem: any)=> {
                var oldColumn: Column = _.find(oldColumnList, 'colId', stateItem.colId);
                if (!oldColumn) {
                    console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                    return;
                }
                // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
                oldColumn.setVisible(!stateItem.hide);
                // sets pinned to 'left' or 'right'
                oldColumn.setPinned(stateItem.pinned);
                // if width provided and valid, use it, otherwise stick with the old width
                if (stateItem.width >= this.gridOptionsWrapper.getMinColWidth()) {
                    oldColumn.setActualWidth(stateItem.width);
                }
                // accept agg func only if valid
                var aggFuncValid = [Column.AGG_MIN, Column.AGG_MAX, Column.AGG_SUM].indexOf(stateItem.aggFunc) >= 0;
                if (aggFuncValid) {
                    oldColumn.setAggFunc(stateItem.aggFunc);
                    this.valueColumns.push(oldColumn);
                } else {
                    oldColumn.setAggFunc(null);
                }
                // if rowGroup
                if (typeof stateItem.rowGroupIndex === 'number' && stateItem.rowGroupIndex >= 0) {
                    this.rowGroupColumns.push(oldColumn);
                }
                this.allColumns.push(oldColumn);
                oldColumnList.splice(oldColumnList.indexOf(oldColumn), 1);
            });
        }

        // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
        oldColumnList.forEach( (oldColumn: Column) => {
            oldColumn.setVisible(false);
            oldColumn.setAggFunc(null);
            oldColumn.setPinned(null);
            this.allColumns.push(oldColumn);
        });

        // sort the row group columns
        this.rowGroupColumns.sort(function (colA: Column, colB: Column): number {
            var rowGroupIndexA = -1;
            var rowGroupIndexB = -1;
            for (var i = 0; i<columnState.length; i++) {
                var state = columnState[i];
                if (state.colId === colA.getColId()) {
                    rowGroupIndexA = state.rowGroupIndex;
                }
                if (state.colId === colB.getColId()) {
                    rowGroupIndexB = state.rowGroupIndex;
                }
            }
            return rowGroupIndexA - rowGroupIndexB;
        });

        this.updateModel();

        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
    }

    public getColumns(keys: any[]): Column[] {
        var foundColumns: Column[] = [];
        if (keys) {
            keys.forEach( (key: any) => {
                var column = this.getColumn(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }
        return foundColumns;
    }

    public getColumn(key: string|ColDef|Column): Column {
        if (!key) {return null;}

        for (var i = 0; i < this.allColumns.length; i++) {
            if (colMatches(this.allColumns[i])) {
                return this.allColumns[i];
            }
        }

        if (this.groupAutoColumn && colMatches(this.groupAutoColumn)) {
            return this.groupAutoColumn;
        }

        function colMatches(column: Column): boolean {
            var columnMatches = column === key;
            var colDefMatches = column.getColDef() === key;
            var idMatches = column.getColId() === key;
            return columnMatches || colDefMatches || idMatches;
        }

        console.log('could not find column for key ' + key);

        return null;
    }

    public getDisplayNameForCol(column: any): string {

        var colDef = column.colDef;
        var headerValueGetter = colDef.headerValueGetter;

        if (headerValueGetter) {
            var params = {
                colDef: colDef,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            } else if (typeof headerValueGetter === 'string') {
                // valueGetter is an expression, so execute the expression
                return this.expressionService.evaluate(headerValueGetter, params);
            } else {
                console.warn('ag-grid: headerValueGetter must be a function or a string');
            }

        } else if (colDef.displayName) {
            console.warn("ag-grid: Found displayName " + colDef.displayName + ", please use headerName instead, displayName is deprecated.");
            return colDef.displayName;
        } else {
            return colDef.headerName;
        }
    }

    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    public getColumnGroup(colId: string|ColumnGroup, instanceId?: number): ColumnGroup {

        if (!colId) {return null;}

        if (colId instanceof ColumnGroup) {
            return colId;
        }

        var allColumnGroups = this.getAllDisplayedColumnGroups();
        var checkInstanceId = typeof instanceId === 'number';
        var result: ColumnGroup = null;

        this.columnUtils.deptFirstAllColumnTreeSearch(allColumnGroups, (child: ColumnGroupChild)=> {
            if (child instanceof ColumnGroup) {
                var columnGroup = <ColumnGroup> child;
                var matched: boolean;
                if (checkInstanceId) {
                    matched = colId === columnGroup.getGroupId() && instanceId === columnGroup.getInstanceId();
                } else {
                    matched = colId === columnGroup.getGroupId();
                }
                if (matched) {
                    result = columnGroup;
                }
            }
        });

        return result;
    }

    // called by angularGrid
    public onColumnsChanged() {
        var columnDefs = this.gridOptionsWrapper.getColumnDefs();

        var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs);
        this.originalBalancedTree = balancedTreeResult.balancedTree;
        this.headerRowCount = balancedTreeResult.treeDept + 1;

        this.allColumns = this.getColumnsFromTree(this.originalBalancedTree);
        this.extractRowGroupColumns();
        this.createValueColumns();
        this.updateModel();
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
        this.setupComplete = true;
    }

    private extractRowGroupColumns(): void {
        this.rowGroupColumns = [];
        // pull out the columns
        this.allColumns.forEach( (column: Column) => {
            if (typeof column.getColDef().rowGroupIndex === 'number') {
                this.rowGroupColumns.push(column);
            }
        });
        // then sort them
        this.rowGroupColumns.sort(function (colA: Column, colB: Column): number {
            return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
        });
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(passedGroup: ColumnGroup|string, newValue: boolean, instanceId?:number): void {
        var groupToUse: ColumnGroup = this.getColumnGroup(passedGroup, instanceId);
        if (!groupToUse) { return; }
        this.logger.log('columnGroupOpened(' + groupToUse.getGroupId() + ',' + newValue + ')');
        groupToUse.setExpanded(newValue);
        this.updateGroupsAndDisplayedColumns();
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_GROUP_OPENED).withColumnGroup(groupToUse);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_GROUP_OPENED, event);
    }

    // used by updateModel
    private getColumnGroupState(): any {
        var groupState: any = {};
        this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.getAllDisplayedColumnGroups(), (child: ColumnGroupChild) => {
            if (child instanceof ColumnGroup) {
                var columnGroup = <ColumnGroup> child;
                var key = columnGroup.getGroupId();
                // if more than one instance of the group, we only record the state of the first item
                if (!groupState.hasOwnProperty(key)) {
                    groupState[key] = columnGroup.isExpanded();
                }
            }
        });
        return groupState;
    }

    // used by updateModel
    private setColumnGroupState(groupState: any): any {
        this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.getAllDisplayedColumnGroups(), (child: ColumnGroupChild) => {
            if (child instanceof ColumnGroup) {
                var columnGroup = <ColumnGroup> child;
                var key = columnGroup.getGroupId();
                var shouldExpandGroup = groupState[key]===true && columnGroup.isExpandable();
                if (shouldExpandGroup) {
                    columnGroup.setExpanded(true);
                }
            }
        });
    }

    // after:
    private updateModel() {
        // save opened / closed state
        var oldGroupState = this.getColumnGroupState();

        // following 3 methods are only called from here
        this.createGroupAutoColumn();
        var visibleColumns = this.updateVisibleColumns();
        this.buildAllGroups(visibleColumns);

        // restore opened / closed state
        this.setColumnGroupState(oldGroupState);

        // this is also called when a group is opened or closed
        this.updateGroupsAndDisplayedColumns();
    }

    private updateGroupsAndDisplayedColumns() {
        this.updateGroups();
        this.updateDisplayedColumnsFromGroups();
    }

    private updateDisplayedColumnsFromGroups() {
        this.addToDisplayedColumns(this.displayedLeftColumnTree, this.displayedLeftColumns);
        this.addToDisplayedColumns(this.displayedRightColumnTree, this.displayedRightColumns);
        this.addToDisplayedColumns(this.displayedCentreColumnTree, this.displayedCenterColumns);
        this.setLeftValues();
    }

    private setLeftValues(): void {
        // go through each list of displayed columns
        [this.displayedLeftColumns,this.displayedRightColumns,this.displayedCenterColumns].forEach( columns => {
            var left = 0;
            columns.forEach( column => {
                column.setLeft(left);
                left += column.getActualWidth();
            });
        });
    }

    private addToDisplayedColumns(displayedColumnTree: ColumnGroupChild[], displayedColumns: Column[]): void {
        displayedColumns.length = 0;
        this.columnUtils.deptFirstDisplayedColumnTreeSearch(displayedColumnTree, (child: ColumnGroupChild)=> {
            if (child instanceof Column) {
                displayedColumns.push(child);
            }
        });
    }

    // called from api
    public sizeColumnsToFit(gridWidth: any): void {
        // avoid divide by zero
        var allDisplayedColumns = this.getAllDisplayedColumns();

        if (gridWidth <= 0 || allDisplayedColumns.length === 0) {
            return;
        }

        var colsToNotSpread = _.filter(allDisplayedColumns, (column: Column): boolean => {
            return column.getColDef().suppressSizeToFit === true;
        });
        var colsToSpread = _.filter(allDisplayedColumns, (column: Column): boolean => {
            return column.getColDef().suppressSizeToFit !== true;
        });

        // make a copy of the cols that are going to be resized
        var colsToFireEventFor = colsToSpread.slice(0);

        var finishedResizing = false;
        while (!finishedResizing) {
            finishedResizing = true;
            var availablePixels = gridWidth - getTotalWidth(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach( (column: Column) => {
                    column.setMinimum();
                });
            } else {
                var scale = availablePixels / getTotalWidth(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                var pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (var i = colsToSpread.length - 1; i >= 0; i--) {
                    var column = colsToSpread[i];
                    var newWidth = Math.round(column.getActualWidth() * scale);
                    if (newWidth < column.getMinWidth()) {
                        column.setMinimum();
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else if (column.isGreaterThanMax(newWidth)) {
                        column.setActualWidth(column.getMaxWidth());
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else {
                        var onLastCol = i === 0;
                        if (onLastCol) {
                            column.setActualWidth(pixelsForLastCol);
                        } else {
                            pixelsForLastCol -= newWidth;
                            column.setActualWidth(newWidth);
                        }
                    }
                }
            }
        }

        this.setLeftValues();

        // widths set, refresh the gui
        colsToFireEventFor.forEach( (column: Column) => {
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_RESIZED).withColumn(column);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_RESIZED, event);
        });

        function moveToNotSpread(column: Column) {
            _.removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        }

        function getTotalWidth(columns: Column[]): number {
            var result = 0;
            for (var i = 0; i<columns.length; i++) {
                result += columns[i].getActualWidth();
            }
            return result;
        }
    }

    private buildAllGroups(visibleColumns: Column[]) {
        var leftVisibleColumns = _.filter(visibleColumns, (column)=> {
            return column.getPinned() === 'left';
        });

        var rightVisibleColumns = _.filter(visibleColumns, (column)=> {
            return column.getPinned() === 'right';
        });

        var centerVisibleColumns = _.filter(visibleColumns, (column)=> {
            return column.getPinned() !== 'left' && column.getPinned() !== 'right';
        });

        var groupInstanceIdCreator = new GroupInstanceIdCreator();
        this.displayedLeftColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            leftVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
        this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            rightVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
        this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            centerVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
    }

    private updateGroups(): void {
        var allGroups = this.getAllDisplayedColumnGroups();
        this.columnUtils.deptFirstAllColumnTreeSearch(allGroups, (child: ColumnGroupChild)=> {
            if (child instanceof ColumnGroup) {
                var group = <ColumnGroup> child;
                group.calculateDisplayedColumns();
            }
        });
    }

    private createGroupAutoColumn(): void {

        // see if we need to insert the default grouping column
        var needAGroupColumn = this.rowGroupColumns.length > 0
            && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
            && !this.gridOptionsWrapper.isGroupUseEntireRow()
            && !this.gridOptionsWrapper.isGroupSuppressRow();

        if (needAGroupColumn) {
            // if one provided by user, use it, otherwise create one
            var groupColDef = this.gridOptionsWrapper.getGroupColumnDef();
            if (!groupColDef) {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                groupColDef = {
                    headerName: localeTextFunc('group', 'Group'),
                    comparator: defaultGroupComparator,
                    cellRenderer: {
                        renderer: 'group'
                    }
                };
            }
            // we never allow moving the group column
            groupColDef.suppressMovable = true;

            var groupColumnWidth = this.columnUtils.calculateColInitialWidth(groupColDef);
            var colId = 'ag-Grid-AutoColumn';
            var minColWidth = this.gridOptionsWrapper.getMinColWidth();
            var maxColWidth = this.gridOptionsWrapper.getMaxColWidth();
            this.groupAutoColumn = new Column(groupColDef, groupColumnWidth, colId, minColWidth, maxColWidth);
        } else {
            this.groupAutoColumn = null;
        }
    }

    private updateVisibleColumns(): Column[] {
        var visibleColumns: Column[] = [];

        if (this.groupAutoColumn) {
            visibleColumns.push(this.groupAutoColumn);
        }

        for (var i = 0; i < this.allColumns.length; i++) {
            var column = this.allColumns[i];
            var hideBecauseOfRowGroup = this.rowGroupColumns.indexOf(column) >= 0
                && this.gridOptionsWrapper.isGroupHideGroupColumns();
            if (column.isVisible() && !hideBecauseOfRowGroup) {
                visibleColumns.push(this.allColumns[i]);
            }
        }

        return visibleColumns;
    }

    private createValueColumns(): void {
        this.valueColumns = [];

        // override with columns that have the aggFunc specified explicitly
        for (var i = 0; i < this.allColumns.length; i++) {
            var column = this.allColumns[i];
            if (column.getColDef().aggFunc) {
                column.setAggFunc(column.getColDef().aggFunc);
                this.valueColumns.push(column);
            }
        }
    }

    private getWithOfColsInList(columnList: Column[]) {
        var result = 0;
        for (var i = 0; i<columnList.length; i++) {
            result += columnList[i].getActualWidth();
        }
        return result;
    }
}