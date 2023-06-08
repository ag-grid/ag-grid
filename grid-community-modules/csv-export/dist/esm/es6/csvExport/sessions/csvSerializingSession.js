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
        var _a;
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        const rowCellValue = this.extractRowCellValue(column, index, index, 'csv', node);
        this.result += this.putInQuotes((_a = rowCellValue.valueFormatted) !== null && _a !== void 0 ? _a : rowCellValue.value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2U2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NzdkV4cG9ydC9zZXNzaW9ucy9jc3ZTZXJpYWxpemluZ1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFMUUsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBRTlCLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSwwQkFBNEM7SUFNbkYsWUFBWSxNQUE0QjtRQUNwQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFOVixnQkFBVyxHQUFHLElBQUksQ0FBQztRQUNuQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBT3hCLE1BQU0sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBRW5ELElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzNDLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxPQUF5QjtRQUM3QyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQ3pCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDdkI7WUFDRCxvRUFBb0U7WUFDcEUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1NBQzFCO2FBQU07WUFDSCxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3BCLEdBQUcs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