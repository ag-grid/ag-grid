// ag-grid-react v29.3.5
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalManager = void 0;
var PortalManager = /** @class */ (function () {
    function PortalManager(parent, wrappingElement, maxComponentCreationTimeMs) {
        this.destroyed = false;
        this.portals = [];
        this.hasPendingPortalUpdate = false;
        this.wrappingElement = wrappingElement ? wrappingElement : 'div';
        this.parent = parent;
        this.maxComponentCreationTimeMs = maxComponentCreationTimeMs ? maxComponentCreationTimeMs : PortalManager.MAX_COMPONENT_CREATION_TIME_IN_MS;
    }
    PortalManager.prototype.getPortals = function () {
        return this.portals;
    };
    PortalManager.prototype.destroy = function () {
        this.destroyed = true;
    };
    PortalManager.prototype.destroyPortal = function (portal) {
        this.portals = this.portals.filter(function (curPortal) { return curPortal !== portal; });
        this.batchUpdate();
    };
    PortalManager.prototype.getComponentWrappingElement = function () {
        return this.wrappingElement;
    };
    PortalManager.prototype.mountReactPortal = function (portal, reactComponent, resolve) {
        this.portals = __spreadArrays(this.portals, [portal]);
        this.waitForInstance(reactComponent, resolve);
        this.batchUpdate();
    };
    PortalManager.prototype.updateReactPortal = function (oldPortal, newPortal) {
        this.portals[this.portals.indexOf(oldPortal)] = newPortal;
        this.batchUpdate();
    };
    PortalManager.prototype.batchUpdate = function () {
        var _this = this;
        if (this.hasPendingPortalUpdate) {
            return;
        }
        setTimeout(function () {
            if (!_this.destroyed) { // destroyed?
                _this.parent.forceUpdate(function () {
                    _this.hasPendingPortalUpdate = false;
                });
            }
        });
        this.hasPendingPortalUpdate = true;
    };
    PortalManager.prototype.waitForInstance = function (reactComponent, resolve, startTime) {
        var _this = this;
        if (startTime === void 0) { startTime = Date.now(); }
        // if the grid has been destroyed in the meantime just resolve
        if (this.destroyed) {
            resolve(null);
            return;
        }
        if (reactComponent.rendered()) {
            resolve(reactComponent);
        }
        else {
            if (Date.now() - startTime >= this.maxComponentCreationTimeMs && !this.hasPendingPortalUpdate) {
                // last check - we check if this is a null value being rendered - we do this last as using SSR to check the value
                // can mess up contexts
                if (reactComponent.isNullValue()) {
                    resolve(reactComponent);
                    return;
                }
                console.error("AG Grid: React Component '" + reactComponent.getReactComponentName() + "' not created within " + this.maxComponentCreationTimeMs + "ms");
                return;
            }
            window.setTimeout(function () {
                _this.waitForInstance(reactComponent, resolve, startTime);
            });
        }
    };
    PortalManager.MAX_COMPONENT_CREATION_TIME_IN_MS = 1000; // a second should be more than enough to instantiate a component
    return PortalManager;
}());
exports.PortalManager = PortalManager;
