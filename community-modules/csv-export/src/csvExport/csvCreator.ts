import {
    Autowired,
    Bean,
    ColumnController,
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

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;

    @Autowired('downloader') private downloader: Downloader;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            downloader: this.downloader,
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    }

    public exportDataAsCsv(params?: CsvExportParams): string {
        return this.export(params);
    }

    public getDataAsCsv(params?: CsvExportParams): string {
        return this.getData(params);
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
