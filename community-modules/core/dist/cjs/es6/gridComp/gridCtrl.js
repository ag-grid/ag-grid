/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
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
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const moduleRegistry_1 = require("../modules/moduleRegistry");
const moduleNames_1 = require("../modules/moduleNames");
const layoutFeature_1 = require("../styling/layoutFeature");
const eventKeys_1 = require("../eventKeys");
const array_1 = require("../utils/array");
class GridCtrl extends beanStub_1.BeanStub {
    postConstruct() {
        this.ctrlsService.registerGridCtrl(this);
    }
    setComp(view, eGridDiv, eGui) {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;
        this.mouseEventService.stampTopLevelGridCompWithGridInstance(eGridDiv);
        this.createManagedBean(new layoutFeature_1.LayoutFeature(this.view));
        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();
        this.addManagedListener(this, eventKeys_1.Events.EVENT_KEYBOARD_FOCUS, () => {
            this.view.addOrRemoveKeyboardFocusClass(true);
        });
        this.addManagedListener(this, eventKeys_1.Events.EVENT_MOUSE_FOCUS, () => {
            this.view.addOrRemoveKeyboardFocusClass(false);
        });
        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eGridHostDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());
    }
    showDropZones() {
        return moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.RowGroupingModule);
    }
    showSideBar() {
        return moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.SideBarModule);
    }
    showStatusBar() {
        return moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.StatusBarModule);
    }
    showWatermark() {
        return moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule);
    }
    onGridSizeChanged() {
        const event = {
            type: eventKeys_1.Events.EVENT_GRID_SIZE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight
        };
        this.eventService.dispatchEvent(event);
    }
    addRtlSupport() {
        const cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
        this.view.setRtlClass(cssClass);
    }
    destroyGridUi() {
        this.view.destroyGridUi();
    }
    getGui() {
        return this.eGui;
    }
    setResizeCursor(on) {
        this.view.setCursor(on ? 'ew-resize' : null);
    }
    disableUserSelect(on) {
        this.view.setUserSelect(on ? 'none' : null);
    }
    focusNextInnerContainer(backwards) {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const focusableContainers = this.view.getFocusableContainers();
        const idxWithFocus = focusableContainers.findIndex(container => container.contains(eDocument.activeElement));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);
        if (nextIdx <= 0 || nextIdx >= focusableContainers.length) {
            return false;
        }
        return this.focusService.focusInto(focusableContainers[nextIdx]);
    }
    focusInnerElement(fromBottom) {
        const focusableContainers = this.view.getFocusableContainers();
        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusService.focusInto(array_1.last(focusableContainers), true);
            }
            const lastColumn = array_1.last(this.columnModel.getAllDisplayedColumns());
            if (this.focusService.focusGridView(lastColumn, true)) {
                return true;
            }
        }
        return this.focusService.focusFirstHeader();
    }
    forceFocusOutOfContainer(up = false) {
        this.view.forceFocusOutOfContainer(up);
    }
}
__decorate([
    context_1.Autowired('columnApi')
], GridCtrl.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('gridApi')
], GridCtrl.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('focusService')
], GridCtrl.prototype, "focusService", void 0);
__decorate([
    context_1.Autowired('resizeObserverService')
], GridCtrl.prototype, "resizeObserverService", void 0);
__decorate([
    context_1.Autowired('columnModel')
], GridCtrl.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('ctrlsService')
], GridCtrl.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('mouseEventService')
], GridCtrl.prototype, "mouseEventService", void 0);
__decorate([
    context_1.PostConstruct
], GridCtrl.prototype, "postConstruct", null);
exports.GridCtrl = GridCtrl;

//# sourceMappingURL=gridCtrl.js.map
