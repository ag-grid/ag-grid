"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderRowCtrl = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const eventKeys_1 = require("../../eventKeys");
const headerFilterCellCtrl_1 = require("../cells/floatingFilter/headerFilterCellCtrl");
const headerCellCtrl_1 = require("../cells/column/headerCellCtrl");
const headerGroupCellCtrl_1 = require("../cells/columnGroup/headerGroupCellCtrl");
const headerRowComp_1 = require("./headerRowComp");
const generic_1 = require("../../utils/generic");
let instanceIdSequence = 0;
class HeaderRowCtrl extends beanStub_1.BeanStub {
    constructor(rowIndex, pinned, type) {
        super();
        this.instanceId = instanceIdSequence++;
        this.rowIndex = rowIndex;
        this.pinned = pinned;
        this.type = type;
        const typeClass = type == headerRowComp_1.HeaderRowType.COLUMN_GROUP ? `ag-header-row-column-group` :
            type == headerRowComp_1.HeaderRowType.FLOATING_FILTER ? `ag-header-row-column-filter` : `ag-header-row-column`;
        this.headerRowClass = `ag-header-row ${typeClass}`;
    }
    postConstruct() {
        this.isPrintLayout = this.gridOptionsService.isDomLayout('print');
        this.isEnsureDomOrder = this.gridOptionsService.get('ensureDomOrder');
    }
    getInstanceId() {
        return this.instanceId;
    }
    /**
     *
     * @param comp Proxy to the actual component
     * @param initCompState Should the component be initialised with the current state of the controller. Default: true
     */
    setComp(comp, initCompState = true) {
        this.comp = comp;
        if (initCompState) {
            this.onRowHeightChanged();
            this.onVirtualColumnsChanged();
        }
        // width is managed directly regardless of framework and so is not included in initCompState
        this.setWidth();
        this.addEventListeners();
    }
    getHeaderRowClass() {
        return this.headerRowClass;
    }
    getAriaRowIndex() {
        return this.rowIndex + 1;
    }
    addEventListeners() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, (params) => this.onVirtualColumnsChanged(params.afterScroll));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_GRID_STYLES_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, this.onRowHeightChanged.bind(this));
        // when print layout changes, it changes what columns are in what section
        this.addManagedPropertyListener('domLayout', this.onDisplayedColumnsChanged.bind(this));
        this.addManagedPropertyListener('ensureDomOrder', (e) => this.isEnsureDomOrder = e.currentValue);
        this.addManagedPropertyListener('headerHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('pivotHeaderHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('groupHeaderHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('pivotGroupHeaderHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('floatingFiltersHeight', this.onRowHeightChanged.bind(this));
    }
    getHeaderCellCtrl(column) {
        if (!this.headerCellCtrls) {
            return;
        }
        return (0, generic_1.values)(this.headerCellCtrls).find(cellCtrl => cellCtrl.getColumnGroupChild() === column);
    }
    onDisplayedColumnsChanged() {
        this.isPrintLayout = this.gridOptionsService.isDomLayout('print');
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.onRowHeightChanged();
    }
    getType() {
        return this.type;
    }
    onColumnResized() {
        this.setWidth();
    }
    setWidth() {
        const width = this.getWidthForRow();
        this.comp.setWidth(`${width}px`);
    }
    getWidthForRow() {
        const { columnModel } = this.beans;
        if (this.isPrintLayout) {
            const pinned = this.pinned != null;
            if (pinned) {
                return 0;
            }
            return columnModel.getContainerWidth('right')
                + columnModel.getContainerWidth('left')
                + columnModel.getContainerWidth(null);
        }
        // if not printing, just return the width as normal
        return columnModel.getContainerWidth(this.pinned);
    }
    onRowHeightChanged() {
        var { topOffset, rowHeight } = this.getTopAndHeight();
        this.comp.setTop(topOffset + 'px');
        this.comp.setHeight(rowHeight + 'px');
    }
    getTopAndHeight() {
        const { columnModel, filterManager } = this.beans;
        let headerRowCount = columnModel.getHeaderRowCount();
        const sizes = [];
        let numberOfFloating = 0;
        if (filterManager.hasFloatingFilters()) {
            headerRowCount++;
            numberOfFloating = 1;
        }
        const groupHeight = columnModel.getColumnGroupHeaderRowHeight();
        const headerHeight = columnModel.getColumnHeaderRowHeight();
        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;
        for (let i = 0; i < numberOfGroups; i++) {
            sizes.push(groupHeight);
        }
        sizes.push(headerHeight);
        for (let i = 0; i < numberOfFloating; i++) {
            sizes.push(columnModel.getFloatingFiltersHeight());
        }
        let topOffset = 0;
        for (let i = 0; i < this.rowIndex; i++) {
            topOffset += sizes[i];
        }
        const rowHeight = sizes[this.rowIndex];
        return { topOffset, rowHeight };
    }
    getPinned() {
        return this.pinned;
    }
    getRowIndex() {
        return this.rowIndex;
    }
    onVirtualColumnsChanged(afterScroll = false) {
        const ctrlsToDisplay = this.getHeaderCtrls();
        const forceOrder = this.isEnsureDomOrder || this.isPrintLayout;
        this.comp.setHeaderCtrls(ctrlsToDisplay, forceOrder, afterScroll);
    }
    getHeaderCtrls() {
        const oldCtrls = this.headerCellCtrls;
        this.headerCellCtrls = new Map();
        const columns = this.getColumnsInViewport();
        for (const child of columns) {
            this.recycleAndCreateHeaderCtrls(child, oldCtrls);
        }
        // we want to keep columns that are focused, otherwise keyboard navigation breaks
        const isFocusedAndDisplayed = (ctrl) => {
            const { focusService, columnModel } = this.beans;
            const isFocused = focusService.isHeaderWrapperFocused(ctrl);
            if (!isFocused) {
                return false;
            }
            const isDisplayed = columnModel.isDisplayed(ctrl.getColumnGroupChild());
            return isDisplayed;
        };
        if (oldCtrls) {
            for (const [id, oldCtrl] of oldCtrls) {
                const keepCtrl = isFocusedAndDisplayed(oldCtrl);
                if (keepCtrl) {
                    this.headerCellCtrls.set(id, oldCtrl);
                }
                else {
                    this.destroyBean(oldCtrl);
                }
            }
        }
        const ctrlsToDisplay = Array.from(this.headerCellCtrls.values());
        return ctrlsToDisplay;
    }
    recycleAndCreateHeaderCtrls(headerColumn, oldCtrls) {
        if (!this.headerCellCtrls) {
            return;
        }
        // skip groups that have no displayed children. this can happen when the group is broken,
        // and this section happens to have nothing to display for the open / closed state.
        // (a broken group is one that is split, ie columns in the group have a non-group column
        // in between them)
        if (headerColumn.isEmptyGroup()) {
            return;
        }
        const idOfChild = headerColumn.getUniqueId();
        // if we already have this cell rendered, do nothing
        let headerCtrl;
        if (oldCtrls) {
            headerCtrl = oldCtrls.get(idOfChild);
            oldCtrls.delete(idOfChild);
        }
        // it's possible there is a new Column with the same ID, but it's for a different Column.
        // this is common with pivoting, where the pivot cols change, but the id's are still pivot_0,
        // pivot_1 etc. so if new col but same ID, need to remove the old col here first as we are
        // about to replace it in the this.headerComps map.
        const forOldColumn = headerCtrl && headerCtrl.getColumnGroupChild() != headerColumn;
        if (forOldColumn) {
            this.destroyBean(headerCtrl);
            headerCtrl = undefined;
        }
        if (headerCtrl == null) {
            switch (this.type) {
                case headerRowComp_1.HeaderRowType.FLOATING_FILTER:
                    headerCtrl = this.createBean(new headerFilterCellCtrl_1.HeaderFilterCellCtrl(headerColumn, this.beans, this));
                    break;
                case headerRowComp_1.HeaderRowType.COLUMN_GROUP:
                    headerCtrl = this.createBean(new headerGroupCellCtrl_1.HeaderGroupCellCtrl(headerColumn, this.beans, this));
                    break;
                default:
                    headerCtrl = this.createBean(new headerCellCtrl_1.HeaderCellCtrl(headerColumn, this.beans, this));
                    break;
            }
        }
        this.headerCellCtrls.set(idOfChild, headerCtrl);
    }
    getColumnsInViewport() {
        return this.isPrintLayout ? this.getColumnsInViewportPrintLayout() : this.getColumnsInViewportNormalLayout();
    }
    getColumnsInViewportPrintLayout() {
        // for print layout, we add all columns into the center
        if (this.pinned != null) {
            return [];
        }
        let viewportColumns = [];
        const actualDepth = this.getActualDepth();
        const { columnModel } = this.beans;
        ['left', null, 'right'].forEach(pinned => {
            const items = columnModel.getVirtualHeaderGroupRow(pinned, actualDepth);
            viewportColumns = viewportColumns.concat(items);
        });
        return viewportColumns;
    }
    getActualDepth() {
        return this.type == headerRowComp_1.HeaderRowType.FLOATING_FILTER ? this.rowIndex - 1 : this.rowIndex;
    }
    getColumnsInViewportNormalLayout() {
        // when in normal layout, we add the columns for that container only
        return this.beans.columnModel.getVirtualHeaderGroupRow(this.pinned, this.getActualDepth());
    }
    focusHeader(column, event) {
        if (!this.headerCellCtrls) {
            return false;
        }
        const allCtrls = Array.from(this.headerCellCtrls.values());
        const ctrl = allCtrls.find(ctrl => ctrl.getColumnGroupChild() == column);
        if (!ctrl) {
            return false;
        }
        return ctrl.focus(event);
    }
    destroy() {
        if (this.headerCellCtrls) {
            this.headerCellCtrls.forEach((ctrl) => {
                this.destroyBean(ctrl);
            });
        }
        this.headerCellCtrls = undefined;
        super.destroy();
    }
}
__decorate([
    (0, context_1.Autowired)('beans')
], HeaderRowCtrl.prototype, "beans", void 0);
__decorate([
    context_1.PostConstruct
], HeaderRowCtrl.prototype, "postConstruct", null);
exports.HeaderRowCtrl = HeaderRowCtrl;
