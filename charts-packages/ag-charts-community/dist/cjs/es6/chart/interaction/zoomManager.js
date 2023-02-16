"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomManager = void 0;
const baseManager_1 = require("./baseManager");
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
class ZoomManager extends baseManager_1.BaseManager {
    constructor() {
        super();
        this.states = {};
        this.currentZoom = undefined;
    }
    updateZoom(callerId, newZoom) {
        delete this.states[callerId];
        if (newZoom != null) {
            this.states[callerId] = Object.assign({}, newZoom);
        }
        this.applyStates();
    }
    getZoom() {
        return this.currentZoom;
    }
    applyStates() {
        const currentZoom = this.currentZoom;
        let zoomToApply = {};
        // Last added entry wins.
        for (const [_, { x, y }] of Object.entries(this.states)) {
            zoomToApply.x = x !== null && x !== void 0 ? x : zoomToApply.x;
            zoomToApply.y = y !== null && y !== void 0 ? y : zoomToApply.y;
        }
        this.currentZoom = zoomToApply.x != null || zoomToApply.y != null ? zoomToApply : undefined;
        const changed = !isEqual(currentZoom, this.currentZoom);
        if (!changed) {
            return;
        }
        const event = Object.assign({ type: 'zoom-change' }, (currentZoom !== null && currentZoom !== void 0 ? currentZoom : {}));
        this.listeners.dispatch('zoom-change', event);
    }
}
exports.ZoomManager = ZoomManager;
