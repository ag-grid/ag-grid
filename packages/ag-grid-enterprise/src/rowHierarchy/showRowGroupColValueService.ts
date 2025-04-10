import type { AgColumn, IRowNode, IShowRowGroupColsValueService, NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

/**
 * Containers helper functions specific to row group col values.
 */
export class ShowRowGroupColValueService extends BeanStub implements NamedBean, IShowRowGroupColsValueService {
    beanName = 'showRowGroupColValueSvc' as const;

    /**
     * Get the value for format in the group column, also returns the displayedNode from which the value was
     * taken in cases of groupHideOpenParents and showOpenedGroup.
     */
    public getGroupValue(node: IRowNode, column?: AgColumn): { displayedNode: IRowNode; value: any } | null {
        // full width row
        if (!column) {
            if (!node.group) {
                return null;
            }
            return { displayedNode: node, value: (node as RowNode).groupValue };
        }

        const valueSvc = this.beans.valueSvc;
        const rowGroupColId = column.colDef.showRowGroup;
        if (!rowGroupColId) {
            return null;
        }

        // grand total row cannot have value in group column
        if (node.level === -1 && node.footer) {
            return { displayedNode: node, value: null };
        }

        // when using multiple columns, special handling
        if (typeof rowGroupColId === 'string') {
            const colRowGroupIndex = this.beans.rowGroupColsSvc?.getColumnIndex(rowGroupColId) ?? -1;
            if (colRowGroupIndex > node.level) {
                return null;
            }

            // groupHideOpenParents > cell value > showOpenedGroup
            const hideOpenParentsNode = this.getDisplayedNode(node, column, true);
            if (hideOpenParentsNode) {
                return {
                    displayedNode: hideOpenParentsNode,
                    value: valueSvc.getValue(column, hideOpenParentsNode),
                };
            }
        }

        // cell value > showOpenedGroup
        const value = valueSvc.getValue(column, node);
        if (value == null) {
            // showOpenedGroup
            const displayedNode = this.getDisplayedNode(node, column);
            if (displayedNode) {
                return {
                    displayedNode,
                    value: valueSvc.getValue(column, displayedNode),
                };
            }
        }

        return {
            displayedNode: node,
            value,
        };
    }

    /**
     * Formats a group col value, and prefixes it with the "Total" prefix if applicable
     */
    public formatAndPrefixGroupColValue(
        groupValue: { displayedNode: IRowNode; value: any },
        column?: AgColumn,
        exporting: boolean = false
    ): string | null {
        const formattedValue = this.formatGroupColValue(groupValue, column, exporting);

        const { value, displayedNode } = groupValue;
        const footerSvc = this.beans.footerSvc;
        if (footerSvc?.doesCellShowTotalPrefix(displayedNode, column)) {
            const footerValue = footerSvc.applyTotalPrefix(value, formattedValue, displayedNode, column as AgColumn);
            return footerValue;
        }

        // grand total row, non-first group column cells should be empty and not formatted.
        if (displayedNode.footer && displayedNode.level === -1) {
            return null;
        }

        return formattedValue;
    }

    /**
     * Formats the group col value using the underlying column's value formatter
     */
    private formatGroupColValue(
        groupValue: { displayedNode: IRowNode; value: any },
        column?: AgColumn,
        exporting: boolean = false
    ): string | null {
        const valueSvc = this.beans.valueSvc;
        const { displayedNode, value } = groupValue;

        const groupedCol = displayedNode.rowGroupColumn as AgColumn;
        const isShowingGroupCell = groupedCol && column?.isRowGroupDisplayed(groupedCol.colId);
        // for grouped cells; try to use the underlying col formatter
        if (isShowingGroupCell) {
            // if exporting, check if we should use the value formatter for export
            if (exporting && groupedCol.colDef.useValueFormatterForExport === false) {
                return null;
            }

            // if cell value is empty, populate with (Blanks)
            const formattedValue = valueSvc.formatValue(groupedCol, displayedNode, value);
            if (formattedValue == null && displayedNode.key === '') {
                const localeTextFunc = this.getLocaleTextFunc();
                return localeTextFunc('blanks', '(Blanks)');
            }

            return formattedValue;
        }

        // if no column (full width row) and not full width group, return null
        // if this is not a leaf cell in group col, don't format using auto col formatter
        if (!column || displayedNode.group) {
            return null;
        }

        // if exporting, check if we should use the value formatter for export
        if (exporting && column.colDef.useValueFormatterForExport === false) {
            return null;
        }

        return valueSvc.formatValue(column, displayedNode, value);
    }

    /**
     * Checks if the node has a value to inherit from the parent node for display in the given column
     *
     * This is used when [groupHideOpenParents] or [showOpenedGroup] are enabled
     *
     * @param node node to check for preferential nodes to display
     * @param column column to get the displayed node for
     * @returns a parent node of node to display the value from, or undefined if no value will be inherited
     */
    public getDisplayedNode(node: IRowNode, column: AgColumn, onlyHideOpenParents = false): IRowNode | undefined {
        const gos = this.gos;
        const isGroupHideOpenParents = gos.get('groupHideOpenParents');
        const isShowOpenedGroupValue = gos.get('showOpenedGroup') && !onlyHideOpenParents;

        // don't traverse tree if neither starts enabled
        if (!isGroupHideOpenParents && !isShowOpenedGroupValue) {
            return undefined;
        }

        const showRowGroup = column.colDef.showRowGroup;
        // single auto col can only showOpenedGroup for leaf rows
        if (showRowGroup === true) {
            if (node.group) {
                return undefined;
            }
            return node.parent ?? undefined;
        }

        let pointer: IRowNode | null = node;
        while (pointer && pointer.rowGroupColumn?.getId() != showRowGroup) {
            const isFirstChild = pointer === pointer.parent?.childrenAfterSort?.[0];
            if (!isShowOpenedGroupValue && !isFirstChild) {
                // if not first child and not showOpenedGroup then groupHideOpenParents doesn't
                // display the parent value
                return undefined;
            }
            pointer = pointer.parent;
        }

        if (pointer === node) {
            return undefined;
        }

        return pointer ?? undefined;
    }
}
