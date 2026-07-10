import type {
    Column,
    GridOptions,
    IFooterService,
    IRowNode,
    NamedBean,
    RowNode,
    VerticalSection,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _getGrandTotalRow, _getGroupTotalRowCallback } from 'ag-grid-community';

import { _createRowNodeFooter } from './footerUtils';

export class FooterService extends BeanStub implements NamedBean, IFooterService {
    beanName = 'footerSvc' as const;

    public addTotalRows(
        startIndex: number,
        node: RowNode,
        callback: (node: RowNode, index: number) => void,
        includeFooterNodes: boolean,
        isRootNode: boolean,
        position: VerticalSection
    ): number {
        let index = startIndex;

        if (isRootNode) {
            const grandTotal = includeFooterNodes && _getGrandTotalRow(this.gos);
            if (_positionMatchesGrandTotalRow(position, grandTotal)) {
                callback(_createRowNodeFooter(node, this.beans), index++);
            }
            return index;
        }

        const isGroupIncludeFooter = _getGroupTotalRowCallback(this.gos);
        const groupTotal = includeFooterNodes && isGroupIncludeFooter({ node });
        if (groupTotal === position) {
            callback(_createRowNodeFooter(node, this.beans), index++);
        }
        return index;
    }

    public getTopDisplayIndex(
        rowsToDisplay: RowNode[],
        topLevelIndex: number,
        childrenAfterSort: RowNode[],
        getDefaultIndex: (adjustedIndex: number) => number
    ): number {
        let adjustedIndex = topLevelIndex;
        if (rowsToDisplay[0].footer) {
            // if footer is first displayed row and looking for first row, return footer
            if (topLevelIndex === 0) {
                return 0;
            }

            // if first row is footer, offset index to check sorted rows by 1
            adjustedIndex -= 1;
        }

        const lastRow = rowsToDisplay[rowsToDisplay.length - 1];
        const indexOutsideGroupBounds = adjustedIndex >= childrenAfterSort.length;
        // if last row is footer, and attempting to retrieve row of too high index, return footer row index
        if (lastRow.footer && indexOutsideGroupBounds) {
            return lastRow.rowIndex!;
        }

        return getDefaultIndex(adjustedIndex);
    }

    public doesCellShowTotalPrefix(node: IRowNode, col?: Column): boolean {
        if (!node.footer || !col?.getColDef().showRowGroup) {
            return false;
        }

        // if tree data and a footer, always include the footer prefix
        if (this.gos.get('treeData')) {
            return true;
        }

        // if grand total row footer, heading shown in first group column
        if (node.level === -1) {
            return this.beans.showRowGroupCols?.columns[0] === col;
        }

        // otherwise, show in relevant group column
        return !!node.rowGroupColumn && col?.isRowGroupDisplayed(node.rowGroupColumn.getId());
    }

    public applyTotalPrefix(value: any, formattedValue: string | null, node: IRowNode, column: Column): string {
        const totalValueGetter = column.getColDef().cellRendererParams?.totalValueGetter;
        if (totalValueGetter) {
            const valueGetterParams = _addGridCommonParams(this.gos, { column, node, value, formattedValue });
            const getterType = typeof totalValueGetter;
            if (getterType === 'function') {
                return totalValueGetter(valueGetterParams);
            }

            if (typeof totalValueGetter === 'string') {
                return this.beans.expressionSvc?.evaluate(totalValueGetter, valueGetterParams);
            }
            this.warn(179);
        }

        // grand total row only displays the 'Total' value
        if (node.level === -1) {
            return this.getLocaleTextFunc()('footerTotal', 'Total') + ' ';
        }

        return this.getTotalValue(formattedValue ?? value) ?? '';
    }

    public getTotalValue(value: any): string {
        return this.getLocaleTextFunc()('footerTotal', 'Total') + ' ' + (value ?? '');
    }
}

function _positionMatchesGrandTotalRow(
    position: VerticalSection,
    grandTotalRow: GridOptions['grandTotalRow'] | false
): boolean {
    switch (grandTotalRow) {
        case 'top':
        case 'pinnedTop':
            return position === 'top';
        case 'bottom':
        case 'pinnedBottom':
            return position === 'bottom';
        default:
            return false;
    }
}
