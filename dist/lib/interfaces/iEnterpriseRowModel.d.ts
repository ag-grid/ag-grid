// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IRowModel } from "./iRowModel";
export interface IEnterpriseRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    getBlockState(): any;
}
