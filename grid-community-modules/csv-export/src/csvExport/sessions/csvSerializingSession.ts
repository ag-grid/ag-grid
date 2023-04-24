import { Column, ColumnGroup, CsvCustomContent, RowNode } from "@ag-grid-community/core";
import { CsvSerializingParams, RowAccumulator, RowSpanningAccumulator } from "../interfaces";
import { BaseGridSerializingSession } from "./baseGridSerializingSession";

const LINE_SEPARATOR = '\r\n';

export class CsvSerializingSession extends BaseGridSerializingSession<CsvCustomContent> {
    private isFirstLine = true;
    private result: string = '';
    private suppressQuotes: boolean;
    private columnSeparator: string;

    constructor(config: CsvSerializingParams) {
        super(config);

        const { suppressQuotes, columnSeparator } = config;

        this.suppressQuotes = suppressQuotes;
        this.columnSeparator = columnSeparator;
    }

    public addCustomContent(content: CsvCustomContent) {
        if (!content) { return; }
        if (typeof content === 'string') {
            if (!/^\s*\n/.test(content)) {
                this.beginNewLine();
            }
            // replace whatever newlines are supplied with the style we're using
            content = content.replace(/\r?\n/g, LINE_SEPARATOR);
            this.result += content;
        } else {
            content.forEach(row => {
                this.beginNewLine();
                row.forEach((cell, index) => {
                    if (index !== 0) {
                        this.result += this.columnSeparator;
                    }
                    this.result += this.putInQuotes(cell.data.value || '');
                    if (cell.mergeAcross) {
                        this.appendEmptyCells(cell.mergeAcross);
                    }
                });
            });
        }
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    }

    private onNewHeaderGroupingRowColumn(columnGroup: ColumnGroup, header: string, index: number, span: number) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }

        this.result += this.putInQuotes(header);

        this.appendEmptyCells(span);
    }

    private appendEmptyCells(count: number) {
        for (let i = 1; i <= count; i++) {
            this.result += this.columnSeparator + this.putInQuotes("");
        }
    }

    public onNewHeaderRow(): RowAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewHeaderRowColumn.bind(this)
        };
    }

    private onNewHeaderRowColumn(column: Column, index: number): void {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractHeaderValue(column));
    }

    public onNewBodyRow(): RowAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    }

    private onNewBodyRowColumn(column: Column, index: number, node: RowNode): void {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, index, 'csv', node));
    }

    private putInQuotes(value: any): string {
        if (this.suppressQuotes) {
            return value;
        }

        if (value === null || value === undefined) {
            return '""';
        }

        let stringValue: string;
        if (typeof value === 'string') {
            stringValue = value;
        } else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        } else {
            console.warn('AG Grid: unknown value type during csv conversion');
            stringValue = '';
        }

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        const valueEscaped = stringValue.replace(/"/g, "\"\"");

        return '"' + valueEscaped + '"';
    }

    public parse(): string {
        return this.result;
    }

    private beginNewLine() {
        if (!this.isFirstLine) {
            this.result += LINE_SEPARATOR;
        }
        this.isFirstLine = false;
    }
}