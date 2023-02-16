/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderRowContainerComp = void 0;
var context_1 = require("../../context/context");
var dom_1 = require("../../utils/dom");
var object_1 = require("../../utils/object");
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var headerRowComp_1 = require("../row/headerRowComp");
var headerRowContainerCtrl_1 = require("./headerRowContainerCtrl");
var HeaderRowContainerComp = /** @class */ (function (_super) {
    __extends(HeaderRowContainerComp, _super);
    function HeaderRowContainerComp(pinned) {
        var _this = _super.call(this) || this;
        _this.headerRowComps = {};
        _this.rowCompsList = [];
        _this.pinned = pinned;
        return _this;
    }
    HeaderRowContainerComp.prototype.init = function () {
        var _this = this;
        this.selectAndSetTemplate();
        var compProxy = {
            setDisplayed: function (displayed) { return _this.setDisplayed(displayed); },
            setCtrls: function (ctrls) { return _this.setCtrls(ctrls); },
            // only gets called for center section
            setCenterWidth: function (width) { return _this.eCenterContainer.style.width = width; },
            setContainerTransform: function (transform) { return _this.eCenterContainer.style.transform = transform; },
            // only gets called for pinned sections
            setPinnedContainerWidth: function (width) {
                var eGui = _this.getGui();
                eGui.style.width = width;
                eGui.style.maxWidth = width;
                eGui.style.minWidth = width;
            }
        };
        var ctrl = this.createManagedBean(new headerRowContainerCtrl_1.HeaderRowContainerCtrl(this.pinned));
        ctrl.setComp(compProxy, this.getGui());
    };
    HeaderRowContainerComp.prototype.selectAndSetTemplate = function () {
        var pinnedLeft = this.pinned == 'left';
        var pinnedRight = this.pinned == 'right';
        var template = pinnedLeft ? HeaderRowContainerComp.PINNED_LEFT_TEMPLATE :
            pinnedRight ? HeaderRowContainerComp.PINNED_RIGHT_TEMPLATE : HeaderRowContainerComp.CENTER_TEMPLATE;
        this.setTemplate(template);
        // for left and right, we add rows directly to the root element,
        // but for center container we add elements to the child container.
        this.eRowContainer = this.eCenterContainer ? this.eCenterContainer : this.getGui();
    };
    HeaderRowContainerComp.prototype.destroyRowComps = function () {
        this.setCtrls([]);
    };
    HeaderRowContainerComp.prototype.destroyRowComp = function (rowComp) {
        this.destroyBean(rowComp);
        this.eRowContainer.removeChild(rowComp.getGui());
    };
    HeaderRowContainerComp.prototype.setCtrls = function (ctrls) {
        var _this = this;
        var oldRowComps = this.headerRowComps;
        this.headerRowComps = {};
        this.rowCompsList = [];
        var prevGui;
        var appendEnsuringDomOrder = function (rowComp) {
            var eGui = rowComp.getGui();
            var notAlreadyIn = eGui.parentElement != _this.eRowContainer;
            if (notAlreadyIn) {
                _this.eRowContainer.appendChild(eGui);
            }
            if (prevGui) {
                dom_1.ensureDomOrder(_this.eRowContainer, eGui, prevGui);
            }
            prevGui = eGui;
        };
        ctrls.forEach(function (ctrl) {
            var ctrlId = ctrl.getInstanceId();
            var existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];
            var rowComp = existingComp ? existingComp : _this.createBean(new headerRowComp_1.HeaderRowComp(ctrl));
            _this.headerRowComps[ctrlId] = rowComp;
            _this.rowCompsList.push(rowComp);
            appendEnsuringDomOrder(rowComp);
        });
        object_1.getAllValuesInObject(oldRowComps).forEach(function (c) { return _this.destroyRowComp(c); });
    };
    HeaderRowContainerComp.PINNED_LEFT_TEMPLATE = "<div class=\"ag-pinned-left-header\" role=\"presentation\"></div>";
    HeaderRowContainerComp.PINNED_RIGHT_TEMPLATE = "<div class=\"ag-pinned-right-header\" role=\"presentation\"></div>";
    HeaderRowContainerComp.CENTER_TEMPLATE = "<div class=\"ag-header-viewport\" role=\"presentation\">\n            <div class=\"ag-header-container\" ref=\"eCenterContainer\" role=\"rowgroup\"></div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eCenterContainer')
    ], HeaderRowContainerComp.prototype, "eCenterContainer", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeaderRowContainerComp.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], HeaderRowContainerComp.prototype, "destroyRowComps", null);
    return HeaderRowContainerComp;
}(component_1.Component));
exports.HeaderRowContainerComp = HeaderRowContainerComp;
