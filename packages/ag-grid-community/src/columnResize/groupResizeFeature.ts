import { BeanStub } from '../context/beanStub';
import type { AgColumn, ColumnLane } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { edgeLeafColumn, getColGroupAfter } from '../entities/agColumnGroup';
import type { ColumnEventType } from '../events';
import type { IHeaderResizeFeature } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { IHeaderGroupCellComp } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { ColumnResizeSet } from './columnResizeService';

interface ColumnSizeAndRatios {
    columnsToResize: AgColumn[];
    resizeStartWidth: number;
    resizeRatios: number[];
    groupAfterColumns?: AgColumn[];
    groupAfterStartWidth?: number;
    groupAfterRatios?: number[];
}
export class GroupResizeFeature extends BeanStub implements IHeaderResizeFeature {
    private resizeCols?: AgColumn[];
    private resizeStartWidth: number;
    private resizeStartPinnedWidth: number;
    private resizeRatios?: number[];

    private resizeTakeFromCols?: AgColumn[];
    private resizeTakeFromStartWidth?: number;
    private resizeTakeFromRatios?: number[];

    constructor(
        private readonly comp: IHeaderGroupCellComp,
        private readonly eResize: HTMLElement,
        private readonly columnGroup: AgColumnGroup
    ) {
        super();
    }

    public postConstruct(): void {
        if (!this.columnGroup.isResizable()) {
            this.comp.setResizableDisplayed(false);
            return;
        }

        const { horizontalResizeSvc, gos, colAutosize } = this.beans;

        const finishedWithResizeFunc = horizontalResizeSvc!.addResizeBar({
            eResizeBar: this.eResize,
            isColumn: true,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true),
        });

        this.addDestroyFunc(finishedWithResizeFunc);

