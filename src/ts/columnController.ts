/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
/// <reference path="entities/column.ts" />
/// <reference path="entities/columnGroup.ts" />
/// <reference path="columnChangeEvent.ts" />
/// <reference path="masterSlaveService.ts" />

module ag.grid {

    var _ = Utils;
    var constants = Constants;

    export class ColumnApi {
        constructor(private _columnController: ColumnController) {}
        public sizeColumnsToFit(gridWidth: any): void { this._columnController.sizeColumnsToFit(gridWidth); }
        public hideColumns(colIds: any, hide: any): void { this._columnController.hideColumns(colIds, hide); }
        public columnGroupOpened(group: ColumnGroup, newValue: boolean): void { this._columnController.columnGroupOpened(group, newValue); }
        public getColumnGroup(name: string): ColumnGroup { return this._columnController.getColumnGroup(name); }
        public getDisplayNameForCol(column: any): string { return this._columnController.getDisplayNameForCol(column); }
        public getColumn(key: any): Column { return this._columnController.getColumn(key); }
        public setState(columnState: any): void { return this._columnController.setState(columnState); }
        public getState(): [any] { return this._columnController.getState(); }
        public isPinning(): boolean { return this._columnController.isPinning(); }
        public getVisibleColAfter(col: Column): Column { return this._columnController.getVisibleColAfter(col); }
        public getVisibleColBefore(col: Column): Column { return this._columnController.getVisibleColBefore(col); }
        public setColumnVisible(column: Column, visible: boolean): void { this._columnController.setColumnVisible(column, visible); }
        public getAllColumns(): Column[] { return this._columnController.getAllColumns(); }
        public getDisplayedColumns(): Column[] { return this._columnController.getDisplayedColumns(); }
        public getPivotedColumns(): Column[] { return this._columnController.getPivotedColumns(); }
        public getValueColumns(): Column[] { return this._columnController.getValueColumns(); }
        public moveColumn(fromIndex: number, toIndex: number): void { this._columnController.moveColumn(fromIndex, toIndex); }
        public movePivotColumn(fromIndex: number, toIndex: number): void { this._columnController.movePivotColumn(fromIndex, toIndex); }
        public setColumnAggFunction(column: Column, aggFunc: string): void { this._columnController.setColumnAggFunction(column, aggFunc); }
        public setColumnWidth(column: Column, newWidth: number, finished: boolean = true): void { this._columnController.setColumnWidth(column, newWidth, finished); }
        public removeValueColumn(column: Column): void { this._columnController.removeValueColumn(column); }
        public addValueColumn(column: Column): void { this._columnController.addValueColumn(column); }
        public removePivotColumn(column: Column): void { this._columnController.removePivotColumn(column); }
        public setPinnedColumnCount(count: number): void { this._columnController.setPinnedColumnCount(count); }
        public addPivotColumn(column: Column): void { this._columnController.addPivotColumn(column); }
        public getHeaderGroups(): ColumnGroup[] { return this._columnController.getHeaderGroups(); }
        public hideColumn(colId: any, hide: any): void { this._columnController.hideColumns([colId], hide); }
    }

    export class ColumnController {

        private gridOptionsWrapper: GridOptionsWrapper;
        private angularGrid: Grid;
        private selectionRendererFactory: SelectionRendererFactory;
        private expressionService: ExpressionService;
        private masterSlaveController: MasterSlaveService;

        private allColumns: Column[]; // every column available
        private visibleColumns: Column[]; // allColumns we want to show, regardless of groups
        private displayedColumns: Column[]; // columns actually showing (removes columns not visible due closed groups)
        private pivotColumns: Column[];
        private valueColumns: Column[];
        private columnGroups: ColumnGroup[];

        private setupComplete = false;
        private valueService: ValueService;
        private pinnedColumnCount: number;

        private eventService: EventService;

        constructor() {
        }

        public init(angularGrid: Grid, selectionRendererFactory: SelectionRendererFactory,
                    gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService,
                    valueService: ValueService, masterSlaveController: MasterSlaveService,
                    eventService: EventService) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.angularGrid = angularGrid;
            this.selectionRendererFactory = selectionRendererFactory;
            this.expressionService = expressionService;
            this.valueService = valueService;
            this.masterSlaveController = masterSlaveController;
            this.eventService = eventService;

