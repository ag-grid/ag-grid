var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "@ag-grid-community/core";
import { BaseCreator } from "./baseCreator";
import { Downloader } from "./downloader";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";
let CsvCreator = class CsvCreator extends BaseCreator {
    postConstruct() {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsService: this.gridOptionsService
        });
    }
    getMergedParams(params) {
        const baseParams = this.gridOptionsService.get('defaultCsvExportParams');
        return Object.assign({}, baseParams, params);
    }
    export(userParams) {
        if (this.isExportSuppressed()) {
            console.warn(`AG Grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }
        const mergedParams = this.getMergedParams(userParams);
        const data = this.getData(mergedParams);
        const packagedFile = new Blob(["\ufeff", data], { type: 'text/plain' });
        Downloader.download(this.getFileName(mergedParams.fileName), packagedFile);
        return data;
    }
    exportDataAsCsv(params) {
        return this.export(params);
    }
    getDataAsCsv(params, skipDefaultParams = false) {
        const mergedParams = skipDefaultParams
            ? Object.assign({}, params)
            : this.getMergedParams(params);
        return this.getData(mergedParams);
    }
    getDefaultFileName() {
        return 'export.csv';
    }
    getDefaultFileExtension() {
        return 'csv';
    }
    createSerializingSession(params) {
        const { columnModel, valueService, gridOptionsService } = this;
        const { processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback, suppressQuotes, columnSeparator } = params;
        return new CsvSerializingSession({
            columnModel: columnModel,
            valueService,
            gridOptionsService,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ','
        });
    }
    isExportSuppressed() {
        return this.gridOptionsService.is('suppressCsvExport');
    }
};
__decorate([
    Autowired('columnModel')
], CsvCreator.prototype, "columnModel", void 0);
__decorate([
    Autowired('valueService')
], CsvCreator.prototype, "valueService", void 0);
__decorate([
    Autowired('gridSerializer')
], CsvCreator.prototype, "gridSerializer", void 0);
__decorate([
    Autowired('gridOptionsService')
], CsvCreator.prototype, "gridOptionsService", void 0);
__decorate([
    PostConstruct
], CsvCreator.prototype, "postConstruct", null);
CsvCreator = __decorate([
    Bean('csvCreator')
], CsvCreator);
export { CsvCreator };
