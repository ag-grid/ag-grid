import type { ExportParams } from '@ag-grid-community/core';

import type { BaseCreatorBeans, GridSerializingSession } from './interfaces';

export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {
    private beans: BaseCreatorBeans;

    protected setBeans(beans: BaseCreatorBeans) {
        this.beans = beans;
    }

    protected abstract export(userParams?: P, compress?: boolean): void;

    protected abstract getMergedParams(params?: P): P;

    protected getFileName(fileName?: string): string {
        const extension = this.getDefaultFileExtension();

        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }

        return fileName.indexOf('.') === -1 ? `${fileName}.${extension}` : fileName;
    }

    protected getData(params: P): string {
        const serializingSession = this.createSerializingSession(params);
        return this.beans.gridSerializer.serialize(serializingSession, params);
    }

    public getDefaultFileName(): string {
        return `export.${this.getDefaultFileExtension()}`;
    }

    public abstract createSerializingSession(params?: P): S;
    public abstract getDefaultFileExtension(): string;
    public abstract isExportSuppressed(): boolean;
}
