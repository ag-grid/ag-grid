import { _downloadFile } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import type { ExportEventSource } from '../events';
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
        return { ...baseParams, ...params };
    }

    protected export(userParams: CsvExportParams | undefined, source: ExportEventSource): Promise<void> {
        if (this.isExportSuppressed()) {
            // Export cancelled.
            this.warn(51);
            return Promise.resolve();
        }

        return this.runExport('csv', source, () => {
            const mergedParams = this.getMergedParams(userParams);
            const data = this.getData(mergedParams);

            const packagedFile = new Blob(['\ufeff', data], { type: 'text/plain' });

            const fileName = this.resolveFileName(mergedParams);
            _downloadFile(fileName, packagedFile);
            return fileName;
        });
    }

    public exportDataAsCsv(params?: CsvExportParams, source: ExportEventSource = 'api'): Promise<void> {
        return this.export(params, source);
    }

    public getDataAsCsv(params?: CsvExportParams, skipDefaultParams = false): string {
        const mergedParams = skipDefaultParams ? { ...params } : this.getMergedParams(params);

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
            sanitizeFormulas,
            valueFrom,
            transformValues,
        } = params!;

        return new CsvSerializingSession({
            colModel,
            colNames,
            valueSvc,
            gos,
            log,
            processCellCallback: processCellCallback ?? undefined,
            processHeaderCallback: processHeaderCallback ?? undefined,
            processGroupHeaderCallback: processGroupHeaderCallback ?? undefined,
            processRowGroupCallback: processRowGroupCallback ?? undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ',',
            sanitizeFormulas: sanitizeFormulas || false,
            rowGroupColsSvc,
            valueFrom,
            transformValues,
        });
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressCsvExport');
    }
}
