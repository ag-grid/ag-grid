"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomManager = void 0;
var baseManager_1 = require("./baseManager");
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
}(baseManager_1.BaseManager));
exports.ZoomManager = ZoomManager;
//# sourceMappingURL=zoomManager.js.map