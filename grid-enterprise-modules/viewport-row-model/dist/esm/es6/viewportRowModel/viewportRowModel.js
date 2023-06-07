var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Events, PostConstruct, PreDestroy, RowNode } from "@ag-grid-community/core";
const DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
const DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
let ViewportRowModel = class ViewportRowModel extends BeanStub {
    constructor() {
        super(...arguments);
        // rowRenderer tells us these
        this.firstRow = -1;
        this.lastRow = -1;
        // datasource tells us this
        this.rowCount = -1;
        this.rowNodesByIndex = {};
    }
    // we don't implement as lazy row heights is not supported in this row model
    ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) { return false; }
    init() {
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.addManagedListener(this.eventService, Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));
    }
    start() {
        if (this.gridOptionsService.get('viewportDatasource')) {
            this.setViewportDatasource(this.gridOptionsService.get('viewportDatasource'));
        }
    }
    isLastRowIndexKnown() {
        return true;
    }
    destroyDatasource() {
        if (!this.viewportDatasource) {
            return;
        }
        if (this.viewportDatasource.destroy) {
            this.viewportDatasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.firstRow = -1;
        this.lastRow = -1;
    }
    getViewportRowModelPageSize() {
        return _.oneOrGreater(this.gridOptionsService.getNum('viewportRowModelPageSize'), DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE);
    }
    getViewportRowModelBufferSize() {
        return _.zeroOrGreater(this.gridOptionsService.getNum('viewportRowModelBufferSize'), DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE);
    }
    calculateFirstRow(firstRenderedRow) {
        const bufferSize = this.getViewportRowModelBufferSize();
        const pageSize = this.getViewportRowModelPageSize();
        const afterBuffer = firstRenderedRow - bufferSize;
        if (afterBuffer < 0) {
            return 0;
        }
        return Math.floor(afterBuffer / pageSize) * pageSize;
    }
    calculateLastRow(lastRenderedRow) {
        if (lastRenderedRow === -1) {
            return lastRenderedRow;
        }
        const bufferSize = this.getViewportRowModelBufferSize();
        const pageSize = this.getViewportRowModelPageSize();
        const afterBuffer = lastRenderedRow + bufferSize;
        const result = Math.ceil(afterBuffer / pageSize) * pageSize;
        const lastRowIndex = this.rowCount - 1;
        return Math.min(result, lastRowIndex);
    }
    onViewportChanged(event) {
        const newFirst = this.calculateFirstRow(event.firstRow);
        const newLast = this.calculateLastRow(event.lastRow);
        if (this.firstRow !== newFirst || this.lastRow !== newLast) {
            this.firstRow = newFirst;
            this.lastRow = newLast;
            this.purgeRowsNotInViewport();
            if (this.viewportDatasource) {
                this.viewportDatasource.setViewportRange(this.firstRow, this.lastRow);
            }
        }
    }
    purgeRowsNotInViewport() {
        Object.keys(this.rowNodesByIndex).forEach(indexStr => {
            const index = parseInt(indexStr, 10);
            if (index < this.firstRow || index > this.lastRow) {
                if (this.isRowFocused(index)) {
                    return;
                }
                delete this.rowNodesByIndex[index];
            }
        });
    }
    isRowFocused(rowIndex) {
        const focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        const hasFocus = focusedCell.rowIndex === rowIndex;
        return hasFocus;
    }
    setViewportDatasource(viewportDatasource) {
        this.destroyDatasource();
        this.viewportDatasource = viewportDatasource;
        this.rowCount = -1;
        if (!viewportDatasource.init) {
            console.warn('AG Grid: viewport is missing init method.');
        }
        else {
            viewportDatasource.init({
                setRowCount: this.setRowCount.bind(this),
                setRowData: this.setRowData.bind(this),
                getRow: this.getRow.bind(this)
            });
        }
    }
    getType() {
        return 'viewport';
    }
    getRow(rowIndex) {
        if (!this.rowNodesByIndex[rowIndex]) {
            this.rowNodesByIndex[rowIndex] = this.createBlankRowNode(rowIndex);
        }
        return this.rowNodesByIndex[rowIndex];
    }
    getRowNode(id) {
        let result;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
    }
    getRowCount() {
        return this.rowCount === -1 ? 0 : this.rowCount;
    }
    getRowIndexAtPixel(pixel) {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        }
        return 0;
    }
    getRowBounds(index) {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }
    getTopLevelRowCount() {
        return this.getRowCount();
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        return topLevelIndex;
    }
    isEmpty() {
        return this.rowCount > 0;
    }
    isRowsToRender() {
        return this.rowCount > 0;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        const firstIndex = _.missing(firstInRange) ? 0 : firstInRange.rowIndex;
        const lastIndex = lastInRange.rowIndex;
        const firstNodeOutOfRange = firstIndex < this.firstRow || firstIndex > this.lastRow;
        const lastNodeOutOfRange = lastIndex < this.firstRow || lastIndex > this.lastRow;
        if (firstNodeOutOfRange || lastNodeOutOfRange) {
            return [];
        }
        const result = [];
        const startIndex = firstIndex <= lastIndex ? firstIndex : lastIndex;
        const endIndex = firstIndex <= lastIndex ? lastIndex : firstIndex;
        for (let i = startIndex; i <= endIndex; i++) {
            result.push(this.rowNodesByIndex[i]);
        }
        return result;
    }
    forEachNode(callback) {
        let callbackCount = 0;
        Object.keys(this.rowNodesByIndex).forEach(indexStr => {
            const index = parseInt(indexStr, 10);
            const rowNode = this.rowNodesByIndex[index];
            callback(rowNode, callbackCount);
            callbackCount++;
        });
    }
    setRowData(rowData) {
        _.iterateObject(rowData, (indexStr, dataItem) => {
            const index = parseInt(indexStr, 10);
            // we should never keep rows that we didn't specifically ask for, this
            // guarantees the contract we have with the server.
            if (index >= this.firstRow && index <= this.lastRow) {
                let rowNode = this.rowNodesByIndex[index];
                // the abnormal case is we requested a row even though the grid didn't need it
                // as a result of the paging and buffer (ie the row is off screen), in which
                // case we need to create a new node now
                if (_.missing(rowNode)) {
                    rowNode = this.createBlankRowNode(index);
                    this.rowNodesByIndex[index] = rowNode;
                }
                // now we deffo have a row node, so set in the details
                // if the grid already asked for this row (the normal case), then we would
                // of put a placeholder node in place.
                rowNode.setDataAndId(dataItem, index.toString());
            }
        });
    }
    createBlankRowNode(rowIndex) {
        const rowNode = new RowNode(this.beans);
        rowNode.setRowHeight(this.rowHeight);
        rowNode.setRowTop(this.rowHeight * rowIndex);
        rowNode.setRowIndex(rowIndex);
        return rowNode;
    }
    setRowCount(rowCount, keepRenderedRows = false) {
        if (rowCount === this.rowCount) {
            return;
        }
        this.rowCount = rowCount;
        const event = {
            type: Events.EVENT_MODEL_UPDATED,
            newData: false,
            newPage: false,
            keepRenderedRows: keepRenderedRows,
            animate: false
        };
        this.eventService.dispatchEvent(event);
    }
    isRowPresent(rowNode) {
        const foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    }
};
__decorate([
    Autowired('rowRenderer')
], ViewportRowModel.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('focusService')
], ViewportRowModel.prototype, "focusService", void 0);
__decorate([
    Autowired('beans')
], ViewportRowModel.prototype, "beans", void 0);
__decorate([
    PostConstruct
], ViewportRowModel.prototype, "init", null);
__decorate([
    PreDestroy
], ViewportRowModel.prototype, "destroyDatasource", null);
ViewportRowModel = __decorate([
    Bean('rowModel')
], ViewportRowModel);
export { ViewportRowModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRSb3dNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy92aWV3cG9ydFJvd01vZGVsL3ZpZXdwb3J0Um93TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFDUixNQUFNLEVBSU4sYUFBYSxFQUNiLFVBQVUsRUFFVixPQUFPLEVBTVYsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxNQUFNLG9DQUFvQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxNQUFNLHNDQUFzQyxHQUFHLENBQUMsQ0FBQztBQUVqRCxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFpQixTQUFRLFFBQVE7SUFBOUM7O1FBTUksNkJBQTZCO1FBQ3JCLGFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNkLFlBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVyQiwyQkFBMkI7UUFDbkIsYUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2Qsb0JBQWUsR0FBK0IsRUFBRSxDQUFDO0lBdVE3RCxDQUFDO0lBblFHLDRFQUE0RTtJQUNyRSxxQkFBcUIsQ0FBQyxVQUFrQixFQUFFLFFBQWdCLEVBQUUsZUFBdUIsRUFBRSxhQUFxQixJQUFhLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztJQUdySSxJQUFJO1FBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pILENBQUM7SUFFTSxLQUFLO1FBQ1IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFD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