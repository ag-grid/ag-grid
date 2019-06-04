import { IRowModel } from "./iRowModel";

export interface IServerSideRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    getBlockState(): any;
    isLoading(): boolean;
}