        if (!gos.get('suppressAutoSize') && colAutosize) {
            this.addDestroyFunc(
                colAutosize.addColumnGroupResize(this.eResize, this.columnGroup, () =>
                    this.resizeLeafColumnsToFit('uiColumnResized', true)
                )
            );
        }
    }

    private onResizeStart(shiftKey: boolean): void {
        const {
            columnsToResize,
            resizeStartWidth,
            resizeRatios,
            groupAfterColumns,
            groupAfterStartWidth,
            groupAfterRatios,
        } = this.getInitialValues(shiftKey);

        this.resizeCols = columnsToResize;
        this.resizeStartWidth = resizeStartWidth;
        this.resizeRatios = resizeRatios;

        this.resizeTakeFromCols = groupAfterColumns;
        this.resizeTakeFromStartWidth = groupAfterStartWidth;
        this.resizeTakeFromRatios = groupAfterRatios;
        this.resizeStartPinnedWidth = this.beans.pinnedCols?.getPinnedWidth() ?? 0;

        this.toggleColumnResizing(true);
    }

    public onResizing(finished: boolean, resizeAmount: any, source: ColumnEventType = 'uiColumnResized'): void {
        const resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        const width = this.resizeStartWidth + resizeAmountNormalised;

        this.resizeColumnsFromLocalValues(this.limitPinnedGrowth(width), source, finished);
    }

    private limitPinnedGrowth(width: number): number {
        const { resizeCols, beans } = this;
        const pinnedCols = beans.pinnedCols;
        if (!pinnedCols || !resizeCols || this.getPinnedLane() === 1 || this.isTakingFromPinnedGroup()) {
            return width;
        }

        // measured from the applied widths, as a width outside min/max is never applied
        const actualWidth = getTotalWidth(resizeCols);
        const growth = width - actualWidth;

        if (growth <= 0) {
            return width;
        }

        return actualWidth + pinnedCols.getPinnedResizeGrowth(growth, this.resizeStartPinnedWidth);
    }

    /** A shift resize takes the width from the next group, so the total pinned width does not change when that group is pinned too. */
    private isTakingFromPinnedGroup(): boolean {
        const takeFromCols = this.resizeTakeFromCols;
        return !!takeFromCols?.length && takeFromCols.every((col) => col.pinnedLane !== 1);
    }

    private getPinnedLane(): ColumnLane {
        const { columnGroup } = this;
        const firstDisplayedLeafCol = edgeLeafColumn(columnGroup, true, false);
        return firstDisplayedLeafCol ? firstDisplayedLeafCol.pinnedLane : columnGroup.pinnedLane;
    }

    public getInitialValues(shiftKey?: boolean): ColumnSizeAndRatios {
        const getSizeRatiosOfColumns = (columns: AgColumn[], initialSizeOfColumns: number) =>
            columns.map((column) => column.getActualWidth() / initialSizeOfColumns);

        const columnsToResize = this.getColumnsToResize();
        const resizeStartWidth = getTotalWidth(columnsToResize);
        const resizeRatios = getSizeRatiosOfColumns(columnsToResize, resizeStartWidth);

        const columnSizeAndRatios: ColumnSizeAndRatios = {
            columnsToResize,
            resizeStartWidth,
            resizeRatios,
        };

        let groupAfter: AgColumnGroup | null = null;

        if (shiftKey) {
            groupAfter = getColGroupAfter(this.beans.visibleCols, this.columnGroup);
        }

        if (groupAfter) {
            const takeFromLeafCols = groupAfter.getDisplayedLeafColumns();
            const groupAfterColumns = (columnSizeAndRatios.groupAfterColumns = takeFromLeafCols.filter((col) =>
                col.isResizable()
            ));
            const groupAfterStartWidth = (columnSizeAndRatios.groupAfterStartWidth = getTotalWidth(groupAfterColumns));
            columnSizeAndRatios.groupAfterRatios = getSizeRatiosOfColumns(groupAfterColumns, groupAfterStartWidth);
        } else {
            columnSizeAndRatios.groupAfterColumns = undefined;
            columnSizeAndRatios.groupAfterStartWidth = undefined;
            columnSizeAndRatios.groupAfterRatios = undefined;
        }

        return columnSizeAndRatios;
    }

    /** `limitPinnedGrowth` stops pinned columns growing past the viewport, as a user resize by mouse or keyboard does. */
    public resizeLeafColumnsToFit(source: ColumnEventType, limitPinnedGrowth?: boolean): void {
        const { autoWidthCalc, pinnedCols } = this.beans;
        const preferredSize = autoWidthCalc!.getPreferredWidthForColumnGroup(this.columnGroup);
        const initialValues = this.getInitialValues();
        const { resizeStartWidth } = initialValues;

        if (preferredSize <= resizeStartWidth) {
            return;
        }

        let width = preferredSize;
        if (limitPinnedGrowth && pinnedCols && this.getPinnedLane() !== 1) {
            const pinnedWidth = pinnedCols.getPinnedWidth();
            width = resizeStartWidth + pinnedCols.getPinnedResizeGrowth(width - resizeStartWidth, pinnedWidth);
        }

        if (width > resizeStartWidth) {
            this.resizeColumns(initialValues, width, source, true);
        }
    }

    private resizeColumnsFromLocalValues(totalWidth: number, source: ColumnEventType, finished: boolean = true): void {
        if (!this.resizeCols || !this.resizeRatios) {
            return;
        }

        const initialValues: ColumnSizeAndRatios = {
            columnsToResize: this.resizeCols,
            resizeStartWidth: this.resizeStartWidth,
            resizeRatios: this.resizeRatios,
            groupAfterColumns: this.resizeTakeFromCols,
            groupAfterStartWidth: this.resizeTakeFromStartWidth,
            groupAfterRatios: this.resizeTakeFromRatios,
        };

        this.resizeColumns(initialValues, totalWidth, source, finished);
    }

    public resizeColumns(
        initialValues: ColumnSizeAndRatios,
        totalWidth: number,
        source: ColumnEventType,
        finished: boolean = true
    ): void {
        const {
            columnsToResize,
            resizeStartWidth,
            resizeRatios,
            groupAfterColumns,
            groupAfterStartWidth,
            groupAfterRatios,
        } = initialValues;

        const resizeSets: ColumnResizeSet[] = [];

        resizeSets.push({
            columns: columnsToResize,
            ratios: resizeRatios,
            width: totalWidth,
        });

        if (groupAfterColumns) {
            const diff = totalWidth - resizeStartWidth;
            resizeSets.push({
                columns: groupAfterColumns,
                ratios: groupAfterRatios!,
                width: groupAfterStartWidth! - diff,
            });
        }

        this.beans.colResize?.resizeColumnSets({
            resizeSets,
            finished,
            source: source,
        });

        if (finished) {
            this.toggleColumnResizing(false);
        }
    }

    public toggleColumnResizing(resizing: boolean): void {
        this.comp.toggleCss('ag-column-resizing', resizing);
    }

    private getColumnsToResize(): AgColumn[] {
        const leafCols = this.columnGroup.getDisplayedLeafColumns();
        return leafCols.filter((col) => col.isResizable());
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    private normaliseDragChange(dragChange: number): number {
        let result = dragChange;
        const lane = this.getPinnedLane();

        if (this.gos.get('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (lane !== 0) {
                result *= -1;
            }
        } else if (lane === 2) {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            result *= -1;
        }

        return result;
    }

    public override destroy(): void {
        super.destroy();

        this.resizeCols = undefined;
        this.resizeRatios = undefined;

        this.resizeTakeFromCols = undefined;
        this.resizeTakeFromRatios = undefined;
    }
}

const getTotalWidth = (columns: AgColumn[]): number =>
    columns.reduce((totalWidth: number, column: AgColumn) => totalWidth + column.getActualWidth(), 0);
