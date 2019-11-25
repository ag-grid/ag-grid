import {
    _,
    Autowired,
    Bean,
    CellNavigationService,
    CellPosition,
    CellPositionUtils,
    CellRange,
    ChangedPath,
    IClientSideRowModel,
    Column,
    ColumnApi,
    ColumnController,
    Constants,
    CsvExportParams,
    Events,
    EventService,
    FlashCellsEvent,
    FocusedCellController,
    GridApi,
    GridCore,
    GridOptionsWrapper,
    IClipboardService,
    IRowModel,
    Logger,
    LoggerFactory,
    PasteEndEvent,
    PasteStartEvent,
    PostConstruct,
    ProcessCellForExportParams,
    ProcessHeaderForExportParams,
    RowNode,
    RowPosition,
    RowPositionUtils,
    RowRenderer,
    RowValueChangedEvent,
    SelectionController,
    ValueService,
    ICsvCreator,
    IRangeController,
    Optional
} from "@ag-grid-community/core";

interface RowCallback {
    (gridRow: RowPosition, rowNode: RowNode | null, columns: Column[] | null, rangeIndex: number, isLastRow?: boolean): void;
}

interface ColumnCallback {
    (columns: Column[]): void;
}

@Bean('clipboardService')
export class ClipboardService implements IClipboardService {

    @Autowired('csvCreator') private csvCreator: ICsvCreator;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('rowModel') private rowModel: IRowModel;

    @Autowired('valueService') private valueService: ValueService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') public rowPositionUtils: RowPositionUtils;

    private clientSideRowModel: IClientSideRowModel;

    private logger: Logger;

    private gridCore: GridCore;

