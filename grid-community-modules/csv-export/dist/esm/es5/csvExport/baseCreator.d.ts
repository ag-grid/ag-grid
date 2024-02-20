import { ExportParams } from "@ag-grid-community/core";
import { BaseCreatorBeans, GridSerializingSession } from "./interfaces";
export declare abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {
    private beans;
    protected setBeans(beans: BaseCreatorBeans): void;
    protected abstract export(userParams?: P, compress?: boolean): void;
    protected abstract getMergedParams(params?: P): P;
    protected getFileName(fileName?: string): string;
    protected getData(params: P): string;
    getDefaultFileName(): string;
    abstract createSerializingSession(params?: P): S;
    abstract getDefaultFileExtension(): string;
    abstract isExportSuppressed(): boolean;
}
