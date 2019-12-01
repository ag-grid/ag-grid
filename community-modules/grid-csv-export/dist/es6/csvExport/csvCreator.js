var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, Constants, PostConstruct } from "@ag-grid-community/core";
import { BaseGridSerializingSession } from "./gridSerializer";
var LINE_SEPARATOR = '\r\n';
var CsvSerializingSession = /** @class */ (function (_super) {
    __extends(CsvSerializingSession, _super);
    function CsvSerializingSession(config) {
        var _this = _super.call(this, {
            columnController: config.columnController,
            valueService: config.valueService,
            gridOptionsWrapper: config.gridOptionsWrapper,
            processCellCallback: config.processCellCallback,
            processHeaderCallback: config.processHeaderCallback
        }) || this;
        _this.result = '';
        _this.lineOpened = false;
        var suppressQuotes = config.suppressQuotes, columnSeparator = config.columnSeparator;
        _this.suppressQuotes = suppressQuotes;
        _this.columnSeparator = columnSeparator;
        return _this;
    }
    CsvSerializingSession.prototype.prepare = function (columnsToExport) {
    };
    CsvSerializingSession.prototype.addCustomHeader = function (customHeader) {
        if (!customHeader) {
            return;
        }
        this.result += customHeader + LINE_SEPARATOR;
    };
    CsvSerializingSession.prototype.addCustomFooter = function (customFooter) {
        if (!customFooter) {
            return;
        }
        this.result += customFooter + LINE_SEPARATOR;
    };
    CsvSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        if (this.lineOpened) {
            this.result += LINE_SEPARATOR;
        }
        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    };
    CsvSerializingSession.prototype.onNewHeaderGroupingRowColumn = function (header, index, span) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(header, this.suppressQuotes);
        for (var i = 1; i <= span; i++) {
            this.result += this.columnSeparator + this.putInQuotes("", this.suppressQuotes);
        }
        this.lineOpened = true;
    };
    CsvSerializingSession.prototype.onNewHeaderRow = function () {
        if (this.lineOpened) {
            this.result += LINE_SEPARATOR;
        }
        return {
            onColumn: this.onNewHeaderRowColumn.bind(this)
        };
    };
    CsvSerializingSession.prototype.onNewHeaderRowColumn = function (column, index, node) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractHeaderValue(column), this.suppressQuotes);
        this.lineOpened = true;
    };
    CsvSerializingSession.prototype.onNewBodyRow = function () {
        if (this.lineOpened) {
            this.result += LINE_SEPARATOR;
        }
        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    };
    CsvSerializingSession.prototype.onNewBodyRowColumn = function (column, index, node) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_CSV, node), this.suppressQuotes);
        this.lineOpened = true;
    };
    CsvSerializingSession.prototype.putInQuotes = function (value, suppressQuotes) {
        if (suppressQuotes) {
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
            console.warn('unknown value type during csv conversion');
            stringValue = '';
        }
        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        var valueEscaped = stringValue.replace(/"/g, "\"\"");
        return '"' + valueEscaped + '"';
    };
    CsvSerializingSession.prototype.parse = function () {
        return this.result;
    };
    return CsvSerializingSession;
}(BaseGridSerializingSession));
export { CsvSerializingSession };
var BaseCreator = /** @class */ (function () {
    function BaseCreator() {
    }
    BaseCreator.prototype.setBeans = function (beans) {
        this.beans = beans;
    };
    BaseCreator.prototype.export = function (userParams) {
        if (this.isExportSuppressed()) {
            console.warn("ag-grid: Export cancelled. Export is not allowed as per your configuration.");
            return '';
        }
        var _a = this.getMergedParamsAndData(userParams), mergedParams = _a.mergedParams, data = _a.data;
        var fileNamePresent = mergedParams && mergedParams.fileName && mergedParams.fileName.length !== 0;
        var fileName = fileNamePresent ? mergedParams.fileName : this.getDefaultFileName();
        if (fileName.indexOf(".") === -1) {
            fileName = fileName + "." + this.getDefaultFileExtension();
        }
        this.beans.downloader.download(fileName, this.packageFile(data));
        return data;
    };
    BaseCreator.prototype.getData = function (params) {
        return this.getMergedParamsAndData(params).data;
    };
    BaseCreator.prototype.getMergedParamsAndData = function (userParams) {
        var mergedParams = this.mergeDefaultParams(userParams);
        var data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);
        return { mergedParams: mergedParams, data: data };
    };
    BaseCreator.prototype.mergeDefaultParams = function (userParams) {
        var baseParams = this.beans.gridOptionsWrapper.getDefaultExportParams();
        var params = {};
        _.assign(params, baseParams);
        _.assign(params, userParams);
        return params;
    };
    BaseCreator.prototype.packageFile = function (data) {
        return new Blob(["\ufeff", data], {
            type: window.navigator.msSaveOrOpenBlob ? this.getMimeType() : 'octet/stream'
        });
    };
    return BaseCreator;
}());
export { BaseCreator };
var CsvCreator = /** @class */ (function (_super) {
    __extends(CsvCreator, _super);
    function CsvCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CsvCreator.prototype.postConstruct = function () {
        this.setBeans({
            downloader: this.downloader,
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    };
    CsvCreator.prototype.exportDataAsCsv = function (params) {
        return this.export(params);
    };
    CsvCreator.prototype.getDataAsCsv = function (params) {
        return this.getData(params);
    };
    CsvCreator.prototype.getMimeType = function () {
        return 'text/csv;charset=utf-8;';
    };
    CsvCreator.prototype.getDefaultFileName = function () {
        return 'export.csv';
    };
    CsvCreator.prototype.getDefaultFileExtension = function () {
        return 'csv';
    };
    CsvCreator.prototype.createSerializingSession = function (params) {
        var _a = this, columnController = _a.columnController, valueService = _a.valueService, gridOptionsWrapper = _a.gridOptionsWrapper;
        var processCellCallback = params.processCellCallback, processHeaderCallback = params.processHeaderCallback, processGroupHeaderCallback = params.processGroupHeaderCallback, suppressQuotes = params.suppressQuotes, columnSeparator = params.columnSeparator;
        return new CsvSerializingSession({
            columnController: columnController,
            valueService: valueService,
            gridOptionsWrapper: gridOptionsWrapper,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ','
        });
    };
    CsvCreator.prototype.isExportSuppressed = function () {
        return this.gridOptionsWrapper.isSuppressCsvExport();
    };
    __decorate([
        Autowired('columnController')
    ], CsvCreator.prototype, "columnController", void 0);
    __decorate([
        Autowired('valueService')
    ], CsvCreator.prototype, "valueService", void 0);
    __decorate([
        Autowired('downloader')
    ], CsvCreator.prototype, "downloader", void 0);
    __decorate([
        Autowired('gridSerializer')
    ], CsvCreator.prototype, "gridSerializer", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], CsvCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], CsvCreator.prototype, "postConstruct", null);
    CsvCreator = __decorate([
        Bean('csvCreator')
    ], CsvCreator);
    return CsvCreator;
}(BaseCreator));
export { CsvCreator };
