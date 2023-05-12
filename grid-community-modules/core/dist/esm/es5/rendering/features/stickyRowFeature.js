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
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { last } from "../../utils/array";
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
        this.isClientSide = this.rowModel.getType() === 'clientSide';
        this.ctrlsService.whenReady(function (params) {
            _this.gridBodyCtrl = params.gridBodyCtrl;
        });
    };
    StickyRowFeature.prototype.getStickyRowCtrls = function () {
        return this.stickyRowCtrls;
    };
    StickyRowFeature.prototype.checkStickyRows = function () {
        var _this = this;
        var height = 0;
        if (!this.gridOptionsService.is('groupRowsSticky')) {
            this.refreshNodesAndContainerHeight([], height);
            return;
        }
        var stickyRows = [];
        var firstPixel = this.rowRenderer.getFirstVisibleVerticalPixel();
        var addStickyRow = function (stickyRow) {
            var _a, _b, _c;
            stickyRows.push(stickyRow);
            var lastChildBottom;
            if (_this.isClientSide) {
                var lastAncestor = stickyRow;
                while (lastAncestor.expanded) {
                    if (lastAncestor.master) {
                        lastAncestor = lastAncestor.detailNode;
                    }
                    else if (lastAncestor.childrenAfterSort) {
                        // Tree Data will have `childrenAfterSort` without any nodes, but
                        // the current node will still be marked as expansible.
                        if (lastAncestor.childrenAfterSort.length === 0) {
                            break;
                        }
                        lastAncestor = last(lastAncestor.childrenAfterSort);
                    }
                }
                lastChildBottom = lastAncestor.rowTop + lastAncestor.rowHeight;
            }
            // if the rowModel is `serverSide` as only `clientSide` and `serverSide` create this feature.
            else {
                var storeBounds = (_a = stickyRow.childStore) === null || _a === void 0 ? void 0 : _a.getStoreBounds();
                lastChildBottom = ((_b = storeBounds === null || storeBounds === void 0 ? void 0 : storeBounds.heightPx) !== null && _b !== void 0 ? _b : 0) + ((_c = storeBounds === null || storeBounds === void 0 ? void 0 : storeBounds.topPx) !== null && _c !== void 0 ? _c : 0);
            }
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
            if (firstRow.isExpandable() && firstRow.expanded && firstRow.rowTop < firstPixelAfterStickyRows) {
                addStickyRow(firstRow);
                continue;
            }
            break;
        }
        this.refreshNodesAndContainerHeight(stickyRows, height);
    };
    StickyRowFeature.prototype.refreshStickyNode = function (stickRowNode) {
        var allStickyNodes = [];
        for (var i = 0; i < this.stickyRowCtrls.length; i++) {
            var currentNode = this.stickyRowCtrls[i].getRowNode();
            if (currentNode !== stickRowNode) {
                allStickyNodes.push(currentNode);
            }
        }
        this.refreshNodesAndContainerHeight(allStickyNodes, this.containerHeight);
        this.checkStickyRows();
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
        Autowired("rowModel")
    ], StickyRowFeature.prototype, "rowModel", void 0);
    __decorate([
        Autowired("rowRenderer")
    ], StickyRowFeature.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired("ctrlsService")
    ], StickyRowFeature.prototype, "ctrlsService", void 0);
    __decorate([
        PostConstruct
    ], StickyRowFeature.prototype, "postConstruct", null);
    return StickyRowFeature;
}(BeanStub));
export { StickyRowFeature };
