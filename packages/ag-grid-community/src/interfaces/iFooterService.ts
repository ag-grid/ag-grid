import type { RowNode } from '../entities/rowNode';
import type { Column } from './iColumn';
import type { VerticalSection } from './iGridSection';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IFooterService {
    addTotalRows(
        startIndex: number,
        node: RowNode,
        callback: (node: RowNode, index: number) => void,
        includeFooterNodes: boolean,
        isRootNode: boolean,
        position: VerticalSection
    ): number;

    getTopDisplayIndex(
        rowsToDisplay: RowNode[],
        topLevelIndex: number,
        childrenAfterSort: RowNode[],
        getDefaultIndex: (adjustedIndex: number) => number
    ): number;

    getTotalValue(value: any): string;
    doesCellShowTotalPrefix(node: IRowNode, col?: Column): boolean;
    applyTotalPrefix(value: any, formattedValue: string | null, node: IRowNode, col: Column): string;
}
