import {Utils as _} from "../utils";
import {ColumnGroup} from "../entities/columnGroup";
import {Column} from "../entities/column";
import {ColDef, AbstractColDef, ColGroupDef, IAggFunc} from "../entities/colDef";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ExpressionService} from "../expressionService";
import {BalancedColumnTreeBuilder} from "./balancedColumnTreeBuilder";
import {DisplayedGroupCreator} from "./displayedGroupCreator";
import {AutoWidthCalculator} from "../rendering/autoWidthCalculator";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {EventService} from "../eventService";
import {ColumnUtils} from "./columnUtils";
import {Logger, LoggerFactory} from "../logger";
import {Events} from "../events";
import {ColumnChangeEvent} from "../columnChangeEvent";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {GroupInstanceIdCreator} from "./groupInstanceIdCreator";
import {defaultGroupComparator} from "../functions";
import {Bean, Qualifier, Autowired, PostConstruct, Context, Optional} from "../context/context";
import {GridPanel} from "../gridPanel/gridPanel";
import {IAggFuncService} from "../interfaces/iAggFuncService";

@Bean('columnApi')
export class ColumnApi {

    @Autowired('columnController') private _columnController: ColumnController;

    public sizeColumnsToFit(gridWidth: any): void { this._columnController.sizeColumnsToFit(gridWidth); }
    public setColumnGroupOpened(group: ColumnGroup|string, newValue: boolean, instanceId?: number): void { this._columnController.setColumnGroupOpened(group, newValue, instanceId); }
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup { return this._columnController.getColumnGroup(name, instanceId); }

    public getDisplayNameForColumn(column: Column): string { return this._columnController.getDisplayNameForColumn(column); }
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup): string { return this._columnController.getDisplayNameForColumnGroup(columnGroup); }

    public getColumn(key: any): Column { return this._columnController.getPrimaryColumn(key); }
    public setColumnState(columnState: any): boolean { return this._columnController.setColumnState(columnState); }
    public getColumnState(): any[] { return this._columnController.getColumnState(); }
    public resetColumnState(): void { this._columnController.resetColumnState(); }
    public isPinning(): boolean { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); }
    public isPinningLeft(): boolean { return this._columnController.isPinningLeft(); }
    public isPinningRight(): boolean { return this._columnController.isPinningRight(); }
    public getDisplayedColAfter(col: Column): Column { return this._columnController.getDisplayedColAfter(col); }
    public getDisplayedColBefore(col: Column): Column { return this._columnController.getDisplayedColBefore(col); }
    public setColumnVisible(key: Column|ColDef|String, visible: boolean): void { this._columnController.setColumnVisible(key, visible); }
    public setColumnsVisible(keys: (Column|ColDef|String)[], visible: boolean): void { this._columnController.setColumnsVisible(keys, visible); }
    public setColumnPinned(key: Column|ColDef|String, pinned: string): void { this._columnController.setColumnPinned(key, pinned); }
    public setColumnsPinned(keys: (Column|ColDef|String)[], pinned: string): void { this._columnController.setColumnsPinned(keys, pinned); }

    public getAllColumns(): Column[] { return this._columnController.getAllPrimaryColumns(); }
    public getAllGridColumns(): Column[] { return this._columnController.getAllGridColumns(); }
    public getDisplayedLeftColumns(): Column[] { return this._columnController.getDisplayedLeftColumns(); }
    public getDisplayedCenterColumns(): Column[] { return this._columnController.getDisplayedCenterColumns(); }
    public getDisplayedRightColumns(): Column[] { return this._columnController.getDisplayedRightColumns(); }
    public getAllDisplayedColumns(): Column[] { return this._columnController.getAllDisplayedColumns(); }
    public getAllDisplayedVirtualColumns(): Column[] { return this._columnController.getAllDisplayedVirtualColumns(); }

    public moveColumn(fromIndex: number, toIndex: number): void { this._columnController.moveColumnByIndex(fromIndex, toIndex); }
    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this._columnController.moveRowGroupColumn(fromIndex, toIndex); }
    public setColumnAggFunct(column: Column, aggFunc: string): void { this._columnController.setColumnAggFunc(column, aggFunc); }
    public setColumnWidth(key: Column | string | ColDef, newWidth: number, finished: boolean = true): void { this._columnController.setColumnWidth(key, newWidth, finished); }
    public setPivotMode(pivotMode: boolean): void { this._columnController.setPivotMode(pivotMode); }
    public isPivotMode(): boolean { return this._columnController.isPivotMode(); }
    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: Column|ColDef|String): Column { return this._columnController.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    public getValueColumns(): Column[] { return this._columnController.getValueColumns(); }
    public removeValueColumn(colKey: (Column|ColDef|String)): void { this._columnController.removeValueColumn(colKey); }
    public removeValueColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.removeValueColumns(colKeys); }
    public addValueColumn(colKey: (Column|ColDef|String)): void { this._columnController.addValueColumn(colKey); }
    public addValueColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.addValueColumns(colKeys); }

    public setRowGroupColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.setRowGroupColumns(colKeys); }
    public removeRowGroupColumn(colKey: Column|ColDef|String): void { this._columnController.removeRowGroupColumn(colKey); }
    public removeRowGroupColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.removeRowGroupColumns(colKeys); }
    public addRowGroupColumn(colKey: Column|ColDef|String): void { this._columnController.addRowGroupColumn(colKey); }
    public addRowGroupColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.addRowGroupColumns(colKeys); }
    public getRowGroupColumns(): Column[] { return this._columnController.getRowGroupColumns(); }

    public setPivotColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.setPivotColumns(colKeys); }
    public removePivotColumn(colKey: Column|ColDef|String): void { this._columnController.removePivotColumn(colKey); }
    public removePivotColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.removePivotColumns(colKeys); }
    public addPivotColumn(colKey: Column|ColDef|String): void { this._columnController.addPivotColumn(colKey); }
    public addPivotColumns(colKeys: (Column|ColDef|String)[]): void { this._columnController.addPivotColumns(colKeys); }
    public getPivotColumns(): Column[] { return this._columnController.getPivotColumns(); }

    public getLeftDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getLeftDisplayedColumnGroups(); }
    public getCenterDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getCenterDisplayedColumnGroups(); }
    public getRightDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getRightDisplayedColumnGroups(); }
    public getAllDisplayedColumnGroups(): ColumnGroupChild[] { return this._columnController.getAllDisplayedColumnGroups(); }
    public autoSizeColumn(key: Column|ColDef|String): void {return this._columnController.autoSizeColumn(key); }
    public autoSizeColumns(keys: (Column|ColDef|String)[]): void {return this._columnController.autoSizeColumns(keys); }
    public autoSizeAllColumns(): void { this._columnController.autoSizeAllColumns(); }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[]): void { this._columnController.setSecondaryColumns(colDefs); }

    // below goes through deprecated items, prints message to user, then calls the new version of the same method

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

    public setState(columnState: any): boolean {
        console.error('ag-Grid: setState is deprecated, use setColumnState');
        return this.setColumnState(columnState);
    }
    public getState(): any[] {
        console.error('ag-Grid: getState is deprecated, use getColumnState');
        return this.getColumnState();
    }
    public resetState(): void {
        console.error('ag-Grid: resetState is deprecated, use resetColumnState');
        this.resetColumnState();
    }

    public getAggregationColumns(): Column[] {
        console.error('ag-Grid: getAggregationColumns is deprecated, use getValueColumns');
        return this._columnController.getValueColumns();
    }

    public removeAggregationColumn(colKey: (Column|ColDef|String)): void {
        console.error('ag-Grid: removeAggregationColumn is deprecated, use removeValueColumn');
        this._columnController.removeValueColumn(colKey);
    }

    public removeAggregationColumns(colKeys: (Column|ColDef|String)[]): void {
        console.error('ag-Grid: removeAggregationColumns is deprecated, use removeValueColumns');
        this._columnController.removeValueColumns(colKeys);
    }

    public addAggregationColumn(colKey: (Column|ColDef|String)): void {
        console.error('ag-Grid: addAggregationColumn is deprecated, use addValueColumn');
        this._columnController.addValueColumn(colKey);
    }

    public addAggregationColumns(colKeys: (Column|ColDef|String)[]): void {
        console.error('ag-Grid: addAggregationColumns is deprecated, use addValueColumns');
        this._columnController.addValueColumns(colKeys);
    }

    public setColumnAggFunction(column: Column, aggFunc: string): void {
        console.error('ag-Grid: setColumnAggFunction is deprecated, use setColumnAggFunc');
        this._columnController.setColumnAggFunc(column, aggFunc); 
    }

    public getDisplayNameForCol(column: any): string {
        console.error('ag-Grid: getDisplayNameForCol is deprecated, use getDisplayNameForColumn');
        return this.getDisplayNameForColumn(column);
    }

}

