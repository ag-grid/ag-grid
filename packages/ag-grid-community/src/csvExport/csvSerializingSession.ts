import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { BaseGridSerializingSession } from '../export/baseGridSerializingSession';
import type {
    GridHeaderCell,
    GridSerializingParams,
    HeaderRowAccumulator,
    RowAccumulator,
} from '../export/iGridSerializer';
import type { CsvCustomContent } from '../interfaces/exportParams';

const LINE_SEPARATOR = '\r\n';

interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}

export class CsvSerializingSession extends BaseGridSerializingSession<CsvCustomContent> {
    private isFirstLine = true;
    private result: string = '';
    private readonly suppressQuotes: boolean;
    private readonly columnSeparator: string;

    constructor(private readonly config: CsvSerializingParams) {
        super(config);

        const { suppressQuotes, columnSeparator } = config;

        this.suppressQuotes = suppressQuotes;
        this.columnSeparator = columnSeparator;
    }

    public addCustomContent(content: CsvCustomContent) {
        if (!content) {
            return;
        }
        if (typeof content === 'string') {
            if (!/^\s*\n/.test(content)) {
                this.beginNewLine();
            }
            // replace whatever newlines are supplied with the style we're using
            content = content.replace(/\r?\n/g, LINE_SEPARATOR);
            this.result += content;
        } else {
            content.forEach((row) => {
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

    public onNewHeaderRow(): HeaderRowAccumulator {
        this.beginNewLine();

        return {
            onCell: this.onNewHeaderCell.bind(this),
        };
    }

    public onNewHeaderGroupingRow(): HeaderRowAccumulator {
        return this.onNewHeaderRow();
    }

    private onNewHeaderCell(cell: GridHeaderCell): void {
        if (cell.columnIndex != 0) {
            this.result += this.columnSeparator;
        }

        let value = '';
        if (cell.type === 'column') {
            value = this.extractHeaderValue(cell.column);
        } else if (cell.type !== 'covered' && cell.column) {
            // padding groups still resolve names via defaultColGroupDef and group header callbacks.
            value = this.extractGroupHeaderValue(cell.column);
        }
        this.result += this.putInQuotes(value);

        this.appendEmptyCells(cell.columnSpan - 1);
    }

    private appendEmptyCells(count: number) {
        for (let i = 1; i <= count; i++) {
            this.result += this.columnSeparator + this.putInQuotes('');
        }
    }

    public onNewBodyRow(): RowAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewBodyRowColumn.bind(this),
        };
    }

    private onNewBodyRowColumn(column: AgColumn, index: number, node: RowNode): void {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        const rowCellValue = this.extractRowCellValue({
            column,
            node,
            currentColumnIndex: index,
            accumulatedRowIndex: index,
            type: 'csv',
            useRawFormula: false,
        });
        this.result += this.putInQuotes(rowCellValue.valueFormatted ?? rowCellValue.value);
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
            this.log.warn(53);
            stringValue = '';
        }

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        const valueEscaped = stringValue.replace(/"/g, '""');

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
