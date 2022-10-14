import {
    Autowired,
    Bean,
    ColumnModel,
    CsvCustomContent,
    CsvExportParams,
    GridOptionsWrapper,
    ICsvCreator,
    PostConstruct,
    ValueService
} from "@ag-grid-community/core";
import { BaseCreator } from "./baseCreator";
import { Downloader } from "./downloader";
import { GridSerializer } from "./gridSerializer";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";

@Bean('csvCreator')
export class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements ICsvCreator {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    }

    protected getMergedParams(params?: CsvExportParams): CsvExportParams {
        const baseParams = this.gridOptionsWrapper.getDefaultExportParams('csv');
        return Object.assign({}, baseParams, params);
    }

    public export(userParams?: CsvExportParams): string {
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

    public exportDataAsCsv(params?: CsvExportParams): string {
        return this.export(params);
    }

    public getDataAsCsv(params?: CsvExportParams, skipDefaultParams = false): string {
        const mergedParams = skipDefaultParams
            ? Object.assign({}, params)
            : this.getMergedParams(params);

        return this.getData(mergedParams);
    }

    public getDefaultFileName(): string {
        return 'export.csv';
    }

    public getDefaultFileExtension(): string {
        return 'csv';
    }

    public createSerializingSession(params?: CsvExportParams): CsvSerializingSession {
        const { columnModel, valueService, gridOptionsWrapper } = this;
        const {
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
            suppressQuotes,
            columnSeparator
        } = params!;

        return new CsvSerializingSession({
            columnModel: columnModel,
            valueService,
            gridOptionsWrapper,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ','
        });
    }

    public isExportSuppressed(): boolean {
        return this.gridOptionsWrapper.isSuppressCsvExport();
    }
}
