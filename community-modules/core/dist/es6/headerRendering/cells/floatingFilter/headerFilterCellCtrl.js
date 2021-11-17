/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.2.0
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
import { AbstractHeaderCellCtrl } from "../abstractCell/abstractHeaderCellCtrl";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired, Optional } from '../../../context/context';
import { Column } from '../../../entities/column';
import { Events } from '../../../events';
import { FloatingFilterMapper } from '../../../filter/floating/floatingFilterMapper';
import { ModuleNames } from '../../../modules/moduleNames';
import { ModuleRegistry } from '../../../modules/moduleRegistry';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { isElementChildOfClass, containsClass } from '../../../utils/dom';
import { createIconNoSpan } from '../../../utils/icon';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import { HoverFeature } from '../hoverFeature';
var HeaderFilterCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderFilterCellCtrl, _super);
    function HeaderFilterCellCtrl(column, parentRowCtrl) {
        var _this = _super.call(this, column, parentRowCtrl) || this;
        _this.column = column;
        return _this;
    }
    HeaderFilterCellCtrl.prototype.setComp = function (comp, eGui, eButtonShowMainFilter, eFloatingFilterBody) {
        _super.prototype.setGui.call(this, eGui);
        this.comp = comp;
        this.eButtonShowMainFilter = eButtonShowMainFilter;
        this.eFloatingFilterBody = eFloatingFilterBody;
        var colDef = this.column.getColDef();
        // const active = !(!(colDef.filter && colDef.floatingFilter) && !(colDef.filterFramework && colDef.floatingFilterComponentFramework));
        this.active = (!!colDef.filter || !!colDef.filterFramework) && !!colDef.floatingFilter;
        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();
        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    };
    HeaderFilterCellCtrl.prototype.setupUi = function () {
        this.comp.addOrRemoveButtonWrapperCssClass('ag-hidden', !this.active || this.suppressFilterButton);
        if (!this.active) {
            return;
        }
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);
        var eMenuIcon = createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        if (eMenuIcon) {
            this.eButtonShowMainFilter.appendChild(eMenuIcon);
        }
    };
    HeaderFilterCellCtrl.prototype.setupFocus = function () {
        this.createManagedBean(new ManagedFocusFeature(this.eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    };
    HeaderFilterCellCtrl.prototype.onTabKeyDown = function (e) {
        var activeEl = document.activeElement;
        var wrapperHasFocus = activeEl === this.eGui;
        if (wrapperHasFocus) {
            return;
        }
        var nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);
        if (nextFocusableEl) {
            e.preventDefault();
            nextFocusableEl.focus();
        }
    };
    HeaderFilterCellCtrl.prototype.handleKeyDown = function (e) {
        var activeEl = document.activeElement;
        var wrapperHasFocus = activeEl === this.eGui;
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
                    if (this.focusService.focusInto(this.eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case KeyCode.ESCAPE:
                if (!wrapperHasFocus) {
                    this.eGui.focus();
                }
        }
    };
    HeaderFilterCellCtrl.prototype.onFocusIn = function (e) {
        var isRelatedWithin = this.eGui.contains(e.relatedTarget);
        // when the focus is already within the component,
        // we default to the browser's behavior
        if (isRelatedWithin) {
            return;
        }
        var keyboardMode = this.focusService.isKeyboardMode();
        var notFromHeaderWrapper = !!e.relatedTarget && !containsClass(e.relatedTarget, 'ag-floating-filter');
        var fromWithinHeader = !!e.relatedTarget && isElementChildOfClass(e.relatedTarget, 'ag-floating-filter');
        if (keyboardMode && notFromHeaderWrapper && fromWithinHeader && e.target === this.eGui) {
            var lastFocusEvent = this.lastFocusEvent;
            var fromTab = !!(lastFocusEvent && lastFocusEvent.keyCode === KeyCode.TAB);
            if (lastFocusEvent && fromTab) {
                var currentFocusedHeader = this.beans.focusService.getFocusedHeader();
                var nextColumn = this.beans.columnModel.getDisplayedColAfter(this.column);
                var fromNextColumn = currentFocusedHeader && nextColumn === currentFocusedHeader.column;
                var shouldFocusLast = !!(keyboardMode && lastFocusEvent.shiftKey && fromNextColumn);
                this.focusService.focusInto(this.eGui, shouldFocusLast);
            }
        }
        var rowIndex = this.getRowIndex();
        this.beans.focusService.setFocusedHeader(rowIndex, this.column);
    };
    HeaderFilterCellCtrl.prototype.setupHover = function () {
        var _this = this;
        this.createManagedBean(new HoverFeature([this.column], this.eGui));
        var listener = function () {
            if (!_this.gridOptionsWrapper.isColumnHoverHighlight()) {
                return;
            }
            var hovered = _this.columnHoverService.isHovered(_this.column);
            _this.comp.addOrRemoveCssClass('ag-column-hover', hovered);
        };
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    };
    HeaderFilterCellCtrl.prototype.setupLeft = function () {
        var setLeftFeature = new SetLeftFeature(this.column, this.eGui, this.beans);
        this.createManagedBean(setLeftFeature);
    };
    HeaderFilterCellCtrl.prototype.setupUserComp = function () {
        if (!this.active) {
            return;
        }
        var colDef = this.column.getColDef();
        var filterParams = this.filterManager.createFilterParams(this.column, colDef);
        var finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, 'filter', filterParams);
        var defaultFloatingFilterType = HeaderFilterCellCtrl.getDefaultFloatingFilterType(colDef);
        if (defaultFloatingFilterType == null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }
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
        var compDetails = this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
        if (compDetails) {
            this.comp.setCompDetails(compDetails);
        }
    };
    HeaderFilterCellCtrl.getDefaultFloatingFilterType = function (def) {
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
    HeaderFilterCellCtrl.prototype.currentParentModel = function () {
        var filterComponent = this.getFilterComponent(false);
        return filterComponent ? filterComponent.resolveNow(null, function (filter) { return filter && filter.getModel(); }) : null;
    };
    HeaderFilterCellCtrl.prototype.getFilterComponent = function (createIfDoesNotExist) {
        if (createIfDoesNotExist === void 0) { createIfDoesNotExist = true; }
        return this.filterManager.getFilterComponent(this.column, 'NO_UI', createIfDoesNotExist);
    };
    HeaderFilterCellCtrl.prototype.onFloatingFilterChanged = function () {
        console.warn('AG Grid: since version 21.x, how floating filters are implemented has changed. ' +
            'Instead of calling params.onFloatingFilterChanged(), get a reference to the main filter via ' +
            'params.parentFilterInstance() and then set a value on the parent filter directly.');
    };
    HeaderFilterCellCtrl.prototype.parentFilterInstance = function (callback) {
        var _this = this;
        var filterComponent = this.getFilterComponent();
        if (filterComponent) {
            filterComponent.then(function (instance) {
                var instanceUnwrapped = _this.frameworkComponentWrapper ? _this.frameworkComponentWrapper.unwrap(instance) : instance;
                callback(instanceUnwrapped);
            });
        }
    };
    HeaderFilterCellCtrl.prototype.showParentFilter = function () {
        var eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource, 'floatingFilter', 'filterMenuTab', ['filterMenuTab']);
    };
    HeaderFilterCellCtrl.prototype.setupSyncWithFilter = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        var syncWithFilter = function (filterChangedEvent) {
            var compPromise = _this.comp.getFloatingFilterComp();
            if (!compPromise) {
                return;
            }
            var parentModel = _this.currentParentModel();
            compPromise.then(function (comp) { return comp && comp.onParentModelChanged(parentModel, filterChangedEvent); });
        };
        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, syncWithFilter);
        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    };
    HeaderFilterCellCtrl.prototype.setupWidth = function () {
        var _this = this;
        var listener = function () {
            var width = _this.column.getActualWidth() + "px";
            _this.comp.setWidth(width);
        };
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    };
    __decorate([
        Autowired('userComponentFactory')
    ], HeaderFilterCellCtrl.prototype, "userComponentFactory", void 0);
    __decorate([
        Autowired('filterManager')
    ], HeaderFilterCellCtrl.prototype, "filterManager", void 0);
    __decorate([
        Autowired('columnHoverService')
    ], HeaderFilterCellCtrl.prototype, "columnHoverService", void 0);
    __decorate([
        Autowired('gridApi')
    ], HeaderFilterCellCtrl.prototype, "gridApi", void 0);
    __decorate([
        Autowired('menuFactory')
    ], HeaderFilterCellCtrl.prototype, "menuFactory", void 0);
    __decorate([
        Autowired('beans')
    ], HeaderFilterCellCtrl.prototype, "beans", void 0);
    __decorate([
        Optional('frameworkComponentWrapper')
    ], HeaderFilterCellCtrl.prototype, "frameworkComponentWrapper", void 0);
    return HeaderFilterCellCtrl;
}(AbstractHeaderCellCtrl));
export { HeaderFilterCellCtrl };