    public registerGridCore(gridCore: GridCore): void {
        this.gridCore = gridCore;
    }

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('ClipboardService');

        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = (this.rowModel as unknown) as IClientSideRowModel;
        }
    }

    public pasteFromClipboard(): void {
        this.logger.log('pasteFromClipboard');

        this.executeOnTempElement(
            (textArea: HTMLTextAreaElement) => {
                textArea.focus();
            },
            (element: HTMLTextAreaElement) => {
                const data = element.value;
                if (_.missingOrEmpty(data)) { return; }

                let parsedData: string[][] = this.dataToArray(data);

                const userFunc = this.gridOptionsWrapper.getProcessDataFromClipboardFunc();
                if (userFunc) {
                    parsedData = userFunc({data: parsedData});
                }

                if (_.missingOrEmpty(parsedData)) { return; }

                this.removeLastLineIfBlank(parsedData);

                const pasteOperation = (cellsToFlash: any, updatedRowNodes: RowNode[],
                                        focusedCell: CellPosition, changedPath: ChangedPath|undefined) => {

                    const singleCellInClipboard = parsedData.length == 1 && parsedData[0].length == 1;
                    const rangeActive = this.rangeController && this.rangeController.isMoreThanOneCell();
                    const pasteIntoRange = rangeActive && !singleCellInClipboard;
                    if (pasteIntoRange) {
                        this.pasteIntoActiveRange(parsedData, cellsToFlash, updatedRowNodes, changedPath);
                    } else {
                        this.pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath);
                    }

                };

                this.doPasteOperation(pasteOperation);

            }
        );
    }

    // common code to paste operations, eg past to cell, paste to range, and copy range down
    private doPasteOperation(pasteOperationFunc: (cellsToFlash: any, updatedRowNodes: RowNode[],
                                                  focusedCell: CellPosition, changedPath: ChangedPath|undefined)=>void): void {

        this.eventService.dispatchEvent({
            type: Events.EVENT_PASTE_START,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            source: 'clipboard'
        } as PasteStartEvent);

        let changedPath: ChangedPath | undefined;
        if (this.clientSideRowModel) {
            const onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
        }

        const cellsToFlash = {} as any;
        const updatedRowNodes: RowNode[] = [];
        const focusedCell = this.focusedCellController.getFocusedCell();

        pasteOperationFunc(cellsToFlash, updatedRowNodes, focusedCell, changedPath);

        if (changedPath) {
            this.clientSideRowModel.doAggregate(changedPath);
        }

        this.rowRenderer.refreshCells();
        this.dispatchFlashCells(cellsToFlash);
        this.fireRowChanged(updatedRowNodes);

        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.rowPinned, true);
        }

        this.eventService.dispatchEvent({
            type: Events.EVENT_PASTE_END,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            source: 'clipboard'
        } as PasteEndEvent);
    }

    private pasteIntoActiveRange(clipboardData: string[][], cellsToFlash: any, updatedRowNodes: RowNode[],
                                 changedPath: ChangedPath | undefined) {

        // true if clipboard data can be evenly pasted into range, otherwise false
        const abortRepeatingPasteIntoRows = this.rangeSize() % clipboardData.length != 0;

        let indexOffset = 0, dataRowIndex = 0;

        const rowCallback = (currentRow: RowPosition, rowNode: RowNode | null, columns: Column[] | null, index: number, isLastRow?: boolean) => {
            const atEndOfClipboardData = index - indexOffset >= clipboardData.length;
            if (atEndOfClipboardData) {
                if (abortRepeatingPasteIntoRows) { return; }
                // increment offset and reset data index to repeat paste of data
                indexOffset += dataRowIndex;
                dataRowIndex = 0;
            }

            const currentRowData = clipboardData[index - indexOffset];

            // otherwise we are not the first row, so copy
            updatedRowNodes.push(rowNode!);
            columns!.forEach((column: Column, idx: number) => {
                if (!column.isCellEditable(rowNode!)) { return; }

                // repeat data for columns we don't have data for - happens when to range is bigger than copied data range
                if (idx >= currentRowData.length) {
                    idx = idx % currentRowData.length;
                }

                let newValue = currentRowData[idx];

                const processCellFromClipboardFunc = this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
                newValue = this.userProcessCell(rowNode, column, newValue, processCellFromClipboardFunc, Constants.EXPORT_TYPE_DRAG_COPY);
                this.valueService.setValue(rowNode!, column, newValue, Constants.SOURCE_PASTE);

                if (changedPath) {
                    changedPath.addParentNode(rowNode!.parent, [column]);
                }

                const cellId = this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
                cellsToFlash[cellId] = true;
            });

            dataRowIndex++;
        };

        this.iterateActiveRanges(false, rowCallback);
    }

    private pasteStartingFromFocusedCell(parsedData: string[][], cellsToFlash: any, updatedRowNodes: RowNode[],
                                         focusedCell: CellPosition, changedPath: ChangedPath | undefined) {

        if (!focusedCell) { return; }

        const currentRow: RowPosition = {rowIndex: focusedCell.rowIndex, rowPinned: focusedCell.rowPinned};
        const columnsToPasteInto = this.columnController.getDisplayedColumnsStartingAt(focusedCell.column);
        const onlyOneValueToPaste = parsedData.length === 1 && parsedData[0].length === 1;

        if (onlyOneValueToPaste) {
            this.pasteSingleValue(parsedData, updatedRowNodes, cellsToFlash, changedPath);
        } else {
            this.pasteMultipleValues(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash,
                Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
        }
    }

    private removeLastLineIfBlank(parsedData: string[][]): void {
        // remove last row if empty, excel puts empty last row in
        const lastLine = _.last(parsedData);
        const lastLineIsBlank = lastLine && lastLine.length === 1 && lastLine[0] === '';
        if (lastLineIsBlank) {
            _.removeFromArray(parsedData, lastLine);
        }
    }

    public copyRangeDown(): void {
        if (!this.rangeController || this.rangeController.isEmpty()) {
            return;
        }

        const firstRowValues: any[] = [];

        const pasteOperation = (cellsToFlash: any, updatedRowNodes: RowNode[],
                                focusedCell: CellPosition, changedPath: ChangedPath|undefined) => {

            const rowCallback = (currentRow: RowPosition, rowNode: RowNode | null, columns: Column[] | null, index: number, isLastRow?: boolean) => {
                // take reference of first row, this is the one we will be using to copy from
                if (!firstRowValues.length) {
                    // two reasons for looping through columns
                    columns!.forEach(column => {
                        // get the initial values to copy down
                        let value = this.valueService.getValue(column, rowNode);
                        const processCellForClipboardFunc = this.gridOptionsWrapper.getProcessCellForClipboardFunc();
                        value = this.userProcessCell(rowNode, column, value, processCellForClipboardFunc, Constants.EXPORT_TYPE_DRAG_COPY);
                        firstRowValues.push(value);
                    });
                } else {
                    // otherwise we are not the first row, so copy
                    updatedRowNodes.push(rowNode!);
                    columns!.forEach((column: Column, index: number) => {
                        if (!column.isCellEditable(rowNode!)) {
                            return;
                        }

                        let firstRowValue = firstRowValues[index];
                        const processCellFromClipboardFunc = this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
                        firstRowValue = this.userProcessCell(rowNode, column, firstRowValue, processCellFromClipboardFunc, Constants.EXPORT_TYPE_DRAG_COPY);
                        this.valueService.setValue(rowNode!, column, firstRowValue, Constants.SOURCE_PASTE);

                        if (changedPath) {
                            changedPath.addParentNode(rowNode!.parent, [column]);
                        }

                        const cellId = this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
                        cellsToFlash[cellId] = true;
                    });
                }
            };

            this.iterateActiveRanges(true, rowCallback);
        };

        this.doPasteOperation(pasteOperation);
    }



    private fireRowChanged(rowNodes: RowNode[]): void {
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            return;
        }

        rowNodes.forEach(rowNode => {
            const event: RowValueChangedEvent = {
                type: Events.EVENT_ROW_VALUE_CHANGED,
                node: rowNode,
                data: rowNode.data,
                rowIndex: rowNode.rowIndex,
                rowPinned: rowNode.rowPinned,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!
            };
            this.eventService.dispatchEvent(event);
        });
    }

    private pasteMultipleValues(clipboardGridData: string[][], currentRow: RowPosition | null, updatedRowNodes: RowNode[], columnsToPasteInto: Column[], cellsToFlash: any, type: string, changedPath: ChangedPath | undefined) {
        clipboardGridData.forEach((clipboardRowData: string[]) => {
            // if we have come to end of rows in grid, then skip
            if (!currentRow) {
                return;
            }

            const rowNode = this.rowPositionUtils.getRowNode(currentRow);
            if (rowNode) {

                updatedRowNodes.push(rowNode);

                clipboardRowData.forEach((value: any, index: number) => {
                    const column = columnsToPasteInto[index];
                    this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, type, changedPath);
                });
                // move to next row down for next set of values
                currentRow = this.cellNavigationService.getRowBelow({rowPinned: currentRow.rowPinned, rowIndex: currentRow.rowIndex});
            }
        });
        return currentRow;
    }

    private pasteSingleValue(parsedData: string[][], updatedRowNodes: RowNode[], cellsToFlash: any, changedPath: ChangedPath | undefined) {
        const value = parsedData[0][0];
        const rowCallback = (currentRow: RowPosition, rowNode: RowNode | null, columns: Column[] | null) => {
            updatedRowNodes.push(rowNode!);
            columns!.forEach((column) => {
                this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
            });
        };
        this.iterateActiveRanges(false, rowCallback);
    }

    private updateCellValue(rowNode: RowNode | null, column: Column, value: string, currentRow: RowPosition | null, cellsToFlash: any, type: string, changedPath: ChangedPath | undefined) {
        if (
            !rowNode ||
            !currentRow ||
            !column ||
            !column.isCellEditable ||
            column.isSuppressPaste(rowNode)
        ) { return; }

        const processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellFromClipboardFunc(), type);
        this.valueService.setValue(rowNode, column, processedValue, Constants.SOURCE_PASTE);

        const cellId = this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
        cellsToFlash[cellId] = true;

        if (changedPath) {
            changedPath.addParentNode(rowNode.parent, [column]);
        }
    }

    public copyToClipboard(includeHeaders: boolean): void {
        this.logger.log(`copyToClipboard: includeHeaders = ${includeHeaders}`);

        // don't override 'includeHeaders' if it has been explicitly set to 'false'
        if (typeof includeHeaders === 'undefined') {
            includeHeaders = this.gridOptionsWrapper.isCopyHeadersToClipboard();
        }

        const selectedRowsToCopy = !this.selectionController.isEmpty()
            && !this.gridOptionsWrapper.isSuppressCopyRowsToClipboard();

        // default is copy range if exists, otherwise rows
        if (this.rangeController && this.rangeController.isMoreThanOneCell()) {
            this.copySelectedRangeToClipboard(includeHeaders);
        } else if (selectedRowsToCopy) {
            // otherwise copy selected rows if they exist
            this.copySelectedRowsToClipboard(includeHeaders);
        } else if (this.focusedCellController.isAnyCellFocused()) {
            // if there is a focused cell, copy this
            this.copyFocusedCellToClipboard(includeHeaders);
        } else {
            // lastly if no focused cell, try range again. this can happen
            // if use has cellSelection turned off (so no focused cell)
            // but has a cell clicked, so there exists a cell range
            // of exactly one cell (hence the first 'if' above didn't
            // get executed).
            this.copySelectedRangeToClipboard(includeHeaders);
        }
    }

    private iterateActiveRanges(onlyFirst: boolean, rowCallback: RowCallback, columnCallback?: ColumnCallback): void {
        if (!this.rangeController || this.rangeController.isEmpty()) {
            return;
        }

        const cellRanges: any = this.rangeController.getCellRanges();

        if (onlyFirst) {
            const range = cellRanges[0];
            this.iterateActiveRange(range, rowCallback, columnCallback, true);
        } else {
            cellRanges.forEach((range: CellRange, idx: number) => this.iterateActiveRange(range, rowCallback, columnCallback, idx === cellRanges.length - 1));
        }
    }

    private iterateActiveRange(range: CellRange, rowCallback: RowCallback, columnCallback?: ColumnCallback, isLastRange?: boolean): void {
        if (!this.rangeController) { return; }

        let currentRow : RowPosition | null = this.rangeController.getRangeStartRow(range);
        const lastRow = this.rangeController.getRangeEndRow(range);

        if (columnCallback && _.exists(columnCallback) && range.columns) {
            columnCallback(range.columns);
        }

        let rangeIndex = 0;
        let isLastRow = false;

        // the currentRow could be missing if the user sets the active range manually, and sets a range
        // that is outside of the grid (eg. sets range rows 0 to 100, but grid has only 20 rows).
        while (!isLastRow && !_.missing(currentRow) && currentRow) {
            const rowNode = this.rowPositionUtils.getRowNode(currentRow);
            isLastRow = this.rowPositionUtils.sameRow(currentRow, lastRow);

            rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    }

    public copySelectedRangeToClipboard(includeHeaders = false): void {
        if (!this.rangeController || this.rangeController.isEmpty()) {
            return;
        }

        const deliminator = this.gridOptionsWrapper.getClipboardDeliminator();

        let data = '';
        const cellsToFlash = {} as any;

        // adds columns to the data
        const columnCallback = (columns: Column[]) => {
            if (!includeHeaders) {
                return;
            }

            columns.forEach((column, index) => {
                const value = this.columnController.getDisplayNameForColumn(column, 'clipboard', true);

                const processedValue = this.userProcessHeader(column, value, this.gridOptionsWrapper.getProcessHeaderForClipboardFunc());

                if (index != 0) {
                    data += deliminator;
                }
                if (_.exists(processedValue)) {
                    data += processedValue;
                }
            });
            data += '\r\n';
        };

        // adds cell values to the data
        const rowCallback = (currentRow: RowPosition, rowNode: RowNode | null, columns: Column[] | null, index: number, isLastRow?: boolean) => {
            columns!.forEach((column, index) => {
                const value = this.valueService.getValue(column, rowNode);

                const processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellForClipboardFunc(), Constants.EXPORT_TYPE_CLIPBOARD);

                if (index != 0) {
                    data += deliminator;
                }
                if (_.exists(processedValue)) {
                    data += processedValue;
                }
                const cellId = this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
                cellsToFlash[cellId] = true;
            });

            if (!isLastRow) {
                data += '\r\n';
            }
        };

        this.iterateActiveRanges(false, rowCallback, columnCallback);
        this.copyDataToClipboard(data);
        this.dispatchFlashCells(cellsToFlash);
    }

    private copyFocusedCellToClipboard(includeHeaders = false): void {
        const focusedCell: CellPosition = this.focusedCellController.getFocusedCell();
        if (_.missing(focusedCell)) { return; }
        const cellId = this.cellPositionUtils.createId(focusedCell);
        const currentRow: RowPosition = {rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex};

        const rowNode = this.rowPositionUtils.getRowNode(currentRow);
        const column = focusedCell.column;
        const value = this.valueService.getValue(column, rowNode);

        let processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellForClipboardFunc(), Constants.EXPORT_TYPE_CLIPBOARD);

        if (_.missing(processedValue)) {
            // copy the new line character to clipboard instead of an empty string, as the 'execCommand' will ignore it.
            // this behaviour is consistent with how Excel works!
            processedValue = '\t';
        }

        let data = '';
        if (includeHeaders) {
            const headerValue = this.columnController.getDisplayNameForColumn(column, 'clipboard', true);
            data = this.userProcessHeader(column, headerValue, this.gridOptionsWrapper.getProcessHeaderForClipboardFunc());
            data += '\r\n';
        }
        data += processedValue.toString();
        this.copyDataToClipboard(data);
        this.dispatchFlashCells({ [cellId]: true });
    }

    private dispatchFlashCells(cellsToFlash: {}): void {
        window.setTimeout(() => {
            const event: FlashCellsEvent = {
                type: Events.EVENT_FLASH_CELLS,
                cells: cellsToFlash,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }, 0);
    }

    private userProcessCell(rowNode: RowNode | null, column: Column, value: any, func: ((params: ProcessCellForExportParams) => void) | undefined, type: string): any {
        if (func) {
            const params = {
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                type: type
            };
            return func(params);
        } else {
            return value;
        }
    }

    private userProcessHeader(column: Column, value: any, func: ((params: ProcessHeaderForExportParams) => void) | undefined): any {
        if (func) {
            const params: ProcessHeaderForExportParams = {
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            return func(params);
        }

        return value;
    }

    public copySelectedRowsToClipboard(includeHeaders = false, columnKeys?: (string | Column)[]): void {
        const skipHeader = !includeHeaders;
        const deliminator = this.gridOptionsWrapper.getClipboardDeliminator();

        const params: CsvExportParams = {
            columnKeys: columnKeys,
            skipHeader: skipHeader,
            skipFooters: true,
            suppressQuotes: true,
            columnSeparator: deliminator,
            onlySelected: true,
            processCellCallback: this.gridOptionsWrapper.getProcessCellForClipboardFunc(),
            processHeaderCallback: this.gridOptionsWrapper.getProcessHeaderForClipboardFunc()
        };

        const data = this.csvCreator.getDataAsCsv(params);

        this.copyDataToClipboard(data);
    }

    private copyDataToClipboard(data: string): void {
        const userProvidedFunc = this.gridOptionsWrapper.getSendToClipboardFunc();
        if (userProvidedFunc && _.exists(userProvidedFunc)) {
            const params = {data: data};
            userProvidedFunc(params);
        } else {
            this.executeOnTempElement((element: HTMLTextAreaElement) => {
                element.value = data;
                element.select();
                element.focus();
                const result = document.execCommand('copy');

                if (!result) {
                    console.warn('ag-grid: Browser did not allow document.execCommand(\'copy\'). Ensure ' +
                        'api.copySelectedRowsToClipboard() is invoked via a user event, i.e. button click, otherwise ' +
                        'the browser will prevent it for security reasons.');
                }
            });
        }
    }

    private executeOnTempElement(callbackNow: (element: HTMLTextAreaElement) => void,
                                 callbackAfter?: (element: HTMLTextAreaElement) => void): void {

        const eTempInput = document.createElement('textarea') as HTMLTextAreaElement;
        eTempInput.style.width = '1px';
        eTempInput.style.height = '1px';
        eTempInput.style.top = '0px';
        eTempInput.style.left = '0px';
        eTempInput.style.position = 'absolute';
        eTempInput.style.opacity = '0.0';

        const guiRoot = this.gridCore.getRootGui();

        guiRoot.appendChild(eTempInput);

        try {
            callbackNow(eTempInput);
        } catch (err) {
            console.warn('ag-grid: Browser does not support document.execCommand(\'copy\') for clipboard operations');
        }

        //It needs 100 otherwise OS X seemed to not always be able to paste... Go figure...
        if (callbackAfter) {
            window.setTimeout(() => {
                callbackAfter(eTempInput);
                guiRoot.removeChild(eTempInput);
            }, 100);
        } else {
            guiRoot.removeChild(eTempInput);
        }
    }

    // From http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
    // This will parse a delimited string into an array of arrays.
    // Note: this code fixes an issue with the example posted on stack overflow where it doesn't correctly handle
    // empty values in the first cell.
    private dataToArray(strData: string): string[][] {
        const delimiter = this.gridOptionsWrapper.getClipboardDeliminator();

        // Create a regular expression to parse the CSV values.
        const objPattern = new RegExp(
            (
                // Delimiters.
                '(\\' + delimiter + '|\\r?\\n|\\r|^)' +
                // Quoted fields.
                '(?:"([^\"]*(?:""[^\"]*)*)"|' +
                // Standard fields.
                '([^\\' + delimiter + '\\r\\n]*))'
            ),
            "gi"
        );

        // Create an array to hold our data. Give the array
        // a default empty first row.
        const arrData: string[][] = [[]];

        // Create an array to hold our individual pattern matching groups.
        let arrMatches: RegExpExecArray | null;

        // Required for handling edge case on first row copy
        let atFirstRow = true;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            const strMatchedDelimiter = arrMatches[1];

            // Handles case when first row is an empty cell, insert an empty string before delimiter
            if ((atFirstRow && strMatchedDelimiter) || !arrMatches.index && arrMatches[0].charAt(0) === delimiter) {
                arrData[0].push('');
            }

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && strMatchedDelimiter !== delimiter) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }

            let strMatchedValue: string;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescaped any double quotes.
                strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }

            // Now that we have our value string, let's add
            // it to the data array.
            const lastItem = _.last(arrData);
            if (lastItem) {
                lastItem.push(strMatchedValue);
            }

            atFirstRow = false;
        }

        // Return the parsed data.
        return arrData;
    }

    private rangeSize(): number {
        const ranges = this.rangeController.getCellRanges();
        let startRangeIndex: number;
        let endRangeIndex: number;
        if (ranges.length > 0) {
            startRangeIndex = 0;
            endRangeIndex = 0;
        } else {
            startRangeIndex = this.rangeController.getRangeStartRow(ranges[0]).rowIndex;
            endRangeIndex = this.rangeController.getRangeEndRow(ranges[0]).rowIndex;
        }
        return startRangeIndex - endRangeIndex + 1;
    }

}
