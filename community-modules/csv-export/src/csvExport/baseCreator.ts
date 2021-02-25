import { BaseExportParams, ExportParams, FileExportParams, _ } from "@ag-grid-community/core";
import { BaseCreatorBeans, GridSerializingSession } from "./interfaces";

export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>, Q extends FileExportParams> {

    private beans: BaseCreatorBeans;

    protected setBeans(beans: BaseCreatorBeans) {
        this.beans = beans;
    }

    public abstract export(userParams?: P & Q): string;

    protected getFileName(fileName?: string): string {
        const extension = this.getDefaultFileExtension();

        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }

        return fileName.indexOf('.') === -1 ? `${fileName}.${extension}` : fileName;
    }

    protected getMergedParamsAndData(userParams?: P & Q): { mergedParams: P & Q, data: string } {
        const mergedParams = this.mergeDefaultParams(userParams);
        const data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);

        return { mergedParams, data };
    }

    private mergeDefaultParams(userParams?: P & Q): P & Q {
        const baseParams: BaseExportParams | undefined = this.beans.gridOptionsWrapper.getDefaultExportParams();
        const params: P & Q = {} as any;
        _.assign(params, baseParams);
        _.assign(params, userParams);

        return params;
    }

    protected packageFile(params: Q): Blob {
        return new Blob(["\ufeff", params.data[0]], {
            // @ts-ignore
            type: window.navigator.msSaveOrOpenBlob ? this.getMimeType() : 'octet/stream'
        });
    }

    public abstract createSerializingSession(params?: P): S;
    public abstract getMimeType(): string;
    public abstract getDefaultFileName(): string;
    public abstract getDefaultFileExtension(): string;
    public abstract isExportSuppressed(): boolean;
}