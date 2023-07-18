"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomManager = void 0;
var chartAxisDirection_1 = require("../chartAxisDirection");
var baseManager_1 = require("./baseManager");
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
var ZoomManager = /** @class */ (function (_super) {
    __extends(ZoomManager, _super);
    function ZoomManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.axes = {};
        return _this;
    }
    ZoomManager.prototype.updateAxes = function (axes) {
        var _this = this;
        var removedAxes = new Set(Object.keys(this.axes));
        axes.forEach(function (axis) {
            var _a;
            var _b, _c;
            removedAxes.delete(axis.id);
            (_a = (_b = _this.axes)[_c = axis.id]) !== null && _a !== void 0 ? _a : (_b[_c] = new AxisZoomManager(axis));
        });
        removedAxes.forEach(function (axisId) {
            delete _this.axes[axisId];
        });
        if (this.initialZoom) {
            this.updateZoom(this.initialZoom.callerId, this.initialZoom.newZoom);
            this.initialZoom = undefined;
        }
    };
    ZoomManager.prototype.updateZoom = function (callerId, newZoom) {
        if (Object.keys(this.axes).length === 0) {
            this.initialZoom = { callerId: callerId, newZoom: newZoom };
            return;
        }
        Object.values(this.axes).forEach(function (axis) {
            axis.updateZoom(callerId, newZoom === null || newZoom === void 0 ? void 0 : newZoom[axis.getDirection()]);
        });
        this.applyStates();
    };
    ZoomManager.prototype.updateAxisZoom = function (callerId, axisId, newZoom) {
        var _a;
        (_a = this.axes[axisId]) === null || _a === void 0 ? void 0 : _a.updateZoom(callerId, newZoom);
        this.applyStates();
    };
    ZoomManager.prototype.getZoom = function () {
        var x;
        var y;
        // TODO: this only works when there is a single axis on each direction as it gets the last of each
        Object.values(this.axes).forEach(function (axis) {
            if (axis.getDirection() === chartAxisDirection_1.ChartAxisDirection.X) {
                x = axis.getZoom();
            }
            else if (axis.getDirection() === chartAxisDirection_1.ChartAxisDirection.Y) {
                y = axis.getZoom();
            }
        });
        if (x || y) {
            return { x: x, y: y };
        }
    };
    ZoomManager.prototype.getAxisZoom = function (axisId) {
        var _a;
        return (_a = this.axes[axisId]) === null || _a === void 0 ? void 0 : _a.getZoom();
    };
    ZoomManager.prototype.getAxisZooms = function () {
        var e_1, _a;
        var axes = {};
        try {
            for (var _b = __values(Object.entries(this.axes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), axisId = _d[0], axis = _d[1];
                axes[axisId] = {
                    direction: axis.getDirection(),
                    zoom: axis.getZoom(),
                };
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return axes;
    };
    ZoomManager.prototype.applyStates = function () {
        var e_2, _a;
        var changed = Object.values(this.axes)
            .map(function (axis) { return axis.applyStates(); })
            .some(Boolean);
        if (!changed) {
            return;
        }
        var currentZoom = this.getZoom();
        var axes = {};
        try {
            for (var _b = __values(Object.entries(this.axes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), axisId = _d[0], axis = _d[1];
                axes[axisId] = axis.getZoom();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var event = __assign(__assign({ type: 'zoom-change' }, (currentZoom !== null && currentZoom !== void 0 ? currentZoom : {})), { axes: axes });
        this.listeners.dispatch('zoom-change', event);
    };
    return ZoomManager;
}(baseManager_1.BaseManager));
exports.ZoomManager = ZoomManager;
var AxisZoomManager = /** @class */ (function () {
    function AxisZoomManager(axis) {
        this.states = {};
        this.currentZoom = undefined;
        this.axis = axis;
    }
    AxisZoomManager.prototype.getDirection = function () {
        return this.axis.direction;
    };
    AxisZoomManager.prototype.updateZoom = function (callerId, newZoom) {
        delete this.states[callerId];
        if (newZoom != null) {
            this.states[callerId] = __assign({}, newZoom);
        }
    };
    AxisZoomManager.prototype.getZoom = function () {
        return this.currentZoom;
    };
    AxisZoomManager.prototype.applyStates = function () {
        var _a, _b;
        var prevZoom = this.currentZoom;
        var last = Object.keys(this.states)[Object.keys(this.states).length - 1];
        this.currentZoom = __assign({}, this.states[last]);
        var changed = (prevZoom === null || prevZoom === void 0 ? void 0 : prevZoom.min) !== ((_a = this.currentZoom) === null || _a === void 0 ? void 0 : _a.min) || (prevZoom === null || prevZoom === void 0 ? void 0 : prevZoom.max) !== ((_b = this.currentZoom) === null || _b === void 0 ? void 0 : _b.max);
        return changed;
    };
    return AxisZoomManager;
}());
//# sourceMappingURL=zoomManager.js.map