import type { AgColumn } from '../entities/agColumn';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface GroupValueResult {
    displayedNode: IRowNode;
    value: any;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IShowRowGroupColsValueService {
    getGroupValue(node: IRowNode, column: AgColumn | undefined, ignoreAggData: boolean): GroupValueResult | null;
    formatAndPrefixGroupColValue(groupValue: GroupValueResult, column?: AgColumn, exporting?: boolean): string | null;
    getDisplayedNode(node: IRowNode, column: AgColumn, onlyHideOpenParents?: boolean): IRowNode | undefined;
}