            this.pinnedColumnCount = gridOptionsWrapper.getPinnedColCount();
            // check for negative or non-number values
            if (!(this.pinnedColumnCount>0)) {
                this.pinnedColumnCount = 0;
            }
        }

        public getColumnApi(): ColumnApi {
            return new ColumnApi(this);
        }

        public isSetupComplete(): boolean {
            return this.setupComplete;
        }

        // used by:
        // + headerRenderer -> setting pinned body width
        public getHeaderGroups(): ColumnGroup[] {
            return this.columnGroups;
        }

        // used by:
        // + angularGrid -> setting pinned body width
        public getPinnedContainerWidth() {
            return this.getTotalColWidth(true);
        }

        public addPivotColumn(column: Column): void {
            if (this.allColumns.indexOf(column) < 0) {
                console.warn('not a valid column: ' + column);
                return;
            }
            if (this.pivotColumns.indexOf(column) >= 0) {
                console.warn('column is already a value column');
                return;
            }
            this.pivotColumns.push(column);
            // because we could be taking out 'pivot' columns, the displayed
            // columns may differ, so need to work out all the columns again
            this.updateModel();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_PIVOT_CHANGE);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_CHANGE, event);
        }

        public setPinnedColumnCount(count: number): void {
            if (!(typeof count === 'number')) {
                console.warn('ag-Grid: setPinnedColumnCount: count must be a number');
                return;
            }
            if (count < 0) {
                console.warn('ag-Grid: setPinnedColumnCount: count must be zero or greater');
                return;
            }
            this.pinnedColumnCount = count;
            this.updateModel();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_PINNED_COUNT_CHANGED).withPinnedColumnCount(count);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_PINNED_COUNT_CHANGED, event);
        }

        public removePivotColumn(column: Column): void {
            if (this.pivotColumns.indexOf(column) < 0) {
                console.warn('column not a pivot');
                return;
            }
            _.removeFromArray(this.pivotColumns, column);
            this.updateModel();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_PIVOT_CHANGE);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_CHANGE, event);
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
            if (!column.aggFunc) { // defualt to SUM if aggFunc is missing
                column.aggFunc = constants.SUM;
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

        // returns true if the col is either in all columns or visible columns.
        // we need to check visible columns because the grouping column could come
        // from the gridOptions, so that's a special case
        private doesColumnExistInGrid(column: Column): boolean {
            var columnInAllColumns = this.allColumns.indexOf(column) >= 0;
            var columnInVisibleColumns = this.visibleColumns.indexOf(column) >= 0;
            return columnInAllColumns || columnInVisibleColumns;
        }

        public setColumnWidth(column: Column, newWidth: number, finished: boolean): void {
            if (!this.doesColumnExistInGrid(column)) {
                console.warn('column does not exist');
                return;
            }

            if (newWidth < column.getMinimumWidth()) {
                newWidth = column.getMinimumWidth();
            }

            if (column.isGreaterThanMax(newWidth)) {
                newWidth = column.colDef.maxWidth;
            }

            // check for change first, to avoid unnecessary firing of events
            // however we always fire 'finished' events. this is important
            // when groups are resized, as if the group is changing slowly,
            // eg 1 pixel at a time, then each change will fire change events
            // in all the columns in the group, but only one with get the pixel.
            if (finished || column.actualWidth !== newWidth) {
                column.actualWidth = newWidth;

                // if part of a group, update the groups width
                this.updateGroupWidthsAfterColumnResize(column);

                var event = new ColumnChangeEvent(Events.EVENT_COLUMN_RESIZED).withColumn(column).withFinished(finished);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_RESIZED, event);
            }
        }

        private updateGroupWidthsAfterColumnResize(column: Column) {
            if (this.columnGroups) {
                this.columnGroups.forEach( (columnGroup: ColumnGroup) => {
                    if (columnGroup.displayedColumns.indexOf(column) >= 0) {
                        columnGroup.calculateActualWidth();
                    }
                });
            }
        }

        public setColumnAggFunction(column: Column, aggFunc: string): void {
            column.aggFunc = aggFunc;
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VALUE_CHANGE);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGE, event);
        }

        public movePivotColumn(fromIndex: number, toIndex: number): void {
            var column = this.pivotColumns[fromIndex];
            this.pivotColumns.splice(fromIndex, 1);
            this.pivotColumns.splice(toIndex, 0, column);
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_PIVOT_CHANGE);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_CHANGE, event);
        }

        public moveColumn(fromIndex: number, toIndex: number): void {
            var column = this.allColumns[fromIndex];
            this.allColumns.splice(fromIndex, 1);
            this.allColumns.splice(toIndex, 0, column);
            this.updateModel();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_MOVED)
                .withFromIndex(fromIndex)
                .withToIndex(toIndex);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_MOVED, event);
        }

        // used by:
        // + angularGrid -> for setting body width
        // + rowController -> setting main row widths (when inserting and resizing)
        public getBodyContainerWidth(): number {
            return this.getTotalColWidth(false);
        }

        // + rowController
        public getValueColumns(): Column[] {
            return this.valueColumns;
        }

        // + toolPanel
        public getPivotedColumns(): Column[] {
            return this.pivotColumns;
        }

        // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
        // need a newMethod - get next col index
        public getDisplayedColumns(): Column[] {
            return this.displayedColumns;
        }

        // used by:
        // + inMemoryRowController -> sorting, building quick filter text
        // + headerRenderer -> sorting (clearing icon)
        public getAllColumns(): Column[] {
            return this.allColumns;
        }

        public setColumnVisible(column: Column, visible: boolean): void {
            column.visible = visible;

            this.updateModel();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VISIBLE).withColumn(column);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_VISIBLE, event);
        }

        public getVisibleColBefore(col: any): Column {
            var oldIndex = this.visibleColumns.indexOf(col);
            if (oldIndex > 0) {
                return this.visibleColumns[oldIndex - 1];
            } else {
                return null;
            }
        }

        // used by:
        // + rowRenderer -> for navigation
        public getVisibleColAfter(col: Column): Column {
            var oldIndex = this.visibleColumns.indexOf(col);
            if (oldIndex < (this.visibleColumns.length - 1)) {
                return this.visibleColumns[oldIndex + 1];
            } else {
                return null;
            }
        }

        public isPinning(): boolean {
            return this.visibleColumns && this.visibleColumns.length > 0 && this.visibleColumns[0].pinned;
        }

        public getState(): [any] {
            if (!this.allColumns || this.allColumns.length < 0) {
                return <any>[];
            }
            var result = <any>[];
            for (var i = 0; i < this.allColumns.length; i++) {
                var column = this.allColumns[i];
                var pivotIndex = this.pivotColumns.indexOf(column);
                var resultItem = {
                    colId: column.colId,
                    hide: !column.visible,
                    aggFunc: column.aggFunc ? column.aggFunc : null,
                    width: column.actualWidth,
                    pivotIndex: pivotIndex >= 0 ? pivotIndex : null
                };
                result.push(resultItem);
            }
            return result;
        }

        public setState(columnState: any): void {
            var oldColumnList = this.allColumns;
            this.allColumns = [];
            this.pivotColumns = [];
            this.valueColumns = [];
            var that = this;

            _.forEach(columnState, function (stateItem: any) {
                var oldColumn = _.find(oldColumnList, 'colId', stateItem.colId);
                if (!oldColumn) {
                    console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                    return;
                }
                // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
                oldColumn.visible = stateItem.hide ? false : true;
                // if width provided and valid, use it, otherwise stick with the old width
                oldColumn.actualWidth = stateItem.width >= constants.MIN_COL_WIDTH ? stateItem.width : oldColumn.actualWidth;
                // accept agg func only if valid
                var aggFuncValid = [constants.MIN, constants.MAX, constants.SUM].indexOf(stateItem.aggFunc) >= 0;
                if (aggFuncValid) {
                    oldColumn.aggFunc = stateItem.aggFunc;
                    that.valueColumns.push(oldColumn);
                } else {
                    oldColumn.aggFunc = null;
                }
                // if pivot
                if (typeof stateItem.pivotIndex === 'number' && stateItem.pivotIndex >= 0) {
                    that.pivotColumns.push(oldColumn);
                }
                that.allColumns.push(oldColumn);
                oldColumnList.splice(oldColumnList.indexOf(oldColumn), 1);
            });

            // anything left over, we got no data for, so add in the column as non-value, non-pivot and hidden
            _.forEach(oldColumnList, function (oldColumn: any) {
                oldColumn.visible = false;
                oldColumn.aggFunc = null;
                that.allColumns.push(oldColumn);
            });

            this.pivotColumns.sort(function (colA: any, colB: any): number {
                return colA.pivotIndex - colB.pivotIndex;
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

        public getColumn(key: any): Column {
            if (!key) {return null;}

            // need both allColumns and visibleColumns, in case the
            // grouping column that came from the grid options
            var listsToCheck = [this.allColumns, this.visibleColumns];

            for (var j = 0; j<listsToCheck.length; j++) {
                var list = listsToCheck[j];
                if (!list) {
                    continue;
                }
                for (var i = 0; i < list.length; i++) {
                    var colDefMatches = list[i].colDef === key;
                    var idMatches = list[i].colId === key;
                    if (colDefMatches || idMatches) {
                        return list[i];
                    }
                }
            }

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

        public getColumnGroup(name: string): ColumnGroup {
            if (!name) {return null;}
            if (this.columnGroups) {
                for (var i = 0; i<this.columnGroups.length; i++) {
                    if (this.columnGroups[i].name === name) {
                        return this.columnGroups[i];
                    }
                }
            }
        }

        // called by angularGrid
        public onColumnsChanged() {
            var columnDefs = this.gridOptionsWrapper.getColumnDefs();
            this.checkForDeprecatedItems(columnDefs);
            this.createColumns(columnDefs);
            this.createPivotColumns();
            this.createValueColumns();
            this.updateModel();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
            this.setupComplete = true;
        }

        private checkForDeprecatedItems(columnDefs: any) {
            if (columnDefs) {
                for (var i = 0; i < columnDefs.length; i++) {
                    var colDef = columnDefs[i];
                    if (colDef.group !== undefined) {
                        console.warn('ag-grid: ' + colDef.field + ' colDef.group is deprecated, please use colDef.headerGroup');
                        colDef.headerGroup = colDef.group;
                    }
                    if (colDef.groupShow !== undefined) {
                        console.warn('ag-grid: ' + colDef.field + ' colDef.groupShow is deprecated, please use colDef.headerGroupShow');
                        colDef.headerGroupShow = colDef.groupShow;
                    }
                }
            }
        }

        // called by headerRenderer - when a header is opened or closed
        public columnGroupOpened(group: ColumnGroup, newValue: boolean): void {
            group.expanded = newValue;
            this.updateGroups();
            this.updateDisplayedColumns();
            var event = new ColumnChangeEvent(Events.EVENT_COLUMN_GROUP_OPENED).withColumnGroup(group);
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_GROUP_OPENED, event);
        }

        // called from API
        public hideColumns(colIds: any, hide: any) {
            var updatedCols: Column[] = [];
            this.allColumns.forEach( (column: Column) => {
                var idThisCol = column.colId;
                var hideThisCol = colIds.indexOf(idThisCol) >= 0;
                var newVisible = !hide;
                if (hideThisCol && column.visible !== newVisible) {
                    column.visible = newVisible;
                    updatedCols.push(column);
                }
            });

            if (updatedCols.length>0) {
                this.updateModel();
                updatedCols.forEach( (column: Column) => {
                    var event = new ColumnChangeEvent(Events.EVENT_COLUMN_VISIBLE)
                        .withColumn(column);
                    this.eventService.dispatchEvent(Events.EVENT_COLUMN_VISIBLE, event);
                });
            }
        }

        private updateModel() {
            this.updateVisibleColumns();
            this.updatePinnedColumns();
            this.buildGroups();
            this.updateGroups();
            this.updateDisplayedColumns();
        }

        private updateDisplayedColumns() {

            if (!this.gridOptionsWrapper.isGroupHeaders()) {
                // if not grouping by headers, then pull visible cols
                this.displayedColumns = this.visibleColumns;
            } else {
                // if grouping, then only show col as per group rules
                this.displayedColumns = [];
                for (var i = 0; i < this.columnGroups.length; i++) {
                    var group = this.columnGroups[i];
                    group.addToVisibleColumns(this.displayedColumns);
                }
            }

        }

        // called from api
        public sizeColumnsToFit(gridWidth: any): void {
            // avoid divide by zero
            if (gridWidth <= 0 || this.displayedColumns.length === 0) {
                return;
            }

            var colsToNotSpread = _.filter(this.displayedColumns, (column: Column): boolean => {
                return column.colDef.suppressSizeToFit === true;
            });
            var colsToSpread = _.filter(this.displayedColumns, (column: Column): boolean => {
                return column.colDef.suppressSizeToFit !== true;
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
                        this.updateGroupWidthsAfterColumnResize(column);
                    });
                } else {
                    var scale = availablePixels / getTotalWidth(colsToSpread);
                    // we set the pixels for the last col based on what's left, as otherwise
                    // we could be a pixel or two short or extra because of rounding errors.
                    var pixelsForLastCol = availablePixels;
                    // backwards through loop, as we are removing items as we go
                    for (var i = colsToSpread.length - 1; i >= 0; i--) {
                        var column = colsToSpread[i];
                        var newWidth = Math.round(column.actualWidth * scale);
                        if (newWidth < column.getMinimumWidth()) {
                            column.setMinimum();
                            moveToNotSpread(column);
                            finishedResizing = false;
                        } else if (column.isGreaterThanMax(newWidth)) {
                            column.actualWidth = column.colDef.maxWidth;
                            moveToNotSpread(column);
                            finishedResizing = false;
                        } else {
                            var onLastCol = i === 0;
                            if (onLastCol) {
                                column.actualWidth = pixelsForLastCol;
                            } else {
                                pixelsForLastCol -= newWidth;
                                column.actualWidth = newWidth;
                            }
                        }
                        this.updateGroupWidthsAfterColumnResize(column);
                    }
                }
            }

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
                    result += columns[i].actualWidth;
                }
                return result;
            }
        }

        private buildGroups() {
            // if not grouping by headers, do nothing
            if (!this.gridOptionsWrapper.isGroupHeaders()) {
                this.columnGroups = null;
                return;
            }

            // split the columns into groups
            var currentGroup = <any> null;
            this.columnGroups = [];
            var that = this;

            var lastColWasPinned = true;

            this.visibleColumns.forEach(function (column: any) {
                // do we need a new group, because we move from pinned to non-pinned columns?
                var endOfPinnedHeader = lastColWasPinned && !column.pinned;
                if (!column.pinned) {
                    lastColWasPinned = false;
                }
                // do we need a new group, because the group names doesn't match from previous col?
                var groupKeyMismatch = currentGroup && column.colDef.headerGroup !== currentGroup.name;
                // we don't group columns where no group is specified
                var colNotInGroup = currentGroup && !currentGroup.name;
                // do we need a new group, because we are just starting
                var processingFirstCol = currentGroup === null;
                var newGroupNeeded = processingFirstCol || endOfPinnedHeader || groupKeyMismatch || colNotInGroup;
                // create new group, if it's needed
                if (newGroupNeeded) {
                    var pinned = column.pinned;
                    currentGroup = new ColumnGroup(pinned, column.colDef.headerGroup);
                    that.columnGroups.push(currentGroup);
                }
                currentGroup.addColumn(column);
            });
        }

        private updateGroups(): void {
            // if not grouping by headers, do nothing
            if (!this.gridOptionsWrapper.isGroupHeaders()) {
                return;
            }

            for (var i = 0; i < this.columnGroups.length; i++) {
                var group = this.columnGroups[i];
                group.calculateExpandable();
                group.calculateDisplayedColumns();
                group.calculateActualWidth();
            }
        }

        private updateVisibleColumns(): void {
            this.visibleColumns = [];

            // see if we need to insert the default grouping column
            var needAGroupColumn = this.pivotColumns.length > 0
                && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
                && !this.gridOptionsWrapper.isGroupUseEntireRow()
                && !this.gridOptionsWrapper.isGroupSuppressRow();

            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

            if (needAGroupColumn) {
                // if one provided by user, use it, otherwise create one
                var groupColDef = this.gridOptionsWrapper.getGroupColumnDef();
                if (!groupColDef) {
                    groupColDef = {
                        headerName: localeTextFunc('group', 'Group'),
                        cellRenderer: {
                            renderer: "group"
                        }
                    };
                }
                // no group column provided, need to create one here
                var groupColumnWidth = this.calculateColInitialWidth(groupColDef);
                var groupColumn = new Column(groupColDef, groupColumnWidth);
                this.visibleColumns.push(groupColumn);
            }

            for (var i = 0; i < this.allColumns.length; i++) {
                var column = this.allColumns[i];
                var hideBecauseOfPivot = this.pivotColumns.indexOf(column) >= 0
                    && this.gridOptionsWrapper.isGroupHidePivotColumns();
                if (column.visible && !hideBecauseOfPivot) {
                    column.index = this.visibleColumns.length;
                    this.visibleColumns.push(this.allColumns[i]);
                }
            }
        }

        private updatePinnedColumns(): void {
            for (var i = 0; i < this.visibleColumns.length; i++) {
                var pinned = i < this.pinnedColumnCount;
                this.visibleColumns[i].pinned = pinned;
            }
        }

        private createColumns(colDefs: any): void {
            this.allColumns = [];
            if (colDefs) {
                for (var i = 0; i < colDefs.length; i++) {
                    var colDef = colDefs[i];
                    var width = this.calculateColInitialWidth(colDef);
                    var column = new Column(colDef, width);
                    this.allColumns.push(column);
                }
            }
        }

        private createPivotColumns(): void {
            this.pivotColumns = [];
            var groupKeys = this.gridOptionsWrapper.getGroupKeys();
            if (!groupKeys || groupKeys.length <= 0) {
                return;
            }
            for (var i = 0; i < groupKeys.length; i++) {
                var groupKey = groupKeys[i];
                var column = this.getColumn(groupKey);
                if (!column) {
                    column = this.createDummyColumn(groupKey);
                }
                this.pivotColumns.push(column);
            }
        }

        private createValueColumns(): void {
            this.valueColumns = [];

            // override with columns that have the aggFunc specified explicitly
            for (var i = 0; i < this.allColumns.length; i++) {
                var column = this.allColumns[i];
                if (column.colDef.aggFunc) {
                    column.aggFunc = column.colDef.aggFunc;
                    this.valueColumns.push(column);
                }
            }
        }

        private createDummyColumn(field: any): Column {
            var colDef = {
                field: field,
                headerName: field,
                hide: false
            };
            var width = this.gridOptionsWrapper.getColWidth();
            var column = new Column(colDef, width);
            return column;
        }

        private calculateColInitialWidth(colDef: any) {
            if (!colDef.width) {
                // if no width defined in colDef, use default
                return this.gridOptionsWrapper.getColWidth();
            } else if (colDef.width < constants.MIN_COL_WIDTH) {
                // if width in col def to small, set to min width
                return constants.MIN_COL_WIDTH;
            } else {
                // otherwise use the provided width
                return colDef.width;
            }
        }

        // call with true (pinned), false (not-pinned) or undefined (all columns)
        private getTotalColWidth(includePinned: any) {
            var widthSoFar = 0;
            var pinedNotImportant = typeof includePinned !== 'boolean';

            this.displayedColumns.forEach(function (column: any) {
                var includeThisCol = pinedNotImportant || column.pinned === includePinned;
                if (includeThisCol) {
                    widthSoFar += column.actualWidth;
                }
            });

            return widthSoFar;
        }
    }

}