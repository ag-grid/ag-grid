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
        this.rowCount = 0;
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
        return this.rowCount;
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
