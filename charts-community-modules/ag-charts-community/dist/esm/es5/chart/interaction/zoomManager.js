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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
import { BaseManager } from './baseManager';
function isEqual(a, b) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (a === b)
        return true;
    if (((_a = a === null || a === void 0 ? void 0 : a.x) === null || _a === void 0 ? void 0 : _a.min) !== ((_b = b === null || b === void 0 ? void 0 : b.x) === null || _b === void 0 ? void 0 : _b.min))
        return false;
    if (((_c = a === null || a === void 0 ? void 0 : a.x) === null || _c === void 0 ? void 0 : _c.max) !== ((_d = b === null || b === void 0 ? void 0 : b.x) === null || _d === void 0 ? void 0 : _d.max))
        return false;
    if (((_e = a === null || a === void 0 ? void 0 : a.y) === null || _e === void 0 ? void 0 : _e.max) !== ((_f = b === null || b === void 0 ? void 0 : b.y) === null || _f === void 0 ? void 0 : _f.max))
        return false;
    if (((_g = a === null || a === void 0 ? void 0 : a.y) === null || _g === void 0 ? void 0 : _g.min) !== ((_h = b === null || b === void 0 ? void 0 : b.y) === null || _h === void 0 ? void 0 : _h.min))
        return false;
    return true;
}
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
var ZoomManager = /** @class */ (function (_super) {
    __extends(ZoomManager, _super);
    function ZoomManager() {
        var _this = _super.call(this) || this;
        _this.states = {};
        _this.currentZoom = undefined;
        return _this;
    }
    ZoomManager.prototype.updateZoom = function (callerId, newZoom) {
        delete this.states[callerId];
        if (newZoom != null) {
            this.states[callerId] = __assign({}, newZoom);
        }
        this.applyStates();
    };
    ZoomManager.prototype.getZoom = function () {
        return this.currentZoom;
    };
    ZoomManager.prototype.applyStates = function () {
        var e_1, _a;
        var currentZoom = this.currentZoom;
        var zoomToApply = {};
        try {
            // Last added entry wins.
            for (var _b = __values(Object.entries(this.states)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), _ = _d[0], _e = _d[1], x = _e.x, y = _e.y;
                zoomToApply.x = x !== null && x !== void 0 ? x : zoomToApply.x;
                zoomToApply.y = y !== null && y !== void 0 ? y : zoomToApply.y;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.currentZoom = zoomToApply.x != null || zoomToApply.y != null ? zoomToApply : undefined;
        var changed = !isEqual(currentZoom, this.currentZoom);
        if (!changed) {
            return;
        }
        var event = __assign({ type: 'zoom-change' }, (currentZoom !== null && currentZoom !== void 0 ? currentZoom : {}));
        this.listeners.dispatch('zoom-change', event);
    };
    return ZoomManager;
}(BaseManager));
export { ZoomManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vem9vbU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBZ0I1QyxTQUFTLE9BQU8sQ0FBQyxDQUFpQixFQUFFLENBQWlCOztJQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDekIsSUFBSSxDQUFBLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxPQUFLLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxDQUFBO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDMUMsSUFBSSxDQUFBLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxPQUFLLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxDQUFBO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDMUMsSUFBSSxDQUFBLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxPQUFLLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxDQUFBO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDMUMsSUFBSSxDQUFBLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxPQUFLLE1BQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLENBQUMsMENBQUUsR0FBRyxDQUFBO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFFMUMsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7R0FHRztBQUNIO0lBQWlDLCtCQUEyQztJQUl4RTtRQUFBLFlBQ0ksaUJBQU8sU0FDVjtRQUxnQixZQUFNLEdBQWtDLEVBQUUsQ0FBQztRQUNwRCxpQkFBVyxHQUFtQixTQUFTLENBQUM7O0lBSWhELENBQUM7SUFFTSxnQ0FBVSxHQUFqQixVQUFrQixRQUFnQixFQUFFLE9BQXVCO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQVEsT0FBTyxDQUFFLENBQUM7U0FDMUM7UUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLDZCQUFPLEdBQWQ7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVPLGlDQUFXLEdBQW5COztRQUNJLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBTSxXQUFXLEdBQWtCLEVBQUUsQ0FBQzs7WUFFdEMseUJBQXlCO1lBQ3pCLEtBQTRCLElBQUEsS0FBQSxTQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO2dCQUE5QyxJQUFBLEtBQUEsbUJBQWEsRUFBWixDQUFDLFFBQUEsRUFBRSxVQUFRLEVBQU4sQ0FBQyxPQUFBLEVBQUUsQ0FBQyxPQUFBO2dCQUNqQixXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBRCxDQUFDLGNBQUQsQ0FBQyxHQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFELENBQUMsY0FBRCxDQUFDLEdBQUksV0FBVyxDQUFDLENBQUMsQ0FBQzthQUN0Qzs7Ozs7Ozs7O1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFNUYsSUFBTSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTztTQUNWO1FBQ0QsSUFBTSxLQUFLLGNBQ1AsSUFBSSxFQUFFLGFBQWEsSUFDaEIsQ0FBQyxXQUFXLGFBQVgsV0FBVyxjQUFYLFdBQVcsR0FBSSxFQUFFLENBQUMsQ0FDekIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQUFDLEFBM0NELENBQWlDLFdBQVcsR0EyQzNDIn0=