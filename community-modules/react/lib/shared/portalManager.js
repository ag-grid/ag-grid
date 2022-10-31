// @ag-grid-community/react v28.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PortalManager {
    constructor(parent, wrappingElement, maxComponentCreationTimeMs) {
        this.destroyed = false;
        this.portals = [];
        this.hasPendingPortalUpdate = false;
        this.wrappingElement = wrappingElement ? wrappingElement : 'div';
        this.parent = parent;
        this.maxComponentCreationTimeMs = maxComponentCreationTimeMs ? maxComponentCreationTimeMs : PortalManager.MAX_COMPONENT_CREATION_TIME_IN_MS;
    }
    getPortals() {
        return this.portals;
    }
    destroy() {
        this.destroyed = true;
    }
    destroyPortal(portal) {
        this.portals = this.portals.filter(curPortal => curPortal !== portal);
        this.batchUpdate();
    }
    getComponentWrappingElement() {
        return this.wrappingElement;
    }
    mountReactPortal(portal, reactComponent, resolve) {
        this.portals = [...this.portals, portal];
        this.waitForInstance(reactComponent, resolve);
        this.batchUpdate();
    }
    updateReactPortal(oldPortal, newPortal) {
        this.portals[this.portals.indexOf(oldPortal)] = newPortal;
        this.batchUpdate();
    }
    batchUpdate() {
        if (this.hasPendingPortalUpdate) {
            return;
        }
        setTimeout(() => {
            if (!this.destroyed) { // destroyed?
                this.parent.forceUpdate(() => {
                    this.hasPendingPortalUpdate = false;
                });
            }
        });
        this.hasPendingPortalUpdate = true;
    }
    waitForInstance(reactComponent, resolve, startTime = Date.now()) {
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
                console.error(`AG Grid: React Component '${reactComponent.getReactComponentName()}' not created within ${this.maxComponentCreationTimeMs}ms`);
                return;
            }
            window.setTimeout(() => {
                this.waitForInstance(reactComponent, resolve, startTime);
            });
        }
    }
}
exports.PortalManager = PortalManager;
PortalManager.MAX_COMPONENT_CREATION_TIME_IN_MS = 1000; // a second should be more than enough to instantiate a component

//# sourceMappingURL=portalManager.js.map
