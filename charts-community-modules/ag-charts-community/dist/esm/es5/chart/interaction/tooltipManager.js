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
export { TooltipManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vdG9vbHRpcE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0E7OztHQUdHO0FBQ0g7SUFRSSx3QkFBbUIsT0FBZ0IsRUFBRSxrQkFBc0M7UUFBM0UsaUJBS0M7UUFaZ0IsV0FBTSxHQUFpQyxFQUFFLENBQUM7UUFHbkQsbUJBQWMsR0FBeUIsRUFBRSxDQUFDO1FBRTFDLGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBR3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQTNCLENBQTJCLENBQUMsQ0FBQztRQUM3RixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFNLE9BQUEsa0JBQWtCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVNLHNDQUFhLEdBQXBCLFVBQXFCLFFBQWdCLEVBQUUsSUFBa0IsRUFBRSxPQUFnQjs7UUFDdkUsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ2pCLE9BQU8sR0FBRyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDBDQUFFLE9BQU8sQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLFNBQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sNENBQW1CLEdBQTFCLFVBQTJCLFFBQWdCLEVB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