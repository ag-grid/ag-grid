import type { BeanCollection, DetailGridInfo } from 'ag-grid-community';
export declare function addDetailGridInfo(beans: BeanCollection, id: string, gridInfo: DetailGridInfo): void;
export declare function removeDetailGridInfo(beans: BeanCollection, id: string): void;
export declare function getDetailGridInfo(beans: BeanCollection, id: string): DetailGridInfo | undefined;
export declare function forEachDetailGridInfo(beans: BeanCollection, callback: (gridInfo: DetailGridInfo, index: number) => void): void;
