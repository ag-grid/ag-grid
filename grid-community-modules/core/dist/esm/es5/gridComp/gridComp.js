/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
import { Autowired, PostConstruct } from "../context/context";
import { RefSelector } from "../widgets/componentAnnotations";
import { isVisible } from "../utils/dom";
import { FocusService } from "../focusService";
import { GridCtrl } from "./gridCtrl";
import { LayoutCssClasses } from "../styling/layoutFeature";
import { TabGuardComp } from "../widgets/tabGuardComp";
var GridComp = /** @class */ (function (_super) {
    __extends(GridComp, _super);
    function GridComp(eGridDiv) {
        var _this = _super.call(this) || this;
        _this.eGridDiv = eGridDiv;
        return _this;
    }
    GridComp.prototype.postConstruct = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('GridComp');
        var compProxy = {
            destroyGridUi: function () { return _this.destroyBean(_this); },
            setRtlClass: function (cssClass) { return _this.addCssClass(cssClass); },
            addOrRemoveKeyboardFocusClass: function (addOrRemove) { return _this.addOrRemoveCssClass(FocusService.AG_KEYBOARD_FOCUS, addOrRemove); },
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this),
            setUserSelect: function (value) {
                _this.getGui().style.userSelect = value != null ? value : '';
                _this.getGui().style.webkitUserSelect = value != null ? value : '';
            },
            setCursor: function (value) {
                _this.getGui().style.cursor = value != null ? value : '';
            }
        };
        this.ctrl = this.createManagedBean(new GridCtrl());
        var template = this.createTemplate();
        this.setTemplate(template);
        this.ctrl.setComp(compProxy, this.eGridDiv, this.getGui());
        this.insertGridIntoDom();
        this.initialiseTabGuard({
            // we want to override the default behaviour to do nothing for onTabKeyDown
            onTabKeyDown: function () { return undefined; },
            focusInnerElement: function (fromBottom) { return _this.ctrl.focusInnerElement(fromBottom); }
        });
    };
    GridComp.prototype.insertGridIntoDom = function () {
        var _this = this;
        var eGui = this.getGui();
        this.eGridDiv.appendChild(eGui);
        this.addDestroyFunc(function () {
            _this.eGridDiv.removeChild(eGui);
            _this.logger.log('Grid removed from DOM');
        });
    };
    GridComp.prototype.updateLayoutClasses = function (cssClass, params) {
        var eRootWrapperBodyClassList = this.eRootWrapperBody.classList;
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
        eRootWrapperBodyClassList.toggle(LayoutCssClasses.PRINT, params.print);
        this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
        this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
    };
    GridComp.prototype.createTemplate = function () {
        var dropZones = this.ctrl.showDropZones() ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        var sideBar = this.ctrl.showSideBar() ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        var statusBar = this.ctrl.showStatusBar() ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        var watermark = this.ctrl.showWatermark() ? '<ag-watermark></ag-watermark>' : '';
        var template = /* html */ "<div class=\"ag-root-wrapper\" role=\"presentation\">\n                " + dropZones + "\n                <div class=\"ag-root-wrapper-body\" ref=\"rootWrapperBody\" role=\"presentation\">\n                    <ag-grid-body ref=\"gridBody\"></ag-grid-body>\n                    " + sideBar + "\n                </div>\n                " + statusBar + "\n                <ag-pagination></ag-pagination>\n                " + watermark + "\n            </div>";
        return template;
    };
    GridComp.prototype.getFocusableElement = function () {
        return this.eRootWrapperBody;
    };
    GridComp.prototype.getFocusableContainers = function () {
        var focusableContainers = [
            this.gridBodyComp.getGui()
        ];
        if (this.sideBarComp) {
            focusableContainers.push(this.sideBarComp.getGui());
        }
        return focusableContainers.filter(function (el) { return isVisible(el); });
    };
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
    return GridComp;
}(TabGuardComp));
export { GridComp };
