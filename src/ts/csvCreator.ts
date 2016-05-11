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

var LINE_SEPARATOR = '\r\n';

export interface CsvExportParams {
    skipHeader?: boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
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

        var result = '';

        var skipGroups = params && params.skipGroups;
        var skipHeader = params && params.skipHeader;
        var skipFooters = params && params.skipFooters;
        var includeCustomHeader = params && params.customHeader;
        var includeCustomFooter = params && params.customFooter;
        var allColumns = params && params.allColumns;
        var onlySelected = params && params.onlySelected;
        var columnSeparator = (params && params.columnSeparator) || ',';
        var processCellCallback = params.processCellCallback;

        var columnsToExport: Column[];
        if (allColumns) {
            columnsToExport = this.columnController.getAllOriginalColumns();
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
            columnsToExport.forEach( (column: Column, index: number)=> {

                var nameForCol = this.getHeaderName(params.processHeaderCallback, column);
                if (nameForCol === null || nameForCol === undefined) {
                    nameForCol = '';
                }
                if (index != 0) {
                    result += columnSeparator;
                }
                result += '"' + this.escape(nameForCol) + '"';
            });
            result += LINE_SEPARATOR;
        }

        inMemoryRowModel.forEachNodeAfterFilterAndSort( (node: RowNode) => {
            if (skipGroups && node.group) { return; }

            if (skipFooters && node.footer) { return; }

            if (onlySelected && !node.isSelected()) { return; }

            columnsToExport.forEach( (column: Column, index: number)=> {
                var valueForCell: any;
                if (node.group && index === 0) {
                    valueForCell =  this.createValueForGroupNode(node);
                } else {
                    valueForCell =  this.valueService.getValue(column, node);
                }
                valueForCell = this.processCell(node, column, valueForCell, processCellCallback);
                if (valueForCell === null || valueForCell === undefined) {
                    valueForCell = '';
                }
                if (index != 0) {
                    result += columnSeparator;
                }
                result += '"' + this.escape(valueForCell) + '"';
            });

            result += LINE_SEPARATOR;
        });

        if (includeCustomFooter) {
            result += params.customFooter;
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
            return this.columnController.getDisplayNameForCol(column);
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

    // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
    private escape(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        var stringValue: string;
        if (typeof value === 'string') {
            stringValue = value;
        } else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        } else {
            console.warn('known value type during csv conversion');
            stringValue = '';
        }

        return stringValue.replace(/"/g, "\"\"");
    }

}
