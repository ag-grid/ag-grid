import type { NamedBean } from '../context/bean';
import { BaseCreator } from '../export/baseCreator';
import { _downloadFile } from '../export/downloader';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { CsvCustomContent, CsvExportParams } from '../interfaces/exportParams';
import type { ICsvCreator } from '../interfaces/iCsvCreator';
import { _warn } from '../validation/logging';
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
            _warn(51);
            return;
        }

        const exportFunc = () => {
            const mergedParams = this.getMergedParams(userParams);
            const data = this.getData(mergedParams);

            const packagedFile = new Blob(['\ufeff', data], { type: 'text/plain' });

            const fileNameParams = mergedParams.fileName;
            const fileName =
                typeof fileNameParams === 'function'
                    ? fileNameParams(_addGridCommonParams(this.gos, {}))
                    : fileNameParams;

            _downloadFile(this.getFileName(fileName), packagedFile);
        };
        const { overlays } = this.beans;
        if (overlays) {
            overlays.showExportOverlay(exportFunc);
        } else {
            exportFunc();
        }
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
        const { colModel, colNames, rowGroupColsSvc, valueSvc, gos } = this.beans;
        const {
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
            suppressQuotes,
            columnSeparator,
        } = params!;

        return new CsvSerializingSession({
            colModel,
            colNames,
            valueSvc,
            gos,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ',',
            rowGroupColsSvc,
        });
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressCsvExport');
    }
}
