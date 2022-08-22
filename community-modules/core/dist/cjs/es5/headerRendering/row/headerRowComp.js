/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var aria_1 = require("../../utils/aria");
var dom_1 = require("../../utils/dom");
var object_1 = require("../../utils/object");
var component_1 = require("../../widgets/component");
var headerCellComp_1 = require("../cells/column/headerCellComp");
var headerGroupCellComp_1 = require("../cells/columnGroup/headerGroupCellComp");
var headerFilterCellComp_1 = require("../cells/floatingFilter/headerFilterCellComp");
var HeaderRowType;
(function (HeaderRowType) {
    HeaderRowType["COLUMN_GROUP"] = "group";
    HeaderRowType["COLUMN"] = "column";
    HeaderRowType["FLOATING_FILTER"] = "filter";
})(HeaderRowType = exports.HeaderRowType || (exports.HeaderRowType = {}));
var HeaderRowComp = /** @class */ (function (_super) {
    __extends(HeaderRowComp, _super);
    function HeaderRowComp(ctrl) {
        var _this = _super.call(this) || this;
        _this.headerComps = {};
        var extraClass = ctrl.getType() == HeaderRowType.COLUMN_GROUP ? "ag-header-row-column-group" :
            ctrl.getType() == HeaderRowType.FLOATING_FILTER ? "ag-header-row-column-filter" : "ag-header-row-column";
        _this.setTemplate(/* html */ "<div class=\"ag-header-row " + extraClass + "\" role=\"row\"></div>");
        _this.ctrl = ctrl;
        return _this;
    }
    //noinspection JSUnusedLocalSymbols
    HeaderRowComp.prototype.init = function () {
        var _this = this;
        var compProxy = {
            setTransform: function (transform) { return _this.getGui().style.transform = transform; },
            setHeight: function (height) { return _this.getGui().style.height = height; },
            setTop: function (top) { return _this.getGui().style.top = top; },
            setHeaderCtrls: function (ctrls) { return _this.setHeaderCtrls(ctrls); },
            setWidth: function (width) { return _this.getGui().style.width = width; },
            setAriaRowIndex: function (rowIndex) { return aria_1.setAriaRowIndex(_this.getGui(), rowIndex); }
        };
        this.ctrl.setComp(compProxy);
    };
    HeaderRowComp.prototype.destroyHeaderCtrls = function () {
        this.setHeaderCtrls([]);
    };
    HeaderRowComp.prototype.setHeaderCtrls = function (ctrls) {
        var _this = this;
        if (!this.isAlive()) {
            return;
        }
        var oldComps = this.headerComps;
        this.headerComps = {};
        ctrls.forEach(function (ctrl) {
            var id = ctrl.getInstanceId();
            var comp = oldComps[id];
            delete oldComps[id];
            if (comp == null) {
                comp = _this.createHeaderComp(ctrl);
                _this.getGui().appendChild(comp.getGui());
            }
            _this.headerComps[id] = comp;
        });
        object_1.iterateObject(oldComps, function (id, comp) {
            _this.getGui().removeChild(comp.getGui());
            _this.destroyBean(comp);
        });
        var ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        if (ensureDomOrder) {
            var comps = object_1.getAllValuesInObject(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort(function (a, b) {
                var leftA = a.getCtrl().getColumnGroupChild().getLeft();
                var leftB = b.getCtrl().getColumnGroupChild().getLeft();
                return leftA - leftB;
            });
            var elementsInOrder = comps.map(function (c) { return c.getGui(); });
            dom_1.setDomChildOrder(this.getGui(), elementsInOrder);
        }
    };
    HeaderRowComp.prototype.createHeaderComp = function (headerCtrl) {
        var result;
        switch (this.ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                result = new headerGroupCellComp_1.HeaderGroupCellComp(headerCtrl);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new headerFilterCellComp_1.HeaderFilterCellComp(headerCtrl);
                break;
            default:
                result = new headerCellComp_1.HeaderCellComp(headerCtrl);
                break;
        }
        this.createBean(result);
        result.setParentComponent(this);
        return result;
    };
    __decorate([
        context_1.PostConstruct
    ], HeaderRowComp.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], HeaderRowComp.prototype, "destroyHeaderCtrls", null);
    return HeaderRowComp;
}(component_1.Component));
exports.HeaderRowComp = HeaderRowComp;
