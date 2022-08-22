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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var array_1 = require("../../utils/array");
var StickyRowFeature = /** @class */ (function (_super) {
    __extends(StickyRowFeature, _super);
    function StickyRowFeature(createRowCon, destroyRowCtrls) {
        var _this = _super.call(this) || this;
        _this.createRowCon = createRowCon;
        _this.destroyRowCtrls = destroyRowCtrls;
        _this.stickyRowCtrls = [];
        _this.containerHeight = 0;
        return _this;
    }
    StickyRowFeature.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (params) {
            _this.gridBodyCtrl = params.gridBodyCtrl;
        });
    };
    StickyRowFeature.prototype.getStickyRowCtrls = function () {
        return this.stickyRowCtrls;
    };
    StickyRowFeature.prototype.checkStickyRows = function () {
        var height = 0;
        if (!this.gridOptionsWrapper.isGroupRowsSticky()) {
            this.refreshNodesAndContainerHeight([], height);
            return;
        }
        var stickyRows = [];
        var firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();
        var addStickyRow = function (stickyRow) {
            stickyRows.push(stickyRow);
            var lastAncester = stickyRow;
            while (lastAncester.expanded) {
                lastAncester = array_1.last(lastAncester.childrenAfterSort);
            }
            var lastChildBottom = lastAncester.rowTop + lastAncester.rowHeight;
            var stickRowBottom = firstPixel + height + stickyRow.rowHeight;
            if (lastChildBottom < stickRowBottom) {
                stickyRow.stickyRowTop = height + (lastChildBottom - stickRowBottom);
            }
            else {
                stickyRow.stickyRowTop = height;
            }
            height = 0;
            stickyRows.forEach(function (rowNode) {
                var thisRowLastPx = rowNode.stickyRowTop + rowNode.rowHeight;
                if (height < thisRowLastPx) {
                    height = thisRowLastPx;
                }
            });
        };
        while (true) {
            var firstPixelAfterStickyRows = firstPixel + height;
            var firstIndex = this.rowModel.getRowIndexAtPixel(firstPixelAfterStickyRows);
            var firstRow = this.rowModel.getRow(firstIndex);
            if (firstRow == null) {
                break;
            }
            // only happens when pivoting, and we are showing root node
            if (firstRow.level < 0) {
                break;
            }
            var parents = [];
            var p = firstRow.parent;
            while (p.level >= 0) {
                parents.push(p);
                p = p.parent;
            }
            var firstMissingParent = parents.reverse().find(function (parent) { return stickyRows.indexOf(parent) < 0 && parent.displayed; });
            if (firstMissingParent) {
                addStickyRow(firstMissingParent);
                continue;
            }
            // if first row is an open group, and practically shown, it needs
            // to be stuck
            if (firstRow.group && firstRow.expanded && !firstRow.footer && firstRow.rowTop < firstPixelAfterStickyRows) {
                addStickyRow(firstRow);
                continue;
            }
            break;
        }
        this.refreshNodesAndContainerHeight(stickyRows, height);
    };
    StickyRowFeature.prototype.refreshNodesAndContainerHeight = function (allStickyNodes, height) {
        var e_1, _a, _b;
        var _this = this;
        var removedCtrls = this.stickyRowCtrls.filter(function (ctrl) { return allStickyNodes.indexOf(ctrl.getRowNode()) === -1; });
        var addedNodes = allStickyNodes.filter(function (rowNode) { return _this.stickyRowCtrls.findIndex(function (ctrl) { return ctrl.getRowNode() === rowNode; }) === -1; });
        var ctrlsToDestroy = {};
        removedCtrls.forEach(function (removedCtrl) {
            ctrlsToDestroy[removedCtrl.getRowNode().id] = removedCtrl;
            _this.stickyRowCtrls = _this.stickyRowCtrls.filter(function (ctrl) { return ctrl !== removedCtrl; });
        });
        try {
            for (var _c = __values(Object.values(ctrlsToDestroy)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var ctrl = _d.value;
                ctrl.getRowNode().sticky = false;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.destroyRowCtrls(ctrlsToDestroy, false);
        var newCtrls = addedNodes.map(function (rowNode) {
            rowNode.sticky = true;
            return _this.createRowCon(rowNode, false, false);
        });
        (_b = this.stickyRowCtrls).push.apply(_b, __spread(newCtrls));
        this.stickyRowCtrls.forEach(function (ctrl) { return ctrl.setRowTop(ctrl.getRowNode().stickyRowTop); });
        this.stickyRowCtrls.sort(function (a, b) { return b.getRowNode().rowIndex - a.getRowNode().rowIndex; });
        if (this.containerHeight !== height) {
            this.containerHeight = height;
            this.gridBodyCtrl.setStickyTopHeight(height);
        }
    };
    __decorate([
        context_1.Autowired("rowModel")
    ], StickyRowFeature.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired("rowRenderer")
    ], StickyRowFeature.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired("ctrlsService")
    ], StickyRowFeature.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], StickyRowFeature.prototype, "postConstruct", null);
    return StickyRowFeature;
}(beanStub_1.BeanStub));
exports.StickyRowFeature = StickyRowFeature;
