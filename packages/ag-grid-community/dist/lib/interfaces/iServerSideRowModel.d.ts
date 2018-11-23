// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IRowModel } from "./iRowModel";
export interface IServerSideRowModel extends IRowModel {
    purgeCache(route?: string[]): void;
    addToCache(route: string[], items: any[], index: number): void;
    removeFromCache(route: string[], items: any[]): void;
    getBlockState(): any;
}
//# sourceMappingURL=iServerSideRowModel.d.ts.map