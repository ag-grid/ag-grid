// community-modules/csv-export/src/csvExport/baseCreator.ts
import { BeanStub } from "@ag-grid-community/core";
var BaseCreator = class extends BeanStub {
  setBeans(beans) {
    this.beans = beans;
  }
  getFileName(fileName) {
    const extension = this.getDefaultFileExtension();
    if (fileName == null || !fileName.length) {
      fileName = this.getDefaultFileName();
    }
    return fileName.indexOf(".") === -1 ? `${fileName}.${extension}` : fileName;
  }
  getData(params) {
    const serializingSession = this.createSerializingSession(params);
    return this.beans.gridSerializer.serialize(serializingSession, params);
  }
  getDefaultFileName() {
    return `export.${this.getDefaultFileExtension()}`;
  }
};

// community-modules/csv-export/src/csvExport/sessions/baseGridSerializingSession.ts
var BaseGridSerializingSession = class {
  constructor(config) {
    this.groupColumns = [];
    const {
      columnModel,
      funcColsService,
      columnNameService,
      valueService,
      gos,
      processCellCallback,
      processHeaderCallback,
      processGroupHeaderCallback,
      processRowGroupCallback
    } = config;
    this.columnModel = columnModel;
    this.funcColsService = funcColsService;
    this.columnNameService = columnNameService;
    this.valueService = valueService;
    this.gos = gos;
    this.processCellCallback = processCellCallback;
    this.processHeaderCallback = processHeaderCallback;
    this.processGroupHeaderCallback = processGroupHeaderCallback;
    this.processRowGroupCallback = processRowGroupCallback;
  }
  prepare(columnsToExport) {
    this.groupColumns = columnsToExport.filter((col) => !!col.getColDef().showRowGroup);
  }
  extractHeaderValue(column) {
    const value = this.getHeaderName(this.processHeaderCallback, column);
    return value ?? "";
  }
  extractRowCellValue(column, index, accumulatedRowIndex, type, node) {
    const hideOpenParents = this.gos.get("groupHideOpenParents");
    const value = (!hideOpenParents || node.footer) && this.shouldRenderGroupSummaryCell(node, column, index) ? this.createValueForGroupNode(column, node) : this.valueService.getValue(column, node);
    const processedValue = this.processCell({
      accumulatedRowIndex,
      rowNode: node,
      column,
      value,
      processCellCallback: this.processCellCallback,
      type
    });
    return processedValue;
  }
  shouldRenderGroupSummaryCell(node, column, currentColumnIndex) {
    const isGroupNode = node && node.group;
    if (!isGroupNode) {
      return false;
    }
    const currentColumnGroupIndex = this.groupColumns.indexOf(column);
    if (currentColumnGroupIndex !== -1) {
      if (node.groupData?.[column.getId()] != null) {
        return true;
      }
      if (this.gos.isRowModelType("serverSide") && node.group) {
        return true;
      }
      if (node.footer && node.level === -1) {
        const colDef = column.getColDef();
        const isFullWidth = colDef == null || colDef.showRowGroup === true;
        return isFullWidth || colDef.showRowGroup === this.funcColsService.getRowGroupColumns()[0].getId();
      }
    }
    const isGroupUseEntireRow = this.gos.isGroupUseEntireRow(this.columnModel.isPivotMode());
    return currentColumnIndex === 0 && isGroupUseEntireRow;
  }
  getHeaderName(callback, column) {
    if (callback) {
      return callback(this.gos.addGridCommonParams({ column }));
    }
    return this.columnNameService.getDisplayNameForColumn(column, "csv", true);
  }
  createValueForGroupNode(column, node) {
    if (this.processRowGroupCallback) {
      return this.processRowGroupCallback(this.gos.addGridCommonParams({ column, node }));
    }
    const isTreeData = this.gos.get("treeData");
    const isSuppressGroupMaintainValueType = this.gos.get("suppressGroupMaintainValueType");
    const getValueFromNode = (node2) => {
      if (isTreeData || isSuppressGroupMaintainValueType) {
        return node2.key;
      }
      const value = node2.groupData?.[column.getId()];
      if (!value || !node2.rowGroupColumn || node2.rowGroupColumn.getColDef().useValueFormatterForExport === false) {
        return value;
      }
      return this.valueService.formatValue(node2.rowGroupColumn, node2, value) ?? value;
    };
    const isFooter = node.footer;
    const keys = [getValueFromNode(node)];
    if (!this.gos.isGroupMultiAutoColumn()) {
      while (node.parent) {
        node = node.parent;
        keys.push(getValueFromNode(node));
      }
    }
    const groupValue = keys.reverse().join(" -> ");
    return isFooter ? `Total ${groupValue}` : groupValue;
  }
  processCell(params) {
    const { accumulatedRowIndex, rowNode, column, value, processCellCallback, type } = params;
    if (processCellCallback) {
      return {
        value: processCellCallback(
          this.gos.addGridCommonParams({
            accumulatedRowIndex,
            column,
            node: rowNode,
            value,
            type,
            parseValue: (valueToParse) => this.valueService.parseValue(
              column,
              rowNode,
              valueToParse,
              this.valueService.getValue(column, rowNode)
            ),
            formatValue: (valueToFormat) => this.valueService.formatValue(column, rowNode, valueToFormat) ?? valueToFormat
          })
        ) ?? ""
      };
    }
    if (column.getColDef().useValueFormatterForExport !== false) {
      return {
        value: value ?? "",
        valueFormatted: this.valueService.formatValue(column, rowNode, value)
      };
    }
    return { value: value ?? "" };
  }
};

