"use strict";
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
    function TooltipManager(tooltip) {
        this.states = {};
        this.tooltip = tooltip;
    }
    TooltipManager.prototype.updateTooltip = function (callerId, meta, content) {
        var _a;
        if (content == null) {
            content = (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.content;
        }
        delete this.states[callerId];
        if (meta != null && content != null) {
            this.states[callerId] = { content: content, meta: meta };
        }
        this.applyStates();
    };
    TooltipManager.prototype.getTooltipMeta = function (callerId) {
        var _a;
        return (_a = this.states[callerId]) === null || _a === void 0 ? void 0 : _a.meta;
    };
    TooltipManager.prototype.applyStates = function () {
        var _a;
        var contentToApply = undefined;
        var metaToApply = undefined;
        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], _c = _b[1], content = _c.content, meta = _c.meta;
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
