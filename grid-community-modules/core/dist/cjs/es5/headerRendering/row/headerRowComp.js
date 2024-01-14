"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.HeaderRowComp = exports.HeaderRowType = void 0;
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
        _this.ctrl = ctrl;
        _this.setTemplate(/* html */ "<div class=\"".concat(_this.ctrl.getHeaderRowClass(), "\" role=\"row\"></div>"));
        return _this;
    }
    //noinspection JSUnusedLocalSymbols
    HeaderRowComp.prototype.init = function () {
        var _this = this;
        this.getGui().style.transform = this.ctrl.getTransform();
        (0, aria_1.setAriaRowIndex)(this.getGui(), this.ctrl.getAriaRowIndex());
        var compProxy = {
            setHeight: function (height) { return _this.getGui().style.height = height; },
            setTop: function (top) { return _this.getGui().style.top = top; },
            setHeaderCtrls: function (ctrls, forceOrder) { return _this.setHeaderCtrls(ctrls, forceOrder); },
            setWidth: function (width) { return _this.getGui().style.width = width; },
        };
        this.ctrl.setComp(compProxy);
    };
    HeaderRowComp.prototype.destroyHeaderCtrls = function () {
        this.setHeaderCtrls([], false);
    };
    HeaderRowComp.prototype.setHeaderCtrls = function (ctrls, forceOrder) {
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
        (0, object_1.iterateObject)(oldComps, function (id, comp) {
            _this.getGui().removeChild(comp.getGui());
            _this.destroyBean(comp);
        });
        if (forceOrder) {
            var comps = (0, object_1.getAllValuesInObject)(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort(function (a, b) {
                var leftA = a.getCtrl().getColumnGroupChild().getLeft();
                var leftB = b.getCtrl().getColumnGroupChild().getLeft();
                return leftA - leftB;
            });
            var elementsInOrder = comps.map(function (c) { return c.getGui(); });
            (0, dom_1.setDomChildOrder)(this.getGui(), elementsInOrder);
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
