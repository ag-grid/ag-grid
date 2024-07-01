import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { GetCellValueParams } from './gridApi';
export declare function expireValueCache(beans: BeanCollection): void;
/** @deprecated v31.1 */
export declare function getValue<TValue = any>(beans: BeanCollection, colKey: string | Column<TValue>, rowNode: IRowNode): TValue | null | undefined;
export declare function getCellValue<TValue = any>(beans: BeanCollection, params: GetCellValueParams<TValue>): any;
