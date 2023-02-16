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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowContainerComp = void 0;
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var context_1 = require("../../context/context");
var rowContainerCtrl_1 = require("./rowContainerCtrl");
var dom_1 = require("../../utils/dom");
var rowComp_1 = require("../../rendering/row/rowComp");
var object_1 = require("../../utils/object");
var aria_1 = require("../../utils/aria");
function templateFactory() {
    var name = component_1.Component.elementGettingCreated.getAttribute('name');
    var cssClasses = rowContainerCtrl_1.RowContainerCtrl.getRowContainerCssClasses(name);
    var res;
    var template1 = name === rowContainerCtrl_1.RowContainerName.CENTER;
    var template2 = name === rowContainerCtrl_1.RowContainerName.TOP_CENTER
        || name === rowContainerCtrl_1.RowContainerName.STICKY_TOP_CENTER
        || name === rowContainerCtrl_1.RowContainerName.BOTTOM_CENTER;
    if (template1) {
        res = /* html */
            "<div class=\"" + cssClasses.wrapper + "\" ref=\"eWrapper\" role=\"presentation\">\n                <div class=\"" + cssClasses.viewport + "\" ref=\"eViewport\" role=\"presentation\">\n                    <div class=\"" + cssClasses.container + "\" ref=\"eContainer\"></div>\n                </div>\n            </div>";
    }
    else if (template2) {
        res = /* html */
            "<div class=\"" + cssClasses.viewport + "\" ref=\"eViewport\" role=\"presentation\">\n                <div class=\"" + cssClasses.container + "\" ref=\"eContainer\"></div>\n            </div>";
    }
    else {
        res = /* html */
            "<div class=\"" + cssClasses.container + "\" ref=\"eContainer\"></div>";
    }
    return res;
}
var RowContainerComp = /** @class */ (function (_super) {
    __extends(RowContainerComp, _super);
    function RowContainerComp() {
        var _this = _super.call(this, templateFactory()) || this;
        _this.rowComps = {};
        _this.name = component_1.Component.elementGettingCreated.getAttribute('name');
        _this.type = rowContainerCtrl_1.getRowContainerTypeForName(_this.name);
        return _this;
    }
    RowContainerComp.prototype.postConstruct = function () {
        var _this = this;
        var compProxy = {
            setViewportHeight: function (height) { return _this.eViewport.style.height = height; },
            setRowCtrls: function (rowCtrls) { return _this.setRowCtrls(rowCtrls); },
            setDomOrder: function (domOrder) {
                _this.domOrder = domOrder;
            },
            setContainerWidth: function (width) { return _this.eContainer.style.width = width; }
        };
        var ctrl = this.createManagedBean(new rowContainerCtrl_1.RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, this.eContainer, this.eViewport, this.eWrapper);
    };
    RowContainerComp.prototype.preDestroy = function () {
        // destroys all row comps
        this.setRowCtrls([]);
    };
    RowContainerComp.prototype.setRowCtrls = function (rowCtrls) {
        var _this = this;
        var oldRows = __assign({}, this.rowComps);
        this.rowComps = {};
        this.lastPlacedElement = null;
        var processRow = function (rowCon) {
            var instanceId = rowCon.getInstanceId();
            var existingRowComp = oldRows[instanceId];
            if (existingRowComp) {
                _this.rowComps[instanceId] = existingRowComp;
                delete oldRows[instanceId];
                _this.ensureDomOrder(existingRowComp.getGui());
            }
            else {
                var rowComp = new rowComp_1.RowComp(rowCon, _this.beans, _this.type);
                _this.rowComps[instanceId] = rowComp;
                _this.appendRow(rowComp.getGui());
            }
        };
        rowCtrls.forEach(processRow);
        object_1.getAllValuesInObject(oldRows).forEach(function (oldRowComp) {
            _this.eContainer.removeChild(oldRowComp.getGui());
            oldRowComp.destroy();
        });
        aria_1.setAriaRole(this.eContainer, rowCtrls.length ? "rowgroup" : "presentation");
    };
    RowContainerComp.prototype.appendRow = function (element) {
        if (this.domOrder) {
            dom_1.insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        }
        else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    };
    RowContainerComp.prototype.ensureDomOrder = function (eRow) {
        if (this.domOrder) {
            dom_1.ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    };
    __decorate([
        context_1.Autowired('beans')
    ], RowContainerComp.prototype, "beans", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eViewport')
    ], RowContainerComp.prototype, "eViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContainer')
    ], RowContainerComp.prototype, "eContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eWrapper')
    ], RowContainerComp.prototype, "eWrapper", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowContainerComp.prototype, "postConstruct", null);
    __decorate([
        context_1.PreDestroy
    ], RowContainerComp.prototype, "preDestroy", null);
    return RowContainerComp;
}(component_1.Component));
exports.RowContainerComp = RowContainerComp;
