/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
var RowContainerComponent = (function () {
    function RowContainerComponent(params) {
        this.childCount = 0;
        this.rowTemplatesToAdd = [];
        this.afterGuiAttachedCallbacks = [];
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;
        this.hideWhenNoChildren = params.hideWhenNoChildren;
        this.body = params.body;
    }
    RowContainerComponent.prototype.postConstruct = function () {
        this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder() && !this.gridOptionsWrapper.isForPrint();
        this.checkVisibility();
    };
    RowContainerComponent.prototype.getRowElement = function (compId) {
        return this.eContainer.querySelector("[comp-id=\"" + compId + "\"]");
    };
    RowContainerComponent.prototype.setHeight = function (height) {
        this.eContainer.style.height = height + "px";
        // can ask niall about this - was testing different ways to get the browser to display
        // unlimited number of rows
        // if (this.body) {
        //     let eParent = this.eViewport;
        //
        //     let FILLER_HEIGHT = 1000000;
        //
        //     let fillerCount = 0;
        //     let colors = ['#000020','#000040','#000060','#000080','#0000A0','#0000C0','#0000E0','#00F000','#00F020','#00F040','#00F060','#00F080','#00F0A0','#00F0C0','#00F0E0'];
        //     _.removeAllChildren(eParent);
        //     let pixelsToGo = height;
        //     while (pixelsToGo > 0) {
        //         fillerCount++;
        //         let pixelsThisDiv = (pixelsToGo > FILLER_HEIGHT) ? FILLER_HEIGHT : pixelsToGo;
        //         pixelsToGo -= FILLER_HEIGHT;
        //         let eFiller = document.createElement('div');
        //         eFiller.style.height = pixelsThisDiv + 'px';
        //         eFiller.style.backgroundColor = colors[fillerCount%colors.length];
        //         eFiller.innerHTML = '' + fillerCount;
        //         eParent.appendChild(eFiller);
        //     }
        //     console.log(`fillerCount = ${fillerCount}`);
        // }
    };
    RowContainerComponent.prototype.flushRowTemplates = function () {
        // if doing dom order, then rowTemplates will be empty,
        // or if no rows added since last time also empty.
        if (this.rowTemplatesToAdd.length !== 0) {
            var htmlToAdd = this.rowTemplatesToAdd.join('');
            utils_1.Utils.appendHtml(this.eContainer, htmlToAdd);
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
            this.lastPlacedElement = utils_1.Utils.insertTemplateWithDomOrder(this.eContainer, rowTemplate, this.lastPlacedElement);
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
            utils_1.Utils.ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
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
            utils_1.Utils.setVisible(eGui, visible);
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowContainerComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowContainerComponent.prototype, "postConstruct", null);
    return RowContainerComponent;
}());
exports.RowContainerComponent = RowContainerComponent;
