import type { IRowModel } from './iRowModel';

export interface IViewportRowModel extends IRowModel {
    resetRowHeights(): void;
}
