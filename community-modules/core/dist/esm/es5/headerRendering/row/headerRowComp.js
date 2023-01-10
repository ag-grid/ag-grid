/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
import { PostConstruct, PreDestroy } from '../../context/context';
import { setAriaRowIndex } from '../../utils/aria';
import { setDomChildOrder } from '../../utils/dom';
import { getAllValuesInObject, iterateObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { HeaderCellComp } from '../cells/column/headerCellComp';
import { HeaderGroupCellComp } from '../cells/columnGroup/headerGroupCellComp';
import { HeaderFilterCellComp } from '../cells/floatingFilter/headerFilterCellComp';
export var HeaderRowType;
(function (HeaderRowType) {
    HeaderRowType["COLUMN_GROUP"] = "group";
    HeaderRowType["COLUMN"] = "column";
    HeaderRowType["FLOATING_FILTER"] = "filter";
})(HeaderRowType || (HeaderRowType = {}));
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
            setAriaRowIndex: function (rowIndex) { return setAriaRowIndex(_this.getGui(), rowIndex); }
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
        iterateObject(oldComps, function (id, comp) {
            _this.getGui().removeChild(comp.getGui());
            _this.destroyBean(comp);
        });
        var isEnsureDomOrder = this.gridOptionsService.is('ensureDomOrder');
        var isPrintLayout = this.gridOptionsService.isDomLayout('print');
        if (isEnsureDomOrder || isPrintLayout) {
            var comps = getAllValuesInObject(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort(function (a, b) {
                var leftA = a.getCtrl().getColumnGroupChild().getLeft();
                var leftB = b.getCtrl().getColumnGroupChild().getLeft();
                return leftA - leftB;
            });
            var elementsInOrder = comps.map(function (c) { return c.getGui(); });
            setDomChildOrder(this.getGui(), elementsInOrder);
        }
    };
    HeaderRowComp.prototype.createHeaderComp = function (headerCtrl) {
        var result;
        switch (this.ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                result = new HeaderGroupCellComp(headerCtrl);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new HeaderFilterCellComp(headerCtrl);
                break;
            default:
                result = new HeaderCellComp(headerCtrl);
                break;
        }
        this.createBean(result);
        result.setParentComponent(this);
        return result;
    };
    __decorate([
        PostConstruct
    ], HeaderRowComp.prototype, "init", null);
    __decorate([
        PreDestroy
    ], HeaderRowComp.prototype, "destroyHeaderCtrls", null);
    return HeaderRowComp;
}(Component));
export { HeaderRowComp };
