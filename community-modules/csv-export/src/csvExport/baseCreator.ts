import { ExportParams, _ } from "@ag-grid-community/core";
import { BaseCreatorBeans, GridSerializingSession } from "./interfaces";

export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {

    private beans: BaseCreatorBeans;

    protected setBeans(beans: BaseCreatorBeans) {
        this.beans = beans;
    }

    public abstract export(userParams?: P): string;
    protected abstract getDefaultExportParams(): P | undefined;

    protected getFileName(fileName?: string): string {
        const extension = this.getDefaultFileExtension();

        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }

        return fileName.indexOf('.') === -1 ? `${fileName}.${extension}` : fileName;
    }

    protected getMergedParamsAndData(userParams?: P): { mergedParams: P, data: string } {
        const mergedParams = this.mergeDefaultParams(userParams);
        const data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);

        return { mergedParams, data };
    }

    private mergeDefaultParams(userParams?: P): P {
        const baseParams: P | undefined = this.getDefaultExportParams();
        const params: P = {} as P;
        Object.assign(params, baseParams);
        Object.assign(params, userParams);

        return params;
    }

    public abstract createSerializingSession(params?: P): S;
    public abstract getMimeType(): string;
    public abstract getDefaultFileName(): string;
    public abstract getDefaultFileExtension(): string;
    public abstract isExportSuppressed(): boolean;
}