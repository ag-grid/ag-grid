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
        const { columnModel, valueService, gridOptionsService, valueFormatterService, valueParserService } = this;
        const { processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback, suppressQuotes, columnSeparator } = params;
        return new CsvSerializingSession({
            columnModel: columnModel,
            valueService,
            gridOptionsService,
            valueFormatterService,
            valueParserService,
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
    Autowired('valueFormatterService')
], CsvCreator.prototype, "valueFormatterService", void 0);
__decorate([
    Autowired('valueParserService')
], CsvCreator.prototype, "valueParserService", void 0);
__decorate([
    PostConstruct
], CsvCreator.prototype, "postConstruct", null);
CsvCreator = __decorate([
    Bean('csvCreator')
], CsvCreator);
export { CsvCreator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2Q3JlYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jc3ZFeHBvcnQvY3N2Q3JlYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFNSixhQUFhLEVBSWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBR3pFLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVcsU0FBUSxXQUFxRTtJQVUxRixhQUFhO1FBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDVixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtTQUM5QyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsZUFBZSxDQUFDLE1BQXdCO1FBQzlDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN6RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0sTUFBTSxDQUFDLFVBQTRCO1FBQ3RDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7WUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO1lBQzVGLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENB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