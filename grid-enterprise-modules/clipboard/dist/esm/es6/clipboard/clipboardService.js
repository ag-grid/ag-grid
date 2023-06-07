var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClipboardService_1;
import { _, Autowired, Bean, BeanStub, ChangedPath, Events, PostConstruct, Optional } from "@ag-grid-community/core";
// Matches value in changeDetectionService
const SOURCE_PASTE = 'paste';
const EXPORT_TYPE_DRAG_COPY = 'dragCopy';
const EXPORT_TYPE_CLIPBOARD = 'clipboard';
var CellClearType;
(function (CellClearType) {
    CellClearType[CellClearType["CellRange"] = 0] = "CellRange";
    CellClearType[CellClearType["SelectedRows"] = 1] = "SelectedRows";
    CellClearType[CellClearType["FocusedCell"] = 2] = "FocusedCell";
})(CellClearType || (CellClearType = {}));
;
let ClipboardService = ClipboardService_1 = class ClipboardService extends BeanStub {
    constructor() {
        super(...arguments);
        this.lastPasteOperationTime = 0;
        this.navigatorApiFailed = false;
    }
    init() {
        this.logger = this.loggerFactory.create('ClipboardService');
        if (this.rowModel.getType() === 'clientSide') {
            this.clientSideRowModel = this.rowModel;
        }
        this.ctrlsService.whenReady(p => {
            this.gridCtrl = p.gridCtrl;
        });
    }
    pasteFromClipboard() {
        this.logger.log('pasteFromClipboard');
        // Method 1 - native clipboard API, available in modern chrome browsers
        const allowNavigator = !this.gridOptionsService.is('suppressClipboardApi');
        // Some browsers (Firefox) do not allow Web Applications to read from
        // the clipboard so verify if not only the ClipboardAPI is available,
        // but also if the `readText` method is public.
        if (allowNavigator && !this.navigatorApiFailed && navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
                .then(this.processClipboardData.bind(this))
                .catch((e) => {
                _.doOnce(() => {
                    console.warn(e);
                    console.warn('AG Grid: Unable to use the Clipboard API (navigator.clipboard.readText()). ' +
                        'The reason why it could not be used has been logged in the previous line. ' +
                        'For this reason the grid has defaulted to using a workaround which doesn\'t perform as well. ' +
                        'Either fix why Clipboard API is blocked, OR stop this message from appearing by setting grid ' +
                        'property suppressClipboardApi=true (which will default the grid to using the workaround rather than the API');
                }, 'clipboardApiError');
                this.navigatorApiFailed = true;
                this.pasteFromClipboardLegacy();
            });
        }
        else {
            this.pasteFromClipboardLegacy();
        }
    }
    pasteFromClipboardLegacy() {
        // Method 2 - if modern API fails, the old school hack
        let defaultPrevented = false;
        const handlePasteEvent = (e) => {
            const currentPastOperationTime = (new Date()).getTime();
            if (currentPastOperationTime - this.lastPasteOperationTime < 50) {
                defaultPrevented = true;
                e.preventDefault();
            }
            this.lastPasteOperationTime = currentPastOperationTime;
        };
        this.executeOnTempElement((textArea) => {
            textArea.addEventListener('paste', handlePasteEvent);
            textArea.focus({ preventScroll: true });
        }, (element) => {
            const data = element.value;
            if (!defaultPrevented) {
                this.processClipboardData(data);
            }
            else {
                this.refocusLastFocusedCell();
            }
            element.removeEventListener('paste', handlePasteEvent);
        });
    }
    refocusLastFocusedCell() {
        const focusedCell = this.focusService.getFocusedCell();
        if (focusedCell) {
            this.focusService.setFocusedCell({
                rowIndex: focusedCell.rowIndex,
                column: focusedCell.column,
                rowPinned: focusedCell.rowPinned,
                forceBrowserFocus: true
            });
        }
    }
    getClipboardDelimiter() {
        const delimiter = this.gridOptionsService.get('clipboardDelimiter');
        return _.exists(delimiter) ? delimiter : '\t';
    }
    processClipboardData(data) {
        if (data == null) {
            return;
        }
        let parsedData = ClipboardService_1.stringToArray(data, this.getClipboardDelimiter());
        const userFunc = this.gridOptionsService.getCallback('processDataFromClipboard');
        if (userFunc) {
            parsedData = userFunc({ data: parsedData });
        }
        if (parsedData == null) {
            return;
        }
        if (this.gridOptionsService.is('suppressLastEmptyLineOnPaste')) {
            this.removeLastLineIfBlank(parsedData);
        }
        const pasteOperation = (cellsToFlash, updatedRowNodes, focusedCell, changedPath) => {
            const rangeActive = this.rangeService && this.rangeService.isMoreThanOneCell();
            const pasteIntoRange = rangeActive && !this.hasOnlyOneValueToPaste(parsedData);
            if (pasteIntoRange) {
                this.pasteIntoActiveRange(parsedData, cellsToFlash, updatedRowNodes, changedPath);
            }
            else {
                this.pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath);
            }
        };
        this.doPasteOperation(pasteOperation);
    }
    // This will parse a delimited string into an array of arrays.
    static stringToArray(strData, delimiter = ',') {
        const data = [];
        const isNewline = (char) => char === '\r' || char === '\n';
        let insideQuotedField = false;
        if (strData === '') {
            return [['']];
        }
        // iterate over each character, keep track of current row and column (of the returned array)
        for (let row = 0, column = 0, position = 0; position < strData.length; position++) {
            const previousChar = strData[position - 1];
            const currentChar = strData[position];
            const nextChar = strData[position + 1];
            const ensureDataExists = () => {
                if (!data[row]) {
                    // create row if it doesn't exist
                    data[row] = [];
                }
                if (!data[row][column]) {
                    // create column if it doesn't exist
                    data[row][column] = '';
                }
            };
            ensureDataExists();
            if (currentChar === '"') {
                if (insideQuotedField) {
                    if (nextChar === '"') {
                        // unescape double quote
                        data[row][column] += '"';
                        position++;
                    }
                    else {
                        // exit quoted field
                        insideQuotedField = false;
                    }
                    // continue;
                }
                else if (previousChar === undefined || previousChar === delimiter || isNewline(previousChar)) {
                    // enter quoted field
                    insideQuotedField = true;
                    // continue;
                }
            }
            if (!insideQuotedField && currentChar !== '"') {
                if (currentChar === delimiter) {
                    // move to next column
                    column++;
                    ensureDataExists();
                    continue;
                }
                else if (isNewline(currentChar)) {
                    // move to next row
                    column = 0;
                    row++;
                    ensureDataExists();
                    if (currentChar === '\r' && nextChar === '\n') {
                        // skip over second newline character if it exists
                        position++;
                    }
                    continue;
                }
            }
            // add current character to current column
            data[row][column] += currentChar;
        }
        return data;
    }
    // common code to paste operations, e.g. paste to cell, paste to range, and copy range down
    doPasteOperation(pasteOperationFunc) {
        const api = this.gridOptionsService.api;
        const columnApi = this.gridOptionsService.columnApi;
        const source = 'clipboard';
        this.eventService.dispatchEvent({
            type: Events.EVENT_PASTE_START,
            api,
            columnApi,
            source
        });
        let changedPath;
        if (this.clientSideRowModel) {
            const onlyChangedColumns = this.gridOptionsService.is('aggregateOnlyChangedColumns');
            changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
        }
        const cellsToFlash = {};
        const updatedRowNodes = [];
        const focusedCell = this.focusService.getFocusedCell();
        pasteOperationFunc(cellsToFlash, updatedRowNodes, focusedCell, changedPath);
        if (changedPath) {
            this.clientSideRowModel.doAggregate(changedPath);
        }
        this.rowRenderer.refreshCells();
        this.dispatchFlashCells(cellsToFlash);
        this.fireRowChanged(updatedRowNodes);
        // if using the clipboard hack with a temp element, then the focus has been lost,
        // so need to put it back. otherwise paste operation loosed focus on cell and keyboard
        // navigation stops.
        this.refocusLastFocusedCell();
        const event = {
            type: Events.EVENT_PASTE_END,
            source
        };
        this.eventService.dispatchEvent(event);
    }
    pasteIntoActiveRange(clipboardData, cellsToFlash, updatedRowNodes, changedPath) {
        // true if clipboard data can be evenly pasted into range, otherwise false
        const abortRepeatingPasteIntoRows = this.getRangeSize() % clipboardData.length != 0;
        let indexOffset = 0;
        let dataRowIndex = 0;
        const rowCallback = (currentRow, rowNode, columns, index) => {
            const atEndOfClipboardData = index - indexOffset >= clipboardData.length;
            if (atEndOfClipboardData) {
                if (abortRepeatingPasteIntoRows) {
                    return;
                }
                // increment offset and reset data index to repeat paste of data
                indexOffset += dataRowIndex;
                dataRowIndex = 0;
            }
            const currentRowData = clipboardData[index - indexOffset];
            // otherwise we are not the first row, so copy
            updatedRowNodes.push(rowNode);
            const processCellFromClipboardFunc = this.gridOptionsService.getCallback('processCellFromClipboard');
            columns.forEach((column, idx) => {
                if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
                    return;
                }
                // repeat data for columns we don't have data for - happens when to range is bigger than copied data range
                if (idx >= currentRowData.length) {
                    idx = idx % currentRowData.length;
                }
                const newValue = this.processCell(rowNode, column, currentRowData[idx], EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc, true);
                rowNode.setDataValue(column, newValue, SOURCE_PASTE);
                if (changedPath) {
                    changedPath.addParentNode(rowNode.parent, [column]);
                }
                const { rowIndex, rowPinned } = currentRow;
                const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
                cellsToFlash[cellId] = true;
            });
            dataRowIndex++;
        };
        this.iterateActiveRanges(false, rowCallback);
    }
    pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
        if (!focusedCell) {
            return;
        }
        const currentRow = { rowIndex: focusedCell.rowIndex, rowPinned: focusedCell.rowPinned };
        const columnsToPasteInto = this.columnModel.getDisplayedColumnsStartingAt(focusedCell.column);
        if (this.isPasteSingleValueIntoRange(parsedData)) {
            this.pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath);
        }
        else {
            this.pasteMultipleValues(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, EXPORT_TYPE_CLIPBOARD, changedPath);
        }
    }
    // if range is active, and only one cell, then we paste this cell into all cells in the active range.
    isPasteSingleValueIntoRange(parsedData) {
        return this.hasOnlyOneValueToPaste(parsedData)
            && this.rangeService != null
            && !this.rangeService.isEmpty();
    }
    pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath) {
        const value = parsedData[0][0];
        const rowCallback = (currentRow, rowNode, columns) => {
            updatedRowNodes.push(rowNode);
            columns.forEach(column => this.updateCellValue(rowNode, column, value, cellsToFlash, EXPORT_TYPE_CLIPBOARD, changedPath));
        };
        this.iterateActiveRanges(false, rowCallback);
    }
    hasOnlyOneValueToPaste(parsedData) {
        return parsedData.length === 1 && parsedData[0].length === 1;
    }
    copyRangeDown() {
        if (!this.rangeService || this.rangeService.isEmpty()) {
            return;
        }
        const firstRowValues = [];
        const pasteOperation = (cellsToFlash, updatedRowNodes, focusedCell, changedPath) => {
            const processCellForClipboardFunc = this.gridOptionsService.getCallback('processCellForClipboard');
            const processCellFromClipboardFunc = this.gridOptionsService.getCallback('processCellFromClipboard');
            const rowCallback = (currentRow, rowNode, columns) => {
                // take reference of first row, this is the one we will be using to copy from
                if (!firstRowValues.length) {
                    // two reasons for looping through columns
                    columns.forEach(column => {
                        // get the initial values to copy down
                        const value = this.processCell(rowNode, column, this.valueService.getValue(column, rowNode), EXPORT_TYPE_DRAG_COPY, processCellForClipboardFunc, false, true);
                        firstRowValues.push(value);
                    });
                }
                else {
                    // otherwise we are not the first row, so copy
                    updatedRowNodes.push(rowNode);
                    columns.forEach((column, index) => {
                        if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
                            return;
                        }
                        const firstRowValue = this.processCell(rowNode, column, firstRowValues[index], EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc, true);
                        rowNode.setDataValue(column, firstRowValue, SOURCE_PASTE);
                        if (changedPath) {
                            changedPath.addParentNode(rowNode.parent, [column]);
                        }
                        const { rowIndex, rowPinned } = currentRow;
                        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
                        cellsToFlash[cellId] = true;
                    });
                }
            };
            this.iterateActiveRanges(true, rowCallback);
        };
        this.doPasteOperation(pasteOperation);
    }
    removeLastLineIfBlank(parsedData) {
        // remove last row if empty, excel puts empty last row in
        const lastLine = _.last(parsedData);
        const lastLineIsBlank = lastLine && lastLine.length === 1 && lastLine[0] === '';
        if (lastLineIsBlank) {
            // do not remove the last empty line when that is the only line pasted
            if (parsedData.length === 1) {
                return;
            }
            _.removeFromArray(parsedData, lastLine);
        }
    }
    fireRowChanged(rowNodes) {
        if (this.gridOptionsService.get('editType') !== 'fullRow') {
            return;
        }
        rowNodes.forEach(rowNode => {
            const event = {
                type: Events.EVENT_ROW_VALUE_CHANGED,
                node: rowNode,
                data: rowNode.data,
                rowIndex: rowNode.rowIndex,
                rowPinned: rowNode.rowPinned
            };
            this.eventService.dispatchEvent(event);
        });
    }
    pasteMultipleValues(clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, type, changedPath) {
        let rowPointer = currentRow;
        // if doing CSRM and NOT tree data, then it means groups are aggregates, which are read only,
        // so we should skip them when doing paste operations.
        const skipGroupRows = this.clientSideRowModel != null && !this.gridOptionsService.is('enableGroupEdit') && !this.gridOptionsService.isTreeData();
        const getNextGoodRowNode = () => {
            while (true) {
                if (!rowPointer) {
                    return null;
                }
                const res = this.rowPositionUtils.getRowNode(rowPointer);
                // move to next row down for next set of values
                rowPointer = this.cellNavigationService.getRowBelow({ rowPinned: rowPointer.rowPinned, rowIndex: rowPointer.rowIndex });
                // if no more rows, return null
                if (res == null) {
                    return null;
                }
                // skip details rows and footer rows, never paste into them as they don't hold data
                const skipRow = res.detail || res.footer || (skipGroupRows && res.group);
                // skipping row means we go into the next iteration of the while loop
                if (!skipRow) {
                    return res;
                }
            }
        };
        clipboardGridData.forEach(clipboardRowData => {
            const rowNode = getNextGoodRowNode();
            // if we have come to end of rows in grid, then skip
            if (!rowNode) {
                return;
            }
            clipboardRowData.forEach((value, index) => this.updateCellValue(rowNode, columnsToPasteInto[index], value, cellsToFlash, type, changedPath));
            updatedRowNodes.push(rowNode);
        });
    }
    updateCellValue(rowNode, column, value, cellsToFlash, type, changedPath) {
        if (!rowNode ||
            !column ||
            !column.isCellEditable(rowNode) ||
            column.isSuppressPaste(rowNode)) {
            return;
        }
        // if the cell is a group and the col is an aggregation, skip the cell.
        if (rowNode.group && column.isValueActive()) {
            return;
        }
        const processedValue = this.processCell(rowNode, column, value, type, this.gridOptionsService.getCallback('processCellFromClipboard'), true);
        rowNode.setDataValue(column, processedValue, SOURCE_PASTE);
        const { rowIndex, rowPinned } = rowNode;
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex: rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
        if (changedPath) {
            changedPath.addParentNode(rowNode.parent, [column]);
        }
    }
    copyToClipboard(params = {}) {
        this.copyOrCutToClipboard(params);
    }
    cutToClipboard(params = {}, source = 'api') {
        if (this.gridOptionsService.is('suppressCutToClipboard')) {
            return;
        }
        const startEvent = {
            type: Events.EVENT_CUT_START,
            source
        };
        this.eventService.dispatchEvent(startEvent);
        this.copyOrCutToClipboard(params, true);
        const endEvent = {
            type: Events.EVENT_CUT_END,
            source
        };
        this.eventService.dispatchEvent(endEvent);
    }
    copyOrCutToClipboard(params, cut) {
        let { includeHeaders, includeGroupHeaders } = params;
        this.logger.log(`copyToClipboard: includeHeaders = ${includeHeaders}`);
        // don't override 'includeHeaders' if it has been explicitly set to 'false'
        if (includeHeaders == null) {
            includeHeaders = this.gridOptionsService.is('copyHeadersToClipboard');
        }
        if (includeGroupHeaders == null) {
            includeGroupHeaders = this.gridOptionsService.is('copyGroupHeadersToClipboard');
        }
        const copyParams = { includeHeaders, includeGroupHeaders };
        const shouldCopyRows = !this.gridOptionsService.is('suppressCopyRowsToClipboard');
        let cellClearType = null;
        // Copy priority is Range > Row > Focus
        if (this.rangeService && !this.rangeService.isEmpty() && !this.shouldSkipSingleCellRange()) {
            this.copySelectedRangeToClipboard(copyParams);
            cellClearType = CellClearType.CellRange;
        }
        else if (shouldCopyRows && !this.selectionService.isEmpty()) {
            this.copySelectedRowsToClipboard(copyParams);
            cellClearType = CellClearType.SelectedRows;
        }
        else if (this.focusService.isAnyCellFocused()) {
            this.copyFocusedCellToClipboard(copyParams);
            cellClearType = CellClearType.FocusedCell;
        }
        if (cut && cellClearType !== null) {
            this.clearCellsAfterCopy(cellClearType);
        }
    }
    clearCellsAfterCopy(type) {
        this.eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });
        if (type === CellClearType.CellRange) {
            this.rangeService.clearCellRangeCellValues({ cellEventSource: 'clipboardService' });
        }
        else if (type === CellClearType.SelectedRows) {
            this.clearSelectedRows();
        }
        else {
            const focusedCell = this.focusService.getFocusedCell();
            if (focusedCell == null) {
                return;
            }
            const rowNode = this.rowPositionUtils.getRowNode(focusedCell);
            if (rowNode) {
                this.clearCellValue(rowNode, focusedCell.column);
            }
        }
        this.eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
    }
    clearSelectedRows() {
        const selected = this.selectionService.getSelectedNodes();
        const columns = this.columnModel.getAllDisplayedColumns();
        for (const row of selected) {
            for (const col of columns) {
                this.clearCellValue(row, col);
            }
        }
    }
    clearCellValue(rowNode, column) {
        if (!column.isCellEditable(rowNode)) {
            return;
        }
        rowNode.setDataValue(column, null, 'clipboardService');
    }
    shouldSkipSingleCellRange() {
        return this.gridOptionsService.is('suppressCopySingleCellRanges') && !this.rangeService.isMoreThanOneCell();
    }
    iterateActiveRanges(onlyFirst, rowCallback, columnCallback) {
        if (!this.rangeService || this.rangeService.isEmpty()) {
            return;
        }
        const cellRanges = this.rangeService.getCellRanges();
        if (onlyFirst) {
            this.iterateActiveRange(cellRanges[0], rowCallback, columnCallback, true);
        }
        else {
            cellRanges.forEach((range, idx) => this.iterateActiveRange(range, rowCallback, columnCallback, idx === cellRanges.length - 1));
        }
    }
    iterateActiveRange(range, rowCallback, columnCallback, isLastRange) {
        if (!this.rangeService) {
            return;
        }
        let currentRow = this.rangeService.getRangeStartRow(range);
        const lastRow = this.rangeService.getRangeEndRow(range);
        if (columnCallback && range.columns) {
            columnCallback(range.columns);
        }
        let rangeIndex = 0;
        let isLastRow = false;
        // the currentRow could be missing if the user sets the active range manually, and sets a range
        // that is outside of the grid (eg. sets range rows 0 to 100, but grid has only 20 rows).
        while (!isLastRow && currentRow != null) {
            const rowNode = this.rowPositionUtils.getRowNode(currentRow);
            isLastRow = this.rowPositionUtils.sameRow(currentRow, lastRow);
            rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    }
    copySelectedRangeToClipboard(params = {}) {
        if (!this.rangeService || this.rangeService.isEmpty()) {
            return;
        }
        const allRangesMerge = this.rangeService.areAllRangesAbleToMerge();
        const { data, cellsToFlash } = allRangesMerge ? this.buildDataFromMergedRanges(params) : this.buildDataFromRanges(params);
        this.copyDataToClipboard(data);
        this.dispatchFlashCells(cellsToFlash);
    }
    buildDataFromMergedRanges(params) {
        const columnsSet = new Set();
        const ranges = this.rangeService.getCellRanges();
        const rowPositionsMap = new Map();
        const allRowPositions = [];
        const allCellsToFlash = {};
        ranges.forEach(range => {
            range.columns.forEach(col => columnsSet.add(col));
            const { rowPositions, cellsToFlash } = this.getRangeRowPositionsAndCellsToFlash(range);
            rowPositions.forEach(rowPosition => {
                const rowPositionAsString = `${rowPosition.rowIndex}-${rowPosition.rowPinned || 'null'}`;
                if (!rowPositionsMap.get(rowPositionAsString)) {
                    rowPositionsMap.set(rowPositionAsString, true);
                    allRowPositions.push(rowPosition);
                }
            });
            Object.assign(allCellsToFlash, cellsToFlash);
        });
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const exportedColumns = Array.from(columnsSet);
        exportedColumns.sort((a, b) => {
            const posA = allColumns.indexOf(a);
            const posB = allColumns.indexOf(b);
            return posA - posB;
        });
        const data = this.buildExportParams({
            columns: exportedColumns,
            rowPositions: allRowPositions,
            includeHeaders: params.includeHeaders,
            includeGroupHeaders: params.includeGroupHeaders,
        });
        return { data, cellsToFlash: allCellsToFlash };
    }
    buildDataFromRanges(params) {
        const ranges = this.rangeService.getCellRanges();
        const data = [];
        const allCellsToFlash = {};
        ranges.forEach(range => {
            const { rowPositions, cellsToFlash } = this.getRangeRowPositionsAndCellsToFlash(range);
            Object.assign(allCellsToFlash, cellsToFlash);
            data.push(this.buildExportParams({
                columns: range.columns,
                rowPositions: rowPositions,
                includeHeaders: params.includeHeaders,
                includeGroupHeaders: params.includeGroupHeaders,
            }));
        });
        return { data: data.join('\n'), cellsToFlash: allCellsToFlash };
    }
    getRangeRowPositionsAndCellsToFlash(range) {
        const rowPositions = [];
        const cellsToFlash = {};
        const startRow = this.rangeService.getRangeStartRow(range);
        const lastRow = this.rangeService.getRangeEndRow(range);
        let node = startRow;
        while (node) {
            rowPositions.push(node);
            range.columns.forEach(column => {
                const { rowIndex, rowPinned } = node;
                const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
                cellsToFlash[cellId] = true;
            });
            if (this.rowPositionUtils.sameRow(node, lastRow)) {
                break;
            }
            node = this.cellNavigationService.getRowBelow(node);
        }
        return { rowPositions, cellsToFlash };
    }
    copyFocusedCellToClipboard(params = {}) {
        const focusedCell = this.focusService.getFocusedCell();
        if (focusedCell == null) {
            return;
        }
        const cellId = this.cellPositionUtils.createId(focusedCell);
        const currentRow = { rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex };
        const column = focusedCell.column;
        const data = this.buildExportParams({
            columns: [column],
            rowPositions: [currentRow],
            includeHeaders: params.includeHeaders,
            includeGroupHeaders: params.includeGroupHeaders
        });
        this.copyDataToClipboard(data);
        this.dispatchFlashCells({ [cellId]: true });
    }
    copySelectedRowsToClipboard(params = {}) {
        const { columnKeys, includeHeaders, includeGroupHeaders } = params;
        const data = this.buildExportParams({
            columns: columnKeys,
            includeHeaders,
            includeGroupHeaders
        });
        this.copyDataToClipboard(data);
    }
    buildExportParams(params) {
        const { columns, rowPositions, includeHeaders = false, includeGroupHeaders = false } = params;
        const exportParams = {
            columnKeys: columns,
            rowPositions,
            skipColumnHeaders: !includeHeaders,
            skipColumnGroupHeaders: !includeGroupHeaders,
            suppressQuotes: true,
            columnSeparator: this.getClipboardDelimiter(),
            onlySelected: !rowPositions,
            processCellCallback: this.gridOptionsService.getCallback('processCellForClipboard'),
            processRowGroupCallback: (params) => this.processRowGroupCallback(params),
            processHeaderCallback: this.gridOptionsService.getCallback('processHeaderForClipboard'),
            processGroupHeaderCallback: this.gridOptionsService.getCallback('processGroupHeaderForClipboard')
        };
        return this.csvCreator.getDataAsCsv(exportParams, true);
    }
    processRowGroupCallback(params) {
        const { node } = params;
        const { key } = node;
        let value = key != null ? key : '';
        if (params.node.footer) {
            let suffix = '';
            if (key && key.length) {
                suffix = ` ${key}`;
            }
            value = `Total${suffix}`;
        }
        const processCellForClipboard = this.gridOptionsService.getCallback('processCellForClipboard');
        if (processCellForClipboard) {
            let column = node.rowGroupColumn;
            if (!column && node.footer && node.level === -1) {
                column = this.columnModel.getRowGroupColumns()[0];
            }
            return processCellForClipboard({
                value,
                node,
                column,
                type: 'clipboard',
                formatValue: (valueToFormat) => { var _a; return (_a = this.valueFormatterService.formatValue(column, node, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; },
                parseValue: (valueToParse) => this.valueParserService.parseValue(column, node, valueToParse, this.valueService.getValue(column, node))
            });
        }
        return value;
    }
    dispatchFlashCells(cellsToFlash) {
        window.setTimeout(() => {
            const event = {
                type: Events.EVENT_FLASH_CELLS,
                cells: cellsToFlash
            };
            this.eventService.dispatchEvent(event);
        }, 0);
    }
    processCell(rowNode, column, value, type, func, canParse, canFormat) {
        var _a;
        if (func) {
            const params = {
                column,
                node: rowNode,
                value,
                type,
                formatValue: (valueToFormat) => { var _a; return (_a = this.valueFormatterService.formatValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; },
                parseValue: (valueToParse) => this.valueParserService.parseValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, valueToParse, this.valueService.getValue(column, rowNode))
            };
            return func(params);
        }
        if (canParse && column.getColDef().useValueParserForImport) {
            return this.valueParserService.parseValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, value, this.valueService.getValue(column, rowNode));
        }
        else if (canFormat && column.getColDef().useValueFormatterForExport) {
            return (_a = this.valueFormatterService.formatValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, value)) !== null && _a !== void 0 ? _a : value;
        }
        return value;
    }
    copyDataToClipboard(data) {
        const userProvidedFunc = this.gridOptionsService.getCallback('sendToClipboard');
        // method 1 - user provided func
        if (userProvidedFunc) {
            userProvidedFunc({ data });
            return;
        }
        // method 2 - native clipboard API, available in modern chrome browsers
        const allowNavigator = !this.gridOptionsService.is('suppressClipboardApi');
        if (allowNavigator && navigator.clipboard) {
            navigator.clipboard.writeText(data).catch((e) => {
                _.doOnce(() => {
                    console.warn(e);
                    console.warn('AG Grid: Unable to use the Clipboard API (navigator.clipboard.writeText()). ' +
                        'The reason why it could not be used has been logged in the previous line. ' +
                        'For this reason the grid has defaulted to using a workaround which doesn\'t perform as well. ' +
                        'Either fix why Clipboard API is blocked, OR stop this message from appearing by setting grid ' +
                        'property suppressClipboardApi=true (which will default the grid to using the workaround rather than the API.');
                }, 'clipboardApiError');
                this.copyDataToClipboardLegacy(data);
            });
            return;
        }
        this.copyDataToClipboardLegacy(data);
    }
    copyDataToClipboardLegacy(data) {
        // method 3 - if all else fails, the old school hack
        this.executeOnTempElement(element => {
            const eDocument = this.gridOptionsService.getDocument();
            const focusedElementBefore = eDocument.activeElement;
            element.value = data || ' '; // has to be non-empty value or execCommand will not do anything
            element.select();
            element.focus({ preventScroll: true });
            const result = eDocument.execCommand('copy');
            if (!result) {
                console.warn('AG Grid: Browser did not allow document.execCommand(\'copy\'). Ensure ' +
                    'api.copySelectedRowsToClipboard() is invoked via a user event, i.e. button click, otherwise ' +
                    'the browser will prevent it for security reasons.');
            }
            if (focusedElementBefore != null && focusedElementBefore.focus != null) {
                focusedElementBefore.focus({ preventScroll: true });
            }
        });
    }
    executeOnTempElement(callbackNow, callbackAfter) {
        const eDoc = this.gridOptionsService.getDocument();
        const eTempInput = eDoc.createElement('textarea');
        eTempInput.style.width = '1px';
        eTempInput.style.height = '1px';
        // removing items from the DOM causes the document element to scroll to the
        // position where the element was positioned. Here we set scrollTop / scrollLeft
        // to prevent the document element from scrolling when we remove it from the DOM.
        eTempInput.style.top = eDoc.documentElement.scrollTop + 'px';
        eTempInput.style.left = eDoc.documentElement.scrollLeft + 'px';
        eTempInput.style.position = 'absolute';
        eTempInput.style.opacity = '0';
        const guiRoot = this.gridCtrl.getGui();
        guiRoot.appendChild(eTempInput);
        try {
            callbackNow(eTempInput);
        }
        catch (err) {
            console.warn('AG Grid: Browser does not support document.execCommand(\'copy\') for clipboard operations');
        }
        //It needs 100 otherwise OS X seemed to not always be able to paste... Go figure...
        if (callbackAfter) {
            window.setTimeout(() => {
                callbackAfter(eTempInput);
                guiRoot.removeChild(eTempInput);
            }, 100);
        }
        else {
            guiRoot.removeChild(eTempInput);
        }
    }
    getRangeSize() {
        const ranges = this.rangeService.getCellRanges();
        let startRangeIndex = 0;
        let endRangeIndex = 0;
        if (ranges.length > 0) {
            startRangeIndex = this.rangeService.getRangeStartRow(ranges[0]).rowIndex;
            endRangeIndex = this.rangeService.getRangeEndRow(ranges[0]).rowIndex;
        }
        return startRangeIndex - endRangeIndex + 1;
    }
};
__decorate([
    Autowired('csvCreator')
], ClipboardService.prototype, "csvCreator", void 0);
__decorate([
    Autowired('loggerFactory')
], ClipboardService.prototype, "loggerFactory", void 0);
__decorate([
    Autowired('selectionService')
], ClipboardService.prototype, "selectionService", void 0);
__decorate([
    Optional('rangeService')
], ClipboardService.prototype, "rangeService", void 0);
__decorate([
    Autowired('rowModel')
], ClipboardService.prototype, "rowModel", void 0);
__decorate([
    Autowired('ctrlsService')
], ClipboardService.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('valueService')
], ClipboardService.prototype, "valueService", void 0);
__decorate([
    Autowired('focusService')
], ClipboardService.prototype, "focusService", void 0);
__decorate([
    Autowired('rowRenderer')
], ClipboardService.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('columnModel')
], ClipboardService.prototype, "columnModel", void 0);
__decorate([
    Autowired('cellNavigationService')
], ClipboardService.prototype, "cellNavigationService", void 0);
__decorate([
    Autowired('cellPositionUtils')
], ClipboardService.prototype, "cellPositionUtils", void 0);
__decorate([
    Autowired('rowPositionUtils')
], ClipboardService.prototype, "rowPositionUtils", void 0);
__decorate([
    Autowired('valueFormatterService')
], ClipboardService.prototype, "valueFormatterService", void 0);
__decorate([
    Autowired('valueParserService')
], ClipboardService.prototype, "valueParserService", void 0);
__decorate([
    PostConstruct
], ClipboardService.prototype, "init", null);
ClipboardService = ClipboardService_1 = __decorate([
    Bean('clipboardService')
], ClipboardService);
export { ClipboardService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGlwYm9hcmQvY2xpcGJvYXJkU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFLUixXQUFXLEVBU1gsTUFBTSxFQVVOLGFBQWEsRUFXYixRQUFRLEVBTVgsTUFBTSx5QkFBeUIsQ0FBQztBQWFqQywwQ0FBMEM7QUFDMUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBQzdCLE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDO0FBQ3pDLE1BQU0scUJBQXFCLEdBQUcsV0FBVyxDQUFDO0FBRTFDLElBQUssYUFBc0Q7QUFBM0QsV0FBSyxhQUFhO0lBQUcsMkRBQVMsQ0FBQTtJQUFFLGlFQUFZLENBQUE7SUFBRSwrREFBVyxDQUFBO0FBQUMsQ0FBQyxFQUF0RCxhQUFhLEtBQWIsYUFBYSxRQUF5QztBQUFBLENBQUM7QUFHNUQsSUFBYSxnQkFBZ0Isd0JBQTdCLE1BQWEsZ0JBQWlCLFNBQVEsUUFBUTtJQUE5Qzs7UUFzQlksMkJBQXNCLEdBQVcsQ0FBQyxDQUFDO1FBRW5DLHVCQUFrQixHQUFHLEtBQUssQ0FBQztJQTQ5QnZDLENBQUM7SUF6OUJXLElBQUk7UUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFNUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLFlBQVksRUFBRTtZQUMxQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQStCLENBQUM7U0FDbEU7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FB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