// community-modules/csv-export/src/csvExport/csvCreator.ts
import { _warnOnce as _warnOnce3 } from "@ag-grid-community/core";

// community-modules/csv-export/src/csvExport/downloader.ts
import { _warnOnce } from "@ag-grid-community/core";
var Downloader = class {
  static download(fileName, content) {
    const win = document.defaultView || window;
    if (!win) {
      _warnOnce("There is no `window` associated with the current `document`");
      return;
    }
    const element = document.createElement("a");
    const url = win.URL.createObjectURL(content);
    element.setAttribute("href", url);
    element.setAttribute("download", fileName);
    element.style.display = "none";
    document.body.appendChild(element);
    element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: false,
        cancelable: true,
        view: win
      })
    );
    document.body.removeChild(element);
    win.setTimeout(() => {
      win.URL.revokeObjectURL(url);
    }, 0);
  }
};

// community-modules/csv-export/src/csvExport/sessions/csvSerializingSession.ts
import { _warnOnce as _warnOnce2 } from "@ag-grid-community/core";
var LINE_SEPARATOR = "\r\n";
var CsvSerializingSession = class extends BaseGridSerializingSession {
  constructor(config) {
    super(config);
    this.isFirstLine = true;
    this.result = "";
    const { suppressQuotes, columnSeparator } = config;
    this.suppressQuotes = suppressQuotes;
    this.columnSeparator = columnSeparator;
  }
  addCustomContent(content) {
    if (!content) {
      return;
    }
    if (typeof content === "string") {
      if (!/^\s*\n/.test(content)) {
        this.beginNewLine();
      }
      content = content.replace(/\r?\n/g, LINE_SEPARATOR);
      this.result += content;
    } else {
      content.forEach((row) => {
        this.beginNewLine();
        row.forEach((cell, index) => {
          if (index !== 0) {
            this.result += this.columnSeparator;
          }
          this.result += this.putInQuotes(cell.data.value || "");
          if (cell.mergeAcross) {
            this.appendEmptyCells(cell.mergeAcross);
          }
        });
      });
    }
  }
  onNewHeaderGroupingRow() {
    this.beginNewLine();
    return {
      onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
    };
  }
  onNewHeaderGroupingRowColumn(columnGroup, header, index, span) {
    if (index != 0) {
      this.result += this.columnSeparator;
    }
    this.result += this.putInQuotes(header);
    this.appendEmptyCells(span);
  }
  appendEmptyCells(count) {
    for (let i = 1; i <= count; i++) {
      this.result += this.columnSeparator + this.putInQuotes("");
    }
  }
  onNewHeaderRow() {
    this.beginNewLine();
    return {
      onColumn: this.onNewHeaderRowColumn.bind(this)
    };
  }
  onNewHeaderRowColumn(column, index) {
    if (index != 0) {
      this.result += this.columnSeparator;
    }
    this.result += this.putInQuotes(this.extractHeaderValue(column));
  }
  onNewBodyRow() {
    this.beginNewLine();
    return {
      onColumn: this.onNewBodyRowColumn.bind(this)
    };
  }
  onNewBodyRowColumn(column, index, node) {
    if (index != 0) {
      this.result += this.columnSeparator;
    }
    const rowCellValue = this.extractRowCellValue(column, index, index, "csv", node);
    this.result += this.putInQuotes(rowCellValue.valueFormatted ?? rowCellValue.value);
  }
  putInQuotes(value) {
    if (this.suppressQuotes) {
      return value;
    }
    if (value === null || value === void 0) {
      return '""';
    }
    let stringValue;
    if (typeof value === "string") {
      stringValue = value;
    } else if (typeof value.toString === "function") {
      stringValue = value.toString();
    } else {
      _warnOnce2("unknown value type during csv conversion");
      stringValue = "";
    }
    const valueEscaped = stringValue.replace(/"/g, '""');
    return '"' + valueEscaped + '"';
  }
  parse() {
    return this.result;
  }
  beginNewLine() {
    if (!this.isFirstLine) {
      this.result += LINE_SEPARATOR;
    }
    this.isFirstLine = false;
  }
};

// community-modules/csv-export/src/csvExport/csvCreator.ts
var CsvCreator = class extends BaseCreator {
  constructor() {
    super(...arguments);
    this.beanName = "csvCreator";
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.columnNameService = beans.columnNameService;
    this.funcColsService = beans.funcColsService;
    this.valueService = beans.valueService;
    this.gridSerializer = beans.gridSerializer;
  }
  postConstruct() {
    this.setBeans({
      gridSerializer: this.gridSerializer,
      gos: this.gos
    });
  }
  getMergedParams(params) {
    const baseParams = this.gos.get("defaultCsvExportParams");
    return Object.assign({}, baseParams, params);
  }
  export(userParams) {
    if (this.isExportSuppressed()) {
      _warnOnce3(`Export cancelled. Export is not allowed as per your configuration.`);
      return;
    }
    const mergedParams = this.getMergedParams(userParams);
    const data = this.getData(mergedParams);
    const packagedFile = new Blob(["\uFEFF", data], { type: "text/plain" });
    const fileName = typeof mergedParams.fileName === "function" ? mergedParams.fileName(this.gos.getGridCommonParams()) : mergedParams.fileName;
    Downloader.download(this.getFileName(fileName), packagedFile);
  }
  exportDataAsCsv(params) {
    this.export(params);
  }
  getDataAsCsv(params, skipDefaultParams = false) {
    const mergedParams = skipDefaultParams ? Object.assign({}, params) : this.getMergedParams(params);
    return this.getData(mergedParams);
  }
  getDefaultFileExtension() {
    return "csv";
  }
  createSerializingSession(params) {
    const { columnModel, columnNameService, funcColsService, valueService, gos } = this;
    const {
      processCellCallback,
      processHeaderCallback,
      processGroupHeaderCallback,
      processRowGroupCallback,
      suppressQuotes,
      columnSeparator
    } = params;
    return new CsvSerializingSession({
      columnModel,
      columnNameService,
      funcColsService,
      valueService,
      gos,
      processCellCallback: processCellCallback || void 0,
      processHeaderCallback: processHeaderCallback || void 0,
      processGroupHeaderCallback: processGroupHeaderCallback || void 0,
      processRowGroupCallback: processRowGroupCallback || void 0,
      suppressQuotes: suppressQuotes || false,
      columnSeparator: columnSeparator || ","
    });
  }
  isExportSuppressed() {
    return this.gos.get("suppressCsvExport");
  }
};

// community-modules/csv-export/src/csvExportModule.ts
import { ModuleNames } from "@ag-grid-community/core";

// community-modules/csv-export/src/csvExport/csvExportApi.ts
function getDataAsCsv(beans, params) {
  return beans.csvCreator?.getDataAsCsv(params);
}
function exportDataAsCsv(beans, params) {
  beans.csvCreator?.exportDataAsCsv(params);
}

// community-modules/csv-export/src/csvExport/gridSerializer.ts
import {
  BeanStub as BeanStub2,
  GROUP_AUTO_COLUMN_ID,
  GroupInstanceIdCreator,
  _compose,
  _last,
  isColumnGroup
} from "@ag-grid-community/core";
var RowType = /* @__PURE__ */ ((RowType2) => {
  RowType2[RowType2["HEADER_GROUPING"] = 0] = "HEADER_GROUPING";
  RowType2[RowType2["HEADER"] = 1] = "HEADER";
  RowType2[RowType2["BODY"] = 2] = "BODY";
  return RowType2;
})(RowType || {});
var GridSerializer = class extends BeanStub2 {
  constructor() {
    super(...arguments);
    this.beanName = "gridSerializer";
  }
  wireBeans(beans) {
    this.visibleColsService = beans.visibleColsService;
    this.columnModel = beans.columnModel;
    this.columnNameService = beans.columnNameService;
    this.rowModel = beans.rowModel;
    this.pinnedRowModel = beans.pinnedRowModel;
    this.selectionService = beans.selectionService;
    this.rowNodeSorter = beans.rowNodeSorter;
    this.sortController = beans.sortController;
  }
  serialize(gridSerializingSession, params = {}) {
    const { allColumns, columnKeys, skipRowGroups } = params;
    const columnsToExport = this.getColumnsToExport(
      allColumns,
      skipRowGroups,
      columnKeys
    );
    const serializeChain = _compose(
      // first pass, put in the header names of the cols
      this.prepareSession(columnsToExport),
      this.prependContent(params),
      this.exportColumnGroups(params, columnsToExport),
      this.exportHeaders(params, columnsToExport),
      this.processPinnedTopRows(params, columnsToExport),
      this.processRows(params, columnsToExport),
      this.processPinnedBottomRows(params, columnsToExport),
      this.appendContent(params)
    );
    return serializeChain(gridSerializingSession).parse();
  }
  processRow(gridSerializingSession, params, columnsToExport, node) {
    const rowSkipper = params.shouldRowBeSkipped || (() => false);
    const skipSingleChildrenGroup = this.gos.get("groupRemoveSingleChildren");
    const skipLowestSingleChildrenGroup = this.gos.get("groupRemoveLowestSingleChildren");
    const isClipboardExport = params.rowPositions != null;
    const isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
    const hideOpenParents = this.gos.get("groupHideOpenParents") && !isExplicitExportSelection;
    const isLeafNode = this.columnModel.isPivotMode() ? node.leafGroup : !node.group;
    const isFooter = !!node.footer;
    const shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
    const shouldSkipCurrentGroup = node.allChildrenCount === 1 && node.childrenAfterGroup?.length === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);
    if (!isLeafNode && !isFooter && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents) || params.onlySelected && !node.isSelected() || params.skipPinnedTop && node.rowPinned === "top" || params.skipPinnedBottom && node.rowPinned === "bottom") {
      return;
    }
    const nodeIsRootNode = node.level === -1;
    if (nodeIsRootNode && !isLeafNode && !isFooter) {
      return;
    }
    const shouldRowBeSkipped = rowSkipper(this.gos.addGridCommonParams({ node }));
    if (shouldRowBeSkipped) {
      return;
    }
    const rowAccumulator = gridSerializingSession.onNewBodyRow(node);
    columnsToExport.forEach((column, index) => {
      rowAccumulator.onColumn(column, index, node);
    });
    if (params.getCustomContentBelowRow) {
      const content = params.getCustomContentBelowRow(this.gos.addGridCommonParams({ node }));
      if (content) {
        gridSerializingSession.addCustomContent(content);
      }
    }
  }
  appendContent(params) {
    return (gridSerializingSession) => {
      const appendContent = params.appendContent;
      if (appendContent) {
        gridSerializingSession.addCustomContent(appendContent);
      }
      return gridSerializingSession;
    };
  }
  prependContent(params) {
    return (gridSerializingSession) => {
      const prependContent = params.prependContent;
      if (prependContent) {
        gridSerializingSession.addCustomContent(prependContent);
      }
      return gridSerializingSession;
    };
  }
  prepareSession(columnsToExport) {
    return (gridSerializingSession) => {
      gridSerializingSession.prepare(columnsToExport);
      return gridSerializingSession;
    };
  }
  exportColumnGroups(params, columnsToExport) {
    return (gridSerializingSession) => {
      if (!params.skipColumnGroupHeaders) {
        const idCreator = new GroupInstanceIdCreator();
        const displayedGroups = this.visibleColsService.createGroups({
          columns: columnsToExport,
          idCreator,
          pinned: null,
          isStandaloneStructure: true
        });
        this.recursivelyAddHeaderGroups(
          displayedGroups,
          gridSerializingSession,
          params.processGroupHeaderCallback
        );
      }
      return gridSerializingSession;
    };
  }
  exportHeaders(params, columnsToExport) {
    return (gridSerializingSession) => {
      if (!params.skipColumnHeaders) {
        const gridRowIterator = gridSerializingSession.onNewHeaderRow();
        columnsToExport.forEach((column, index) => {
          gridRowIterator.onColumn(column, index, void 0);
        });
      }
      return gridSerializingSession;
    };
  }
  processPinnedTopRows(params, columnsToExport) {
    return (gridSerializingSession) => {
      const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
      if (params.rowPositions) {
        params.rowPositions.filter((position) => position.rowPinned === "top").sort((a, b) => a.rowIndex - b.rowIndex).map((position) => this.pinnedRowModel.getPinnedTopRow(position.rowIndex)).forEach(processRow);
      } else {
        this.pinnedRowModel.forEachPinnedTopRow(processRow);
      }
      return gridSerializingSession;
    };
  }
  processRows(params, columnsToExport) {
    return (gridSerializingSession) => {
      const rowModel = this.rowModel;
      const rowModelType = rowModel.getType();
      const usingCsrm = rowModelType === "clientSide";
      const usingSsrm = rowModelType === "serverSide";
      const onlySelectedNonStandardModel = !usingCsrm && params.onlySelected;
      const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
      const { exportedRows = "filteredAndSorted" } = params;
      if (params.rowPositions) {
        params.rowPositions.filter((position) => position.rowPinned == null).sort((a, b) => a.rowIndex - b.rowIndex).map((position) => rowModel.getRow(position.rowIndex)).forEach(processRow);
      } else if (this.columnModel.isPivotMode()) {
        if (usingCsrm) {
          rowModel.forEachPivotNode(processRow, true);
        } else if (usingSsrm) {
          rowModel.forEachNodeAfterFilterAndSort(processRow, true);
        } else {
          rowModel.forEachNode(processRow);
        }
      } else {
        if (params.onlySelectedAllPages || onlySelectedNonStandardModel) {
          const selectedNodes = this.selectionService.getSelectedNodes();
          this.replicateSortedOrder(selectedNodes);
          selectedNodes.forEach(processRow);
        } else {
          if (exportedRows === "all") {
            rowModel.forEachNode(processRow);
          } else if (usingCsrm) {
            rowModel.forEachNodeAfterFilterAndSort(processRow, true);
          } else if (usingSsrm) {
            rowModel.forEachNodeAfterFilterAndSort(processRow, true);
          } else {
            rowModel.forEachNode(processRow);
          }
        }
      }
      return gridSerializingSession;
    };
  }
  replicateSortedOrder(rows) {
    const sortOptions = this.sortController.getSortOptions();
    const compareNodes = (rowA, rowB) => {
      if (rowA.rowIndex != null && rowB.rowIndex != null) {
        return rowA.rowIndex - rowB.rowIndex;
      }
      if (rowA.level === rowB.level) {
        if (rowA.parent?.id === rowB.parent?.id) {
          return this.rowNodeSorter.compareRowNodes(
            sortOptions,
            {
              rowNode: rowA,
              currentPos: rowA.rowIndex ?? -1
            },
            {
              rowNode: rowB,
              currentPos: rowB.rowIndex ?? -1
            }
          );
        }
        return compareNodes(rowA.parent, rowB.parent);
      }
      if (rowA.level > rowB.level) {
        return compareNodes(rowA.parent, rowB);
      }
      return compareNodes(rowA, rowB.parent);
    };
    rows.sort(compareNodes);
  }
  processPinnedBottomRows(params, columnsToExport) {
    return (gridSerializingSession) => {
      const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
      if (params.rowPositions) {
        params.rowPositions.filter((position) => position.rowPinned === "bottom").sort((a, b) => a.rowIndex - b.rowIndex).map((position) => this.pinnedRowModel.getPinnedBottomRow(position.rowIndex)).forEach(processRow);
      } else {
        this.pinnedRowModel.forEachPinnedBottomRow(processRow);
      }
      return gridSerializingSession;
    };
  }
  getColumnsToExport(allColumns = false, skipRowGroups = false, columnKeys) {
    const isPivotMode = this.columnModel.isPivotMode();
    if (columnKeys && columnKeys.length) {
      return this.columnModel.getColsForKeys(columnKeys);
    }
    const isTreeData = this.gos.get("treeData");
    let columnsToExport = [];
    if (allColumns && !isPivotMode) {
      columnsToExport = this.columnModel.getCols();
    } else {
      columnsToExport = this.visibleColsService.getAllCols();
    }
    if (skipRowGroups && !isTreeData) {
      columnsToExport = columnsToExport.filter((column) => column.getColId() !== GROUP_AUTO_COLUMN_ID);
    }
    return columnsToExport;
  }
  recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, processGroupHeaderCallback) {
    const directChildrenHeaderGroups = [];
    displayedGroups.forEach((columnGroupChild) => {
      const columnGroup = columnGroupChild;
      if (!columnGroup.getChildren) {
        return;
      }
      columnGroup.getChildren().forEach((it) => directChildrenHeaderGroups.push(it));
    });
    if (displayedGroups.length > 0 && isColumnGroup(displayedGroups[0])) {
      this.doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback);
    }
    if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
      this.recursivelyAddHeaderGroups(
        directChildrenHeaderGroups,
        gridSerializingSession,
        processGroupHeaderCallback
      );
    }
  }
  doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback) {
    const gridRowIterator = gridSerializingSession.onNewHeaderGroupingRow();
    let columnIndex = 0;
    displayedGroups.forEach((columnGroupChild) => {
      const columnGroup = columnGroupChild;
      let name;
      if (processGroupHeaderCallback) {
        name = processGroupHeaderCallback(
          this.gos.addGridCommonParams({
            columnGroup
          })
        );
      } else {
        name = this.columnNameService.getDisplayNameForColumnGroup(columnGroup, "header");
      }
      const collapsibleGroupRanges = columnGroup.getLeafColumns().reduce((collapsibleGroups, currentColumn, currentIdx, arr) => {
        let lastGroup = _last(collapsibleGroups);
        const groupShow = currentColumn.getColumnGroupShow() === "open";
        if (!groupShow) {
          if (lastGroup && lastGroup[1] == null) {
            lastGroup[1] = currentIdx - 1;
          }
        } else if (!lastGroup || lastGroup[1] != null) {
          lastGroup = [currentIdx];
          collapsibleGroups.push(lastGroup);
        }
        if (currentIdx === arr.length - 1 && lastGroup && lastGroup[1] == null) {
          lastGroup[1] = currentIdx;
        }
        return collapsibleGroups;
      }, []);
      gridRowIterator.onColumn(
        columnGroup,
        name || "",
        columnIndex++,
        columnGroup.getLeafColumns().length - 1,
        collapsibleGroupRanges
      );
    });
  }
};

