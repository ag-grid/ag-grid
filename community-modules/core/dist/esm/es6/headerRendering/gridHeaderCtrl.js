/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { exists } from "../utils/generic";
import { ManagedFocusFeature } from "../widgets/managedFocusFeature";
import { HeaderNavigationDirection } from "./common/headerNavigationService";
export class GridHeaderCtrl extends BeanStub {
    setComp(comp, eGui, eFocusableElement) {
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
    }
    setupHeaderHeight() {
        const listener = this.setHeaderHeight.bind(this);
        listener();
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, listener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, listener);
    }
    getHeaderHeight() {
        return this.headerHeight;
    }
    setHeaderHeight() {
        const { columnModel, gridOptionsWrapper } = this;
        let numberOfFloating = 0;
        let headerRowCount = columnModel.getHeaderRowCount();
        let totalHeaderHeight;
        const hasFloatingFilters = columnModel.hasFloatingFilters();
        if (hasFloatingFilters) {
            headerRowCount++;
            numberOfFloating = 1;
        }
        const groupHeight = this.columnModel.getColumnGroupHeaderRowHeight();
        const headerHeight = this.columnModel.getColumnHeaderRowHeight();
        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;
        totalHeaderHeight = numberOfFloating * gridOptionsWrapper.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;
        if (this.headerHeight === totalHeaderHeight) {
            return;
        }
        this.headerHeight = totalHeaderHeight;
        // one extra pixel is needed here to account for the
        // height of the border
        const px = `${totalHeaderHeight + 1}px`;
        this.comp.setHeightAndMinHeight(px);
        this.eventService.dispatchEvent({
            type: Events.EVENT_HEADER_HEIGHT_CHANGED
        });
    }
    onPivotModeChanged() {
        const pivotMode = this.columnModel.isPivotMode();
        this.comp.addOrRemoveCssClass('ag-pivot-on', pivotMode);
        this.comp.addOrRemoveCssClass('ag-pivot-off', !pivotMode);
    }
    onTabKeyDown(e) {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        const direction = e.shiftKey !== isRtl
            ? HeaderNavigationDirection.LEFT
            : HeaderNavigationDirection.RIGHT;
        if (this.headerNavigationService.navigateHorizontally(direction, true, e) ||
            this.focusService.focusNextGridCoreContainer(e.shiftKey)) {
            e.preventDefault();
        }
    }
    handleKeyDown(e) {
        let direction = null;
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
    }
    onFocusOut(e) {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const { relatedTarget } = e;
        if (!relatedTarget && this.eGui.contains(eDocument.activeElement)) {
            return;
        }
        if (!this.eGui.contains(relatedTarget)) {
            this.focusService.clearFocusedHeader();
        }
    }
}
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
