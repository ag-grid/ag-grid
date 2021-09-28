/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.1.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, PostConstruct } from '../../../context/context';
import { Column } from '../../../entities/column';
import { Events } from '../../../events';
import { FloatingFilterMapper } from '../../../filter/floating/floatingFilterMapper';
import { ReadOnlyFloatingFilter } from '../../../filter/floating/provided/readOnlyFloatingFilter';
import { ModuleNames } from '../../../modules/moduleNames';
import { ModuleRegistry } from '../../../modules/moduleRegistry';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { AgPromise } from '../../../utils';
import { addOrRemoveCssClass, setDisplayed } from '../../../utils/dom';
import { createIconNoSpan } from '../../../utils/icon';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import { HoverFeature } from '../hoverFeature';
var HeaderFilterCellComp = /** @class */ (function (_super) {
    __extends(HeaderFilterCellComp, _super);
    function HeaderFilterCellComp(ctrl) {
        var _this = _super.call(this, HeaderFilterCellComp.TEMPLATE, ctrl) || this;
        _this.column = ctrl.getColumnGroupChild();
        _this.pinned = ctrl.getPinned();
        return _this;
    }
    HeaderFilterCellComp.prototype.postConstruct = function () {
        this.setupFloatingFilter();
        this.setupWidth();
        this.setupLeftPositioning();
        this.setupColumnHover();
        this.createManagedBean(new HoverFeature([this.column], this.getGui()));
        this.createManagedBean(new ManagedFocusFeature(this.getFocusableElement(), {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        var compProxy = {};
        this.ctrl.setComp(compProxy, this.getGui());
    };
    HeaderFilterCellComp.prototype.getColumn = function () {
        return this.column;
    };
    HeaderFilterCellComp.prototype.onTabKeyDown = function (e) {
        var activeEl = document.activeElement;
        var eGui = this.getGui();
        var wrapperHasFocus = activeEl === eGui;
        if (wrapperHasFocus) {
            return;
        }
        e.preventDefault();
        var nextFocusableEl = this.focusService.findNextFocusableElement(eGui, null, e.shiftKey);
        if (nextFocusableEl) {
            nextFocusableEl.focus();
        }
        else {
            eGui.focus();
        }
    };
    HeaderFilterCellComp.prototype.handleKeyDown = function (e) {
        var activeEl = document.activeElement;
        var eGui = this.getGui();
        var wrapperHasFocus = activeEl === eGui;
        switch (e.keyCode) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                if (wrapperHasFocus) {
                    return;
                }
                e.stopPropagation();
            case KeyCode.ENTER:
                if (wrapperHasFocus) {
                    if (this.focusService.focusInto(eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case KeyCode.ESCAPE:
                if (!wrapperHasFocus) {
                    this.getGui().focus();
                }
        }
    };
    HeaderFilterCellComp.prototype.onFocusIn = function (e) {
        var eGui = this.getGui();
        if (!eGui.contains(e.relatedTarget)) {
            var rowIndex = this.ctrl.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.getColumn());
        }
    };
    HeaderFilterCellComp.prototype.setupFloatingFilter = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        if ((!colDef.filter || !colDef.floatingFilter) && (!colDef.filterFramework || !colDef.floatingFilterComponentFramework)) {
            return;
        }
        this.floatingFilterCompPromise = this.getFloatingFilterInstance();
        if (!this.floatingFilterCompPromise) {
            return;
        }
        this.floatingFilterCompPromise.then(function (compInstance) {
            if (compInstance) {
                _this.setupWithFloatingFilter(compInstance);
                _this.setupSyncWithFilter();
            }
        });
    };
    HeaderFilterCellComp.prototype.setupLeftPositioning = function () {
        var setLeftFeature = new SetLeftFeature(this.column, this.getGui(), this.beans);
        this.createManagedBean(setLeftFeature);
    };
    HeaderFilterCellComp.prototype.setupSyncWithFilter = function () {
        var _this = this;
        var syncWithFilter = function (filterChangedEvent) {
            _this.onParentModelChanged(_this.currentParentModel(), filterChangedEvent);
        };
        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, syncWithFilter);
        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    };
    // linked to event listener in template
    HeaderFilterCellComp.prototype.showParentFilter = function () {
        var eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource, 'floatingFilter', 'filterMenuTab', ['filterMenuTab']);
    };
    HeaderFilterCellComp.prototype.setupColumnHover = function () {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    HeaderFilterCellComp.prototype.onColumnHover = function () {
        if (!this.gridOptionsWrapper.isColumnHoverHighlight()) {
            return;
        }
        addOrRemoveCssClass(this.getGui(), 'ag-column-hover', this.columnHoverService.isHovered(this.column));
    };
    HeaderFilterCellComp.prototype.setupWidth = function () {
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    HeaderFilterCellComp.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + "px";
    };
    HeaderFilterCellComp.prototype.setupWithFloatingFilter = function (floatingFilterComp) {
        var _this = this;
        var disposeFunc = function () {
            _this.getContext().destroyBean(floatingFilterComp);
        };
        if (!this.isAlive()) {
            disposeFunc();
            return;
        }
        this.addDestroyFunc(disposeFunc);
        var floatingFilterCompUi = floatingFilterComp.getGui();
        addOrRemoveCssClass(this.eFloatingFilterBody, 'ag-floating-filter-full-body', this.suppressFilterButton);
        addOrRemoveCssClass(this.eFloatingFilterBody, 'ag-floating-filter-body', !this.suppressFilterButton);
        setDisplayed(this.eButtonWrapper, !this.suppressFilterButton);
        var eIcon = createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        this.eButtonShowMainFilter.appendChild(eIcon);
        this.eFloatingFilterBody.appendChild(floatingFilterCompUi);
        if (floatingFilterComp.afterGuiAttached) {
            floatingFilterComp.afterGuiAttached();
        }
    };
    HeaderFilterCellComp.prototype.parentFilterInstance = function (callback) {
        var filterComponent = this.getFilterComponent();
        if (filterComponent) {
            filterComponent.then(callback);
        }
    };
    HeaderFilterCellComp.prototype.getFilterComponent = function (createIfDoesNotExist) {
        if (createIfDoesNotExist === void 0) { createIfDoesNotExist = true; }
        return this.filterManager.getFilterComponent(this.column, 'NO_UI', createIfDoesNotExist);
    };
    HeaderFilterCellComp.getDefaultFloatingFilterType = function (def) {
        if (def == null) {
            return null;
        }
        var defaultFloatingFilterType = null;
        if (typeof def.filter === 'string') {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterMapper.getFloatingFilterType(def.filter);
        }
        else if (def.filterFramework) {
            // If filterFramework, then grid is NOT using one of the provided filters, hence no default.
            // Note: We could combine this with another part of the 'if' statement, however explicitly
            // having this section makes the code easier to read.
        }
        else if (def.filter === true) {
            var setFilterModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
            defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }
        return defaultFloatingFilterType;
    };
    HeaderFilterCellComp.prototype.getFloatingFilterInstance = function () {
        var colDef = this.column.getColDef();
        var defaultFloatingFilterType = HeaderFilterCellComp.getDefaultFloatingFilterType(colDef);
        var filterParams = this.filterManager.createFilterParams(this.column, colDef);
        var finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, 'filter', filterParams);
        var params = {
            api: this.gridApi,
            column: this.column,
            filterParams: finalFilterParams,
            currentParentModel: this.currentParentModel.bind(this),
            parentFilterInstance: this.parentFilterInstance.bind(this),
            showParentFilter: this.showParentFilter.bind(this),
            onFloatingFilterChanged: this.onFloatingFilterChanged.bind(this),
            suppressFilterButton: false // This one might be overridden from the colDef
        };
        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;
        var promise = this.userComponentFactory.newFloatingFilterComponent(colDef, params, defaultFloatingFilterType);
        if (!promise) {
            var compInstance = this.userComponentFactory.createUserComponentFromConcreteClass(ReadOnlyFloatingFilter, params);
            promise = AgPromise.resolve(compInstance);
        }
        return promise;
    };
    HeaderFilterCellComp.prototype.currentParentModel = function () {
        var filterComponent = this.getFilterComponent(false);
        return filterComponent ? filterComponent.resolveNow(null, function (filter) { return filter && filter.getModel(); }) : null;
    };
    HeaderFilterCellComp.prototype.onParentModelChanged = function (model, filterChangedEvent) {
        if (!this.floatingFilterCompPromise) {
            return;
        }
        this.floatingFilterCompPromise.then(function (comp) { return comp && comp.onParentModelChanged(model, filterChangedEvent); });
    };
    HeaderFilterCellComp.prototype.onFloatingFilterChanged = function () {
        console.warn('AG Grid: since version 21.x, how floating filters are implemented has changed. ' +
            'Instead of calling params.onFloatingFilterChanged(), get a reference to the main filter via ' +
            'params.parentFilterInstance() and then set a value on the parent filter directly.');
    };
    HeaderFilterCellComp.TEMPLATE = "<div class=\"ag-header-cell ag-floating-filter\" role=\"gridcell\" tabindex=\"-1\">\n            <div class=\"ag-floating-filter-full-body\" ref=\"eFloatingFilterBody\" role=\"presentation\"></div>\n            <div class=\"ag-floating-filter-button ag-hidden\" ref=\"eButtonWrapper\" role=\"presentation\">\n                <button type=\"button\" aria-label=\"Open Filter Menu\" class=\"ag-floating-filter-button-button\" ref=\"eButtonShowMainFilter\" tabindex=\"-1\"></button>\n            </div>\n        </div>";
    __decorate([
        Autowired('columnHoverService')
    ], HeaderFilterCellComp.prototype, "columnHoverService", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], HeaderFilterCellComp.prototype, "userComponentFactory", void 0);
    __decorate([
        Autowired('gridApi')
    ], HeaderFilterCellComp.prototype, "gridApi", void 0);
    __decorate([
        Autowired('filterManager')
    ], HeaderFilterCellComp.prototype, "filterManager", void 0);
    __decorate([
        Autowired('menuFactory')
    ], HeaderFilterCellComp.prototype, "menuFactory", void 0);
    __decorate([
        Autowired('beans')
    ], HeaderFilterCellComp.prototype, "beans", void 0);
    __decorate([
        RefSelector('eFloatingFilterBody')
    ], HeaderFilterCellComp.prototype, "eFloatingFilterBody", void 0);
    __decorate([
        RefSelector('eButtonWrapper')
    ], HeaderFilterCellComp.prototype, "eButtonWrapper", void 0);
    __decorate([
        RefSelector('eButtonShowMainFilter')
    ], HeaderFilterCellComp.prototype, "eButtonShowMainFilter", void 0);
    __decorate([
        PostConstruct
    ], HeaderFilterCellComp.prototype, "postConstruct", null);
    return HeaderFilterCellComp;
}(AbstractHeaderCellComp));
export { HeaderFilterCellComp };
