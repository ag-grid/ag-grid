var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// enterprise-modules/viewport-row-model/src/main.ts
var main_exports = {};
__export(main_exports, {
  ViewportRowModelModule: () => ViewportRowModelModule
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/viewport-row-model/src/viewportRowModelModule.ts
var import_core2 = require("@ag-grid-community/core");
var import_core3 = require("@ag-grid-enterprise/core");

// enterprise-modules/viewport-row-model/src/version.ts
var VERSION = "32.0.2";

// enterprise-modules/viewport-row-model/src/viewportRowModel/viewportRowModel.ts
var import_core = require("@ag-grid-community/core");
var ViewportRowModel = class extends import_core.BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "rowModel";
    // rowRenderer tells us these
    this.firstRow = -1;
    this.lastRow = -1;
    // datasource tells us this
    this.rowCount = -1;
    this.rowNodesByIndex = {};
  }
  wireBeans(beans) {
    this.rowRenderer = beans.rowRenderer;
    this.focusService = beans.focusService;
    this.beans = beans;
  }
  // we don't implement as lazy row heights is not supported in this row model
  ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
    return false;
  }
  postConstruct() {
    this.rowHeight = this.gos.getRowHeightAsNumber();
    this.addManagedEventListeners({ viewportChanged: this.onViewportChanged.bind(this) });
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
  destroy() {
    this.destroyDatasource();
    super.destroy();
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
      (0, import_core._warnOnce)("viewport is missing init method.");
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
      type: "modelUpdated",
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
    const firstIndex = firstInRange.rowIndex;
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
    (0, import_core._iterateObject)(rowData, (indexStr, dataItem) => {
      const index = parseInt(indexStr, 10);
      if (index >= this.firstRow && index <= this.lastRow) {
        let rowNode = this.rowNodesByIndex[index];
        if ((0, import_core._missing)(rowNode)) {
          rowNode = this.createBlankRowNode(index);
          this.rowNodesByIndex[index] = rowNode;
        }
        rowNode.setDataAndId(dataItem, index.toString());
      }
    });
  }
  createBlankRowNode(rowIndex) {
    const rowNode = new import_core.RowNode(this.beans);
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
      type: "rowCountReady"
    });
    const event = {
      type: "modelUpdated",
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

// enterprise-modules/viewport-row-model/src/viewportRowModelModule.ts
var ViewportRowModelModule = {
  version: VERSION,
  moduleName: import_core2.ModuleNames.ViewportRowModelModule,
  rowModel: "viewport",
  beans: [ViewportRowModel],
  dependantModules: [import_core3.EnterpriseCoreModule]
};
