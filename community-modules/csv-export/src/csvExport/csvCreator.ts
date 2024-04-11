import {
    Autowired,
    Bean,
    ColumnModel,
    CsvCustomContent,
    CsvExportParams,
    GridOptionsService,
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
    @Autowired('gridOptionsService') gos: GridOptionsService;

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gos: this.gos
        });
    }

    protected getMergedParams(params?: CsvExportParams): CsvExportParams {
        const baseParams = this.gos.get('defaultCsvExportParams');
        return Object.assign({}, baseParams, params);
    }

    protected export(userParams?: CsvExportParams): void {
        if (this.isExportSuppressed()) {
            console.warn(`AG Grid: Export cancelled. Export is not allowed as per your configuration.`);
            return;
        }

        const mergedParams = this.getMergedParams(userParams);
        const data = this.getData(mergedParams);

        const packagedFile = new Blob(["\ufeff", data], { type: 'text/plain' });

        const fileName = typeof mergedParams.fileName === 'function'
            ? mergedParams.fileName(this.gos.getGridCommonParams())
            : mergedParams.fileName;

        Downloader.download(this.getFileName(fileName), packagedFile);
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        this.export(params);
    }

    public getDataAsCsv(params?: CsvExportParams, skipDefaultParams = false): string {
        const mergedParams = skipDefaultParams
            ? Object.assign({}, params)
            : this.getMergedParams(params);

        return this.getData(mergedParams);
    }

    public getDefaultFileExtension(): string {
        return 'csv';
    }

    public createSerializingSession(params?: CsvExportParams): CsvSerializingSession {
        const { columnModel, valueService, gos } = this;
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
            gos,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ','
        });
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressCsvExport');
    }
}
