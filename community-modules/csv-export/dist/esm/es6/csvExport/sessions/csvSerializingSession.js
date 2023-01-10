import { BaseGridSerializingSession } from "./baseGridSerializingSession";
const LINE_SEPARATOR = '\r\n';
export class CsvSerializingSession extends BaseGridSerializingSession {
    constructor(config) {
        super(config);
        this.isFirstLine = true;
        this.result = '';
        const { suppressQuotes, columnSeparator } = config;
        this.suppressQuotes = suppressQuotes;
        this.columnSeparator = columnSeparator;
    }
    addCustomContent(content) {
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
        }
        else {
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
    onNewHeaderGroupingRow() {
        this.beginNewLine();
        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    }
    onNewHeaderGroupingRowColumn(columnGroup, header, index, span) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(header);
        this.appendEmptyCells(span);
    }
    appendEmptyCells(count) {
        for (let i = 1; i <= count; i++) {
            this.result += this.columnSeparator + this.putInQuotes("");
        }
    }
    onNewHeaderRow() {
        this.beginNewLine();
        return {
            onColumn: this.onNewHeaderRowColumn.bind(this)
        };
    }
    onNewHeaderRowColumn(column, index) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractHeaderValue(column));
    }
    onNewBodyRow() {
        this.beginNewLine();
        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    }
    onNewBodyRowColumn(column, index, node) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, index, 'csv', node));
    }
    putInQuotes(value) {
        if (this.suppressQuotes) {
            return value;
        }
        if (value === null || value === undefined) {
            return '""';
        }
        let stringValue;
        if (typeof value === 'string') {
            stringValue = value;
        }
        else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        }
        else {
            console.warn('AG Grid: unknown value type during csv conversion');
            stringValue = '';
        }
        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        const valueEscaped = stringValue.replace(/"/g, "\"\"");
        return '"' + valueEscaped + '"';
    }
    parse() {
        return this.result;
    }
    beginNewLine() {
        if (!this.isFirstLine) {
            this.result += LINE_SEPARATOR;
        }
        this.isFirstLine = false;
    }
}
