import type {
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    CsvCustomContent,
    CsvExportParams,
    FuncColsService,
    ICsvCreator,
    ValueService,
} from '@ag-grid-community/core';
import type { BeanName } from '@ag-grid-community/core';

import { BaseCreator } from './baseCreator';
import { Downloader } from './downloader';
import type { GridSerializer } from './gridSerializer';
import { CsvSerializingSession } from './sessions/csvSerializingSession';

export class CsvCreator
    extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams>
    implements ICsvCreator
{
    static BeanName: BeanName = 'csvCreator';

    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private funcColsService: FuncColsService;
    private valueService: ValueService;
    private gridSerializer: GridSerializer;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.funcColsService = beans.funcColsService;
        this.valueService = beans.valueService;
        this.gridSerializer = beans.gridSerializer;
    }

    public postConstruct(): void {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gos: this.gos,
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

        const packagedFile = new Blob(['\ufeff', data], { type: 'text/plain' });

        const fileName =
            typeof mergedParams.fileName === 'function'
                ? mergedParams.fileName(this.gos.getGridCommonParams())
                : mergedParams.fileName;

        Downloader.download(this.getFileName(fileName), packagedFile);
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        this.export(params);
    }

    public getDataAsCsv(params?: CsvExportParams, skipDefaultParams = false): string {
        const mergedParams = skipDefaultParams ? Object.assign({}, params) : this.getMergedParams(params);

        return this.getData(mergedParams);
    }

    public getDefaultFileExtension(): string {
        return 'csv';
    }

    public createSerializingSession(params?: CsvExportParams): CsvSerializingSession {
        const { columnModel, columnNameService, funcColsService, valueService, gos } = this;
        const {
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
            suppressQuotes,
            columnSeparator,
        } = params!;

        return new CsvSerializingSession({
            columnModel,
            columnNameService,
            funcColsService,
            valueService,
            gos,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ',',
        });
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressCsvExport');
    }
}
