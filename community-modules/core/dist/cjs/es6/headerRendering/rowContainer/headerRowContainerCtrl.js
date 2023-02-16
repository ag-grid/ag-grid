/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.HeaderRowContainerCtrl = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const column_1 = require("../../entities/column");
const eventKeys_1 = require("../../eventKeys");
const centerWidthFeature_1 = require("../../gridBodyComp/centerWidthFeature");
const utils_1 = require("../../utils");
const bodyDropTarget_1 = require("../columnDrag/bodyDropTarget");
const headerRowComp_1 = require("../row/headerRowComp");
const headerRowCtrl_1 = require("../row/headerRowCtrl");
class HeaderRowContainerCtrl extends beanStub_1.BeanStub {
    constructor(pinned) {
        super();
        this.hidden = false;
        this.groupsRowCtrls = [];
        this.pinned = pinned;
    }
    setComp(comp, eGui) {
        this.comp = comp;
        this.eViewport = eGui;
        this.setupCenterWidth();
        this.setupPinnedWidth();
        this.setupDragAndDrop(this.eViewport);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eViewport, 'scroll', this.resetScrollLeft.bind(this));
        this.ctrlsService.registerHeaderContainer(this, this.pinned);
        if (this.columnModel.isReady()) {
            this.refresh();
        }
    }
    setupDragAndDrop(dropContainer) {
        const bodyDropTarget = new bodyDropTarget_1.BodyDropTarget(this.pinned, dropContainer);
        this.createManagedBean(bodyDropTarget);
    }
    refresh(keepColumns = false) {
        const sequence = new utils_1.NumberSequence();
        const focusedHeaderPosition = this.focusService.getFocusHeaderToUseAfterRefresh();
        const refreshColumnGroups = () => {
            const groupRowCount = this.columnModel.getHeaderRowCount() - 1;
            this.groupsRowCtrls = this.destroyBeans(this.groupsRowCtrls);
            for (let i = 0; i < groupRowCount; i++) {
                const ctrl = this.createBean(new headerRowCtrl_1.HeaderRowCtrl(sequence.next(), this.pinned, headerRowComp_1.HeaderRowType.COLUMN_GROUP));
                this.groupsRowCtrls.push(ctrl);
            }
        };
        const refreshColumns = () => {
            const rowIndex = sequence.next();
            const needNewInstance = !this.hidden && (this.columnsRowCtrl == null || !keepColumns || this.columnsRowCtrl.getRowIndex() !== rowIndex);
            const shouldDestroyInstance = needNewInstance || this.hidden;
            if (shouldDestroyInstance) {
                this.columnsRowCtrl = this.destroyBean(this.columnsRowCtrl);
            }
            if (needNewInstance) {
                this.columnsRowCtrl = this.createBean(new headerRowCtrl_1.HeaderRowCtrl(rowIndex, this.pinned, headerRowComp_1.HeaderRowType.COLUMN));
            }
        };
        const refreshFilters = () => {
            const includeFloatingFilter = this.columnModel.hasFloatingFilters() && !this.hidden;
            const destroyPreviousComp = () => {
                this.filtersRowCtrl = this.destroyBean(this.filtersRowCtrl);
            };
            if (!includeFloatingFilter) {
                destroyPreviousComp();
                return;
            }
            const rowIndex = sequence.next();
            if (this.filtersRowCtrl) {
                const rowIndexMismatch = this.filtersRowCtrl.getRowIndex() !== rowIndex;
                if (!keepColumns || rowIndexMismatch) {
                    destroyPreviousComp();
                }
            }
            if (!this.filtersRowCtrl) {
                this.filtersRowCtrl = this.createBean(new headerRowCtrl_1.HeaderRowCtrl(rowIndex, this.pinned, headerRowComp_1.HeaderRowType.FLOATING_FILTER));
            }
        };
        refreshColumnGroups();
        refreshColumns();
        refreshFilters();
        const allCtrls = this.getAllCtrls();
        this.comp.setCtrls(allCtrls);
        this.restoreFocusOnHeader(focusedHeaderPosition);
    }
    restoreFocusOnHeader(position) {
        if (position == null || position.column.getPinned() != this.pinned) {
            return;
        }
        this.focusService.focusHeaderPosition({ headerPosition: position });
    }
    getAllCtrls() {
        const res = [...this.groupsRowCtrls];
        if (this.columnsRowCtrl) {
            res.push(this.columnsRowCtrl);
        }
        if (this.filtersRowCtrl) {
            res.push(this.filtersRowCtrl);
        }
        return res;
    }
    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    onGridColumnsChanged() {
        this.refresh(true);
    }
    setupCenterWidth() {
        if (this.pinned != null) {
            return;
        }
        this.createManagedBean(new centerWidthFeature_1.CenterWidthFeature(width => this.comp.setCenterWidth(`${width}px`)));
    }
    setHorizontalScroll(offset) {
        this.comp.setContainerTransform(`translateX(${offset}px)`);
    }
    resetScrollLeft() {
        this.eViewport.scrollLeft = 0;
    }
    setupPinnedWidth() {
        if (this.pinned == null) {
            return;
        }
        const pinningLeft = this.pinned === 'left';
        const pinningRight = this.pinned === 'right';
        this.hidden = true;
        const listener = () => {
            const width = pinningLeft ? this.pinnedWidthService.getPinnedLeftWidth() : this.pinnedWidthService.getPinnedRightWidth();
            if (width == null) {
                return;
            } // can happen at initialisation, width not yet set
            const hidden = (width == 0);
            const hiddenChanged = this.hidden !== hidden;
            const isRtl = this.gridOptionsService.is('enableRtl');
            const scrollbarWidth = this.gridOptionsService.getScrollbarWidth();
            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            const widthWithPadding = addPaddingForScrollbar ? width + scrollbarWidth : width;
            this.comp.setPinnedContainerWidth(`${widthWithPadding}px`);
            this.comp.setDisplayed(!hidden);
            if (hiddenChanged) {
                this.hidden = hidden;
                this.refresh();
            }
        };
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED, listener);
    }
    getHeaderCtrlForColumn(column) {
        if (column instanceof column_1.Column) {
            if (!this.columnsRowCtrl) {
                return;
            }
            return this.columnsRowCtrl.getHeaderCellCtrl(column);
        }
        if (this.groupsRowCtrls.length === 0) {
            return;
        }
        for (let i = 0; i < this.groupsRowCtrls.length; i++) {
            const ctrl = this.groupsRowCtrls[i].getHeaderCellCtrl(column);
            if (ctrl) {
                return ctrl;
            }
        }
    }
    getHtmlElementForColumnHeader(column) {
        /* tslint:enable */
        const cellCtrl = this.getHeaderCtrlForColumn(column);
        if (!cellCtrl) {
            return null;
        }
        return cellCtrl.getGui();
    }
    getRowType(rowIndex) {
        const allCtrls = this.getAllCtrls();
        const ctrl = allCtrls[rowIndex];
        return ctrl ? ctrl.getType() : undefined;
    }
    focusHeader(rowIndex, column, event) {
        const allCtrls = this.getAllCtrls();
        const ctrl = allCtrls[rowIndex];
        if (!ctrl) {
            return false;
        }
        return ctrl.focusHeader(column, event);
    }
    getRowCount() {
        return this.getAllCtrls().length;
    }
}
__decorate([
    context_1.Autowired('ctrlsService')
], HeaderRowContainerCtrl.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('scrollVisibleService')
], HeaderRowContainerCtrl.prototype, "scrollVisibleService", void 0);
__decorate([
    context_1.Autowired('pinnedWidthService')
], HeaderRowContainerCtrl.prototype, "pinnedWidthService", void 0);
__decorate([
    context_1.Autowired('columnModel')
], HeaderRowContainerCtrl.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('focusService')
], HeaderRowContainerCtrl.prototype, "focusService", void 0);
exports.HeaderRowContainerCtrl = HeaderRowContainerCtrl;
