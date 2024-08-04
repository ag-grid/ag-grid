import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { IRangeService, ISelectionHandle, ISelectionHandleFactory } from '../../interfaces/IRangeService';
import { CellRangeType, SelectionHandleType } from '../../interfaces/IRangeService';
import { _setAriaSelected } from '../../utils/aria';
import { _includes, _last } from '../../utils/array';
import { _missing } from '../../utils/generic';
import type { CellCtrl, ICellComp } from './cellCtrl';

const CSS_CELL_RANGE_SELECTED = 'ag-cell-range-selected';
const CSS_CELL_RANGE_CHART = 'ag-cell-range-chart';
const CSS_CELL_RANGE_SINGLE_CELL = 'ag-cell-range-single-cell';
const CSS_CELL_RANGE_CHART_CATEGORY = 'ag-cell-range-chart-category';
const CSS_CELL_RANGE_HANDLE = 'ag-cell-range-handle';
const CSS_CELL_RANGE_TOP = 'ag-cell-range-top';
const CSS_CELL_RANGE_RIGHT = 'ag-cell-range-right';
const CSS_CELL_RANGE_BOTTOM = 'ag-cell-range-bottom';
const CSS_CELL_RANGE_LEFT = 'ag-cell-range-left';

export class CellRangeFeature {
    private beans: BeanCollection;
    private rangeService: IRangeService;
    private selectionHandleFactory: ISelectionHandleFactory;
    private cellComp: ICellComp;
    private cellCtrl: CellCtrl;
    private eGui: HTMLElement;

    private rangeCount: number;
    private hasChartRange: boolean;

    private selectionHandle: ISelectionHandle | null | undefined;

    constructor(beans: BeanCollection, ctrl: CellCtrl) {
        this.beans = beans;
        // We know these are defined otherwise the feature wouldn't be registered
        this.rangeService = beans.rangeService!;
        this.selectionHandleFactory = beans.selectionHandleFactory!;
        this.cellCtrl = ctrl;
    }

    public setComp(cellComp: ICellComp, eGui: HTMLElement): void {
        this.cellComp = cellComp;
        this.eGui = eGui;
        this.onRangeSelectionChanged();
    }

