var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BaseGridSerializingSession } from "./baseGridSerializingSession";
var LINE_SEPARATOR = '\r\n';
var CsvSerializingSession = /** @class */ (function (_super) {
    __extends(CsvSerializingSession, _super);
    function CsvSerializingSession(config) {
        var _this = _super.call(this, config) || this;
        _this.isFirstLine = true;
        _this.result = '';
        var suppressQuotes = config.suppressQuotes, columnSeparator = config.columnSeparator;
        _this.suppressQuotes = suppressQuotes;
        _this.columnSeparator = columnSeparator;
        return _this;
    }
    CsvSerializingSession.prototype.addCustomContent = function (content) {
        var _this = this;
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
            content.forEach(function (row) {
                _this.beginNewLine();
                row.forEach(function (cell, index) {
                    if (index !== 0) {
                        _this.result += _this.columnSeparator;
                    }
                    _this.result += _this.putInQuotes(cell.data.value || '');
                    if (cell.mergeAcross) {
                        _this.appendEmptyCells(cell.mergeAcross);
                    }
                });
            });
        }
    };
    CsvSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        this.beginNewLine();
        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    };
    CsvSerializingSession.prototype.onNewHeaderGroupingRowColumn = function (columnGroup, header, index, span) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(header);
        this.appendEmptyCells(span);
    };
    CsvSerializingSession.prototype.appendEmptyCells = function (count) {
        for (var i = 1; i <= count; i++) {
            this.result += this.columnSeparator + this.putInQuotes("");
        }
    };
    CsvSerializingSession.prototype.onNewHeaderRow = function () {
        this.beginNewLine();
        return {
            onColumn: this.onNewHeaderRowColumn.bind(this)
        };
    };
    CsvSerializingSession.prototype.onNewHeaderRowColumn = function (column, index) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractHeaderValue(column));
    };
    CsvSerializingSession.prototype.onNewBodyRow = function () {
        this.beginNewLine();
        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    };
    CsvSerializingSession.prototype.onNewBodyRowColumn = function (column, index, node) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, index, 'csv', node));
    };
    CsvSerializingSession.prototype.putInQuotes = function (value) {
        if (this.suppressQuotes) {
            return value;
        }
        if (value === null || value === undefined) {
            return '""';
        }
        var stringValue;
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
        var valueEscaped = stringValue.replace(/"/g, "\"\"");
        return '"' + valueEscaped + '"';
    };
    CsvSerializingSession.prototype.parse = function () {
        return this.result;
    };
    CsvSerializingSession.prototype.beginNewLine = function () {
        if (!this.isFirstLine) {
            this.result += LINE_SEPARATOR;
        }
        this.isFirstLine = false;
    };
    return CsvSerializingSession;
}(BaseGridSerializingSession));
export { CsvSerializingSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2U2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NzdkV4cG9ydC9zZXNzaW9ucy9jc3ZTZXJpYWxpemluZ1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFMUUsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBRTlCO0lBQTJDLHlDQUE0QztJQU1uRiwrQkFBWSxNQUE0QjtRQUF4QyxZQUNJLGtCQUFNLE1BQU0sQ0FBQyxTQU1oQjtRQVpPLGlCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLFlBQU0sR0FBVyxFQUFFLENBQUM7UUFPaEIsSUFBQSxjQUFjLEdBQXNCLE1BQU0sZUFBNUIsRUFBRSxlQUFlLEdBQUssTUFBTSxnQkFBWCxDQUFZO1FBRW5ELEtBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLEtBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDOztJQUMzQyxDQUFDO0lBRU0sZ0RBQWdCLEdBQXZCLFVBQXdCLE9BQXlCO1FBQWpELGlCQXVCQztRQXRCRyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQ3pCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDdkI7WUFDRCxvRUFBb0U7WUFDcEUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1NBQzFCO2FBQU07WUFDSCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDZixLQUFJLENB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