// community-modules/csv-export/src/version.ts
var VERSION = "32.0.0";

// community-modules/csv-export/src/csvExportModule.ts
var CsvExportCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.CsvExportModule}-core`,
  beans: [CsvCreator, GridSerializer]
};
var CsvExportApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames.CsvExportModule}-api`,
  apiFunctions: {
    getDataAsCsv,
    exportDataAsCsv
  },
  dependantModules: [CsvExportCoreModule]
};
var CsvExportModule = {
  version: VERSION,
  moduleName: ModuleNames.CsvExportModule,
  dependantModules: [CsvExportCoreModule, CsvExportApiModule]
};

// community-modules/csv-export/src/csvExport/xmlFactory.ts
var LINE_SEPARATOR2 = "\r\n";
function returnAttributeIfPopulated(key, value, booleanTransformer) {
  if (!value && value !== "" && value !== 0) {
    return "";
  }
  let xmlValue = value;
  if (typeof value === "boolean") {
    if (booleanTransformer) {
      xmlValue = booleanTransformer(value);
    }
  }
  return ` ${key}="${xmlValue}"`;
}
var XmlFactory = class {
  static createHeader(headerElement = {}) {
    const headerStart = "<?";
    const headerEnd = "?>";
    const keys = ["version"];
    if (!headerElement.version) {
      headerElement.version = "1.0";
    }
    if (headerElement.encoding) {
      keys.push("encoding");
    }
    if (headerElement.standalone) {
      keys.push("standalone");
    }
    const att = keys.map((key) => `${key}="${headerElement[key]}"`).join(" ");
    return `${headerStart}xml ${att} ${headerEnd}`;
  }
  static createXml(xmlElement, booleanTransformer) {
    let props = "";
    if (xmlElement.properties) {
      if (xmlElement.properties.prefixedAttributes) {
        xmlElement.properties.prefixedAttributes.forEach((prefixedSet) => {
          Object.keys(prefixedSet.map).forEach((key) => {
            props += returnAttributeIfPopulated(
              prefixedSet.prefix + key,
              prefixedSet.map[key],
              booleanTransformer
            );
          });
        });
      }
      if (xmlElement.properties.rawMap) {
        Object.keys(xmlElement.properties.rawMap).forEach((key) => {
          props += returnAttributeIfPopulated(key, xmlElement.properties.rawMap[key], booleanTransformer);
        });
      }
    }
    let result = "<" + xmlElement.name + props;
    if (!xmlElement.children && xmlElement.textNode == null) {
      return result + "/>" + LINE_SEPARATOR2;
    }
    if (xmlElement.textNode != null) {
      return result + ">" + xmlElement.textNode + "</" + xmlElement.name + ">" + LINE_SEPARATOR2;
    }
    result += ">" + LINE_SEPARATOR2;
    if (xmlElement.children) {
      xmlElement.children.forEach((it) => {
        result += this.createXml(it, booleanTransformer);
      });
    }
    return result + "</" + xmlElement.name + ">" + LINE_SEPARATOR2;
  }
};

