/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { _ } from "../utils";
/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
var RowContainerComponent = /** @class */ (function () {
    function RowContainerComponent(params) {
        this.childCount = 0;
        this.rowTemplatesToAdd = [];
        this.afterGuiAttachedCallbacks = [];
        // this is to cater for a 'strange behaviour' where when a panel is made visible, it is firing a scroll
        // event which we want to ignore. see gridPanel.onAnyBodyScroll()
        this.lastMadeVisibleTime = 0;
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;
        if (params.eWrapper) {
            this.eWrapper = params.eWrapper;
        }
        this.hideWhenNoChildren = params.hideWhenNoChildren;
    }
    RowContainerComponent.prototype.setVerticalScrollPosition = function (verticalScrollPosition) {
        this.scrollTop = verticalScrollPosition;
    };
    RowContainerComponent.prototype.postConstruct = function () {
        this.checkDomOrder();
        this.checkVisibility();
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_DOM_LAYOUT, this.checkDomOrder.bind(this));
    };
    RowContainerComponent.prototype.checkDomOrder = function () {
        this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder();
    };
    RowContainerComponent.prototype.getRowElement = function (compId) {
        return this.eContainer.querySelector("[comp-id=\"" + compId + "\"]");
    };
    RowContainerComponent.prototype.setHeight = function (height) {
        if (height == null) {
            this.eContainer.style.height = '';
            return;
        }
        this.eContainer.style.height = height + "px";
        if (this.eWrapper) {
            this.eWrapper.style.height = height + "px";
        }
    };
    RowContainerComponent.prototype.flushRowTemplates = function () {
        // if doing dom order, then rowTemplates will be empty,
        // or if no rows added since last time also empty.
        if (this.rowTemplatesToAdd.length !== 0) {
            var htmlToAdd = this.rowTemplatesToAdd.join('');
            _.appendHtml(this.eContainer, htmlToAdd);
            this.rowTemplatesToAdd.length = 0;
        }
        // this only empty if no rows since last time, as when
        // doing dom order, we still have callbacks to process
        this.afterGuiAttachedCallbacks.forEach(function (func) { return func(); });
        this.afterGuiAttachedCallbacks.length = 0;
        this.lastPlacedElement = null;
    };
    RowContainerComponent.prototype.appendRowTemplate = function (rowTemplate, callback) {
        if (this.domOrder) {
            this.lastPlacedElement = _.insertTemplateWithDomOrder(this.eContainer, rowTemplate, this.lastPlacedElement);
        }
        else {
            this.rowTemplatesToAdd.push(rowTemplate);
        }
        this.afterGuiAttachedCallbacks.push(callback);
        // it is important we put items in in order, so that when we open a row group,
        // the new rows are inserted after the opened group, but before the rows below.
        // that way, the rows below are over the new rows (as dom renders last in dom over
        // items previous in dom), otherwise the child rows would cover the row below and
        // that meant the user doesn't see the rows below slide away.
        this.childCount++;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.ensureDomOrder = function (eRow) {
        if (this.domOrder) {
            _.ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    };
    RowContainerComponent.prototype.removeRowElement = function (eRow) {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.checkVisibility = function () {
        if (!this.hideWhenNoChildren) {
            return;
        }
        var eGui = this.eViewport ? this.eViewport : this.eContainer;
        var visible = this.childCount > 0;
        if (this.visible !== visible) {
            this.visible = visible;
            this.lastMadeVisibleTime = new Date().getTime();
            _.setDisplayed(eGui, visible);
            // if we are showing the viewport, then the scroll is always zero,
            // so we need to align with the other sections (ie if this is full
            // width container, and first time showing a full width row, we need to
            // scroll it so full width rows are show in right place alongside the
            // body rows). without this, there was an issue with 'loading rows' for
            // server side row model, as loading rows are full width, and they were
            // not getting displayed in the right location when rows were expanded.
            if (visible && this.eViewport) {
                this.eViewport.scrollTop = this.scrollTop;
            }
        }
    };
    RowContainerComponent.prototype.isMadeVisibleRecently = function () {
        var now = new Date().getTime();
        var millisSinceVisible = now - this.lastMadeVisibleTime;
        return millisSinceVisible < 500;
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], RowContainerComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], RowContainerComponent.prototype, "postConstruct", null);
    return RowContainerComponent;
}());
export { RowContainerComponent };
