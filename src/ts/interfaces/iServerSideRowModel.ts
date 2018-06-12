
import {IRowModel} from "./iRowModel";

export interface IServerSideRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    addToCache(route: string[], items: any[], index: number): void;
    removeFromCache(route: string[], items: any[]): void;
    getBlockState(): any;
}