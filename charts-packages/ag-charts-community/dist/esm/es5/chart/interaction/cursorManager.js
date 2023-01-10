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
 * Manages the cursor styling for an element. Tracks the requested styling from distinct
 * dependents and handles conflicting styling requests.
 */
var CursorManager = /** @class */ (function () {
    function CursorManager(element) {
        this.states = {};
        this.element = element;
    }
    CursorManager.prototype.updateCursor = function (callerId, style) {
        delete this.states[callerId];
        if (style != null) {
            this.states[callerId] = { style: style };
        }
        this.applyStates();
    };
    CursorManager.prototype.applyStates = function () {
        var styleToApply = 'default';
        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], style = _b[1].style;
            return (styleToApply = style);
        });
        this.element.style.cursor = styleToApply;
    };
    return CursorManager;
}());
export { CursorManager };
