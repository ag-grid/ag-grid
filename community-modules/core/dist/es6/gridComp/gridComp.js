/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { Autowired } from "../context/context";
import { RefSelector } from "../widgets/componentAnnotations";
import { ManagedFocusComponent } from "../widgets/managedFocusComponent";
import { addCssClass, addOrRemoveCssClass, isVisible } from "../utils/dom";
import { last } from "../utils/array";
import { FocusController } from "../focusController";
import { GridCompController } from "./gridCompController";
import { LayoutCssClasses } from "../styling/layoutFeature";
var GridComp = /** @class */ (function (_super) {
    __extends(GridComp, _super);
    function GridComp(eGridDiv) {
        var _this = _super.call(this, undefined, true) || this;
        _this.eGridDiv = eGridDiv;
        return _this;
    }
    GridComp.prototype.postConstruct = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('GridComp');
        var view = {
            destroyGridUi: function () { return _this.destroyBean(_this); },
            setRtlClass: function (cssClass) { return addCssClass(_this.getGui(), cssClass); },
            addOrRemoveKeyboardFocusClass: function (addOrRemove) { return _this.addOrRemoveCssClass(FocusController.AG_KEYBOARD_FOCUS, addOrRemove); },
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this)
        };
        this.con = this.createManagedBean(new GridCompController());
        var template = this.createTemplate();
        this.setTemplate(template);
        this.con.setView(view, this.eGridDiv, this.getGui());
        this.insertGridIntoDom();
        _super.prototype.postConstruct.call(this);
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
    GridComp.prototype.updateLayoutClasses = function (params) {
        addOrRemoveCssClass(this.eRootWrapperBody, LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        addOrRemoveCssClass(this.eRootWrapperBody, LayoutCssClasses.NORMAL, params.normal);
        addOrRemoveCssClass(this.eRootWrapperBody, LayoutCssClasses.PRINT, params.print);
        this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
        this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
    };
    GridComp.prototype.createTemplate = function () {
        var dropZones = this.con.showDropZones() ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        var sideBar = this.con.showSideBar() ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        var statusBar = this.con.showStatusBar() ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        var watermark = this.con.showWatermark() ? '<ag-watermark></ag-watermark>' : '';
        var template = /* html */ "<div ref=\"eRootWrapper\" class=\"ag-root-wrapper\">\n                " + dropZones + "\n                <div class=\"ag-root-wrapper-body\" ref=\"rootWrapperBody\">\n                    <ag-grid-body ref=\"gridBody\"></ag-grid-body>\n                    " + sideBar + "\n                </div>\n                " + statusBar + "\n                <ag-pagination></ag-pagination>\n                " + watermark + "\n            </div>";
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
    GridComp.prototype.focusInnerElement = function (fromBottom) {
        var focusableContainers = this.getFocusableContainers();
        if (fromBottom) {
            if (focusableContainers.length > 1) {
                return this.focusController.focusInto(last(focusableContainers));
            }
            var lastColumn = last(this.columnController.getAllDisplayedColumns());
            if (this.focusController.focusGridView(lastColumn, true)) {
                return true;
            }
        }
        return this.con.focusGridHeader();
    };
    GridComp.prototype.onTabKeyDown = function () { };
    __decorate([
        Autowired('columnController')
    ], GridComp.prototype, "columnController", void 0);
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
    return GridComp;
}(ManagedFocusComponent));
export { GridComp };
