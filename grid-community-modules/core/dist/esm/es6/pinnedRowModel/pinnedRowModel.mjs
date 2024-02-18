var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RowNode } from "../entities/rowNode.mjs";
import { Autowired, Bean, PostConstruct } from "../context/context.mjs";
import { Events } from "../events.mjs";
import { BeanStub } from "../context/beanStub.mjs";
import { missingOrEmpty } from "../utils/generic.mjs";
import { last } from "../utils/array.mjs";
let PinnedRowModel = class PinnedRowModel extends BeanStub {
    init() {
        this.setPinnedTopRowData();
        this.setPinnedBottomRowData();
        this.addManagedPropertyListener('pinnedTopRowData', () => this.setPinnedTopRowData());
        this.addManagedPropertyListener('pinnedBottomRowData', () => this.setPinnedBottomRowData());
    }
    isEmpty(floating) {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        return missingOrEmpty(rows);
    }
    isRowsToRender(floating) {
        return !this.isEmpty(floating);
    }
    getRowAtPixel(pixel, floating) {
        const rows = floating === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
        if (missingOrEmpty(rows)) {
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
    setPinnedTopRowData() {
        const rowData = this.gridOptionsService.get('pinnedTopRowData');
        this.pinnedTopRows = this.createNodesFromData(rowData, true);
        const event = {
            type: Events.EVENT_PINNED_ROW_DATA_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    setPinnedBottomRowData() {
        const rowData = this.gridOptionsService.get('pinnedBottomRowData');
        this.pinnedBottomRows = this.createNodesFromData(rowData, false);
        const event = {
            type: Events.EVENT_PINNED_ROW_DATA_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    createNodesFromData(allData, isTop) {
        const rowNodes = [];
        if (allData) {
            let nextRowTop = 0;
            allData.forEach((dataItem, index) => {
                const rowNode = new RowNode(this.beans);
                rowNode.data = dataItem;
                const idPrefix = isTop ? RowNode.ID_PREFIX_TOP_PINNED : RowNode.ID_PREFIX_BOTTOM_PINNED;
                rowNode.id = idPrefix + index;
                rowNode.rowPinned = isTop ? 'top' : 'bottom';
                rowNode.setRowTop(nextRowTop);
                rowNode.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode).height);
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
        if (missingOrEmpty(this.pinnedTopRows)) {
            return;
        }
        this.pinnedTopRows.forEach(callback);
    }
    forEachPinnedBottomRow(callback) {
        if (missingOrEmpty(this.pinnedBottomRows)) {
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
        const lastNode = last(rowNodes);
        return lastNode.rowTop + lastNode.rowHeight;
    }
};
__decorate([
    Autowired('beans')
], PinnedRowModel.prototype, "beans", void 0);
__decorate([
    PostConstruct
], PinnedRowModel.prototype, "init", null);
PinnedRowModel = __decorate([
    Bean('pinnedRowModel')
], PinnedRowModel);
export { PinnedRowModel };
