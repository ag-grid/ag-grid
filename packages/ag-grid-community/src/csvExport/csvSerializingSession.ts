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
// Spreadsheet applications can evaluate a value starting with any of these, including the full-width forms, as a formula
const FORMULA_START_REGEX = /^[=+\-@\t\r\n＝＋－＠]/;
const SIGN_START_REGEX = /^[+-]/;
const PLAIN_NUMBER_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

// `avg` and `count` aggregates produce objects with a `toNumber()` method rather than numbers
function isNumberValue(value: any): boolean {
    return typeof value === 'number' || typeof value === 'bigint' || typeof value?.toNumber === 'function';
}

/** Prefixes `'` to text a spreadsheet application could evaluate as a formula, unless it is a number or a formatted number with a leading sign. */
function prefixFormula(text: string, sourceValue: unknown): string {
    if (!FORMULA_START_REGEX.test(text) || PLAIN_NUMBER_REGEX.test(text)) {
        return text;
    }
    return isNumberValue(sourceValue) && SIGN_START_REGEX.test(text) ? text : `'${text}`;
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
        this.result += this.putInQuotes(rowCellValue.valueFormatted ?? rowCellValue.value, rowCellValue.value);
    }

    private putInQuotes(value: any, sourceValue?: unknown): string {
        const csvValue =
            this.sanitizeFormulas && value != null ? prefixFormula(this.toCsvString(value), sourceValue) : value;

        if (this.suppressQuotes) {
            return csvValue;
        }

        if (csvValue === null || csvValue === undefined) {
            return '""';
        }

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        const valueEscaped = this.toCsvString(csvValue).replace(/"/g, '""');

        return '"' + valueEscaped + '"';
    }

    private toCsvString(value: any): string {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value.toString === 'function') {
            return value.toString();
        }
        this.log.warn(53);
        return '';
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
