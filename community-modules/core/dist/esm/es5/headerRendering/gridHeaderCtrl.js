/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { KeyCode } from "../constants/keyCode";
import { BeanStub } from "../context/beanStub";
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";
import { exists } from "../utils/generic";
import { ManagedFocusFeature } from "../widgets/managedFocusFeature";
import { HeaderNavigationDirection } from "./common/headerNavigationService";
var GridHeaderCtrl = /** @class */ (function (_super) {
    __extends(GridHeaderCtrl, _super);
    function GridHeaderCtrl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridHeaderCtrl.prototype.setComp = function (comp, eGui, eFocusableElement) {
        this.comp = comp;
        this.eGui = eGui;
        this.createManagedBean(new ManagedFocusFeature(eFocusableElement, {
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusOut: this.onFocusOut.bind(this)
        }));
        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.onPivotModeChanged();
        this.setupHeaderHeight();
        this.ctrlsService.registerGridHeaderCtrl(this);
    };
    GridHeaderCtrl.prototype.setupHeaderHeight = function () {
        var listener = this.setHeaderHeight.bind(this);
        listener();
        this.addManagedPropertyListener('headerHeight', listener);
        this.addManagedPropertyListener('pivotHeaderHeight', listener);
        this.addManagedPropertyListener('groupHeaderHeight', listener);
        this.addManagedPropertyListener('pivotGroupHeaderHeight', listener);
        this.addManagedPropertyListener('floatingFiltersHeight', listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, listener);
    };
    GridHeaderCtrl.prototype.getHeaderHeight = function () {
        return this.headerHeight;
    };
    GridHeaderCtrl.prototype.setHeaderHeight = function () {
        var columnModel = this.columnModel;
        var numberOfFloating = 0;
        var headerRowCount = columnModel.getHeaderRowCount();
        var totalHeaderHeight;
        var hasFloatingFilters = columnModel.hasFloatingFilters();
        if (hasFloatingFilters) {
            headerRowCount++;
            numberOfFloating = 1;
        }
        var groupHeight = this.columnModel.getColumnGroupHeaderRowHeight();
        var headerHeight = this.columnModel.getColumnHeaderRowHeight();
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        totalHeaderHeight = numberOfFloating * columnModel.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;
        if (this.headerHeight === totalHeaderHeight) {
            return;
        }
        this.headerHeight = totalHeaderHeight;
        // one extra pixel is needed here to account for the
        // height of the border
        var px = totalHeaderHeight + 1 + "px";
        this.comp.setHeightAndMinHeight(px);
        this.eventService.dispatchEvent({
            type: Events.EVENT_HEADER_HEIGHT_CHANGED
        });
    };
    GridHeaderCtrl.prototype.onPivotModeChanged = function () {
        var pivotMode = this.columnModel.isPivotMode();
        this.comp.addOrRemoveCssClass('ag-pivot-on', pivotMode);
        this.comp.addOrRemoveCssClass('ag-pivot-off', !pivotMode);
    };
    GridHeaderCtrl.prototype.onTabKeyDown = function (e) {
        var isRtl = this.gridOptionsService.is('enableRtl');
        var direction = e.shiftKey !== isRtl
            ? HeaderNavigationDirection.LEFT
            : HeaderNavigationDirection.RIGHT;
        if (this.headerNavigationService.navigateHorizontally(direction, true, e) ||
            this.focusService.focusNextGridCoreContainer(e.shiftKey)) {
            e.preventDefault();
        }
    };
    GridHeaderCtrl.prototype.handleKeyDown = function (e) {
        var direction = null;
        switch (e.key) {
            case KeyCode.LEFT:
                direction = HeaderNavigationDirection.LEFT;
            case KeyCode.RIGHT:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.RIGHT;
                }
                this.headerNavigationService.navigateHorizontally(direction, false, e);
                break;
            case KeyCode.UP:
                direction = HeaderNavigationDirection.UP;
            case KeyCode.DOWN:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.DOWN;
                }
                if (this.headerNavigationService.navigateVertically(direction, null, e)) {
                    e.preventDefault();
                }
                break;
            default:
                return;
        }
    };
    GridHeaderCtrl.prototype.onFocusOut = function (e) {
        var eDocument = this.gridOptionsService.getDocument();
        var relatedTarget = e.relatedTarget;
        if (!relatedTarget && this.eGui.contains(eDocument.activeElement)) {
            return;
        }
        if (!this.eGui.contains(relatedTarget)) {
            this.focusService.clearFocusedHeader();
        }
    };
    __decorate([
        Autowired('headerNavigationService')
    ], GridHeaderCtrl.prototype, "headerNavigationService", void 0);
    __decorate([
        Autowired('focusService')
    ], GridHeaderCtrl.prototype, "focusService", void 0);
    __decorate([
        Autowired('columnModel')
    ], GridHeaderCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], GridHeaderCtrl.prototype, "ctrlsService", void 0);
    return GridHeaderCtrl;
}(BeanStub));
export { GridHeaderCtrl };
