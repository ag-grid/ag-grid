"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomManager = void 0;
const chartAxisDirection_1 = require("../chartAxisDirection");
const baseManager_1 = require("./baseManager");
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
class ZoomManager extends baseManager_1.BaseManager {
    constructor() {
        super(...arguments);
        this.axes = {};
    }
    updateAxes(axes) {
        const removedAxes = new Set(Object.keys(this.axes));
        axes.forEach((axis) => {
            var _a;
            var _b, _c;
            removedAxes.delete(axis.id);
            (_a = (_b = this.axes)[_c = axis.id]) !== null && _a !== void 0 ? _a : (_b[_c] = new AxisZoomManager(axis));
        });
        removedAxes.forEach((axisId) => {
            delete this.axes[axisId];
        });
        if (this.initialZoom) {
            this.updateZoom(this.initialZoom.callerId, this.initialZoom.newZoom);
            this.initialZoom = undefined;
        }
    }
    updateZoom(callerId, newZoom) {
        if (Object.keys(this.axes).length === 0) {
            this.initialZoom = { callerId, newZoom };
            return;
        }
        Object.values(this.axes).forEach((axis) => {
            axis.updateZoom(callerId, newZoom === null || newZoom === void 0 ? void 0 : newZoom[axis.getDirection()]);
        });
        this.applyStates();
    }
    updateAxisZoom(callerId, axisId, newZoom) {
        var _a;
        (_a = this.axes[axisId]) === null || _a === void 0 ? void 0 : _a.updateZoom(callerId, newZoom);
        this.applyStates();
    }
    getZoom() {
        let x;
        let y;
        // TODO: this only works when there is a single axis on each direction as it gets the last of each
        Object.values(this.axes).forEach((axis) => {
            if (axis.getDirection() === chartAxisDirection_1.ChartAxisDirection.X) {
                x = axis.getZoom();
            }
            else if (axis.getDirection() === chartAxisDirection_1.ChartAxisDirection.Y) {
                y = axis.getZoom();
            }
        });
        if (x || y) {
            return { x, y };
        }
    }
    getAxisZoom(axisId) {
        var _a;
        return (_a = this.axes[axisId]) === null || _a === void 0 ? void 0 : _a.getZoom();
    }
    getAxisZooms() {
        const axes = {};
        for (const [axisId, axis] of Object.entries(this.axes)) {
            axes[axisId] = {
                direction: axis.getDirection(),
                zoom: axis.getZoom(),
            };
        }
        return axes;
    }
    applyStates() {
        const changed = Object.values(this.axes)
            .map((axis) => axis.applyStates())
            .some(Boolean);
        if (!changed) {
            return;
        }
        const currentZoom = this.getZoom();
        const axes = {};
        for (const [axisId, axis] of Object.entries(this.axes)) {
            axes[axisId] = axis.getZoom();
        }
        const event = Object.assign(Object.assign({ type: 'zoom-change' }, (currentZoom !== null && currentZoom !== void 0 ? currentZoom : {})), { axes });
        this.listeners.dispatch('zoom-change', event);
    }
}
exports.ZoomManager = ZoomManager;
class AxisZoomManager {
    constructor(axis) {
        this.states = {};
        this.currentZoom = undefined;
        this.axis = axis;
    }
    getDirection() {
        return this.axis.direction;
    }
    updateZoom(callerId, newZoom) {
        delete this.states[callerId];
        if (newZoom != null) {
            this.states[callerId] = Object.assign({}, newZoom);
        }
    }
    getZoom() {
        return this.currentZoom;
    }
    applyStates() {
        var _a, _b;
        const prevZoom = this.currentZoom;
        const last = Object.keys(this.states)[Object.keys(this.states).length - 1];
        this.currentZoom = Object.assign({}, this.states[last]);
        const changed = (prevZoom === null || prevZoom === void 0 ? void 0 : prevZoom.min) !== ((_a = this.currentZoom) === null || _a === void 0 ? void 0 : _a.min) || (prevZoom === null || prevZoom === void 0 ? void 0 : prevZoom.max) !== ((_b = this.currentZoom) === null || _b === void 0 ? void 0 : _b.max);
        return changed;
    }
}
