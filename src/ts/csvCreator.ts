import {ColumnController} from "./columnController/columnController";
import {ValueService} from "./valueService";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {Bean, Autowired} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ProcessCellForExportParams, ProcessHeaderForExportParams} from "./entities/gridOptions";
import {Constants} from "./constants";
import {IInMemoryRowModel} from "./interfaces/iInMemoryRowModel";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {ColDef} from "./entities/colDef";
import {Utils as _} from "./utils";

var LINE_SEPARATOR = '\r\n';

export interface CsvExportParams {
    skipHeader?: boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
    skipFloatingTop?: boolean;
    skipFloatingBottom?: boolean;
    suppressQuotes?: boolean;
    columnKeys?: (Column|ColDef|string)[]
    fileName?: string;
    customHeader?: string;
    customFooter?: string;
    allColumns?: boolean;
    columnSeparator?: string;
    onlySelected?: boolean;
    processCellCallback?(params: ProcessCellForExportParams): void;
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;
}

@Bean('csvCreator')
export class CsvCreator {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public exportDataAsCsv(params?: CsvExportParams): void {
        var csvString = this.getDataAsCsv(params);
        var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        var fileName = fileNamePresent ? params.fileName : 'export.csv';
        // for Excel, we need \ufeff at the start
        // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
        var blobObject = new Blob(["\ufeff", csvString], {
            type: "text/csv;charset=utf-8;"
        });
        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        } else {
            // Chrome
            var downloadLink = document.createElement("a");
            downloadLink.href = (<any>window).URL.createObjectURL(blobObject);
            (<any>downloadLink).download = fileName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    public getDataAsCsv(params?: CsvExportParams): string {
        if (this.rowModel.getType()!==Constants.ROW_MODEL_TYPE_NORMAL) {
            console.log('ag-Grid: getDataAsCsv is only available for standard row model');
            return '';
        }
        var inMemoryRowModel = <IInMemoryRowModel> this.rowModel;

        var that = this;
        var result = '';

        var skipGroups = params && params.skipGroups;
        var skipHeader = params && params.skipHeader;
        var skipFooters = params && params.skipFooters;
        var skipFloatingTop = params && params.skipFloatingTop;
        var skipFloatingBottom = params && params.skipFloatingBottom;
        var includeCustomHeader = params && params.customHeader;
        var includeCustomFooter = params && params.customFooter;
        var allColumns = params && params.allColumns;
        var onlySelected = params && params.onlySelected;
        var columnSeparator = (params && params.columnSeparator) || ',';
        var suppressQuotes = params && params.suppressQuotes;
        var columnKeys = params && params.columnKeys;
        var processCellCallback = params && params.processCellCallback;
        var processHeaderCallback = params && params.processHeaderCallback;

        // when in pivot mode, we always render cols on screen, never 'all columns'
        var isPivotMode = this.columnController.isPivotMode();
        var isRowGrouping = this.columnController.getRowGroupColumns().length > 0;

        var columnsToExport: Column[];
        if (_.existsAndNotEmpty(columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(columnKeys);
        } else if (allColumns && !isPivotMode) {
            columnsToExport = this.columnController.getAllPrimaryColumns();
        } else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }

        if (!columnsToExport || columnsToExport.length === 0) {
            return '';
        }

        if (includeCustomHeader) {
            result += params.customHeader;
        }

        // first pass, put in the header names of the cols
        if (!skipHeader) {
            columnsToExport.forEach(processHeaderColumn);
            result += LINE_SEPARATOR;
        }

        this.floatingRowModel.forEachFloatingTopRow(processRow);

        if (isPivotMode) {
            inMemoryRowModel.forEachPivotNode(processRow);
        } else {
            inMemoryRowModel.forEachNodeAfterFilterAndSort(processRow);
        }

        this.floatingRowModel.forEachFloatingBottomRow(processRow);

        if (includeCustomFooter) {
            result += params.customFooter;
        }

        function processRow(node: RowNode): void {
            if (skipGroups && node.group) { return; }

            if (skipFooters && node.footer) { return; }

            if (onlySelected && !node.isSelected()) { return; }

            if (skipFloatingTop && node.floating==='top') { return; }

            if (skipFloatingBottom && node.floating==='bottom') { return; }

            // if we are in pivotMode, then the grid will show the root node only
            // if it's not a leaf group
            var nodeIsRootNode = node.level===-1;
            if (nodeIsRootNode && !node.leafGroup) { return; }

            columnsToExport.forEach( (column: Column, index: number)=> {
                var valueForCell: any;
                if (node.group && isRowGrouping && index === 0) {
                    valueForCell =  that.createValueForGroupNode(node);
                } else {
                    valueForCell =  that.valueService.getValue(column, node);
                }
                valueForCell = that.processCell(node, column, valueForCell, processCellCallback);
                if (valueForCell === null || valueForCell === undefined) {
                    valueForCell = '';
                }
                if (index != 0) {
                    result += columnSeparator;
                }
                result += that.putInQuotes(valueForCell, suppressQuotes);
            });

            result += LINE_SEPARATOR;
        }

        function processHeaderColumn(column: Column, index: number): void {
            var nameForCol = that.getHeaderName(processHeaderCallback, column);
            if (nameForCol === null || nameForCol === undefined) {
                nameForCol = '';
            }
            if (index != 0) {
                result += columnSeparator;
            }
            result += that.putInQuotes(nameForCol, suppressQuotes);
        }

        return result;
    }

    private getHeaderName(callback: (params: ProcessHeaderForExportParams)=>string, column: Column): string {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        } else {
            return this.columnController.getDisplayNameForCol(column, true);
        }
    }

    private processCell(rowNode: RowNode, column: Column, value: any, processCellCallback:(params: ProcessCellForExportParams)=>void): any {
        if (processCellCallback) {
            return processCellCallback({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        } else {
            return value;
        }
    }

    private createValueForGroupNode(node: RowNode): string {
        var keys = [node.key];
        while (node.parent) {
            node = node.parent;
            keys.push(node.key);
        }
        return keys.reverse().join(' -> ');
    }

    private putInQuotes(value: any, suppressQuotes: boolean): string {
        if (suppressQuotes) { return value; }

        if (value === null || value === undefined) {
            return '""';
        }

        var stringValue: string;
        if (typeof value === 'string') {
            stringValue = value;
        } else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        } else {
            console.warn('unknown value type during csv conversion');
            stringValue = '';
        }

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        var valueEscaped = stringValue.replace(/"/g, "\"\"");

        return '"' + valueEscaped + '"';
    }

}
