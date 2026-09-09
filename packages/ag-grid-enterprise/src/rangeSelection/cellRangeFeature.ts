import { _last, _missing, _requestAnimationFrame, _setAriaSelected } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    CellCtrl,
    CellPosition,
    CellSelectionRange,
    CellSelectionSnapshot,
    GridOptionsService,
    ICellComp,
    ICellRangeFeature,
    IRangeService,
} from 'ag-grid-community';
import { CellRangeType, _isSameRow } from 'ag-grid-community';

import { SelectionHandleType } from './abstractSelectionHandle';
import type { AgFillHandle } from './agFillHandle';
import type { AgRangeHandle } from './agRangeHandle';
import { isCellInSelectionRange } from './cellSelectionState';

const CSS_CELL_RANGE_SELECTED = 'ag-cell-range-selected';
const CSS_CELL_RANGE_CHART = 'ag-cell-range-chart';
const CSS_CELL_RANGE_SINGLE_CELL = 'ag-cell-range-single-cell';
const CSS_CELL_RANGE_CHART_CATEGORY = 'ag-cell-range-chart-category';
const CSS_CELL_RANGE_HANDLE = 'ag-cell-range-handle';
const CSS_CELL_RANGE_TOP = 'ag-cell-range-top';
const CSS_CELL_RANGE_RIGHT = 'ag-cell-range-right';
const CSS_CELL_RANGE_BOTTOM = 'ag-cell-range-bottom';
const CSS_CELL_RANGE_LEFT = 'ag-cell-range-left';
// OPTIMIZATION: every rendered cell toggles all four, so the names are built once, not per cell
const CSS_CELL_RANGE_SELECTED_COUNT = [
    `${CSS_CELL_RANGE_SELECTED}-1`,
    `${CSS_CELL_RANGE_SELECTED}-2`,
    `${CSS_CELL_RANGE_SELECTED}-3`,
    `${CSS_CELL_RANGE_SELECTED}-4`,
];

function _isRangeHandleEnabled(gos: GridOptionsService): boolean {
    const selection = gos.get('cellSelection');
    const useNewAPI = selection !== undefined;

    if (!useNewAPI) {
        return gos.get('enableRangeHandle');
    }

    return typeof selection !== 'boolean' ? selection.handle?.mode === 'range' : false;
}
function _isFillHandleEnabled(gos: GridOptionsService): boolean {
    const selection = gos.get('cellSelection');
    const useNewAPI = selection !== undefined;

    if (!useNewAPI) {
        return gos.get('enableFillHandle');
    }

    return typeof selection !== 'boolean' ? selection.handle?.mode === 'fill' : false;
}

export class CellRangeFeature implements ICellRangeFeature {
    private readonly rangeSvc: IRangeService;
    private cellComp: ICellComp;
    private eGui: HTMLElement;

    private rangeCount: number;
    private hasChartRange: boolean;
    private rangeColorClass: string | null = null;
    private handleColorClass: string | null = null;

    private selectionHandle: AgFillHandle | AgRangeHandle | null | undefined;
    private refreshScheduled = false;

    constructor(
        private readonly beans: BeanCollection,
        private readonly cellCtrl: CellCtrl
    ) {
        // We know these are defined otherwise the feature wouldn't be registered
        this.rangeSvc = beans.rangeSvc!;
    }

    public setComp(cellComp: ICellComp): void {
        this.cellComp = cellComp;
        this.eGui = this.cellCtrl.eGui;
        this.onCellSelectionChanged();
    }

    public unsetComp(): void {
        this.beans.context.destroyBean(this.selectionHandle);
    }

    public onCellSelectionChanged(state?: CellSelectionSnapshot): void {
        const cellComp = this.cellComp;
        // when using reactUi, given UI is async, it's possible this method is called before the comp is registered
        if (!cellComp) {
            return;
        }

        const selection = state ?? this.rangeSvc.getSelectionState();
        const eGui = this.eGui;

        const rangeCount = this.countRangesAtCell(selection);
        this.rangeCount = rangeCount;
        const hasChartRange = rangeCount > 0 && selection.allChartRanges;
        this.hasChartRange = hasChartRange;

        cellComp.toggleCss(CSS_CELL_RANGE_SELECTED, rangeCount !== 0);
        cellComp.toggleCss(CSS_CELL_RANGE_SELECTED_COUNT[0], rangeCount === 1);
        cellComp.toggleCss(CSS_CELL_RANGE_SELECTED_COUNT[1], rangeCount === 2);
        cellComp.toggleCss(CSS_CELL_RANGE_SELECTED_COUNT[2], rangeCount === 3);
        cellComp.toggleCss(CSS_CELL_RANGE_SELECTED_COUNT[3], rangeCount >= 4);
        cellComp.toggleCss(CSS_CELL_RANGE_CHART, hasChartRange);

        _setAriaSelected(eGui, rangeCount > 0 ? true : undefined);
        cellComp.toggleCss(CSS_CELL_RANGE_SINGLE_CELL, this.isSingleCell(selection));

        this.updateRangeBorders(selection);

        this.refreshRangeStyleAndHandle(selection);
    }

