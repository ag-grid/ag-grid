module ag.grid {

    var LINE_SEPARATOR = '\r\n';

    export interface CsvExportParams {
        skipHeader?: boolean;
        skipFooters?: boolean;
        skipGroups?: boolean;
        fileName?: string;
        customHeader?: string;
        customFooter?: string;
    }

    export class CsvCreator {

        constructor(
            private rowController: InMemoryRowController,
            private columnController: ColumnController,
            private grid: Grid,
            private valueService: ValueService) {
        }

        public exportDataAsCsv(params?: CsvExportParams): void {
            var csvString = this.getDataAsCsv(params);
            var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
            var fileName = fileNamePresent ? params.fileName : 'export.csv';
            var blobObject = new Blob([csvString], {
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
            if (!this.grid.isUsingInMemoryModel()) {
                console.log('ag-Grid: getDataAsCsv not available when doing virtual pagination');
                return '';
            }

            var result = '';

            var skipGroups = params && params.skipGroups;
            var skipHeader = params && params.skipHeader;
            var skipFooters = params && params.skipFooters;
            var includeCustomHeader = params && params.customHeader;
            var includeCustomFooter = params && params.customFooter;

            var columnsToExport = this.columnController.getDisplayedColumns();
            if (!columnsToExport || columnsToExport.length === 0) {
                return '';
            }

            if (includeCustomHeader) {
                result += params.customHeader;
            }

            // first pass, put in the header names of the cols
            if (!skipHeader) {
                columnsToExport.forEach( (column: Column, index: number)=> {
                    var nameForCol = this.columnController.getDisplayNameForCol(column);
                    if (nameForCol === null || nameForCol === undefined) {
                        nameForCol = '';
                    }
                    if (index != 0) {
                        result += ',';
                    }
                    result += '"' + this.escape(nameForCol) + '"';
                });
                result += LINE_SEPARATOR;
            }

            this.rowController.forEachNodeAfterFilterAndSort( (node: RowNode) => {
                if (skipGroups && node.group) { return; }

                if (skipFooters && node.footer) { return; }

                columnsToExport.forEach( (column: Column, index: number)=> {
                    var valueForCell: any;
                    if (node.group && index === 0) {
                        valueForCell =  this.createValueForGroupNode(node);
                    } else {
                        valueForCell =  this.valueService.getValue(column.colDef, node.data, node);
                    }
                    if (valueForCell === null || valueForCell === undefined) {
                        valueForCell = '';
                    }
                    if (index != 0) {
                        result += ',';
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
                console.warn('known value type during csv conversio');
                stringValue = '';
            }

            return stringValue.replace(/"/g, "\"\"");
        }

    }

}