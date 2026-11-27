import { BeanStub } from '../context/beanStub';
import type { ExportEventFormat, ExportEventSource } from '../events';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { ExportParams } from '../interfaces/exportParams';
import type { GridSerializingSession } from './iGridSerializer';

type ExportFunc = () => string | undefined | Promise<string | undefined>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> extends BeanStub {
    protected abstract export(userParams: P | undefined, source: ExportEventSource): Promise<void>;

    protected abstract getMergedParams(params?: P): P;

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

    /**
     * Run an export function, showing a transient export overlay when the overlay service is present.
     * `exportFunc` returns the name of the downloaded file, if there was one.
     */
    protected runExport(format: ExportEventFormat, source: ExportEventSource, exportFunc: ExportFunc): Promise<void> {
        const tracked = this.trackExport(format, source, exportFunc);
        const { overlays } = this.beans;
        return overlays ? overlays.showExportOverlay(tracked) : tracked();
    }

    /**
     * Dispatches `exportStart` now, and returns a function that runs the export then dispatches `exportEnd`.
     * A synchronous throw from `exportFunc` is rethrown synchronously rather than turned into a rejection.
     */
    protected trackExport(
        format: ExportEventFormat,
        source: ExportEventSource,
        exportFunc: ExportFunc
    ): () => Promise<void> {
        const { eventSvc } = this.beans;
        eventSvc.dispatchEvent({ type: 'exportStart', format, source });

        const end = (success: boolean, fileName?: string) =>
            eventSvc.dispatchEvent({ type: 'exportEnd', format, source, success, fileName });

        return () => {
            let result: ReturnType<ExportFunc>;
            try {
                result = exportFunc();
            } catch (error) {
                end(false);
                throw error;
            }

            return Promise.resolve(result).then(
                (fileName) => end(fileName != null, fileName),
                (error) => {
                    end(false);
                    throw error;
                }
            );
        };
    }

    protected getData(params: P): string {
        return this.beans.gridSerializer!.serialize(this.createSerializingSession(params), params);
    }

    public getDefaultFileName(): string {
        return `export.${this.getDefaultFileExtension()}`;
    }

    public abstract createSerializingSession(params?: P): S;
    public abstract getDefaultFileExtension(): string;
    public abstract isExportSuppressed(): boolean;
}
