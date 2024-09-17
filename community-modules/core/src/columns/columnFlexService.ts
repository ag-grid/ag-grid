import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import { _removeFromUnorderedArray } from '../utils/array';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import type { VisibleColsService } from './visibleColsService';

export class ColumnFlexService extends BeanStub implements NamedBean {
    beanName = 'columnFlexService' as const;

    private eventDispatcher: ColumnEventDispatcher;
    private visibleColsService: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.eventDispatcher = beans.columnEventDispatcher;
        this.visibleColsService = beans.visibleColsService;
    }

    private flexViewportWidth: number;

    public refreshFlexedColumns(
        params: {
            resizingCols?: AgColumn[];
            skipSetLeft?: boolean;
            viewportWidth?: number;
            source?: ColumnEventType;
            fireResizedEvent?: boolean;
            updateBodyWidths?: boolean;
        } = {}
    ): AgColumn[] {
        const source = params.source ? params.source : 'flex';

        if (params.viewportWidth != null) {
            this.flexViewportWidth = params.viewportWidth;
        }

        if (!this.flexViewportWidth) {
            return [];
        }

        // If the grid has left-over space, divide it between flexing columns in proportion to their flex value.
        // A "flexing column" is one that has a 'flex' value set and is not currently being constrained by its
        // minWidth or maxWidth rules.

        const displayedCenterCols = this.visibleColsService.centerCols;

        let flexAfterDisplayIndex = -1;
        if (params.resizingCols) {
            const allResizingCols = new Set(params.resizingCols);
            // find the last resizing col, as only cols after this one are affected by the resizing
            for (let i = displayedCenterCols.length - 1; i >= 0; i--) {
                if (allResizingCols.has(displayedCenterCols[i])) {
                    flexAfterDisplayIndex = i;
                    break;
                }
            }
        }

        // the width of all of the columns for which the width has been determined
        let knownColumnsWidth = 0;

        let flexingColumns: AgColumn[] = [];

        // store the minimum width of all the flex columns, so we can determine if flex is even possible more quickly
        let minimumFlexedWidth = 0;
        let totalFlex = 0;
        for (let i = 0; i < displayedCenterCols.length; i++) {
            const isFlex = displayedCenterCols[i].getFlex() && i > flexAfterDisplayIndex;
            if (isFlex) {
                flexingColumns.push(displayedCenterCols[i]);
                totalFlex += displayedCenterCols[i].getFlex();
                minimumFlexedWidth += displayedCenterCols[i].getMinWidth();
            } else {
                knownColumnsWidth += displayedCenterCols[i].getActualWidth();
            }
        }

        if (!flexingColumns.length) {
            return [];
        }

        let changedColumns: AgColumn[] = [];

        // this is for performance to prevent trying to flex when unnecessary
        if (knownColumnsWidth + minimumFlexedWidth > this.flexViewportWidth) {
            // known columns and the minimum width of all the flex cols are too wide for viewport
            // so don't flex
            flexingColumns.forEach((col) => col.setActualWidth(col.getMinWidth(), source));

            // No columns should flex, but all have been changed. Swap arrays so events fire properly.
            // Expensive logic won't execute as flex columns is empty.
            changedColumns = flexingColumns;
            flexingColumns = [];
        }

        const flexingColumnSizes: number[] = [];
        let spaceForFlexingColumns: number;

        outer: while (true) {
            spaceForFlexingColumns = this.flexViewportWidth - knownColumnsWidth;
            const spacePerFlex = spaceForFlexingColumns / totalFlex;
            for (let i = 0; i < flexingColumns.length; i++) {
                const col = flexingColumns[i];
                const widthByFlexRule = spacePerFlex * col.getFlex();
                let constrainedWidth = 0;

                const minWidth = col.getMinWidth();
                const maxWidth = col.getMaxWidth();

                if (widthByFlexRule < minWidth) {
                    constrainedWidth = minWidth;
                } else if (widthByFlexRule > maxWidth) {
                    constrainedWidth = maxWidth;
                }

                if (constrainedWidth) {
                    // This column is not in fact flexing as it is being constrained to a specific size
                    // so remove it from the list of flexing columns and start again
                    col.setActualWidth(constrainedWidth, source);
                    _removeFromUnorderedArray(flexingColumns, col);
                    totalFlex -= col.getFlex();
                    changedColumns.push(col);
                    knownColumnsWidth += col.getActualWidth();
                    continue outer;
                }

                flexingColumnSizes[i] = Math.floor(widthByFlexRule);
            }
            break;
        }

        let remainingSpace = spaceForFlexingColumns;
        flexingColumns.forEach((col, i) => {
            const size =
                i < flexingColumns.length - 1
                    ? Math.min(flexingColumnSizes[i], remainingSpace)
                    : // ensure flex columns fill available width by growing the last column to fit available space if there is more available
                      Math.max(flexingColumnSizes[i], remainingSpace);
            col.setActualWidth(size, source);
            changedColumns.push(col);
            remainingSpace -= flexingColumnSizes[i];
        });

        if (!params.skipSetLeft) {
            this.visibleColsService.setLeftValues(source);
        }

        if (params.updateBodyWidths) {
            this.visibleColsService.updateBodyWidths();
        }

        if (params.fireResizedEvent) {
            this.eventDispatcher.columnResized(changedColumns, true, source, flexingColumns);
        }

        return flexingColumns;
    }
}
