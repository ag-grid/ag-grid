import { BeanStub } from '../context/beanStub';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { ExportParams } from '../interfaces/exportParams';
import type { GridSerializingSession } from './iGridSerializer';

export type ExportSource = 'api' | 'contextMenu';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> extends BeanStub {
    protected abstract export(userParams?: P, source?: ExportSource): void;

    protected abstract getMergedParams(params?: P, source?: ExportSource): P;

    protected mergeDefaultParams(
        staticParams: P | undefined,
        callback: ((p: { source: ExportSource }) => P) | undefined,
        source: ExportSource
    ): P | undefined {
        return callback ? ({ ...staticParams, ...callback({ source }) } as P) : staticParams;
    }

    protected getFileName(fileName?: string): string {
        const extension = this.getDefaultFileExtension();

        if (!fileName?.length) {
            fileName = this.getDefaultFileName();
        }

        return fileName.includes('.') ? fileName : `${fileName}.${extension}`;
    }

    /** Resolve the configured file name (string or getter) to a complete file name with extension. */
    protected resolveFileName(mergedParams: P): string {
        const { fileName } = mergedParams;
        const providedFileName =
            typeof fileName === 'function' ? fileName(_addGridCommonParams(this.gos, {})) : fileName;

        return this.getFileName(providedFileName);
    }

    /** Run an export function, showing a transient export overlay when the overlay service is present. */
    protected runExport(exportFunc: () => void): void {
        const { overlays } = this.beans;
        if (overlays) {
            overlays.showExportOverlay(exportFunc);
        } else {
            exportFunc();
        }
    }

    protected getData(params: P): string {
        return this.beans.gridSerializer!.serialize(this.createSerializingSession(params), params);
    }

    public getDefaultFileName(): string {
        return `export.${this.getDefaultFileExtension()}`;
    }

    /** private methods */
    public _exportWithSource(source: ExportSource, params?: P): void {
        this.export(params, source);
    }

    public abstract createSerializingSession(params?: P): S;
    public abstract getDefaultFileExtension(): string;
    public abstract isExportSuppressed(): boolean;
}
