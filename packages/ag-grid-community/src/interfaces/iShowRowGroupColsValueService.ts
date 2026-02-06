import type { AgColumn } from '../entities/agColumn';
import type { IRowNode } from './iRowNode';

export interface GroupValueResult {
    displayedNode: IRowNode;
    value: any;
}

export interface IShowRowGroupColsValueService {
    getGroupValue(node: IRowNode, column: AgColumn | undefined, ignoreAggData: boolean): GroupValueResult | null;
    formatAndPrefixGroupColValue(groupValue: GroupValueResult, column?: AgColumn, exporting?: boolean): string | null;
    getDisplayedNode(node: IRowNode, column: AgColumn, onlyHideOpenParents?: boolean): IRowNode | undefined;
}
