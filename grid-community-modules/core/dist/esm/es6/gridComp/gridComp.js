/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PostConstruct } from "../context/context";
import { RefSelector } from "../widgets/componentAnnotations";
import { isVisible } from "../utils/dom";
import { FocusService } from "../focusService";
import { GridCtrl } from "./gridCtrl";
import { LayoutCssClasses } from "../styling/layoutFeature";
import { TabGuardComp } from "../widgets/tabGuardComp";
export class GridComp extends TabGuardComp {
    constructor(eGridDiv) {
        super();
        this.eGridDiv = eGridDiv;
    }
    postConstruct() {
        this.logger = this.loggerFactory.create('GridComp');
        const compProxy = {
            destroyGridUi: () => this.destroyBean(this),
            setRtlClass: (cssClass) => this.addCssClass(cssClass),
            addOrRemoveKeyboardFocusClass: (addOrRemove) => this.addOrRemoveCssClass(FocusService.AG_KEYBOARD_FOCUS, addOrRemove),
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this),
            setUserSelect: value => {
                this.getGui().style.userSelect = value != null ? value : '';
                this.getGui().style.webkitUserSelect = value != null ? value : '';
            },
            setCursor: value => {
                this.getGui().style.cursor = value != null ? value : '';
            }
        };
        this.ctrl = this.createManagedBean(new GridCtrl());
        const template = this.createTemplate();
        this.setTemplate(template);
        this.ctrl.setComp(compProxy, this.eGridDiv, this.getGui());
        this.insertGridIntoDom();
        this.initialiseTabGuard({
            // we want to override the default behaviour to do nothing for onTabKeyDown
            onTabKeyDown: () => undefined,
            focusInnerElement: fromBottom => this.ctrl.focusInnerElement(fromBottom)
        });
    }
    insertGridIntoDom() {
        const eGui = this.getGui();
        this.eGridDiv.appendChild(eGui);
        this.addDestroyFunc(() => {
            this.eGridDiv.removeChild(eGui);
            this.logger.log('Grid removed from DOM');
        });
    }
    updateLayoutClasses(cssClass, params) {
        const eRootWrapperBodyClassList = this.eRootWrapperBody.classList;
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.PRINT, params.print);
        this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
        this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
    }
    createTemplate() {
        const dropZones = this.ctrl.showDropZones() ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        const sideBar = this.ctrl.showSideBar() ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        const statusBar = this.ctrl.showStatusBar() ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        const watermark = this.ctrl.showWatermark() ? '<ag-watermark></ag-watermark>' : '';
        const template = /* html */ `<div class="ag-root-wrapper" role="presentation">
                ${dropZones}
                <div class="ag-root-wrapper-body" ref="rootWrapperBody" role="presentation">
                    <ag-grid-body ref="gridBody"></ag-grid-body>
                    ${sideBar}
                </div>
                ${statusBar}
                <ag-pagination></ag-pagination>
                ${watermark}
            </div>`;
        return template;
    }
    getFocusableElement() {
        return this.eRootWrapperBody;
    }
    getFocusableContainers() {
        const focusableContainers = [
            this.gridBodyComp.getGui()
        ];
        if (this.sideBarComp) {
            focusableContainers.push(this.sideBarComp.getGui());
        }
        return focusableContainers.filter(el => isVisible(el));
    }
}
__decorate([
    Autowired('loggerFactory')
], GridComp.prototype, "loggerFactory", void 0);
__decorate([
    RefSelector('gridBody')
], GridComp.prototype, "gridBodyComp", void 0);
__decorate([
    RefSelector('sideBar')
], GridComp.prototype, "sideBarComp", void 0);
__decorate([
    RefSelector('rootWrapperBody')
], GridComp.prototype, "eRootWrapperBody", void 0);
__decorate([
    PostConstruct
], GridComp.prototype, "postConstruct", null);
