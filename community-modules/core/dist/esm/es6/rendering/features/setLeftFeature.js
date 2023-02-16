/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { PostConstruct } from "../../context/context";
import { setAriaColIndex, setAriaColSpan } from "../../utils/aria";
import { last } from "../../utils/array";
import { exists } from "../../utils/generic";
import { Events } from "../../eventKeys";
export class SetLeftFeature extends BeanStub {
    constructor(columnOrGroup, eCell, beans, colsSpanning) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.ariaEl = this.eCell.querySelector('[role=columnheader]') || this.eCell;
        this.colsSpanning = colsSpanning;
        this.beans = beans;
    }
    setColsSpanning(colsSpanning) {
        this.colsSpanning = colsSpanning;
        this.onLeftChanged();
    }
    getColumnOrGroup() {
        if (this.beans.gridOptionsService.is('enableRtl') && this.colsSpanning) {
            return last(this.colsSpanning);
        }
        return this.columnOrGroup;
    }
    postConstruct() {
        this.addManagedListener(this.columnOrGroup, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
        // when in print layout, the left position is also dependent on the width of the pinned sections.
        // so additionally update left if any column width changes.
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onLeftChanged.bind(this));
        // setting left has a dependency on print layout
        this.addManagedPropertyListener('domLayout', this.onLeftChanged.bind(this));
    }
    setLeftFirstTime() {
        const suppressMoveAnimation = this.beans.gridOptionsService.is('suppressColumnMoveAnimation');
        const oldLeftExists = exists(this.columnOrGroup.getOldLeft());
        const animateColumnMove = this.beans.columnAnimationService.isActive() && oldLeftExists && !suppressMoveAnimation;
        if (animateColumnMove) {
            this.animateInLeft();
        }
        else {
            this.onLeftChanged();
        }
    }
    animateInLeft() {
        const colOrGroup = this.getColumnOrGroup();
        const left = colOrGroup.getLeft();
        const oldLeft = colOrGroup.getOldLeft();
        const oldActualLeft = this.modifyLeftForPrintLayout(colOrGroup, oldLeft);
        const actualLeft = this.modifyLeftForPrintLayout(colOrGroup, left);
        this.setLeft(oldActualLeft);
        // we must keep track of the left we want to set to, as this would otherwise lead to a race
        // condition, if the user changed the left value many times in one VM turn, then we want to make
        // make sure the actualLeft we set in the timeout below (in the next VM turn) is the correct left
        // position. eg if user changes column position twice, then setLeft() below executes twice in next
        // VM turn, but only one (the correct one) should get applied.
        this.actualLeft = actualLeft;
        this.beans.columnAnimationService.executeNextVMTurn(() => {
            // test this left value is the latest one to be applied, and if not, do nothing
            if (this.actualLeft === actualLeft) {
                this.setLeft(actualLeft);
            }
        });
    }
    onLeftChanged() {
        const colOrGroup = this.getColumnOrGroup();
        const left = colOrGroup.getLeft();
        this.actualLeft = this.modifyLeftForPrintLayout(colOrGroup, left);
        this.setLeft(this.actualLeft);
    }
    modifyLeftForPrintLayout(colOrGroup, leftPosition) {
        const printLayout = this.beans.gridOptionsService.isDomLayout('print');
        if (!printLayout) {
            return leftPosition;
        }
        if (colOrGroup.getPinned() === 'left') {
            return leftPosition;
        }
        const leftWidth = this.beans.columnModel.getDisplayedColumnsLeftWidth();
        if (colOrGroup.getPinned() === 'right') {
            const bodyWidth = this.beans.columnModel.getBodyContainerWidth();
            return leftWidth + bodyWidth + leftPosition;
        }
        // is in body
        return leftWidth + leftPosition;
    }
    setLeft(value) {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (exists(value)) {
            this.eCell.style.left = `${value}px`;
        }
        let indexColumn;
        if (this.columnOrGroup instanceof Column) {
            indexColumn = this.columnOrGroup;
        }
        else {
            const columnGroup = this.columnOrGroup;
            const children = columnGroup.getLeafColumns();
            if (!children.length) {
                return;
            }
            if (children.length > 1) {
                setAriaColSpan(this.ariaEl, children.length);
            }
            indexColumn = children[0];
        }
        const index = this.beans.columnModel.getAriaColumnIndex(indexColumn);
        setAriaColIndex(this.ariaEl, index);
    }
}
__decorate([
    PostConstruct
], SetLeftFeature.prototype, "postConstruct", null);