// community-modules/csv-export/src/csvExport/zipContainer/zipContainerHelper.ts
import { _utf8_encode } from "@ag-grid-community/core";

// community-modules/csv-export/src/csvExport/zipContainer/compress.ts
var compressBlob = async (data) => {
  let chunksSize = 0;
  const chunks = [];
  const writeCompressedData = new WritableStream({
    write: (chunk) => {
      chunks.push(chunk);
      chunksSize += chunk.length;
    }
  });
  const readable = new ReadableStream({
    start: (controller) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          controller.enqueue(e.target.result);
        }
        controller.close();
      };
      reader.readAsArrayBuffer(data);
    }
  });
  const compressStream = new window.CompressionStream("deflate-raw");
  await readable.pipeThrough(compressStream).pipeTo(writeCompressedData);
  return {
    size: chunksSize,
    content: new Blob(chunks)
  };
};
var deflateLocalFile = async (rawContent) => {
  const contentAsBlob = new Blob([rawContent]);
  const { size: compressedSize, content: compressedContent } = await compressBlob(contentAsBlob);
  const compressedContentAsUint8Array = new Uint8Array(await compressedContent.arrayBuffer());
  return {
    size: compressedSize,
    content: compressedContentAsUint8Array
  };
};

// community-modules/csv-export/src/csvExport/zipContainer/convert.ts
var convertTime = (date) => {
  let time = date.getHours();
  time <<= 6;
  time = time | date.getMinutes();
  time <<= 5;
  time = time | date.getSeconds() / 2;
  return time;
};
var convertDate = (date) => {
  let dt = date.getFullYear() - 1980;
  dt <<= 4;
  dt = dt | date.getMonth() + 1;
  dt <<= 5;
  dt = dt | date.getDate();
  return dt;
};
function convertDecToHex(number, bytes) {
  let hex = "";
  for (let i = 0; i < bytes; i++) {
    hex += String.fromCharCode(number & 255);
    number >>>= 8;
  }
  return hex;
}

