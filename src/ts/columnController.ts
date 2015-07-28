/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
/// <reference path="entities/column.ts" />

module awk.grid {

    var _ = Utils;
    var constants = Constants;

    export class ColumnController {

        private gridOptionsWrapper: GridOptionsWrapper;
        private angularGrid: Grid;
        private selectionRendererFactory: SelectionRendererFactory;
        private expressionService: ExpressionService;
        private changedListeners: any[];
        private allColumns: Column[];
        private displayedColumns: Column[];
        private pivotColumns: Column[];
        private valueColumns: Column[];
        private visibleColumns: Column[];
        private headerGroups: HeaderGroup[];

        private valueService: ValueService;

        constructor() {
            this.changedListeners = [];
        }

        public init(angularGrid: Grid, selectionRendererFactory: SelectionRendererFactory,
                    gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService,
                    valueService: ValueService) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.angularGrid = angularGrid;
            this.selectionRendererFactory = selectionRendererFactory;
            this.expressionService = expressionService;
            this.valueService = valueService;
        }

        // used by:
        // + headerRenderer -> setting pinned body width
        public getHeaderGroups(): HeaderGroup[] {
            return this.headerGroups;
        }

        // used by:
        // + angularGrid -> setting pinned body width
        public getPinnedContainerWidth() {
            return this.getTotalColWidth(true);
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
        public getGroupedColumns(): Column[] {
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
        public getVisibleColAfter(col: any): Column {
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

        public getState() {
            if (!this.allColumns || this.allColumns.length < 0) {
                return [];
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

        public setState(columnState: any) {
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
            this.fireColumnsChanged();
        }

        public getColumn(key: any) {
            for (var i = 0; i < this.allColumns.length; i++) {
                var colDefMatches = this.allColumns[i].colDef === key;
                var fieldMatches = this.allColumns[i].colDef.field === key;
                if (colDefMatches || fieldMatches) {
                    return this.allColumns[i];
                }
            }
        }

        public getDisplayNameForCol(column: any) {

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

        public addListener(listener: any) {
            this.changedListeners.push(listener);
        }

        public fireColumnsChanged() {
            for (var i = 0; i < this.changedListeners.length; i++) {
                this.changedListeners[i].columnsChanged(this.allColumns, this.pivotColumns, this.valueColumns);
            }
        }

        // called by angularGrid
        public setColumns(columnDefs: any) {
            this.checkForDeprecatedItems(columnDefs);
            this.createColumns(columnDefs);
            this.createPivotColumns();
            this.createValueColumns();
            this.updateModel();
            this.fireColumnsChanged();
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
        public headerGroupOpened(group: any): void {
            group.expanded = !group.expanded;
            this.updateGroups();
            this.updateDisplayedColumns();
            this.angularGrid.refreshHeaderAndBody();
        }

        // called by toolPanel - when change in columns happens
        public onColumnStateChanged() {
            this.updateModel();
            this.angularGrid.refreshHeaderAndBody();
        }

        // called from API
        public hideColumns(colIds: any, hide: any) {
            for (var i = 0; i < this.allColumns.length; i++) {
                var idThisCol = this.allColumns[i].colId;
                var hideThisCol = colIds.indexOf(idThisCol) >= 0;
                if (hideThisCol) {
                    this.allColumns[i].visible = !hide;
                }
            }
            this.onColumnStateChanged();
            this.fireColumnsChanged(); // to tell toolbar
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
                for (var i = 0; i < this.headerGroups.length; i++) {
                    var group = this.headerGroups[i];
                    group.addToVisibleColumns(this.displayedColumns);
                }
            }

        }

        // called from api
        public sizeColumnsToFit(gridWidth: any) {
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

            var finishedResizing = false;
            while (!finishedResizing) {
                finishedResizing = true;
                var availablePixels = gridWidth - getTotalWidth(colsToNotSpread);
                if (availablePixels <= 0) {
                    // no width, set everything to minimum
                    colsToSpread.forEach( function(column: Column) {
                        column.setMinimum();
                    });
                } else {
                    var scale = availablePixels / getTotalWidth(colsToSpread);
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
                    }
                }
            }

            // widths set, refresh the gui
            this.angularGrid.refreshHeaderAndBody();

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
                this.headerGroups = null;
                return;
            }

            // split the columns into groups
            var currentGroup = <any> null;
            this.headerGroups = [];
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
                    currentGroup = new HeaderGroup(pinned, column.colDef.headerGroup);
                    that.headerGroups.push(currentGroup);
                }
                currentGroup.addColumn(column);
            });
        }

        private updateGroups() {
            // if not grouping by headers, do nothing
            if (!this.gridOptionsWrapper.isGroupHeaders()) {
                return;
            }

            for (var i = 0; i < this.headerGroups.length; i++) {
                var group = this.headerGroups[i];
                group.calculateExpandable();
                group.calculateDisplayedColumns();
            }
        }

        private updateVisibleColumns() {
            this.visibleColumns = [];

            // see if we need to insert the default grouping column
            var needAGroupColumn = this.pivotColumns.length > 0
                && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
                && !this.gridOptionsWrapper.isGroupUseEntireRow()
                && !this.gridOptionsWrapper.isSuppressGroupRow();

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
                var groupColumn = new Column(groupColDef, this.gridOptionsWrapper.getColWidth());
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

        private updatePinnedColumns() {
            var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
            for (var i = 0; i < this.visibleColumns.length; i++) {
                var pinned = i < pinnedColumnCount;
                this.visibleColumns[i].pinned = pinned;
            }
        }

        private createColumns(columnDefs: any) {
            this.allColumns = [];
            if (columnDefs) {
                for (var i = 0; i < columnDefs.length; i++) {
                    var colDef = columnDefs[i];
                    var width = this.calculateColInitialWidth(colDef);
                    var column = new Column(colDef, width);
                    this.allColumns.push(column);
                }
            }
        }

        private createPivotColumns() {
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

        private createValueColumns() {
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

        private createDummyColumn(field: any) {
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

    export class HeaderGroup {

        pinned: any;
        name: any;
        allColumns: Column[] = [];
        displayedColumns: Column[] = [];
        expandable = false;
        expanded = false;

        actualWidth: number;
        eHeaderGroupCell: HTMLElement;
        eHeaderCellResize: HTMLElement;

        constructor(pinned: any, name: any) {
            this.pinned = pinned;
            this.name = name;
        }

        public getMinimumWidth(): number {
            var result = 0;
            this.displayedColumns.forEach( (column: Column) => {
                result += column.getMinimumWidth();
            })
            return result;
        }

        public addColumn(column: any) {
            this.allColumns.push(column);
        }

        // need to check that this group has at least one col showing when both expanded and contracted.
        // if not, then we don't allow expanding and contracting on this group
        public calculateExpandable() {
            // want to make sure the group doesn't disappear when it's open
            var atLeastOneShowingWhenOpen = false;
            // want to make sure the group doesn't disappear when it's closed
            var atLeastOneShowingWhenClosed = false;
            // want to make sure the group has something to show / hide
            var atLeastOneChangeable = false;
            for (var i = 0, j = this.allColumns.length; i < j; i++) {
                var column = this.allColumns[i];
                if (column.colDef.headerGroupShow === 'open') {
                    atLeastOneShowingWhenOpen = true;
                    atLeastOneChangeable = true;
                } else if (column.colDef.headerGroupShow === 'closed') {
                    atLeastOneShowingWhenClosed = true;
                    atLeastOneChangeable = true;
                } else {
                    atLeastOneShowingWhenOpen = true;
                    atLeastOneShowingWhenClosed = true;
                }
            }

            this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
        }

        public calculateDisplayedColumns() {
            // clear out last time we calculated
            this.displayedColumns = [];
            // it not expandable, everything is visible
            if (!this.expandable) {
                this.displayedColumns = this.allColumns;
                return;
            }
            // and calculate again
            for (var i = 0, j = this.allColumns.length; i < j; i++) {
                var column = this.allColumns[i];
                switch (column.colDef.headerGroupShow) {
                    case 'open':
                        // when set to open, only show col if group is open
                        if (this.expanded) {
                            this.displayedColumns.push(column);
                        }
                        break;
                    case 'closed':
                        // when set to open, only show col if group is open
                        if (!this.expanded) {
                            this.displayedColumns.push(column);
                        }
                        break;
                    default:
                        // default is always show the column
                        this.displayedColumns.push(column);
                        break;
                }
            }
        }

        // should replace with utils method 'add all'
        public addToVisibleColumns(colsToAdd: any) {
            for (var i = 0; i < this.displayedColumns.length; i++) {
                var column = this.displayedColumns[i];
                colsToAdd.push(column);
            }
        }
    }
    
}