@Bean('columnController')
export class ColumnController {

    public static GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('balancedColumnTreeBuilder') private balancedColumnTreeBuilder: BalancedColumnTreeBuilder;
    @Autowired('displayedGroupCreator') private displayedGroupCreator: DisplayedGroupCreator;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;
    @Optional('aggFuncService') private aggFuncService: IAggFuncService;

    // these are the columns provided by the client. this doesn't change, even if the
    // order or state of the columns and groups change. it will only change if the client
    // provides a new set of column definitions. otherwise this tree is used to build up
    // the groups for displaying.
    private primaryBalancedTree: OriginalColumnGroupChild[];
    // header row count, based on user provided columns
    private primaryHeaderRowCount = 0;
    // all columns provided by the user. basically it's the leaf level nodes of the
    // tree above (originalBalancedTree)
    private primaryColumns: Column[]; // every column available

    // if pivoting, these are the generated columns as a result of the pivot
    private secondaryBalancedTree: OriginalColumnGroupChild[];
    private secondaryColumns: Column[];
    private secondaryHeaderRowCount = 0;
    private secondaryColumnsPresent = false;

    // these are all columns that are available to the grid for rendering after pivot
    private gridBalancedTree: OriginalColumnGroupChild[];
    private gridColumns: Column[];
    // header row count, either above, or based on pivoting if we are pivoting
    private gridHeaderRowCount = 0;

    // these are the columns actually shown on the screen. used by the header renderer,
    // as header needs to know about column groups and the tree structure.
    private displayedLeftColumnTree: ColumnGroupChild[];
    private displayedRightColumnTree: ColumnGroupChild[];
    private displayedCentreColumnTree: ColumnGroupChild[];

    private displayedLeftHeaderRows: {[row: number]: ColumnGroupChild[]};
    private displayedRightHeaderRows: {[row: number]: ColumnGroupChild[]};
    private displayedCentreHeaderRows: {[row: number]: ColumnGroupChild[]};

    // these are the lists used by the rowRenderer to render nodes. almost the leaf nodes of the above
    // displayed trees, however it also takes into account if the groups are open or not.
    private displayedLeftColumns: Column[] = [];
    private displayedRightColumns: Column[] = [];
    private displayedCenterColumns: Column[] = [];
    // all three lists above combined
    private allDisplayedColumns: Column[] = [];
    // same as above, except trimmed down to only columns within the viewport
    private allDisplayedVirtualColumns: Column[] = [];

    private rowGroupColumns: Column[] = [];
    private valueColumns: Column[] = [];
    private pivotColumns: Column[] = [];

    private groupAutoColumn: Column;
    private groupAutoColumnActive: boolean;

    private ready = false;
    private logger: Logger;

    private pivotMode = false;

    // for horizontal visualisation of columns
    private totalWidth: number;
    private scrollPosition: number;

    private viewportLeft: number;
    private viewportRight: number;

    @PostConstruct
    public init(): void {
        this.pivotMode = this.gridOptionsWrapper.isPivotMode();
        if (this.gridOptionsWrapper.getColumnDefs()) {
            this.setColumnDefs(this.gridOptionsWrapper.getColumnDefs());
        }
    }

    private setViewportLeftAndRight(): void {
        this.viewportLeft = this.scrollPosition;
        this.viewportRight = this.totalWidth + this.scrollPosition;
    }

    private checkDisplayedCenterColumns(): void {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (_.exists(this.displayedCenterColumns)) {
            var hashBefore = this.allDisplayedVirtualColumns.map( column => column.getId() ).join('#');
            this.updateVirtualSets();
            var hashAfter = this.allDisplayedVirtualColumns.map( column => column.getId() ).join('#');
            if (hashBefore !== hashAfter) {
                this.eventService.dispatchEvent(Events.EVENT_VIRTUAL_COLUMNS_CHANGED);
            }
        }
    }

    public setWidthAndScrollPosition(totalWidth: number, scrollPosition: number): void {
        if (totalWidth!==this.totalWidth || scrollPosition!==this.scrollPosition) {
            this.totalWidth = totalWidth;
            this.scrollPosition = scrollPosition;
            this.setViewportLeftAndRight();
            if (this.ready) {
                this.checkDisplayedCenterColumns();
            }
        }
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }
    
