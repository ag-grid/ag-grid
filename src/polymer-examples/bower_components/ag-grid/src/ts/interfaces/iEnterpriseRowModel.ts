
import {IRowModel} from "./iRowModel";

export interface IEnterpriseRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    getBlockState(): any;
}
