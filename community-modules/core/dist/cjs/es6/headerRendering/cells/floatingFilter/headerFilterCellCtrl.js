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
const abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
const keyCode_1 = require("../../../constants/keyCode");
const context_1 = require("../../../context/context");
const column_1 = require("../../../entities/column");
const events_1 = require("../../../events");
const gridApi_1 = require("../../../gridApi");
const setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
const dom_1 = require("../../../utils/dom");
const icon_1 = require("../../../utils/icon");
const managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
const hoverFeature_1 = require("../hoverFeature");
const componentTypes_1 = require("../../../components/framework/componentTypes");
class HeaderFilterCellCtrl extends abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl {
    constructor(column, parentRowCtrl) {
        super(column, parentRowCtrl);
        this.column = column;
    }
    setComp(comp, eGui, eButtonShowMainFilter, eFloatingFilterBody) {
        super.setGui(eGui);
        this.comp = comp;
        this.eButtonShowMainFilter = eButtonShowMainFilter;
        this.eFloatingFilterBody = eFloatingFilterBody;
        const colDef = this.column.getColDef();
        const filterExists = !!colDef.filter || !!colDef.filterFramework;
        const floatingFilterExists = !!colDef.floatingFilter;
        this.active = filterExists && floatingFilterExists;
        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();
        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    }
    setupUi() {
        this.comp.addOrRemoveButtonWrapperCssClass('ag-hidden', !this.active || this.suppressFilterButton);
        if (!this.active) {
            return;
        }
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);
        const eMenuIcon = icon_1.createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        if (eMenuIcon) {
            this.eButtonShowMainFilter.appendChild(eMenuIcon);
        }
    }
    setupFocus() {
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    }
    onTabKeyDown(e) {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const activeEl = eDocument.activeElement;
        const wrapperHasFocus = activeEl === this.eGui;
        if (wrapperHasFocus) {
            return;
        }
        const nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);
        if (nextFocusableEl) {
            this.beans.headerNavigationService.scrollToColumn(this.column);
            e.preventDefault();
            nextFocusableEl.focus();
            return;
        }
        const nextFocusableColumn = this.findNextColumnWithFloatingFilter(e.shiftKey);
        if (!nextFocusableColumn) {
            return;
        }
        if (this.focusService.focusHeaderPosition({
            headerPosition: {
                headerRowIndex: this.getParentRowCtrl().getRowIndex(),
                column: nextFocusableColumn
            },
            event: e
        })) {
            e.preventDefault();
        }
    }
    findNextColumnWithFloatingFilter(backwards) {
        const columModel = this.beans.columnModel;
        let nextCol = this.column;
        do {
            nextCol = backwards
                ? columModel.getDisplayedColBefore(nextCol)
                : columModel.getDisplayedColAfter(nextCol);
            if (!nextCol) {
                break;
            }
        } while (!nextCol.getColDef().filter || !nextCol.getColDef().floatingFilter);
        return nextCol;
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
        const wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            case keyCode_1.KeyCode.LEFT:
            case keyCode_1.KeyCode.RIGHT:
                if (wrapperHasFocus) {
                    return;
                }
                e.stopPropagation();
            case keyCode_1.KeyCode.ENTER:
                if (wrapperHasFocus) {
                    if (this.focusService.focusInto(this.eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case keyCode_1.KeyCode.ESCAPE:
                if (!wrapperHasFocus) {
                    this.eGui.focus();
                }
        }
    }
    onFocusIn(e) {
        const isRelatedWithin = this.eGui.contains(e.relatedTarget);
        // when the focus is already within the component,
        // we default to the browser's behavior
        if (isRelatedWithin) {
            return;
        }
        const notFromHeaderWrapper = !!e.relatedTarget && !e.relatedTarget.classList.contains('ag-floating-filter');
        const fromWithinHeader = !!e.relatedTarget && dom_1.isElementChildOfClass(e.relatedTarget, 'ag-floating-filter');
        if (notFromHeaderWrapper && fromWithinHeader && e.target === this.eGui) {
            const lastFocusEvent = this.lastFocusEvent;
            const fromTab = !!(lastFocusEvent && lastFocusEvent.key === keyCode_1.KeyCode.TAB);
            if (lastFocusEvent && fromTab) {
                const shouldFocusLast = lastFocusEvent.shiftKey;
                this.focusService.focusInto(this.eGui, shouldFocusLast);
            }
        }
        const rowIndex = this.getRowIndex();
        this.beans.focusService.setFocusedHeader(rowIndex, this.column);
    }
    setupHover() {
        this.createManagedBean(new hoverFeature_1.HoverFeature([this.column], this.eGui));
        const listener = () => {
            if (!this.gridOptionsWrapper.isColumnHoverHighlight()) {
                return;
            }
            const hovered = this.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', hovered);
        };
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }
    setupLeft() {
        const setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.eGui, this.beans);
        this.createManagedBean(setLeftFeature);
    }
    setupUserComp() {
        if (!this.active) {
            return;
        }
        const colDef = this.column.getColDef();
        const filterParams = this.filterManager.createFilterParams(this.column, colDef);
        const finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, componentTypes_1.FilterComponent, filterParams);
        let defaultFloatingFilterType = this.userComponentFactory.getDefaultFloatingFilterType(colDef);
        if (defaultFloatingFilterType == null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }
        const params = {
            column: this.column,
            filterParams: finalFilterParams,
            currentParentModel: () => this.currentParentModel(),
            parentFilterInstance: (cb) => this.parentFilterInstance(cb),
            showParentFilter: () => this.showParentFilter(),
            suppressFilterButton: false // This one might be overridden from the colDef
        };
        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;
        const compDetails = this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
        if (compDetails) {
            this.comp.setCompDetails(compDetails);
        }
    }
    currentParentModel() {
        const filterComponent = this.getFilterComponent(false);
        return filterComponent ? filterComponent.resolveNow(null, filter => filter && filter.getModel()) : null;
    }
    getFilterComponent(createIfDoesNotExist = true) {
        return this.filterManager.getFilterComponent(this.column, 'NO_UI', createIfDoesNotExist);
    }
    parentFilterInstance(callback) {
        const filterComponent = this.getFilterComponent();
        if (filterComponent == null) {
            return;
        }
        filterComponent.then(instance => {
            callback(gridApi_1.unwrapUserComp(instance));
        });
    }
    showParentFilter() {
        const eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource, 'floatingFilter', 'filterMenuTab', ['filterMenuTab']);
    }
    setupSyncWithFilter() {
        if (!this.active) {
            return;
        }
        const syncWithFilter = (filterChangedEvent) => {
            const compPromise = this.comp.getFloatingFilterComp();
            if (!compPromise) {
                return;
            }
            const parentModel = this.currentParentModel();
            compPromise.then(comp => {
                if (comp) {
                    comp.onParentModelChanged(parentModel, filterChangedEvent);
                }
            });
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, syncWithFilter);
        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    }
    setupWidth() {
        const listener = () => {
            const width = `${this.column.getActualWidth()}px`;
            this.comp.setWidth(width);
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }
}
__decorate([
    context_1.Autowired('filterManager')
], HeaderFilterCellCtrl.prototype, "filterManager", void 0);
__decorate([
    context_1.Autowired('columnHoverService')
], HeaderFilterCellCtrl.prototype, "columnHoverService", void 0);
__decorate([
    context_1.Autowired('menuFactory')
], HeaderFilterCellCtrl.prototype, "menuFactory", void 0);
exports.HeaderFilterCellCtrl = HeaderFilterCellCtrl;
