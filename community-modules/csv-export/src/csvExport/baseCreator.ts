import { BaseExportParams, ExportParams, _ } from "@ag-grid-community/core";
import { BaseCreatorBeans, GridSerializingSession } from "./interfaces";

export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {

    private beans: BaseCreatorBeans;

    protected setBeans(beans: BaseCreatorBeans) {
        this.beans = beans;
    }

    public export(userParams?: P): string {
        if (this.isExportSuppressed()) {
            console.warn(`ag-grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }
        const {mergedParams, data} = this.getMergedParamsAndData(userParams);

        const fileNamePresent = mergedParams && mergedParams.fileName && mergedParams.fileName.length !== 0;
        let fileName = fileNamePresent ? mergedParams.fileName : this.getDefaultFileName();

        if (fileName!.indexOf(".") === -1) {
            fileName = fileName + "." + this.getDefaultFileExtension();
        }

        this.beans.downloader.download(fileName!, this.packageFile(data));

        return data;
    }

    public getData(params?: P): string {
        return this.getMergedParamsAndData(params).data;
    }

    private getMergedParamsAndData(userParams?: P): { mergedParams: P, data: string } {
        const mergedParams = this.mergeDefaultParams(userParams);
        const data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);

        return {mergedParams, data};
    }

    private mergeDefaultParams(userParams?: P): P {
        const baseParams: BaseExportParams | undefined = this.beans.gridOptionsWrapper.getDefaultExportParams();
        const params: P = {} as any;
        _.assign(params, baseParams);
        _.assign(params, userParams);
        return params;
    }

    protected packageFile(data: string): Blob {
        return new Blob(["\ufeff", data], {
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