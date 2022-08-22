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
const rowNode_1 = require("../entities/rowNode");
const context_1 = require("../context/context");
const events_1 = require("../events");
const constants_1 = require("../constants/constants");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
const array_1 = require("../utils/array");
let PinnedRowModel = class PinnedRowModel extends beanStub_1.BeanStub {
    init() {
        this.setPinnedTopRowData(this.gridOptionsWrapper.getPinnedTopRowData());
        this.setPinnedBottomRowData(this.gridOptionsWrapper.getPinnedBottomRowData());
    }
    isEmpty(floating) {
        const rows = floating === constants_1.Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        return generic_1.missingOrEmpty(rows);
    }
    isRowsToRender(floating) {
        return !this.isEmpty(floating);
    }
    getRowAtPixel(pixel, floating) {
        const rows = floating === constants_1.Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        if (generic_1.missingOrEmpty(rows)) {
            return 0; // this should never happen, just in case, 0 is graceful failure
        }
        for (let i = 0; i < rows.length; i++) {
            const rowNode = rows[i];
            const rowTopPixel = rowNode.rowTop + rowNode.rowHeight - 1;
            // only need to range check against the top pixel, as we are going through the list
            // in order, first row to hit the pixel wins
            if (rowTopPixel >= pixel) {
                return i;
            }
        }
        return rows.length - 1;
    }
    setPinnedTopRowData(rowData) {
        this.pinnedTopRows = this.createNodesFromData(rowData, true);
        const event = {
            type: events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    setPinnedBottomRowData(rowData) {
        this.pinnedBottomRows = this.createNodesFromData(rowData, false);
        const event = {
            type: events_1.Events.EVENT_PINNED_ROW_DATA_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    createNodesFromData(allData, isTop) {
        const rowNodes = [];
        if (allData) {
            let nextRowTop = 0;
            allData.forEach((dataItem, index) => {
                const rowNode = new rowNode_1.RowNode(this.beans);
                rowNode.data = dataItem;
                const idPrefix = isTop ? rowNode_1.RowNode.ID_PREFIX_TOP_PINNED : rowNode_1.RowNode.ID_PREFIX_BOTTOM_PINNED;
                rowNode.id = idPrefix + index;
                rowNode.rowPinned = isTop ? constants_1.Constants.PINNED_TOP : constants_1.Constants.PINNED_BOTTOM;
                rowNode.setRowTop(nextRowTop);
                rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode).height);
                rowNode.setRowIndex(index);
                nextRowTop += rowNode.rowHeight;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes;
    }
    getPinnedTopRowData() {
        return this.pinnedTopRows;
    }
    getPinnedBottomRowData() {
        return this.pinnedBottomRows;
    }
    getPinnedTopTotalHeight() {
        return this.getTotalHeight(this.pinnedTopRows);
    }
    getPinnedTopRowCount() {
        return this.pinnedTopRows ? this.pinnedTopRows.length : 0;
    }
    getPinnedBottomRowCount() {
        return this.pinnedBottomRows ? this.pinnedBottomRows.length : 0;
    }
    getPinnedTopRow(index) {
        return this.pinnedTopRows[index];
    }
    getPinnedBottomRow(index) {
        return this.pinnedBottomRows[index];
    }
    forEachPinnedTopRow(callback) {
        if (generic_1.missingOrEmpty(this.pinnedTopRows)) {
            return;
        }
        this.pinnedTopRows.forEach(callback);
    }
    forEachPinnedBottomRow(callback) {
        if (generic_1.missingOrEmpty(this.pinnedBottomRows)) {
            return;
        }
        this.pinnedBottomRows.forEach(callback);
    }
    getPinnedBottomTotalHeight() {
        return this.getTotalHeight(this.pinnedBottomRows);
    }
    getTotalHeight(rowNodes) {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        }
        const lastNode = array_1.last(rowNodes);
        return lastNode.rowTop + lastNode.rowHeight;
    }
};
__decorate([
    context_1.Autowired('beans')
], PinnedRowModel.prototype, "beans", void 0);
__decorate([
    context_1.PostConstruct
], PinnedRowModel.prototype, "init", null);
PinnedRowModel = __decorate([
    context_1.Bean('pinnedRowModel')
], PinnedRowModel);
exports.PinnedRowModel = PinnedRowModel;
