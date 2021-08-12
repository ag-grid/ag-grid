/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
import { Autowired, Optional, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { ModuleNames } from "../modules/moduleNames";
import { LayoutFeature } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { findIndex, last } from "../utils/array";
var GridCtrl = /** @class */ (function (_super) {
    __extends(GridCtrl, _super);
    function GridCtrl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridCtrl.prototype.postConstruct = function () {
        this.logger = this.loggerFactory.create('GridCompController');
        this.ctrlsService.registerGridCtrl(this);
    };
    GridCtrl.prototype.setComp = function (view, eGridDiv, eGui) {
        var _this = this;
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;
        this.mouseEventService.stampTopLevelGridCompWithGridInstance(eGridDiv);
        this.createManagedBean(new LayoutFeature(this.view));
        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();
        this.addManagedListener(this, Events.EVENT_KEYBOARD_FOCUS, function () {
            _this.view.addOrRemoveKeyboardFocusClass(true);
        });
        this.addManagedListener(this, Events.EVENT_MOUSE_FOCUS, function () {
            _this.view.addOrRemoveKeyboardFocusClass(false);
        });
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.eGridHostDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    GridCtrl.prototype.showDropZones = function () {
        return ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule);
    };
    GridCtrl.prototype.showSideBar = function () {
        return ModuleRegistry.isRegistered(ModuleNames.SideBarModule);
    };
    GridCtrl.prototype.showStatusBar = function () {
        return ModuleRegistry.isRegistered(ModuleNames.StatusBarModule);
    };
    GridCtrl.prototype.showWatermark = function () {
        return ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);
    };
    GridCtrl.prototype.onGridSizeChanged = function () {
        var event = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight
        };
        this.eventService.dispatchEvent(event);
    };
    GridCtrl.prototype.addRtlSupport = function () {
        var cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
        this.view.setRtlClass(cssClass);
    };
    GridCtrl.prototype.destroyGridUi = function () {
        this.view.destroyGridUi();
    };
    GridCtrl.prototype.getGui = function () {
        return this.eGui;
    };
    GridCtrl.prototype.setResizeCursor = function (on) {
        this.view.setCursor(on ? 'ew-resize' : null);
    };
    GridCtrl.prototype.disableUserSelect = function (on) {
        this.view.setUserSelect(on ? 'none' : null);
    };
    GridCtrl.prototype.focusNextInnerContainer = function (backwards) {
        var focusableContainers = this.view.getFocusableContainers();
        var idxWithFocus = findIndex(focusableContainers, function (container) { return container.contains(document.activeElement); });
        var nextIdx = idxWithFocus + (backwards ? -1 : 1);
        if (nextIdx < 0 || nextIdx >= focusableContainers.length) {
            return false;
        }
        if (nextIdx === 0) {
            return this.focusGridHeader();
        }
        return this.focusService.focusInto(focusableContainers[nextIdx]);
    };
    GridCtrl.prototype.focusInnerElement = function (fromBottom) {
        var focusableContainers = this.view.getFocusableContainers();
        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusService.focusInto(last(focusableContainers));
            }
            var lastColumn = last(this.columnModel.getAllDisplayedColumns());
            if (this.focusService.focusGridView(lastColumn, true)) {
                return true;
            }
        }
        return this.focusGridHeader();
    };
    GridCtrl.prototype.focusGridHeader = function () {
        var firstColumn = this.columnModel.getAllDisplayedColumns()[0];
        if (!firstColumn) {
            return false;
        }
        if (firstColumn.getParent()) {
            firstColumn = this.columnModel.getColumnGroupAtLevel(firstColumn, 0);
        }
        this.focusService.focusHeaderPosition({ headerRowIndex: 0, column: firstColumn });
        return true;
    };
    GridCtrl.prototype.forceFocusOutOfContainer = function (up) {
        if (up === void 0) { up = false; }
        this.view.forceFocusOutOfContainer(up);
    };
    __decorate([
        Autowired('columnApi')
    ], GridCtrl.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], GridCtrl.prototype, "gridApi", void 0);
    __decorate([
        Autowired('focusService')
    ], GridCtrl.prototype, "focusService", void 0);
    __decorate([
        Optional('clipboardService')
    ], GridCtrl.prototype, "clipboardService", void 0);
    __decorate([
        Autowired('loggerFactory')
    ], GridCtrl.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('resizeObserverService')
    ], GridCtrl.prototype, "resizeObserverService", void 0);
    __decorate([
        Autowired('columnModel')
    ], GridCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], GridCtrl.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('mouseEventService')
    ], GridCtrl.prototype, "mouseEventService", void 0);
    __decorate([
        PostConstruct
    ], GridCtrl.prototype, "postConstruct", null);
    return GridCtrl;
}(BeanStub));
export { GridCtrl };
