"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipManager = void 0;
/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
var TooltipManager = /** @class */ (function () {
    function TooltipManager(tooltip, interactionManager) {
        var _this = this;
        this.states = {};
        this.exclusiveAreas = {};
        this.destroyFns = [];
        this.tooltip = tooltip;
        var hoverRef = interactionManager.addListener('hover', function (e) { return _this.checkExclusiveRects(e); });
        this.destroyFns.push(function () { return interactionManager.removeListener(hoverRef); });
    }
    TooltipManager.prototype.updateTooltip = function (callerId, meta, content) {
        var _a;
        if (content == null) {
            content = (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.content;
        }
        this.states[callerId] = { content: content, meta: meta };
        this.applyStates();
    };
    TooltipManager.prototype.updateExclusiveRect = function (callerId, area) {
        if (area) {
            this.exclusiveAreas[callerId] = area;
        }
        else {
            delete this.exclusiveAreas[callerId];
        }
    };
    TooltipManager.prototype.removeTooltip = function (callerId) {
        delete this.states[callerId];
        this.applyStates();
    };
    TooltipManager.prototype.getTooltipMeta = function (callerId) {
        var _a;
        return (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.meta;
    };
    TooltipManager.prototype.destroy = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.destroyFns), _c = _b.next(); !_c.done; _c = _b.next()) {
                var destroyFn = _c.value;
                destroyFn();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    TooltipManager.prototype.checkExclusiveRects = function (e) {
        var e_2, _a;
        var newAppliedExclusiveArea;
        try {
            for (var _b = __values(Object.entries(this.exclusiveAreas)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), entryId = _d[0], area = _d[1];
                if (!area.containsPoint(e.offsetX, e.offsetY)) {
                    continue;
                }
                newAppliedExclusiveArea = entryId;
                break;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (newAppliedExclusiveArea === this.appliedExclusiveArea) {
            return;
        }
        this.appliedExclusiveArea = newAppliedExclusiveArea;
        this.applyStates();
    };
    TooltipManager.prototype.applyStates = function () {
        var _this = this;
        var _a;
        var ids = this.appliedExclusiveArea ? [this.appliedExclusiveArea] : Object.keys(this.states);
        var contentToApply = undefined;
        var metaToApply = undefined;
        // Last added entry wins.
        ids.reverse();
        ids.slice(0, 1).forEach(function (id) {
            var _a;
            var _b = (_a = _this.states[id]) !== null && _a !== void 0 ? _a : {}, content = _b.content, meta = _b.meta;
            contentToApply = content;
            metaToApply = meta;
        });
        if (metaToApply === undefined || contentToApply === undefined) {
            this.appliedState = undefined;
            this.tooltip.toggle(false);
            return;
        }
        if (((_a = this.appliedState) === null || _a === void 0 ? void 0 : _a.content) === contentToApply) {
            var renderInstantly = this.tooltip.isVisible();
            this.tooltip.show(metaToApply, undefined, renderInstantly);
        }
        else {
            this.tooltip.show(metaToApply, contentToApply);
        }
        this.appliedState = { content: contentToApply, meta: metaToApply };
    };
    return TooltipManager;
}());
exports.TooltipManager = TooltipManager;
//# sourceMappingURL=tooltipManager.js.map