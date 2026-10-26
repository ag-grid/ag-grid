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
// Spreadsheet applications evaluate a value starting with any of these characters as a formula
const FORMULA_START_REGEX = /^[=+\-@\t\r]/;
const PLAIN_NUMBER_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/** Prefixes `'` to a value a spreadsheet application would evaluate as a formula; plain numbers are left unchanged. */
function prefixFormula(value: string): string {
    return FORMULA_START_REGEX.test(value) && !PLAIN_NUMBER_REGEX.test(value) ? `'${value}` : value;
}

interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
    sanitizeFormulas: boolean;
}

export class CsvSerializingSession extends BaseGridSerializingSession<CsvCustomContent> {
    private isFirstLine = true;
    private result: string = '';
    private readonly suppressQuotes: boolean;
    private readonly columnSeparator: string;
    private readonly sanitizeFormulas: boolean;

    constructor(private readonly config: CsvSerializingParams) {
        super(config);

        const { suppressQuotes, columnSeparator, sanitizeFormulas } = config;

        this.suppressQuotes = suppressQuotes;
        this.columnSeparator = columnSeparator;
        this.sanitizeFormulas = sanitizeFormulas;
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
            return this.sanitizeFormulas && typeof value === 'string' ? prefixFormula(value) : value;
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

        const csvValue = this.sanitizeFormulas ? prefixFormula(stringValue) : stringValue;

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        const valueEscaped = csvValue.replace(/"/g, '""');

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
