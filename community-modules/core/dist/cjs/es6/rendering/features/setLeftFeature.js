/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const column_1 = require("../../entities/column");
const beanStub_1 = require("../../context/beanStub");
const constants_1 = require("../../constants/constants");
const context_1 = require("../../context/context");
const aria_1 = require("../../utils/aria");
const array_1 = require("../../utils/array");
const generic_1 = require("../../utils/generic");
const eventKeys_1 = require("../../eventKeys");
const gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
class SetLeftFeature extends beanStub_1.BeanStub {
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
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            return array_1.last(this.colsSpanning);
        }
        return this.columnOrGroup;
    }
    postConstruct() {
        this.addManagedListener(this.columnOrGroup, column_1.Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
        // when in print layout, the left position is also dependent on the width of the pinned sections.
        // so additionally update left if any column width changes.
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onLeftChanged.bind(this));
        // setting left has a dependency on print layout
        this.addManagedListener(this.beans.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, this.onLeftChanged.bind(this));
    }
    setLeftFirstTime() {
        const suppressMoveAnimation = this.beans.gridOptionsWrapper.isSuppressColumnMoveAnimation();
        const oldLeftExists = generic_1.exists(this.columnOrGroup.getOldLeft());
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
        const printLayout = this.beans.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        if (!printLayout) {
            return leftPosition;
        }
        if (colOrGroup.getPinned() === constants_1.Constants.PINNED_LEFT) {
            return leftPosition;
        }
        const leftWidth = this.beans.columnModel.getDisplayedColumnsLeftWidth();
        if (colOrGroup.getPinned() === constants_1.Constants.PINNED_RIGHT) {
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
        if (generic_1.exists(value)) {
            this.eCell.style.left = `${value}px`;
        }
        let indexColumn;
        if (this.columnOrGroup instanceof column_1.Column) {
            indexColumn = this.columnOrGroup;
        }
        else {
            const columnGroup = this.columnOrGroup;
            const children = columnGroup.getLeafColumns();
            if (!children.length) {
                return;
            }
            if (children.length > 1) {
                aria_1.setAriaColSpan(this.ariaEl, children.length);
            }
            indexColumn = children[0];
        }
        const index = this.beans.columnModel.getAriaColumnIndex(indexColumn);
        aria_1.setAriaColIndex(this.ariaEl, index);
    }
}
__decorate([
    context_1.PostConstruct
], SetLeftFeature.prototype, "postConstruct", null);
exports.SetLeftFeature = SetLeftFeature;