    public onRangeSelectionChanged(): void {
        // when using reactUi, given UI is async, it's possible this method is called before the comp is registered
        if (!this.cellComp) {
            return;
        }

        this.rangeCount = this.rangeService.getCellRangeCount(this.cellCtrl.getCellPosition());
        this.hasChartRange = this.getHasChartRange();

        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED, this.rangeCount !== 0);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-1`, this.rangeCount === 1);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-2`, this.rangeCount === 2);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-3`, this.rangeCount === 3);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-4`, this.rangeCount >= 4);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART, this.hasChartRange);

        _setAriaSelected(this.eGui, this.rangeCount > 0 ? true : undefined);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SINGLE_CELL, this.isSingleCell());

        this.updateRangeBorders();

        this.refreshHandle();
    }

    private updateRangeBorders(): void {
        const rangeBorders = this.getRangeBorders();
        const isSingleCell = this.isSingleCell();
        const isTop = !isSingleCell && rangeBorders.top;
        const isRight = !isSingleCell && rangeBorders.right;
        const isBottom = !isSingleCell && rangeBorders.bottom;
        const isLeft = !isSingleCell && rangeBorders.left;

        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_TOP, isTop);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_RIGHT, isRight);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_BOTTOM, isBottom);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_LEFT, isLeft);
    }

    private isSingleCell(): boolean {
        const { rangeService } = this.beans;
        return this.rangeCount === 1 && !!rangeService && !rangeService.isMoreThanOneCell();
    }

    private getHasChartRange(): boolean {
        const { rangeService } = this.beans;

        if (!this.rangeCount || !rangeService) {
            return false;
        }

        const cellRanges = rangeService.getCellRanges();

        return (
            cellRanges.length > 0 &&
            cellRanges.every((range) => _includes([CellRangeType.DIMENSION, CellRangeType.VALUE], range.type))
        );
    }

    public updateRangeBordersIfRangeCount(): void {
        // we only need to update range borders if we are in a range
        if (this.rangeCount > 0) {
            this.updateRangeBorders();
            this.refreshHandle();
        }
    }

    private getRangeBorders(): {
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

        const thisCol = this.cellCtrl.getCellPosition().column as AgColumn;
        const presentedColsService = this.beans.visibleColsService;

        let leftCol: AgColumn | null;
        let rightCol: AgColumn | null;

        if (isRtl) {
            leftCol = presentedColsService.getColAfter(thisCol);
            rightCol = presentedColsService.getColBefore(thisCol);
        } else {
            leftCol = presentedColsService.getColBefore(thisCol);
            rightCol = presentedColsService.getColAfter(thisCol);
        }

        const ranges = this.rangeService
            .getCellRanges()
            .filter((range) => this.rangeService.isCellInSpecificRange(this.cellCtrl.getCellPosition(), range));

        // this means we are the first column in the grid
        if (!leftCol) {
            left = true;
        }

        // this means we are the last column in the grid
        if (!rightCol) {
            right = true;
        }

        for (let i = 0; i < ranges.length; i++) {
            if (top && right && bottom && left) {
                break;
            }

            const range = ranges[i];
            const startRow = this.rangeService.getRangeStartRow(range);
            const endRow = this.rangeService.getRangeEndRow(range);

            if (!top && this.beans.rowPositionUtils.sameRow(startRow, this.cellCtrl.getCellPosition())) {
                top = true;
            }

            if (!bottom && this.beans.rowPositionUtils.sameRow(endRow, this.cellCtrl.getCellPosition())) {
                bottom = true;
            }

            if (!left && leftCol && range.columns.indexOf(leftCol) < 0) {
                left = true;
            }

            if (!right && rightCol && range.columns.indexOf(rightCol) < 0) {
                right = true;
            }
        }

        return { top, right, bottom, left };
    }

    public refreshHandle(): void {
        if (this.beans.context.isDestroyed()) {
            return;
        }

        const shouldHaveSelectionHandle = this.shouldHaveSelectionHandle();

        if (this.selectionHandle && !shouldHaveSelectionHandle) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }

        if (shouldHaveSelectionHandle) {
            this.addSelectionHandle();
        }

        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_HANDLE, !!this.selectionHandle);
    }

    private shouldHaveSelectionHandle(): boolean {
        const gos = this.beans.gos;
        const cellRanges = this.rangeService.getCellRanges();
        const rangesLen = cellRanges.length;

        if (this.rangeCount < 1 || rangesLen < 1) {
            return false;
        }

        const cellRange = _last(cellRanges);
        const cellPosition = this.cellCtrl.getCellPosition();
        const isFillHandleAvailable =
            !!gos.getLegacySelectionOption('enableFillHandle') && !this.cellCtrl.isSuppressFillHandle();
        const isRangeHandleAvailable = !!gos.getLegacySelectionOption('enableRangeHandle');

        let handleIsAvailable =
            rangesLen === 1 && !this.cellCtrl.isEditing() && (isFillHandleAvailable || isRangeHandleAvailable);

        if (this.hasChartRange) {
            const hasCategoryRange = cellRanges[0].type === CellRangeType.DIMENSION;
            const isCategoryCell =
                hasCategoryRange && this.rangeService.isCellInSpecificRange(cellPosition, cellRanges[0]);

            this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART_CATEGORY, isCategoryCell);
            handleIsAvailable = cellRange.type === CellRangeType.VALUE;
        }

        return (
            handleIsAvailable &&
            cellRange.endRow != null &&
            this.rangeService.isContiguousRange(cellRange) &&
            this.rangeService.isBottomRightCell(cellRange, cellPosition)
        );
    }

    private addSelectionHandle() {
        const gos = this.beans.gos;
        const cellRangeType = _last(this.rangeService.getCellRanges()).type;
        const selectionHandleFill = gos.get('enableFillHandle') && _missing(cellRangeType);
        const type = selectionHandleFill ? SelectionHandleType.FILL : SelectionHandleType.RANGE;

        if (this.selectionHandle && this.selectionHandle.getType() !== type) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }

        if (!this.selectionHandle) {
            this.selectionHandle = this.selectionHandleFactory.createSelectionHandle(type);
        }

        this.selectionHandle.refresh(this.cellCtrl);
    }

    public destroy(): void {
        this.beans.context.destroyBean(this.selectionHandle);
    }
}
