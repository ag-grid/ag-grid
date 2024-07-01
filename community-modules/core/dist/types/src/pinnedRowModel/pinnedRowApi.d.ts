import type { BeanCollection } from '../context/context';
import type { IRowNode } from '../interfaces/iRowNode';
export declare function getPinnedTopRowCount(beans: BeanCollection): number;
export declare function getPinnedBottomRowCount(beans: BeanCollection): number;
export declare function getPinnedTopRow(beans: BeanCollection, index: number): IRowNode | undefined;
export declare function getPinnedBottomRow(beans: BeanCollection, index: number): IRowNode | undefined;
