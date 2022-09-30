import { ExportParams } from "../main";
import { BaseCreatorBeans, GridSerializingSession } from "./interfaces";
export declare abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {
    private beans;
    protected setBeans(beans: BaseCreatorBeans): void;
    abstract export(userParams?: P): string;
    protected abstract getMergedParams(params?: P): P;
    protected getFileName(fileName?: string): string;
    protected getData(params: P): string;
    abstract createSerializingSession(params?: P): S;
    abstract getDefaultFileName(): string;
    abstract getDefaultFileExtension(): string;
    abstract isExportSuppressed(): boolean;
}
