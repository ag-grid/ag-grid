import { _downloadFile } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BaseCreator } from '../export/baseCreator';
import type { CsvCustomContent, CsvExportParams } from '../interfaces/exportParams';
import type { ICsvCreator } from '../interfaces/iCsvCreator';
import { CsvSerializingSession } from './csvSerializingSession';

export class CsvCreator
    extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams>
    implements NamedBean, ICsvCreator
{
    beanName = 'csvCreator' as const;

    protected getMergedParams(params?: CsvExportParams): CsvExportParams {
        const baseParams = this.gos.get('defaultCsvExportParams');
        return Object.assign({}, baseParams, params);
    }

    protected export(userParams?: CsvExportParams): void {
        if (this.isExportSuppressed()) {
            // Export cancelled.
            this.warn(51);
            return;
        }

        this.runExport(() => {
            const mergedParams = this.getMergedParams(userParams);
            const data = this.getData(mergedParams);

            const packagedFile = new Blob(['\ufeff', data], { type: 'text/plain' });

            _downloadFile(this.resolveFileName(mergedParams), packagedFile);
        });
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
        const { colModel, colNames, rowGroupColsSvc, valueSvc, gos, log } = this.beans;
        const {
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
            suppressQuotes,
            columnSeparator,
            valueFrom,
            transformValues,
        } = params!;

        return new CsvSerializingSession({
            colModel,
            colNames,
            valueSvc,
            gos,
            log,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ',',
            rowGroupColsSvc,
            valueFrom,
            transformValues,
        });
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressCsvExport');
    }
}
