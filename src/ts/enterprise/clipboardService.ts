
import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {CsvCreator} from "../csvCreator";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {PostConstruct} from "../context/context";
import SelectionController from "../selectionController";
import {RangeController} from "./rangeController";
import {IRowModel} from "../interfaces/iRowModel";
import ValueService from "../valueService";
import _ from '../utils';
import {FocusedCellController} from "../focusedCellController";
import RowRenderer from "../rendering/rowRenderer";
import {ColumnController} from "../columnController/columnController";
import EventService from "../eventService";
import {Events} from "../events";
import {CellNavigationService} from "../cellNavigationService";
import Constants from "../constants";
import FloatingRowModel from "../rowControllers/floatingRowModel";
import {RowNode} from "../entities/rowNode";
import {GridRow} from "../entities/gridCell";
import {GridCell} from "../entities/gridCell";
import {Grid} from "../grid";

@Bean('clipboardService')
export class ClipboardService {

    @Autowired('csvCreator') private csvCreator: CsvCreator;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;

    private logger: Logger;

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('ClipboardService');
    }

    public pasteFromClipboard(): void {
        this.logger.log('pasteFromClipboard');
        this.executeOnTempElement(
            (textArea: HTMLTextAreaElement)=> {
                textArea.focus();
            },
            (element: HTMLTextAreaElement)=> {
                var text = element.value;
                this.finishPasteFromClipboard(text);
            }
        );
    }

    private finishPasteFromClipboard(data: string) {
        if (_.missingOrEmpty(data)) { return; }

        var focusedCell = this.focusedCellController.getFocusedCell();
        if (!focusedCell) { return; }

        var parsedData = this.dataToArray(data);
        if (!parsedData) {
            return;
        }

        // remove last row if empty, excel puts empty last row in
        var lastLine = parsedData[parsedData.length - 1];
        if (lastLine.length===1 && lastLine[0]==='') {
            _.removeFromArray(parsedData, lastLine);
        }

        var currentRow = new GridRow(focusedCell.rowIndex, focusedCell.floating);
        var cellsToFlash = <any>{};

        parsedData.forEach( (values: string[]) => {
            // if we have come to end of rows in grid, then skip
            if (!currentRow) { return; }

            var rowNode = this.getRowNode(currentRow);
            var column = focusedCell.column;
            values.forEach( (value: any)=> {
                if (_.missing(column)) { return; }
                if (!column.isCellEditable(rowNode)) { return; }
                this.valueService.setValue(rowNode, column, value);
                var cellId = new GridCell(currentRow.rowIndex, currentRow.floating, column).createId();
                cellsToFlash[cellId] = true;
                column = this.columnController.getDisplayedColAfter(column);
            });
            // move to next row down for next set of values
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        });

        // this is very heavy!!
        this.rowRenderer.refreshView();
        this.eventService.dispatchEvent(Events.EVENT_FLASH_CELLS, {cells: cellsToFlash});
    }

    public copyToClipboard(): void {
        this.logger.log('copyToClipboard');

        // default is copy range if exists, otherwise rows
        if (this.rangeController.isMoreThanOneCell()) {
            this.copySelectedRangesToClipboard();
        } else if (!this.selectionController.isEmpty()) {
            this.copySelectedRowsToClipboard();
        } else if (!this.rangeController.isEmpty()) {
            this.copySelectedRangesToClipboard();
        }
    }

    public copySelectedRangesToClipboard(): void {
        if (this.rangeController.isEmpty()) { return; }

        var rangeSelections = this.rangeController.getCellRanges();
        // if more than one range selected, we take the first one only, we ignore the others,
        // in Excel, it doesn't allow multiple blocks to be copied to clipboard at same time
        var range = rangeSelections[0];

        // get starting and ending row, remember rowEnd could be before rowStart
        var startRow = range.start.getGridRow();
        var endRow = range.end.getGridRow();

        var startRowIsFirst = startRow.before(endRow);

        var currentRow = startRowIsFirst ? startRow : endRow;
        var lastRow = startRowIsFirst ? endRow : startRow;

        var cellsToFlash = <any>{};

        var data = '';
        while (true) {
            range.columns.forEach( (column, index) => {
                var rowNode = this.getRowNode(currentRow);
                var value = this.valueService.getValue(column, rowNode);
                if (index != 0) {
                    data += '\t';
                }
                if (_.exists(value)) {
                    data += value;
                }
                var cellId = new GridCell(currentRow.rowIndex, currentRow.floating, column).createId();
                cellsToFlash[cellId] = true;
            });
            data += '\r\n';

            if (currentRow.equals(lastRow)) {
                break;
            }

            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }

        this.copyDataToClipboard(data);
        this.eventService.dispatchEvent(Events.EVENT_FLASH_CELLS, {cells: cellsToFlash});
    }

    private getRowNode(gridRow: GridRow): RowNode {
        switch (gridRow.floating) {
            case Constants.FLOATING_TOP:
                return this.floatingRowModel.getFloatingTopRowData()[gridRow.rowIndex];
            case Constants.FLOATING_BOTTOM:
                return this.floatingRowModel.getFloatingBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }

    public copySelectedRowsToClipboard(): void {

        var data = this.csvCreator.getDataAsCsv({
            skipHeader: true,
            skipFooters: true,
            columnSeparator: '\t',
            onlySelected: true
        });

        this.copyDataToClipboard(data);
    }

    private copyDataToClipboard(data: string): void {
        this.executeOnTempElement( (element: HTMLTextAreaElement)=> {
            element.value = data;
            element.select();
            element.focus();
            return document.execCommand('copy');
        });
    }

    private executeOnTempElement(
        callbackNow: (element: HTMLTextAreaElement)=>void,
        callbackAfter?: (element: HTMLTextAreaElement)=>void): void {

        var eTempInput = <HTMLTextAreaElement> document.createElement('textarea');
        eTempInput.style.width = '1px';
        eTempInput.style.height = '1px';
        eTempInput.style.top = '0px';
        eTempInput.style.left = '0px';
        eTempInput.style.position = 'absolute';
        eTempInput.style.opacity = '0.0';

        document.body.appendChild(eTempInput);

        try {
            var result = callbackNow(eTempInput);
            this.logger.log('Clipboard operation result: ' + result);
        } catch (err) {
            this.logger.log('Browser doesn\t support document.execComment(\'copy\') for clipboard operations');
        }

        if (callbackAfter) {
            setTimeout( ()=> {
                callbackAfter(eTempInput);
                document.body.removeChild(eTempInput);
            }, 0);
        } else {
            document.body.removeChild(eTempInput);
        }
    }

    // From http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    private dataToArray(strData: string): string[][] {
        var strDelimiter = '\t';

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );

        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData: string[][] = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches: string[] = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue: string;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return arrData;
    }
}