// community-modules/csv-export/src/csvExport/zipContainer/crcTable.ts
var getCrcFromCrc32TableAndByteArray = (content) => {
  if (!content.length) {
    return 0;
  }
  let crc = 0 ^ -1;
  let j = 0;
  let k = 0;
  let l = 0;
  for (let i = 0; i < content.length; i++) {
    j = content[i];
    k = (crc ^ j) & 255;
    l = crcTable[k];
    crc = crc >>> 8 ^ l;
  }
  return crc ^ -1;
};
var getCrcFromCrc32Table = (content) => {
  if (!content.length) {
    return 0;
  }
  if (typeof content === "string") {
    return getCrcFromCrc32TableAndByteArray(new TextEncoder().encode(content));
  }
  return getCrcFromCrc32TableAndByteArray(content);
};
var crcTable = new Uint32Array([
  0,
  1996959894,
  3993919788,
  2567524794,
  124634137,
  1886057615,
  3915621685,
  2657392035,
  249268274,
  2044508324,
  3772115230,
  2547177864,
  162941995,
  2125561021,
  3887607047,
  2428444049,
  498536548,
  1789927666,
  4089016648,
  2227061214,
  450548861,
  1843258603,
  4107580753,
  2211677639,
  325883990,
  1684777152,
  4251122042,
  2321926636,
  335633487,
  1661365465,
  4195302755,
  2366115317,
  997073096,
  1281953886,
  3579855332,
  2724688242,
  1006888145,
  1258607687,
  3524101629,
  2768942443,
  901097722,
  1119000684,
  3686517206,
  2898065728,
  853044451,
  1172266101,
  3705015759,
  2882616665,
  651767980,
  1373503546,
  3369554304,
  3218104598,
  565507253,
  1454621731,
  3485111705,
  3099436303,
  671266974,
  1594198024,
  3322730930,
  2970347812,
  795835527,
  1483230225,
  3244367275,
  3060149565,
  1994146192,
  31158534,
  2563907772,
  4023717930,
  1907459465,
  112637215,
  2680153253,
  3904427059,
  2013776290,
  251722036,
  2517215374,
  3775830040,
  2137656763,
  141376813,
  2439277719,
  3865271297,
  1802195444,
  476864866,
  2238001368,
  4066508878,
  1812370925,
  453092731,
  2181625025,
  4111451223,
  1706088902,
  314042704,
  2344532202,
  4240017532,
  1658658271,
  366619977,
  2362670323,
  4224994405,
  1303535960,
  984961486,
  2747007092,
  3569037538,
  1256170817,
  1037604311,
  2765210733,
  3554079995,
  1131014506,
  879679996,
  2909243462,
  3663771856,
  1141124467,
  855842277,
  2852801631,
  3708648649,
  1342533948,
  654459306,
  3188396048,
  3373015174,
  1466479909,
  544179635,
  3110523913,
  3462522015,
  1591671054,
  702138776,
  2966460450,
  3352799412,
  1504918807,
  783551873,
  3082640443,
  3233442989,
  3988292384,
  2596254646,
  62317068,
  1957810842,
  3939845945,
  2647816111,
  81470997,
  1943803523,
  3814918930,
  2489596804,
  225274430,
  2053790376,
  3826175755,
  2466906013,
  167816743,
  2097651377,
  4027552580,
  2265490386,
  503444072,
  1762050814,
  4150417245,
  2154129355,
  426522225,
  1852507879,
  4275313526,
  2312317920,
  282753626,
  1742555852,
  4189708143,
  2394877945,
  397917763,
  1622183637,
  3604390888,
  2714866558,
  953729732,
  1340076626,
  3518719985,
  2797360999,
  1068828381,
  1219638859,
  3624741850,
  2936675148,
  906185462,
  1090812512,
  3747672003,
  2825379669,
  829329135,
  1181335161,
  3412177804,
  3160834842,
  628085408,
  1382605366,
  3423369109,
  3138078467,
  570562233,
  1426400815,
  3317316542,
  2998733608,
  733239954,
  1555261956,
  3268935591,
  3050360625,
  752459403,
  1541320221,
  2607071920,
  3965973030,
  1969922972,
  40735498,
  2617837225,
  3943577151,
  1913087877,
  83908371,
  2512341634,
  3803740692,
  2075208622,
  213261112,
  2463272603,
  3855990285,
  2094854071,
  198958881,
  2262029012,
  4057260610,
  1759359992,
  534414190,
  2176718541,
  4139329115,
  1873836001,
  414664567,
  2282248934,
  4279200368,
  1711684554,
  285281116,
  2405801727,
  4167216745,
  1634467795,
  376229701,
  2685067896,
  3608007406,
  1308918612,
  956543938,
  2808555105,
  3495958263,
  1231636301,
  1047427035,
  2932959818,
  3654703836,
  1088359270,
  936918e3,
  2847714899,
  3736837829,
  1202900863,
  817233897,
  3183342108,
  3401237130,
  1404277552,
  615818150,
  3134207493,
  3453421203,
  1423857449,
  601450431,
  3009837614,
  3294710456,
  1567103746,
  711928724,
  3020668471,
  3272380065,
  1510334235,
  755167117
]);

