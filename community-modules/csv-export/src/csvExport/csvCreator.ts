import {
    Autowired,
    Bean,
    ColumnController,
    CsvCustomContent,
    CsvExportParams,
    GridOptionsWrapper,
    ICsvCreator,
    PostConstruct,
    FileExportParams,
    ValueService
} from "@ag-grid-community/core";
import { BaseCreator } from "./baseCreator";
import { Downloader } from "./downloader";
import { GridSerializer } from "./gridSerializer";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";

@Bean('csvCreator')
export class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams, FileExportParams> implements ICsvCreator {

    @Autowired('columnController') private columnController: ColumnController;
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

    public export(userParams?: CsvExportParams & FileExportParams): string {
        if (this.isExportSuppressed()) {
            console.warn(`ag-grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }

        const { mergedParams, data } = this.getMergedParamsAndData(userParams);

        Downloader.download(this.getFileName(mergedParams.fileName), this.packageFile({ data: [data] }));

        return data;
    }

    public exportDataAsCsv(params?: CsvExportParams & FileExportParams): string {
        return this.export(params);
    }

    public getDataAsCsv(params?: CsvExportParams & FileExportParams): string {
        return this.getMergedParamsAndData(params).data;
    }

    public getMimeType(): string {
        return 'text/csv;charset=utf-8;';
    }

    public getDefaultFileName(): string {
        return 'export.csv';
    }

    public getDefaultFileExtension(): string {
        return 'csv';
    }

    public createSerializingSession(params?: CsvExportParams): CsvSerializingSession {
        const { columnController, valueService, gridOptionsWrapper } = this;
        const {
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
            suppressQuotes,
            columnSeparator
        } = params!;

        return new CsvSerializingSession({
            columnController,
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