    private countRangesAtCell(selection: CellSelectionSnapshot): number {
        const { cellPosition } = this.cellCtrl;
        const ranges = selection.ranges;
        let count = 0;

        for (let i = 0, len = ranges.length; i < len; i++) {
            if (isCellInSelectionRange(ranges[i], cellPosition)) {
                count++;
            }
        }

        return count;
    }

    private updateRangeBorders(selection: CellSelectionSnapshot): void {
        const rangeBorders = this.getRangeBorders(selection);
        const isSingleCell = this.isSingleCell(selection);
        const isTop = !isSingleCell && rangeBorders.top;
        const isRight = !isSingleCell && rangeBorders.right;
        const isBottom = !isSingleCell && rangeBorders.bottom;
        const isLeft = !isSingleCell && rangeBorders.left;

        const cellComp = this.cellComp;
        cellComp.toggleCss(CSS_CELL_RANGE_TOP, isTop);
        cellComp.toggleCss(CSS_CELL_RANGE_RIGHT, isRight);
        cellComp.toggleCss(CSS_CELL_RANGE_BOTTOM, isBottom);
        cellComp.toggleCss(CSS_CELL_RANGE_LEFT, isLeft);
    }

    private isSingleCell(selection: CellSelectionSnapshot): boolean {
        return this.rangeCount === 1 && !selection.moreThanOneCell;
    }

    public updateRangeBordersIfRangeCount(state?: CellSelectionSnapshot): void {
        // we only need to update range borders if we are in a range
        if (this.rangeCount > 0) {
            const selection = state ?? this.rangeSvc.getSelectionState();
            this.updateRangeBorders(selection);
            this.refreshRangeStyleAndHandle(selection);
        }
    }

    private getRangeBorders(selection: CellSelectionSnapshot): {
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    } {
        const isRtl = this.beans.gos.get('enableRtl');

        let top = false;
        let right = false;
        let bottom = false;
        let left = false;

        const {
            beans: { visibleCols },
            cellCtrl: { cellPosition },
        } = this;
        const thisCol = cellPosition.column as AgColumn;

        if (!this.rangeCount) {
            return { top, right, bottom, left };
        }

        let leftCol: AgColumn | null;
        let rightCol: AgColumn | null;

        if (isRtl) {
            leftCol = visibleCols.getColAfter(thisCol);
            rightCol = visibleCols.getColBefore(thisCol);
        } else {
            leftCol = visibleCols.getColBefore(thisCol);
            rightCol = visibleCols.getColAfter(thisCol);
        }

        // this means we are the first column in the grid
        if (!leftCol) {
            left = true;
        }

        // this means we are the last column in the grid
        if (!rightCol) {
            right = true;
        }

        const ranges = selection.ranges;
        for (let i = 0, len = ranges.length; i < len; i++) {
            if (top && right && bottom && left) {
                break;
            }

            const range = ranges[i];
            if (!isCellInSelectionRange(range, cellPosition)) {
                continue;
            }

            const { firstRow, lastRow, columns } = range;

            if (!top && _isSameRow(firstRow, cellPosition)) {
                top = true;
            }

            if (!bottom && _isSameRow(lastRow, cellPosition)) {
                bottom = true;
            }

            if (!left && leftCol && !columns.has(leftCol)) {
                left = true;
            }

            if (!right && rightCol && !columns.has(rightCol)) {
                right = true;
            }
        }

        return { top, right, bottom, left };
    }

    private refreshRangeStyleAndHandle(selection: CellSelectionSnapshot): void {
        const { context } = this.beans;
        if (context.isDestroyed()) {
            return;
        }

        this.styleCellForRangeType(selection);

        const rangeForHandle = this.getRangeForHandle(selection);

        if (this.selectionHandle && !rangeForHandle) {
            this.selectionHandle = context.destroyBean(this.selectionHandle);
        }

        if (rangeForHandle) {
            this.addSelectionHandle(rangeForHandle);
        }

        this.refreshHandleColor(rangeForHandle);
        this.cellComp.toggleCss(CSS_CELL_RANGE_HANDLE, !!this.selectionHandle);
    }

    public scheduleRefreshRangeStyleAndHandle(): void {
        if (this.refreshScheduled) {
            return;
        }
        this.refreshScheduled = true;
        _requestAnimationFrame(this.beans, () => {
            this.refreshScheduled = false;
            this.refreshRangeStyleAndHandle(this.rangeSvc.getSelectionState());
        });
    }

    private styleCellForRangeType(selection: CellSelectionSnapshot): void {
        if (this.hasChartRange) {
            const dimensionRange = selection.ranges[0];
            const hasCategoryRange = dimensionRange.type === CellRangeType.DIMENSION;
            const isCategoryCell =
                hasCategoryRange && isCellInSelectionRange(dimensionRange, this.cellCtrl.cellPosition);

            this.cellComp.toggleCss(CSS_CELL_RANGE_CHART_CATEGORY, isCategoryCell);
        } else {
            this.cellComp.toggleCss(CSS_CELL_RANGE_CHART_CATEGORY, false);
            this.applyRangeColor(this.getRangeColorClass(selection));
        }
    }