// community-modules/csv-export/src/csvExport/zipContainer/zipContainerHelper.ts
var getHeaders = (currentFile, isCompressed, offset, rawSize, rawContent, deflatedSize) => {
  const { content, path, created: creationDate } = currentFile;
  const time = convertTime(creationDate);
  const dt = convertDate(creationDate);
  const crcFlag = getCrcFromCrc32Table(rawContent);
  const zipSize = deflatedSize !== void 0 ? deflatedSize : rawSize;
  const utfPath = _utf8_encode(path);
  const isUTF8 = utfPath !== path;
  let extraFields = "";
  if (isUTF8) {
    const uExtraFieldPath = convertDecToHex(1, 1) + convertDecToHex(getCrcFromCrc32Table(utfPath), 4) + utfPath;
    extraFields = "up" + convertDecToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
  }
  const commonHeader = "\0" + // version needed to extract
  (isUTF8 ? "\0\b" : "\0\0") + // Language encoding flag (EFS) (12th bit turned on)
  convertDecToHex(isCompressed ? 8 : 0, 2) + // As per ECMA-376 Part 2 specs
  convertDecToHex(time, 2) + // last modified time
  convertDecToHex(dt, 2) + // last modified date
  convertDecToHex(zipSize ? crcFlag : 0, 4) + convertDecToHex(deflatedSize ?? rawSize, 4) + // compressed size
  convertDecToHex(rawSize, 4) + // uncompressed size
  convertDecToHex(utfPath.length, 2) + // file name length
  convertDecToHex(extraFields.length, 2);
  const localFileHeader = "PK" + commonHeader + utfPath + extraFields;
  const centralDirectoryHeader = "PK\0" + commonHeader + // file header
  "\0\0\0\0\0\0" + (content ? "\0\0\0\0" : "\0\0\0") + // external file attributes
  convertDecToHex(offset, 4) + // relative offset of local header
  utfPath + // file name
  extraFields;
  return {
    localFileHeader: Uint8Array.from(localFileHeader, (c) => c.charCodeAt(0)),
    centralDirectoryHeader: Uint8Array.from(centralDirectoryHeader, (c) => c.charCodeAt(0))
  };
};
var getDecodedContent = (content) => {
  let contentToUse;
  if (typeof content === "string") {
    const base64String = atob(content.split(";base64,")[1]);
    contentToUse = Uint8Array.from(base64String, (c) => c.charCodeAt(0));
  } else {
    contentToUse = content;
  }
  return {
    size: contentToUse.length,
    content: contentToUse
  };
};
var getDeflatedHeaderAndContent = async (currentFile, offset) => {
  const { content } = currentFile;
  const { size, content: rawContent } = !content ? { size: 0, content: Uint8Array.from([]) } : getDecodedContent(content);
  let deflatedContent = void 0;
  let deflatedSize = void 0;
  let deflationPerformed = false;
  const shouldDeflate = currentFile.type === "file" && rawContent && size > 0;
  if (shouldDeflate) {
    const result = await deflateLocalFile(rawContent);
    deflatedContent = result.content;
    deflatedSize = result.size;
    deflationPerformed = true;
  }
  const headers = getHeaders(currentFile, deflationPerformed, offset, size, rawContent, deflatedSize);
  return {
    ...headers,
    content: deflatedContent || rawContent,
    isCompressed: deflationPerformed
  };
};
var getHeaderAndContent = (currentFile, offset) => {
  const { content } = currentFile;
  const { content: rawContent } = !content ? { content: Uint8Array.from([]) } : getDecodedContent(content);
  const headers = getHeaders(currentFile, false, offset, rawContent.length, rawContent, void 0);
  return {
    ...headers,
    content: rawContent,
    isCompressed: false
  };
};
var buildCentralDirectoryEnd = (tLen, cLen, lLen) => {
  const str = "PK\0\0\0\0" + convertDecToHex(tLen, 2) + // total number of entries in the central folder
  convertDecToHex(tLen, 2) + // total number of entries in the central folder
  convertDecToHex(cLen, 4) + // size of the central folder
  convertDecToHex(lLen, 4) + // central folder start offset
  "\0\0";
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
};