    public setPivotMode(pivotMode: boolean): void {
        if (pivotMode === this.pivotMode) { return; }
        this.pivotMode = pivotMode;
        this.updateDisplayedColumns();
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, event);
    }

    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: Column|ColDef|String): Column {

        if (!this.secondaryColumnsPresent) {
            return null;
        }

        var valueColumnToFind = this.getPrimaryColumn(valueColKey);

        var foundColumn: Column = null;
        this.secondaryColumns.forEach( column => {

            var thisPivotKeys = column.getColDef().pivotKeys;
            var pivotValueColumn = column.getColDef().pivotValueColumn;

            var pivotKeyMatches = _.compareArrays(thisPivotKeys, pivotKeys);
            var pivotValueMatches = pivotValueColumn === valueColumnToFind;

            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        });

        return foundColumn;
    }
    
    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ColumnController');
    }

    private setFirstRightAndLastLeftPinned(): void {
        var lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[this.displayedLeftColumns.length - 1] : null;
        var firstRight = this.displayedRightColumns ? this.displayedRightColumns[0] : null;

        this.gridColumns.forEach( (column: Column) => {
            column.setLastLeftPinned(column === lastLeft);
            column.setFirstRightPinned(column === firstRight);
        } );
    }

    public autoSizeColumns(keys: (Column|ColDef|String)[]): void {
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through teh visible columns until
        // no more cols are available (rendered) to be resized

        // keep track of which cols we have resized in here
        var columnsAutosized: Column[] = [];
        // initialise with anything except 0 so that while loop executs at least once
        var changesThisTimeAround = -1;

        while (changesThisTimeAround!==0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(keys, (column: Column): boolean => {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) { return; }
                // get how wide this col should be
                var preferredWidth = this.autoWidthCalculator.getPreferredWidthForColumn(column);
                // preferredWidth = -1 if this col is not on the screen
                if (preferredWidth>0) {
                    var newWidth = this.normaliseColumnWidth(column, preferredWidth);
                    column.setActualWidth(newWidth);
                    columnsAutosized.push(column);
                    changesThisTimeAround++;
                }
                return true;
            }, ()=> {
                return new ColumnChangeEvent(Events.EVENT_COLUMN_RESIZED).withFinished(true);
            });
        }
    }

    public autoSizeColumn(key: Column|String|ColDef): void {
        this.autoSizeColumns([key]);
    }

    public autoSizeAllColumns(): void {
        var allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns(allDisplayedColumns);
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

    public getPrimaryColumnTree(): OriginalColumnGroupChild[] {
        return this.primaryBalancedTree;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.gridHeaderRowCount;
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

    public getDisplayedColumnGroups(type: string): ColumnGroupChild[] {
        switch (type) {
            case Column.PINNED_LEFT: return this.getLeftDisplayedColumnGroups();
            case Column.PINNED_RIGHT: return this.getRightDisplayedColumnGroups();
            default: return this.getCenterDisplayedColumnGroups();
        }
    }

    // gridPanel -> ensureColumnVisible
    public isColumnDisplayed(column: Column): boolean {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    }

    // + csvCreator
    public getAllDisplayedColumns(): Column[] {
        return this.allDisplayedColumns;
    }

    // + rowRenderer
    public getAllDisplayedVirtualColumns(): Column[] {
        return this.allDisplayedVirtualColumns;
    }
    
    // used by:
    // + angularGrid -> setting pinned body width
    // todo: this needs to be cached
    public getPinnedLeftContainerWidth() {
        return this.getWidthOfColsInList(this.displayedLeftColumns);
    }
    // todo: this needs to be cached
    public getPinnedRightContainerWidth() {
        return this.getWidthOfColsInList(this.displayedRightColumns);
    }

    public addRowGroupColumns(keys: (Column|ColDef|String)[], columnsToIncludeInEvent?: Column[]): void {
        this.actionOnPrimaryColumns(keys, (column: Column)=> {
            if (!column.isRowGroupActive()) {
                this.rowGroupColumns.push(column);
                column.setRowGroupActive(true);
                return true;
            } else {
                return false;
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
        }, columnsToIncludeInEvent);
    }

    public setRowGroupColumns(keys: (Column|ColDef|String)[]): void {
        var updatedColumns: Column[] = [];
        this.rowGroupColumns.forEach( column => {
            column.setRowGroupActive(false);
            updatedColumns.push(column);
        } );
        this.rowGroupColumns.length = 0;
        this.addRowGroupColumns(keys, updatedColumns);
    }

    public addRowGroupColumn(key: Column|ColDef|String): void {
        this.addRowGroupColumns([key]);
    }

    public removeRowGroupColumns(keys: (Column|ColDef|String)[]): void {
        this.actionOnPrimaryColumns(keys, (column: Column)=> {
            if (column.isRowGroupActive()) {
                _.removeFromArray(this.rowGroupColumns, column);
                column.setRowGroupActive(false);
                return true;
            } else {
                return false;
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
        });
    }
    
    public removeRowGroupColumn(key: Column|ColDef|String): void {
        this.removeRowGroupColumns([key]);
    }

    public addPivotColumns(keys: (Column|ColDef|String)[], columnsToIncludeInEvent?: Column[]): void {
        this.actionOnPrimaryColumns(keys, (column: Column)=> {
            if (!column.isPivotActive()) {
                this.pivotColumns.push(column);
                column.setPivotActive(true);
                return true;
            } else {
                return false;
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_PIVOT_CHANGED);
        }, columnsToIncludeInEvent);
    }

    public setPivotColumns(keys: (Column|ColDef|String)[]): void {
        var updatedColumns: Column[] = [];
        this.pivotColumns.forEach( column => {
            column.setPivotActive(false);
            updatedColumns.push(column);
        } );
        this.pivotColumns.length = 0;
        this.addPivotColumns(keys, updatedColumns);
    }

    public addPivotColumn(key: Column|ColDef|String): void {
        this.addPivotColumns([key]);
    }

    public removePivotColumns(keys: (Column|ColDef|String)[]): void {
        this.actionOnPrimaryColumns(keys, (column: Column)=> {
            if (column.isPivotActive()) {
                _.removeFromArray(this.pivotColumns, column);
                column.setPivotActive(false);
                return true;
            } else {
                return false;
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_PIVOT_CHANGED);
        });
    }

    public removePivotColumn(key: Column|ColDef|String): void {
        this.removePivotColumns([key]);
    }

    public addValueColumns(keys: (Column|ColDef|String)[]): void {
        this.actionOnPrimaryColumns(keys, (column: Column)=> {
            if (!column.isValueActive()) {
                if (!column.getAggFunc()) { // default to SUM if aggFunc is missing
                    var defaultAggFunc = this.aggFuncService.getDefaultAggFunc();
                    column.setAggFunc(defaultAggFunc);
                }
                this.valueColumns.push(column);
                column.setValueActive(true);
                return true;
            } else {
                return false;
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGED);
        });
    }

    public addValueColumn(colKey: (Column|ColDef|String)): void {
        this.addValueColumns([colKey]);
    }

    public removeValueColumn(colKey: (Column|ColDef|String)): void {
        this.removeValueColumns([colKey]);
    }

    public removeValueColumns(keys: (Column|ColDef|String)[]): void {
        this.actionOnPrimaryColumns(keys, (column: Column)=> {
            if (column.isValueActive()) {
                _.removeFromArray(this.valueColumns, column);
                column.setValueActive(false);
                return true;
            } else {
                return false;
            }
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGED);
        });
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

    private getPrimaryOrGridColumn(key: Column | string | ColDef): Column {
        var column = this.getPrimaryColumn(key);
        if (column) {
            return column;
        } else {
            return this.getGridColumn(key);
        }
    }

    public setColumnWidth(key: Column | string | ColDef, newWidth: number, finished: boolean): void {
        var column = this.getPrimaryOrGridColumn(key);
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
        this.checkDisplayedCenterColumns();
    }

    public setColumnAggFunc(column: Column, aggFunc: string): void {
        column.setAggFunc(aggFunc);
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGED).withColumn(column);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGED, event);
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void {
        var column = this.rowGroupColumns[fromIndex];
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, event);
    }

    public moveColumns(columnsToMoveKeys: (Column|ColDef|String)[], toIndex: number): void {

        if (toIndex > this.gridColumns.length - columnsToMoveKeys.length) {
            console.warn('ag-Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('ag-Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }

        // we want to pull all the columns out first and put them into an ordered list
        var columnsToMove = this.getGridColumns(columnsToMoveKeys);

        var failedRules = !this.doesMovePassRules(columnsToMove, toIndex);
        if (failedRules) { return; }

        this.gridPanel.turnOnAnimationForABit();

        _.moveInArray(this.gridColumns, columnsToMove, toIndex);

        this.updateDisplayedColumns();

        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_MOVED)
            .withToIndex(toIndex)
            .withColumns(columnsToMove);
        if (columnsToMove.length===1) {
            event.withColumn(columnsToMove[0]);
        }
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_MOVED, event);
    }

    private doesMovePassRules(columnsToMove: Column[], toIndex: number): boolean {

        var allColumnsCopy = this.gridColumns.slice();

        _.moveInArray(allColumnsCopy, columnsToMove, toIndex);

        // look for broken groups, ie stray columns from groups that should be married
        for (var index = 0; index < (allColumnsCopy.length-1); index++) {
            var thisColumn = allColumnsCopy[index];
            var nextColumn = allColumnsCopy[index + 1];

            // skip hidden columns
            if (!nextColumn.isVisible()) {
                continue;
            }

            var thisPath = this.columnUtils.getOriginalPathForColumn(thisColumn, this.gridBalancedTree);
            var nextPath = this.columnUtils.getOriginalPathForColumn(nextColumn, this.gridBalancedTree);

            if (!nextPath || !thisPath) {
                console.log('next path is missing');
            }

            // start at the top of the path and work down
            for (var dept = 0; dept<thisPath.length; dept++) {
                var thisOriginalGroup = thisPath[dept];
                var nextOriginalGroup = nextPath[dept];
                var lastColInGroup = thisOriginalGroup!==nextOriginalGroup;
                // a runaway is a column from this group that left the group, and the group has it's children marked as married
                var colGroupDef = thisOriginalGroup.getColGroupDef();
                var marryChildren = colGroupDef && colGroupDef.marryChildren;
                var needToCheckForRunaways = lastColInGroup && marryChildren;
                if (needToCheckForRunaways) {
                    for (var tailIndex = index+1; tailIndex < allColumnsCopy.length; tailIndex++) {
                        var tailColumn = allColumnsCopy[tailIndex];
                        var tailPath = this.columnUtils.getOriginalPathForColumn(tailColumn, this.gridBalancedTree);
                        var tailOriginalGroup = tailPath[dept];
                        if (tailOriginalGroup===thisOriginalGroup) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    public moveColumn(key: string|Column|ColDef, toIndex: number) {
        this.moveColumns([key], toIndex);
    }

    public moveColumnByIndex(fromIndex: number, toIndex: number): void {
        var column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex);
    }

    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    public getBodyContainerWidth(): number {
        var result = this.getWidthOfColsInList(this.displayedCenterColumns);
        return result;
    }

    // + rowController
    public getValueColumns(): Column[] {
        return this.valueColumns ? this.valueColumns : [];
    }

    // + rowController
    public getPivotColumns(): Column[] {
        return this.pivotColumns ? this.pivotColumns : [];
    }

    // + inMemoryRowModel
    public isPivotActive(): boolean {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    }
    
    // + toolPanel
    public getRowGroupColumns(): Column[] {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    }

    // + rowController -> while inserting rows
    public getDisplayedCenterColumns(): Column[] {
        return this.displayedCenterColumns.slice(0);
    }
    // + rowController -> while inserting rows
    public getDisplayedLeftColumns(): Column[] {
        return this.displayedLeftColumns.slice(0);
    }
    public getDisplayedRightColumns(): Column[] {
        return this.displayedRightColumns.slice(0);
    }

    public getDisplayedColumns(type: string): Column[] {
        switch (type) {
            case Column.PINNED_LEFT: return this.getDisplayedLeftColumns();
            case Column.PINNED_RIGHT: return this.getDisplayedRightColumns();
            default: return this.getDisplayedCenterColumns();
        }
    }

    // used by:
    // + inMemoryRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllPrimaryColumns(): Column[] {
        return this.primaryColumns;
    }

    // + moveColumnController
    public getAllGridColumns(): Column[] {
        return this.gridColumns;
    }

    public isEmpty(): boolean {
        return _.missingOrEmpty(this.gridColumns);
    }

    public isRowGroupEmpty(): boolean {
        return _.missingOrEmpty(this.rowGroupColumns);
    }

    public setColumnVisible(key: Column|ColDef|String, visible: boolean): void {
        this.setColumnsVisible([key], visible);
    }

    public setColumnsVisible(keys: (Column|ColDef|String)[], visible: boolean): void {
        this.gridPanel.turnOnAnimationForABit();
        this.actionOnGridColumns(keys, (column: Column): boolean => {
            column.setVisible(visible);
            return true;
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_VISIBLE).withVisible(visible);
        });
    }

    public setColumnPinned(key: Column|ColDef|String, pinned: string|boolean): void {
        this.setColumnsPinned([key], pinned);
    }

    public setColumnsPinned(keys: (Column|ColDef|String)[], pinned: string|boolean): void {
        this.gridPanel.turnOnAnimationForABit();
        var actualPinned: string;
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            actualPinned = Column.PINNED_LEFT;
        } else if (pinned === Column.PINNED_RIGHT) {
            actualPinned = Column.PINNED_RIGHT;
        } else {
            actualPinned = null;
        }

        this.actionOnGridColumns(keys, (column: Column): boolean => {
            column.setPinned(actualPinned);
            return true;
        }, ()=> {
            return new ColumnChangeEvent(Events.EVENT_COLUMN_PINNED).withPinned(actualPinned);
        });
    }

    private actionOnGridColumns(keys: (Column|ColDef|String)[],
                                action: (column:Column) => boolean,
                                createEvent: ()=>ColumnChangeEvent,
                                columnsToIncludeInEvent?: Column[]): void {
        this.actionOnColumns(keys, this.getGridColumn.bind(this), action, createEvent, columnsToIncludeInEvent);
    }

    private actionOnPrimaryColumns(keys: (Column|ColDef|String)[],
                                   action: (column:Column) => boolean,
                                   createEvent: ()=>ColumnChangeEvent,
                                   columnsToIncludeInEvent?: Column[]): void {
        this.actionOnColumns(keys, this.getPrimaryColumn.bind(this), action, createEvent, columnsToIncludeInEvent);
    }

    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    // used by: autoResize, setVisible, setPinned
    private actionOnColumns(// the column keys this action will be on
                            keys: (Column|ColDef|String)[],
                            columnLookup: (key: string|ColDef|Column)=> Column,
                            // the action to do - if this returns false, the column was skipped
                            // and won't be included in the event
                            action: (column:Column) => boolean,
                            // should return back a column event of the right type
                            createEvent: ()=>ColumnChangeEvent,
                            columnsToIncludeInEvent: Column[]): void {

        if (_.missingOrEmpty(keys) && _.missingOrEmpty(columnsToIncludeInEvent)) { return; }

        var updatedColumns: Column[] = [];

        keys.forEach( (key: Column|ColDef|String)=> {
            var column = columnLookup(key);
            if (!column) {return;}
            // need to check for false with type (ie !== instead of !=)
            // as not returning anything (undefined) would also be false
            var resultOfAction = action(column);
            if (resultOfAction!==false) {
                updatedColumns.push(column);
            }
        });

        if (updatedColumns.length===0 && _.missingOrEmpty(columnsToIncludeInEvent)) { return; }

        if (_.existsAndNotEmpty(columnsToIncludeInEvent)) {
            columnsToIncludeInEvent.forEach( column => {
                if (updatedColumns.indexOf(column) < 0) {
                    updatedColumns.push(column);
                }
            });
        }

        this.updateDisplayedColumns();
        var event = createEvent();

        event.withColumns(updatedColumns);
        if (updatedColumns.length===1) {
            event.withColumn(updatedColumns[0]);
        }

        this.eventService.dispatchEvent(event.getType(), event);
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

    public getPrimaryAndSecondaryAndAutoColumns(): Column[] {
        var result = this.primaryColumns ? this.primaryColumns.slice(0) : [];
        if (this.groupAutoColumnActive) {
            result.push(this.groupAutoColumn);
        }
        if (this.secondaryColumnsPresent) {
            this.secondaryColumns.forEach( column => result.push(column) );
        }
        return result;
    }

    private createStateItemFromColumn(column: Column): any {
        var rowGroupIndex = column.isRowGroupActive() ? this.rowGroupColumns.indexOf(column) : null;
        var pivotIndex = column.isPivotActive() ? this.pivotColumns.indexOf(column) : null;
        var aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        var resultItem = {
            colId: column.getColId(),
            hide: !column.isVisible(),
            aggFunc: aggFunc,
            width: column.getActualWidth(),
            pivotIndex: pivotIndex,
            pinned: column.getPinned(),
            rowGroupIndex: rowGroupIndex
        };
        return resultItem;
    }

    public getColumnState(): any[] {
        if (_.missing(this.primaryColumns)) {
            return <any>[];
        }

        var columnStateList = this.primaryColumns.map(this.createStateItemFromColumn.bind(this));

        if (!this.pivotMode) {
            this.orderColumnStateList(columnStateList);
        }
        
        return columnStateList;
    }

    private orderColumnStateList(columnStateList: any[]): void {
        var gridColumnIds = this.gridColumns.map( column => column.getColId() );
        columnStateList.sort( (itemA: any, itemB: any) => {
            var posA = gridColumnIds.indexOf(itemA.colId);
            var posB = gridColumnIds.indexOf(itemB.colId);
            return posA - posB;
        });
    }


    public resetColumnState(): void {
        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        var primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        var state: any[] = [];

        if (primaryColumns) {
            primaryColumns.forEach( (column) => {
                state.push({
                    colId: column.getColId(),
                    aggFunc: column.getColDef().aggFunc,
                    hide: column.getColDef().hide,
                    pinned: column.getColDef().pinned,
                    rowGroupIndex: column.getColDef().rowGroupIndex,
                    pivotIndex: column.getColDef().pivotIndex,
                    width: column.getColDef().width
                });
            });
        }
        this.setColumnState(state);
    }

    public setColumnState(columnState: any[]): boolean {
        if (_.missingOrEmpty(this.primaryColumns)) { return false; }

        // at the end below, this list will have all columns we got no state for
        var columnsWithNoState = this.primaryColumns.slice();

        this.rowGroupColumns = [];
        this.valueColumns = [];
        this.pivotColumns = [];

        var success = true;

        var rowGroupIndexes: {[key: string]: number} = {};
        var pivotIndexes: {[key: string]: number} = {};

        if (columnState) {
            columnState.forEach( (stateItem: any)=> {
                var column = this.getPrimaryColumn(stateItem.colId);
                if (!column) {
                    console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                    success = false;
                } else {
                    this.syncColumnWithStateItem(column, stateItem, rowGroupIndexes, pivotIndexes);
                    _.removeFromArray(columnsWithNoState, column);
                }
            });
        }

        // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
        columnsWithNoState.forEach(this.syncColumnWithNoState.bind(this));

        // sort the lists according to the indexes that were provided
        this.rowGroupColumns.sort(this.sortColumnListUsingIndexes.bind(this, rowGroupIndexes));
        this.pivotColumns.sort(this.sortColumnListUsingIndexes.bind(this, pivotIndexes));

        this.copyDownGridColumns();

        var orderOfColIds = columnState.map( stateItem => stateItem.colId );
        this.gridColumns.sort( (colA: Column, colB: Column)=> {
            var indexA = orderOfColIds.indexOf(colA.getId());
            var indexB = orderOfColIds.indexOf(colB.getId());
            return indexA - indexB;
        });

        this.updateDisplayedColumns();

        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);

        return success;
    }

    private sortColumnListUsingIndexes(indexes: {[key: string]: number}, colA: Column, colB: Column): number {
        var indexA = indexes[colA.getId()];
        var indexB = indexes[colB.getId()];
        return indexA - indexB;
    }

    private syncColumnWithNoState(column: Column): void {
        column.setVisible(false);
        column.setAggFunc(null);
        column.setPinned(null);
        column.setRowGroupActive(false);
        column.setPivotActive(false);
        column.setValueActive(false);
    }

    private syncColumnWithStateItem(column: Column, stateItem: any,
                                    rowGroupIndexes: {[key: string]: number},
                                    pivotIndexes: {[key: string]: number}): void {
        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        column.setVisible(!stateItem.hide);
        // sets pinned to 'left' or 'right'
        column.setPinned(stateItem.pinned);
        // if width provided and valid, use it, otherwise stick with the old width
        if (stateItem.width >= this.gridOptionsWrapper.getMinColWidth()) {
            column.setActualWidth(stateItem.width);
        }

        if (typeof stateItem.aggFunc === 'string') {
            column.setAggFunc(stateItem.aggFunc);
            column.setValueActive(true);
            this.valueColumns.push(column);
        } else {
            column.setAggFunc(null);
            column.setValueActive(false);
        }

        if (typeof stateItem.rowGroupIndex === 'number') {
            this.rowGroupColumns.push(column);
            column.setRowGroupActive(true);
            rowGroupIndexes[column.getId()] = stateItem.rowGroupIndex;
        } else {
            column.setRowGroupActive(false);
        }

        if (typeof stateItem.pivotIndex === 'number') {
            this.pivotColumns.push(column);
            column.setPivotActive(true);
            pivotIndexes[column.getId()] = stateItem.pivotIndex;
        } else {
            column.setPivotActive(false);
        }
    }

    public getGridColumns(keys: any[]): Column[] {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    }

    private getColumns(keys: any[], columnLookupCallback: (key: string|ColDef|Column)=>Column ): Column[] {
        var foundColumns: Column[] = [];
        if (keys) {
            keys.forEach( (key: any) => {
                var column = columnLookupCallback(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }
        return foundColumns;
    }

    // used by growGroupPanel
    public getColumnWithValidation(key: string|ColDef|Column): Column {
        var column = this.getPrimaryColumn(key);
        if (!column) {
            console.warn('ag-Grid: could not find column ' + column);
        }
        return column;
    }

    public getPrimaryColumn(key: string|ColDef|Column): Column {
        return this.getColumn(key, this.primaryColumns);
    }

    public getGridColumn(key: string|ColDef|Column): Column {
        return this.getColumn(key, this.gridColumns);
    }

    private getColumn(key: string|ColDef|Column, columnList: Column[]): Column {
        if (!key) {return null;}

        for (var i = 0; i < columnList.length; i++) {
            if (colMatches(columnList[i])) {
                return columnList[i];
            }
        }

        if (this.groupAutoColumnActive && colMatches(this.groupAutoColumn)) {
            return this.groupAutoColumn;
        }

        function colMatches(column: Column): boolean {
            var columnMatches = column === key;
            var colDefMatches = column.getColDef() === key;
            var idMatches = column.getColId() == key;
            return columnMatches || colDefMatches || idMatches;
        }

        return null;
    }

    public getDisplayNameForColumn(column: Column, includeAggFunc = false): string {
        var headerName = this.getHeaderName(column.getColDef(), column, null);
        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        } else {
            return headerName;
        }
    }

    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup): string {
        var colGroupDef = columnGroup.getOriginalColumnGroup().getColGroupDef();
        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup);
        } else {
            return null;
        }
    }

    private getHeaderName(colDef: AbstractColDef, column: Column, columnGroup: ColumnGroup): string {
        var headerValueGetter = colDef.headerValueGetter;

        if (headerValueGetter) {
            var params = {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
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
                return '';
            }
        } else {
            return colDef.headerName;
        }
    }

    /*
        private getHeaderGroupName(columnGroup: ColumnGroup): string {
            var colGroupDef = columnGroup.getOriginalColumnGroup().getColGroupDef();
            var headerValueGetter = colGroupDef.headerValueGetter;

            if (headerValueGetter) {
                var params = {
                    columnGroup: columnGroup,
                    colDef: colGroupDef,
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
                    return '';
                }
            } else {
                return colGroupDef.headerName;
            }
        }
    */

    private wrapHeaderNameWithAggFunc(column: Column, headerName: string): string {
        if (this.gridOptionsWrapper.isSuppressAggFuncInHeader()) {
            return headerName;
        }

        // only columns with aggregation active can have aggregations
        var pivotValueColumn = column.getColDef().pivotValueColumn;
        var pivotActiveOnThisColumn = _.exists(pivotValueColumn);
        var aggFunc: string | IAggFunc = null;
        var aggFuncFound: boolean;

        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            aggFunc = pivotValueColumn.getAggFunc();
            aggFuncFound = true;
        } else {
            var measureActive = column.isValueActive();
            var aggregationPresent = this.pivotMode || !this.isRowGroupEmpty();

            if (measureActive && aggregationPresent) {
                aggFunc = column.getAggFunc();
                aggFuncFound = true;
            } else {
                aggFuncFound = false;
            }
        }

        if (aggFuncFound) {
            var aggFuncString = (typeof aggFunc === 'string') ? <string> aggFunc : 'func';
            return `${aggFuncString}(${headerName})`;
        } else {
            return headerName;
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

    public setColumnDefs(columnDefs: AbstractColDef[]) {
        var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs, true);
        this.primaryBalancedTree = balancedTreeResult.balancedTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;

        this.primaryColumns = this.getColumnsFromTree(this.primaryBalancedTree);
        this.extractRowGroupColumns();
        this.extractPivotColumns();
        this.createValueColumns();

        this.copyDownGridColumns();

        this.updateDisplayedColumns();
        this.ready = true;
        var event = new ColumnChangeEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
        this.eventService.dispatchEvent(Events.EVENT_NEW_COLUMNS_LOADED);
    }

    public isReady(): boolean {
        return this.ready;
    }

    private extractRowGroupColumns(): void {
        this.rowGroupColumns.forEach( column => column.setRowGroupActive(false) );
        this.rowGroupColumns = [];
        // pull out the columns
        this.primaryColumns.forEach( (column: Column) => {
            if (typeof column.getColDef().rowGroupIndex === 'number') {
                this.rowGroupColumns.push(column);
                column.setRowGroupActive(true);
            }
        });
        // then sort them
        this.rowGroupColumns.sort(function (colA: Column, colB: Column): number {
            return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
        });
    }

    private extractPivotColumns(): void {
        this.pivotColumns.forEach( column => column.setPivotActive(false) );
        this.pivotColumns = [];
        // pull out the columns
        this.primaryColumns.forEach( (column: Column) => {
            if (typeof column.getColDef().pivotIndex === 'number') {
                this.pivotColumns.push(column);
                column.setPivotActive(true);
            }
        });
        // then sort them
        this.pivotColumns.sort(function (colA: Column, colB: Column): number {
            return colA.getColDef().pivotIndex - colB.getColDef().pivotIndex;
        });
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(passedGroup: ColumnGroup|string, newValue: boolean, instanceId?:number): void {
        var groupToUse: ColumnGroup = this.getColumnGroup(passedGroup, instanceId);
        if (!groupToUse) { return; }
        this.logger.log('columnGroupOpened(' + groupToUse.getGroupId() + ',' + newValue + ')');
        groupToUse.setExpanded(newValue);
        this.gridPanel.turnOnAnimationForABit();
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

    private calculateColumnsForDisplay(): Column[] {

        var columnsForDisplay: Column[];

        if (this.pivotMode && !this.secondaryColumnsPresent) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            columnsForDisplay = this.createColumnsToDisplayFromValueColumns();
        } else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = _.filter(this.gridColumns, column => column.isVisible() );
        }

        this.createGroupAutoColumn();

        if (this.groupAutoColumnActive) {
            columnsForDisplay.unshift(this.groupAutoColumn);
        }

        return columnsForDisplay;
    }

    private createColumnsToDisplayFromValueColumns(): Column [] {
        // make a copy of the value columns, so we have to side effects
        var result = this.valueColumns.slice();
        // order the columns as per the grid columns. having the order is
        // important as without it, reordering of columns would have no impact
        result.sort( (colA: Column, colB: Column)=> {
            return this.gridColumns.indexOf(colA) - this.gridColumns.indexOf(colB);
        });
        return result;
    }

    private updateDisplayedColumns(): void {

        // save opened / closed state
        var oldGroupState = this.getColumnGroupState();

        var columnsForDisplay = this.calculateColumnsForDisplay();

        this.buildDisplayedTrees(columnsForDisplay);

        // restore opened / closed state
        this.setColumnGroupState(oldGroupState);

        // this is also called when a group is opened or closed
        this.updateGroupsAndDisplayedColumns();

        this.setFirstRightAndLastLeftPinned();
    }

    public isSecondaryColumnsPresent(): boolean {
        return this.secondaryColumnsPresent;
    }

    public setSecondaryColumns(colDefs: (ColDef|ColGroupDef)[]): void {
        var newColsPresent = colDefs && colDefs.length>0;

        // if not cols passed, and we had to cols anyway, then do nothing
        if (!newColsPresent && !this.secondaryColumnsPresent) { return; }

        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(colDefs, false);
            this.secondaryBalancedTree = balancedTreeResult.balancedTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.getColumnsFromTree(this.secondaryBalancedTree);
            this.secondaryColumnsPresent = true;
        } else {
            this.secondaryBalancedTree = null;
            this.secondaryHeaderRowCount = -1;
            this.secondaryColumns = null;
            this.secondaryColumnsPresent = false;
        }

        this.copyDownGridColumns();
        this.updateDisplayedColumns();
    }

    private processSecondaryColumnDefinitions(colDefs: (ColDef|ColGroupDef)[]): (ColDef|ColGroupDef)[] {

        let columnCallback = this.gridOptionsWrapper.getProcessSecondaryColDefFunc();
        let groupCallback = this.gridOptionsWrapper.getProcessSecondaryColGroupDefFunc();

        if (!columnCallback && !groupCallback) { return; }

        searchForColDefs(colDefs);

        function searchForColDefs(colDefs2: (ColDef|ColGroupDef)[]): void {
            colDefs2.forEach( function(abstractColDef: AbstractColDef) {
                var isGroup = _.exists((<any>abstractColDef).children);
                if (isGroup) {
                    let colGroupDef = <ColGroupDef> abstractColDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                } else {
                    let colDef = <ColGroupDef> abstractColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        }
    }

    // called from: setColumnState, setColumnDefs, setAlternativeColumnDefs
    private copyDownGridColumns(): void {
        if (this.secondaryColumns) {
            this.gridBalancedTree = this.secondaryBalancedTree.slice();
            this.gridHeaderRowCount = this.secondaryHeaderRowCount;
            this.gridColumns = this.secondaryColumns.slice();
        } else {
            this.gridBalancedTree = this.primaryBalancedTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
        }
        
        this.clearDisplayedColumns();
        
        var event = new ColumnChangeEvent(Events.EVENT_GRID_COLUMNS_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_GRID_COLUMNS_CHANGED, event);
    }

    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    private clearDisplayedColumns(): void {
        this.displayedLeftColumnTree = [];
        this.displayedRightColumnTree = [];
        this.displayedCentreColumnTree = [];

        this.displayedLeftHeaderRows = {};
        this.displayedRightHeaderRows = {};
        this.displayedCentreHeaderRows = {};

        this.displayedLeftColumns = [];
        this.displayedRightColumns = [];
        this.displayedCenterColumns = [];
        this.allDisplayedColumns = [];
        this.allDisplayedVirtualColumns = [];
    }
    
    private updateGroupsAndDisplayedColumns() {
        this.updateGroups();
        this.updateDisplayedColumnsFromTrees();
        this.updateVirtualSets();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display
        var event = new ColumnChangeEvent(Events.EVENT_DISPLAYED_COLUMNS_CHANGED);
        this.eventService.dispatchEvent(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, event);
    }

    private updateDisplayedColumnsFromTrees(): void {
        this.addToDisplayedColumns(this.displayedLeftColumnTree, this.displayedLeftColumns);
        this.addToDisplayedColumns(this.displayedCentreColumnTree, this.displayedCenterColumns);
        this.addToDisplayedColumns(this.displayedRightColumnTree, this.displayedRightColumns);

        // order we add the arrays together is important, so the result
        // has the columns left to right, as they appear on the screen.
        this.allDisplayedColumns = this.displayedLeftColumns
            .concat(this.displayedCenterColumns)
            .concat(this.displayedRightColumns);

        this.setLeftValues();
    }

    // sets the left pixel position of each column
    private setLeftValues(): void {
        this.setLeftValuesOfColumns();
        this.setLeftValuesOfGroups();
    }

    private setLeftValuesOfColumns(): void {
        // go through each list of displayed columns
        var allColumns = this.primaryColumns.slice(0);
        [this.displayedLeftColumns,this.displayedRightColumns,this.displayedCenterColumns].forEach( columns => {
            var left = 0;
            columns.forEach( column => {
                column.setLeft(left);
                left += column.getActualWidth();
                _.removeFromArray(allColumns, column);
            });
        });
        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach( (column: Column) => {
            column.setLeft(null);
        });
    }

    private setLeftValuesOfGroups(): void {
        // a groups left value is the lest left value of it's children
        [this.displayedLeftColumnTree,this.displayedRightColumnTree,this.displayedCentreColumnTree].forEach( columns => {
            columns.forEach( column => {
                if (column instanceof ColumnGroup) {
                    var columnGroup = <ColumnGroup> column;
                    columnGroup.checkLeft();
                }
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

    private updateDisplayedCenterVirtualColumns(): any {
        var filteredCenterColumns: Column[];

        var skipVirtualisation = this.gridOptionsWrapper.isSuppressColumnVirtualisation() || this.gridOptionsWrapper.isForPrint();
        if (skipVirtualisation) {
            // no virtualisation, so don't filter
            filteredCenterColumns = this.displayedCenterColumns;
        } else {
            // filter out what should be visible
            filteredCenterColumns = this.filterOutColumnsWithinViewport(this.displayedCenterColumns);
        }

        this.allDisplayedVirtualColumns = filteredCenterColumns
            .concat(this.displayedLeftColumns)
            .concat(this.displayedRightColumns);

        // return map of virtual col id's, for easy lookup when building the groups.
        // the map will be colId=>true, ie col id's mapping to 'true'.
        var result: any = {};
        this.allDisplayedVirtualColumns.forEach( (col: Column) => {
            result[col.getId()] = true;
        });
        return result;
    }

    public getVirtualHeaderGroupRow(type: string, dept: number): ColumnGroupChild[] {
        var result: ColumnGroupChild[];
        switch (type) {
            case Column.PINNED_LEFT:
                result = this.displayedLeftHeaderRows[dept];
                break;
            case Column.PINNED_RIGHT:
                result = this.displayedRightHeaderRows[dept];
                break;
            default:
                result = this.displayedCentreHeaderRows[dept];
                break;
        }
        if (_.missing(result)) {
            result = [];
        }
        return result;
    }
    
    private updateDisplayedVirtualGroups(virtualColIds: any): void {

        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included

        this.displayedLeftHeaderRows = {};
        this.displayedRightHeaderRows = {};
        this.displayedCentreHeaderRows = {};

        testGroup(this.displayedLeftColumnTree, this.displayedLeftHeaderRows, 0);
        testGroup(this.displayedRightColumnTree, this.displayedRightHeaderRows, 0);
        testGroup(this.displayedCentreColumnTree, this.displayedCentreHeaderRows, 0);
        
        function testGroup(children: ColumnGroupChild[], result: {[row: number]: ColumnGroupChild[]}, dept: number): boolean {
            var returnValue = false;

            for (var i = 0; i<children.length; i++) {
                // see if this item is within viewport
                var child = children[i];
                var addThisItem: boolean;
                if (child instanceof Column) {
                    // for column, test if column is included
                    addThisItem = virtualColIds[child.getId()] === true;
                } else {
                    // if group, base decision on children
                    var columnGroup = <ColumnGroup> child;
                    addThisItem = testGroup(columnGroup.getDisplayedChildren(), result, dept+1);
                }

                if (addThisItem) {
                    returnValue = true;
                    if (!result[dept]) {
                        result[dept] = [];
                    }
                    result[dept].push(child);
                }
            }

            return returnValue;
        }
    }

    private updateVirtualSets(): void {
        var virtualColIds = this.updateDisplayedCenterVirtualColumns();
        this.updateDisplayedVirtualGroups(virtualColIds);
    }

    private filterOutColumnsWithinViewport(columns: Column[]): Column[] {
        var result = _.filter(columns, column => {
            // only out if both sides of columns are to the left or to the right of the boundary
            var columnLeft = column.getLeft();
            var columnRight = column.getLeft() + column.getActualWidth();
            var columnToMuchLeft = columnLeft < this.viewportLeft && columnRight < this.viewportLeft;
            var columnToMuchRight = columnLeft > this.viewportRight && columnRight > this.viewportRight;

            var includeThisCol = !columnToMuchLeft && !columnToMuchRight;
            return includeThisCol;
        });
        return result;
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
                            column.setActualWidth(newWidth);
                        }
                    }
                    pixelsForLastCol -= newWidth;
                }
            }
        }

        this.setLeftValues();

        // widths set, refresh the gui
        colsToFireEventFor.forEach( (column: Column) => {
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_RESIZED).withColumn(column);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_RESIZED, event);
        });

        this.checkDisplayedCenterColumns();

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

    private buildDisplayedTrees(visibleColumns: Column[]) {
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
            leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator);
        this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator);
        this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(
            centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator);
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

        this.groupAutoColumnActive = needAGroupColumn;

        // lazy create group auto-column
        if (needAGroupColumn && !this.groupAutoColumn) {
            // if one provided by user, use it, otherwise create one
            var autoColDef = this.gridOptionsWrapper.getGroupColumnDef();
            if (!autoColDef) {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                autoColDef = {
                    headerName: localeTextFunc('group', 'Group'),
                    comparator: defaultGroupComparator,
                    valueGetter: (params: any) => {
                        if (params.node.group) {
                            return params.node.key;
                        } else if (params.data && params.colDef.field) {
                            return params.data[params.colDef.field];
                        } else {
                            return null;
                        }
                    },
                    cellRenderer: 'group'
                };
            }
            // we never allow moving the group column
            autoColDef.suppressMovable = true;

            var colId = ColumnController.GROUP_AUTO_COLUMN_ID;
            this.groupAutoColumn = new Column(autoColDef, colId, true);
            this.context.wireBean(this.groupAutoColumn);
        }
    }

    private createValueColumns(): void {
        this.valueColumns.forEach( column => column.setValueActive(false) );
        this.valueColumns = [];

        // override with columns that have the aggFunc specified explicitly
        for (var i = 0; i < this.primaryColumns.length; i++) {
            var column = this.primaryColumns[i];
            if (column.getColDef().aggFunc) {
                column.setAggFunc(column.getColDef().aggFunc);
                this.valueColumns.push(column);
                column.setValueActive(true);
            }
        }
    }

    private getWidthOfColsInList(columnList: Column[]) {
        var result = 0;
        for (var i = 0; i<columnList.length; i++) {
            result += columnList[i].getActualWidth();
        }
        return result;
    }
}