    private applyRangeColor(nextClass: string | null): void {
        if (this.rangeColorClass && this.rangeColorClass !== nextClass) {
            this.cellComp.toggleCss(this.rangeColorClass, false);
            this.cellComp.toggleCss('ag-formula-range', false);
        }

        if (nextClass) {
            this.cellComp.toggleCss(nextClass, true);
            this.cellComp.toggleCss('ag-formula-range', nextClass.startsWith('ag-formula-range'));
        }

        this.rangeColorClass = nextClass ?? null;
    }

    private getRangeColorClass(selection: CellSelectionSnapshot): string | null {
        if (!this.rangeCount) {
            return null;
        }

        const { cellPosition } = this.cellCtrl;
        const ranges = selection.ranges;

        for (let i = ranges.length - 1; i >= 0; i--) {
            const range = ranges[i];
            const colorClass = range.colorClass;

            if (!colorClass) {
                continue;
            }

            if (isCellInSelectionRange(range, cellPosition)) {
                return colorClass;
            }
        }

        return null;
    }

    private refreshHandleColor(rangeForHandle: CellSelectionRange | null): void {
        const handleGui = this.selectionHandle?.getGui?.();
        const nextClass = rangeForHandle?.colorClass ?? null;

        if (!handleGui) {
            this.handleColorClass = null;
            return;
        }

        if (this.handleColorClass && this.handleColorClass !== nextClass) {
            handleGui.classList.remove(this.handleColorClass);
        }

        if (nextClass) {
            handleGui.classList.add(nextClass);
        } else if (this.handleColorClass) {
            handleGui.classList.remove(this.handleColorClass);
        }

        this.handleColorClass = nextClass ?? null;
    }

    private getRangeForHandle(selection: CellSelectionSnapshot): CellSelectionRange | null {
        const { gos, editSvc } = this.beans;
        const allRanges = selection.ranges;
        const rangesLen = allRanges.length;

        if (this.rangeCount < 1 || rangesLen < 1) {
            return null;
        }

        const isRangeSelectionEnabledWhileEditing = editSvc?.isRangeSelectionEnabledWhileEditing();
        const rangesToRefreshHandle = isRangeSelectionEnabledWhileEditing ? allRanges : [_last(allRanges)];

        for (const selectionRange of rangesToRefreshHandle) {
            const { cellPosition, column } = this.cellCtrl;
            const isFillHandleAvailable = _isFillHandleEnabled(gos) && !column.isSuppressFillHandle();
            const isRangeHandleAvailable = _isRangeHandleEnabled(gos);
            const isCellEditing = editSvc?.isEditing(this.cellCtrl, { withOpenEditor: true });

            let handleIsAvailable =
                !isCellEditing &&
                (isRangeSelectionEnabledWhileEditing ||
                    (rangesLen === 1 && (isFillHandleAvailable || isRangeHandleAvailable)));

            if (this.hasChartRange) {
                handleIsAvailable = selectionRange.type === CellRangeType.VALUE;
            }

            if (
                handleIsAvailable &&
                selectionRange.range.endRow != null &&
                selectionRange.contiguous &&
                this.isBottomRightCell(selectionRange, cellPosition)
            ) {
                return selectionRange;
            }
        }

        return null;
    }

    private isBottomRightCell({ lastRow, lastColumn }: CellSelectionRange, cell: CellPosition): boolean {
        if (!lastColumn) {
            return false;
        }

        const isRightColumn = (cell.column as AgColumn).allColsIndex === (lastColumn as AgColumn).allColsIndex;

        return isRightColumn && _isSameRow(lastRow, cell);
    }

    private addSelectionHandle(selectionRange: CellSelectionRange) {
        const { editSvc, gos, context, registry } = this.beans;
        const isRangeSelectionEnabledWhileEditing = editSvc?.isRangeSelectionEnabledWhileEditing();
        const cellRangeType = selectionRange.type;
        const selectionHandleFill =
            !isRangeSelectionEnabledWhileEditing && _isFillHandleEnabled(gos) && _missing(cellRangeType);
        const type = selectionHandleFill ? SelectionHandleType.FILL : SelectionHandleType.RANGE;

        if (this.selectionHandle && this.selectionHandle.getType() !== type) {
            this.selectionHandle = context.destroyBean(this.selectionHandle);
        }

        if (!this.selectionHandle) {
            const selectionHandle = registry.createDynamicBean<AgFillHandle | AgRangeHandle>(
                type === SelectionHandleType.FILL ? 'fillHandle' : 'rangeHandle',
                false
            );
            if (selectionHandle) {
                this.selectionHandle = context.createBean(selectionHandle);
            }
        }

        this.selectionHandle?.refresh(this.cellCtrl, selectionRange.range);
    }

    public destroy(): void {
        this.unsetComp();
    }
}