// community-modules/csv-export/src/csvExport/zipContainer/zipContainer.ts
var ZipContainer = class {
  static addFolders(paths) {
    paths.forEach(this.addFolder.bind(this));
  }
  static addFolder(path) {
    this.folders.push({
      path,
      created: /* @__PURE__ */ new Date(),
      isBase64: false,
      type: "folder"
    });
  }
  static addFile(path, content, isBase64 = false) {
    this.files.push({
      path,
      created: /* @__PURE__ */ new Date(),
      content: isBase64 ? content : new TextEncoder().encode(content),
      isBase64,
      type: "file"
    });
  }
  static async getZipFile(mimeType = "application/zip") {
    const textOutput = await this.buildCompressedFileStream();
    this.clearStream();
    return new Blob([textOutput], { type: mimeType });
  }
  static getUncompressedZipFile(mimeType = "application/zip") {
    const textOutput = this.buildFileStream();
    this.clearStream();
    return new Blob([textOutput], { type: mimeType });
  }
  static clearStream() {
    this.folders = [];
    this.files = [];
  }
  static packageFiles(files) {
    let fileLen = 0;
    let folderLen = 0;
    for (const currentFile of files) {
      const { localFileHeader, centralDirectoryHeader, content } = currentFile;
      fileLen += localFileHeader.length + content.length;
      folderLen += centralDirectoryHeader.length;
    }
    const fileData = new Uint8Array(fileLen);
    const folderData = new Uint8Array(folderLen);
    let fileOffset = 0;
    let folderOffset = 0;
    for (const currentFile of files) {
      const { localFileHeader, centralDirectoryHeader, content } = currentFile;
      fileData.set(localFileHeader, fileOffset);
      fileOffset += localFileHeader.length;
      fileData.set(content, fileOffset);
      fileOffset += content.length;
      folderData.set(centralDirectoryHeader, folderOffset);
      folderOffset += centralDirectoryHeader.length;
    }
    const folderEnd = buildCentralDirectoryEnd(files.length, folderLen, fileLen);
    const result = new Uint8Array(fileData.length + folderData.length + folderEnd.length);
    result.set(fileData);
    result.set(folderData, fileData.length);
    result.set(folderEnd, fileData.length + folderData.length);
    return result;
  }
  static async buildCompressedFileStream() {
    const totalFiles = [...this.folders, ...this.files];
    const readyFiles = [];
    let lL = 0;
    for (const currentFile of totalFiles) {
      const output = await getDeflatedHeaderAndContent(currentFile, lL);
      const { localFileHeader, content } = output;
      readyFiles.push(output);
      lL += localFileHeader.length + content.length;
    }
    return this.packageFiles(readyFiles);
  }
  static buildFileStream() {
    const totalFiles = [...this.folders, ...this.files];
    const readyFiles = [];
    let lL = 0;
    for (const currentFile of totalFiles) {
      const readyFile = getHeaderAndContent(currentFile, lL);
      const { localFileHeader, content } = readyFile;
      readyFiles.push(readyFile);
      lL += localFileHeader.length + content.length;
    }
    return this.packageFiles(readyFiles);
  }
};
ZipContainer.folders = [];
ZipContainer.files = [];
export {
  BaseCreator,
  BaseGridSerializingSession,
  CsvCreator,
  CsvExportModule,
  Downloader,
  GridSerializer,
  RowType,
  XmlFactory,
  ZipContainer,
  CsvExportCoreModule as _CsvExportCoreModule
};
//# sourceMappingURL=main.esm.mjs.map
