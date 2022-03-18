import { Beans } from "../beans";
import {
    CellCtrl,
    ICellComp
} from "./cellCtrl";
import { includes, last } from "../../utils/array";
import { CellRangeType, ISelectionHandle, SelectionHandleType } from "../../interfaces/IRangeService";
import { Column } from "../../entities/column";
import { missing } from "../../utils/generic";
import { setAriaSelected } from "../../utils/aria";

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

    private beans: Beans;
    private cellComp: ICellComp;
    private cellCtrl: CellCtrl;
    private eGui: HTMLElement;

    private rangeCount: number;
    private hasChartRange: boolean;

    private selectionHandle: ISelectionHandle | null | undefined;

    constructor(beans: Beans, ctrl: CellCtrl) {
        this.beans = beans;
        this.cellCtrl = ctrl;
    }

    public setComp(cellComp: ICellComp, eGui: HTMLElement): void {
        this.cellComp = cellComp;
        this.eGui = eGui;
        this.onRangeSelectionChanged();
    }

    public onRangeSelectionChanged(): void {
        // when using reactUi, given UI is async, it's possible this method is called before the comp is registered
        if (!this.cellComp) { return; }

        this.rangeCount = this.beans.rangeService.getCellRangeCount(this.cellCtrl.getCellPosition());
        this.hasChartRange = this.getHasChartRange();

        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED, this.rangeCount !== 0);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-1`, this.rangeCount === 1);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-2`, this.rangeCount === 2);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-3`, this.rangeCount === 3);
        this.cellComp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-4`, this.rangeCount >= 4);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART, this.hasChartRange);

        setAriaSelected(this.eGui, this.rangeCount > 0 ? true : undefined);
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
        return this.rangeCount === 1 && rangeService && !rangeService.isMoreThanOneCell();
    }

    private getHasChartRange(): boolean {
        const { rangeService } = this.beans;

        if (!this.rangeCount || !rangeService) { return false; }

        const cellRanges = rangeService.getCellRanges();

        return cellRanges.length > 0 && cellRanges.every(range => includes([CellRangeType.DIMENSION, CellRangeType.VALUE], range.type));
    }

    public updateRangeBordersIfRangeCount(): void {
        // we only need to update range borders if we are in a range
        if (this.rangeCount > 0) {
            this.updateRangeBorders();
            this.refreshHandle();
        }
    }

    private getRangeBorders(): {
        top: boolean,
        right: boolean,
        bottom: boolean,
        left: boolean;
    } {
        const isRtl = this.beans.gridOptionsWrapper.isEnableRtl();

        let top = false;
        let right = false;
        let bottom = false;
        let left = false;

        const thisCol = this.cellCtrl.getCellPosition().column;
        const { rangeService, columnModel } = this.beans;

        let leftCol: Column | null;
        let rightCol: Column | null;

        if (isRtl) {
            leftCol = columnModel.getDisplayedColAfter(thisCol);
            rightCol = columnModel.getDisplayedColBefore(thisCol);
        } else {
            leftCol = columnModel.getDisplayedColBefore(thisCol);
            rightCol = columnModel.getDisplayedColAfter(thisCol);
        }

        const ranges = rangeService.getCellRanges().filter(
            range => rangeService.isCellInSpecificRange(this.cellCtrl.getCellPosition(), range)
        );

        // this means we are the first column in the grid
        if (!leftCol) {
            left = true;
        }

        // this means we are the last column in the grid
        if (!rightCol) {
            right = true;
        }

        for (let i = 0; i < ranges.length; i++) {
            if (top && right && bottom && left) { break; }

            const range = ranges[i];
            const startRow = rangeService.getRangeStartRow(range);
            const endRow = rangeService.getRangeEndRow(range);

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
        if (!this.beans.rangeService) { return; }

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
        const { gridOptionsWrapper, rangeService } = this.beans;
        const cellRanges = rangeService.getCellRanges();
        const rangesLen = cellRanges.length;

        if (this.rangeCount < 1 || rangesLen < 1) {
            return false;
        }

        const cellRange = last(cellRanges);
        const cellPosition = this.cellCtrl.getCellPosition();
        const isFillHandleAvailable = gridOptionsWrapper.isEnableFillHandle() && !this.cellCtrl.isSuppressFillHandle();
        const isRangeHandleAvailable = gridOptionsWrapper.isEnableRangeHandle();

        let handleIsAvailable = rangesLen === 1 && !this.cellCtrl.isEditing() && (
            isFillHandleAvailable || isRangeHandleAvailable
        );

        if (this.hasChartRange) {
            const hasCategoryRange = cellRanges[0].type === CellRangeType.DIMENSION;
            const isCategoryCell = hasCategoryRange && rangeService.isCellInSpecificRange(cellPosition, cellRanges[0]);

            this.cellComp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART_CATEGORY, isCategoryCell);
            handleIsAvailable = cellRange.type === CellRangeType.VALUE;
        }

        return handleIsAvailable &&
            cellRange.endRow != null &&
            rangeService.isContiguousRange(cellRange) &&
            rangeService.isBottomRightCell(cellRange, cellPosition);
    }

    private addSelectionHandle() {
        const { gridOptionsWrapper, rangeService } = this.beans;
        const cellRangeType = last(rangeService.getCellRanges()).type;
        const selectionHandleFill = gridOptionsWrapper.isEnableFillHandle() && missing(cellRangeType);
        const type = selectionHandleFill ? SelectionHandleType.FILL : SelectionHandleType.RANGE;

        if (this.selectionHandle && this.selectionHandle.getType() !== type) {
            this.selectionHandle = this.beans.context.destroyBean(this.selectionHandle);
        }

        if (!this.selectionHandle) {
            this.selectionHandle = this.beans.selectionHandleFactory.createSelectionHandle(type);
        }

        this.selectionHandle.refresh(this.cellCtrl);
    }

    public destroy(): void {
        this.beans.context.destroyBean(this.selectionHandle);
    }

}