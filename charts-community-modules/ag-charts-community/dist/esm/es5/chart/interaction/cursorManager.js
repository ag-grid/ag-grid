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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9pbnRlcmFjdGlvbi9jdXJzb3JNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQTs7O0dBR0c7QUFDSDtJQUlJLHVCQUFtQixPQUFvQjtRQUh0QixXQUFNLEdBQWdDLEVBQUUsQ0FBQztRQUl0RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRU0sb0NBQVksR0FBbkIsVUFBb0IsUUFBZ0IsRUFBRSxLQUFjO1FBQ2hELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQztTQUNyQztRQUVELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU8sbUNBQVcsR0FBbkI7UUFDSSxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUM7UUFFN0IseUJBQXlCO1FBQ3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUN0QixPQUFPLEVBQUU7YUFDVCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNYLE9BQU8sQ0FBQyxVQUFDLEVBQWM7Z0JBQWQsS0FBQSxhQUFjLEVBQWIsQ0FBQyxRQUFBLEVBQUksS0FBSyxjQUFBO1lBQVEsT0FBQSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7SUFDN0MsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0FBQyxBQTdCRCxJQTZCQyJ9