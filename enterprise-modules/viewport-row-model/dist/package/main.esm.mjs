var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/viewport-row-model/src/viewportRowModelModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/viewport-row-model/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/viewport-row-model/src/viewportRowModel/viewportRowModel.ts
import {
  _,
  Autowired,
  Bean,
  BeanStub,
  Events,
  PostConstruct,
  PreDestroy,
  RowNode
} from "@ag-grid-community/core";
var ViewportRowModel = class extends BeanStub {
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
  ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
    return false;
  }
  init() {
    this.rowHeight = this.gos.getRowHeightAsNumber();
    this.addManagedListener(this.eventService, Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));
    this.addManagedPropertyListener("viewportDatasource", () => this.updateDatasource());
    this.addManagedPropertyListener("rowHeight", () => {
      this.rowHeight = this.gos.getRowHeightAsNumber();
      this.updateRowHeights();
    });
  }
  start() {
    this.updateDatasource();
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
  updateDatasource() {
    const datasource = this.gos.get("viewportDatasource");
    if (datasource) {
      this.setViewportDatasource(datasource);
    }
  }
  getViewportRowModelPageSize() {
    return this.gos.get("viewportRowModelPageSize");
  }
  getViewportRowModelBufferSize() {
    return this.gos.get("viewportRowModelBufferSize");
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
    Object.keys(this.rowNodesByIndex).forEach((indexStr) => {
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
      console.warn("AG Grid: viewport is missing init method.");
    } else {
      viewportDatasource.init({
        setRowCount: this.setRowCount.bind(this),
        setRowData: this.setRowData.bind(this),
        getRow: this.getRow.bind(this)
      });
    }
  }
  getType() {
    return "viewport";
  }
  getRow(rowIndex) {
    if (!this.rowNodesByIndex[rowIndex]) {
      this.rowNodesByIndex[rowIndex] = this.createBlankRowNode(rowIndex);
    }
    return this.rowNodesByIndex[rowIndex];
  }
  getRowNode(id) {
    let result;
    this.forEachNode((rowNode) => {
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
    if (this.rowHeight !== 0) {
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
  updateRowHeights() {
    this.forEachNode((node) => {
      node.setRowHeight(this.rowHeight);
      node.setRowTop(this.rowHeight * node.rowIndex);
    });
    const event = {
      type: Events.EVENT_MODEL_UPDATED,
      newData: false,
      newPage: false,
      keepRenderedRows: true,
      animate: false
    };
    this.eventService.dispatchEvent(event);
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
    Object.keys(this.rowNodesByIndex).forEach((indexStr) => {
      const index = parseInt(indexStr, 10);
      const rowNode = this.rowNodesByIndex[index];
      callback(rowNode, callbackCount);
      callbackCount++;
    });
  }
  setRowData(rowData) {
    _.iterateObject(rowData, (indexStr, dataItem) => {
      const index = parseInt(indexStr, 10);
      if (index >= this.firstRow && index <= this.lastRow) {
        let rowNode = this.rowNodesByIndex[index];
        if (_.missing(rowNode)) {
          rowNode = this.createBlankRowNode(index);
          this.rowNodesByIndex[index] = rowNode;
        }
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
    this.eventService.dispatchEventOnce({
      type: Events.EVENT_ROW_COUNT_READY
    });
    const event = {
      type: Events.EVENT_MODEL_UPDATED,
      newData: false,
      newPage: false,
      keepRenderedRows,
      animate: false
    };
    this.eventService.dispatchEvent(event);
  }
  isRowPresent(rowNode) {
    const foundRowNode = this.getRowNode(rowNode.id);
    return !!foundRowNode;
  }
};
__decorateClass([
  Autowired("rowRenderer")
], ViewportRowModel.prototype, "rowRenderer", 2);
__decorateClass([
  Autowired("focusService")
], ViewportRowModel.prototype, "focusService", 2);
__decorateClass([
  Autowired("beans")
], ViewportRowModel.prototype, "beans", 2);
__decorateClass([
  PostConstruct
], ViewportRowModel.prototype, "init", 1);
__decorateClass([
  PreDestroy
], ViewportRowModel.prototype, "destroyDatasource", 1);
ViewportRowModel = __decorateClass([
  Bean("rowModel")
], ViewportRowModel);

// enterprise-modules/viewport-row-model/src/viewportRowModelModule.ts
var ViewportRowModelModule = {
  version: VERSION,
  moduleName: ModuleNames.ViewportRowModelModule,
  rowModel: "viewport",
  beans: [ViewportRowModel],
  dependantModules: [
    EnterpriseCoreModule
  ]
};
export {
  ViewportRowModelModule
};
