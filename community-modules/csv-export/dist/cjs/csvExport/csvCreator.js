"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var baseCreator_1 = require("./baseCreator");
var downloader_1 = require("./downloader");
var csvSerializingSession_1 = require("./sessions/csvSerializingSession");
var CsvCreator = /** @class */ (function (_super) {
    __extends(CsvCreator, _super);
    function CsvCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CsvCreator.prototype.postConstruct = function () {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    };
    CsvCreator.prototype.getDefaultExportParams = function () {
        return this.gridOptionsWrapper.getDefaultExportParams('csv');
    };
    CsvCreator.prototype.export = function (userParams) {
        if (this.isExportSuppressed()) {
            console.warn("ag-grid: Export cancelled. Export is not allowed as per your configuration.");
            return '';
        }
        var _a = this.getMergedParamsAndData(userParams), mergedParams = _a.mergedParams, data = _a.data;
        var packagedFile = new Blob(["\ufeff", data], {
            // @ts-ignore
            type: window.navigator.msSaveOrOpenBlob ? this.getMimeType() : 'octet/stream'
        });
        downloader_1.Downloader.download(this.getFileName(mergedParams.fileName), packagedFile);
        return data;
    };
    CsvCreator.prototype.exportDataAsCsv = function (params) {
        return this.export(params);
    };
    CsvCreator.prototype.getDataAsCsv = function (params) {
        return this.getMergedParamsAndData(params).data;
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
        var _b = params, processCellCallback = _b.processCellCallback, processHeaderCallback = _b.processHeaderCallback, processGroupHeaderCallback = _b.processGroupHeaderCallback, processRowGroupCallback = _b.processRowGroupCallback, suppressQuotes = _b.suppressQuotes, columnSeparator = _b.columnSeparator;
        return new csvSerializingSession_1.CsvSerializingSession({
            columnController: columnController,
            valueService: valueService,
            gridOptionsWrapper: gridOptionsWrapper,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ','
        });
    };
    CsvCreator.prototype.isExportSuppressed = function () {
        return this.gridOptionsWrapper.isSuppressCsvExport();
    };
    __decorate([
        core_1.Autowired('columnController')
    ], CsvCreator.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('valueService')
    ], CsvCreator.prototype, "valueService", void 0);
    __decorate([
        core_1.Autowired('gridSerializer')
    ], CsvCreator.prototype, "gridSerializer", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], CsvCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.PostConstruct
    ], CsvCreator.prototype, "postConstruct", null);
    CsvCreator = __decorate([
        core_1.Bean('csvCreator')
    ], CsvCreator);
    return CsvCreator;
}(baseCreator_1.BaseCreator));
exports.CsvCreator = CsvCreator;
//# sourceMappingURL=csvCreator.js.map