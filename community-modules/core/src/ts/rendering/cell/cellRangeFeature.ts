import { Beans } from "../beans";
import {
    CellCtrl, CSS_CELL_RANGE_BOTTOM,
    CSS_CELL_RANGE_CHART, CSS_CELL_RANGE_LEFT, CSS_CELL_RANGE_RIGHT,
    CSS_CELL_RANGE_SELECTED,
    CSS_CELL_RANGE_SINGLE_CELL, CSS_CELL_RANGE_TOP,
    ICellComp
} from "./cellCtrl";
import { includes } from "../../utils/array";
import { CellRangeType } from "../../interfaces/IRangeService";
import { Column } from "../../entities/column";

export class CellRangeFeature {

    private beans: Beans;
    private comp: ICellComp;
    private ctrl: CellCtrl;

    private rangeCount: number;
    private hasChartRange: boolean;

    private refreshHandle(): void {}

    constructor(beans: Beans, cellComp: ICellComp, ctrl: CellCtrl) {
        this.beans = beans;
        this.comp = cellComp;
        this.ctrl = ctrl;

        this.onRangeSelectionChanged();
    }

    public onRangeSelectionChanged(): void {

        this.rangeCount = this.beans.rangeService.getCellRangeCount(this.ctrl.getCellPosition());
        this.hasChartRange = this.getHasChartRange();

        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_SELECTED, this.rangeCount !== 0);
        this.comp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-1`, this.rangeCount === 1);
        this.comp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-2`, this.rangeCount === 2);
        this.comp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-3`, this.rangeCount === 3);
        this.comp.addOrRemoveCssClass(`${CSS_CELL_RANGE_SELECTED}-4`, this.rangeCount >= 4);
        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_CHART, this.hasChartRange);

        this.comp.setAriaSelected(this.rangeCount > 0);
        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_SINGLE_CELL, this.isSingleCell());

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

        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_TOP, isTop);
        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_RIGHT, isRight);
        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_BOTTOM, isBottom);
        this.comp.addOrRemoveCssClass(CSS_CELL_RANGE_LEFT, isLeft);
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

        const thisCol = this.ctrl.getCellPosition().column;
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
            range => rangeService.isCellInSpecificRange(this.ctrl.getCellPosition(), range)
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

            if (!top && this.beans.rowPositionUtils.sameRow(startRow, this.ctrl.getCellPosition())) {
                top = true;
            }

            if (!bottom && this.beans.rowPositionUtils.sameRow(endRow, this.ctrl.getCellPosition())) {
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

    public destroy(): void {

    }

}