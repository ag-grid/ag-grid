// @ag-grid-community/react v29.2.0
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyReactComponent = void 0;
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const core_1 = require("@ag-grid-community/core");
const reactComponent_1 = require("../shared/reactComponent");
const server_1 = require("react-dom/server");
const keyGenerator_1 = __importDefault(require("../shared/keyGenerator"));
class LegacyReactComponent extends reactComponent_1.ReactComponent {
    constructor(reactComponent, parentComponent, portalManager, componentType) {
        super(reactComponent, portalManager, componentType);
        this.staticMarkup = null;
        this.staticRenderTime = 0;
        this.parentComponent = parentComponent;
    }
    init(params) {
        this.eParentElement = this.createParentElement(params);
        this.renderStaticMarkup(params);
        return new core_1.AgPromise(resolve => this.createReactComponent(params, resolve));
    }
    createReactComponent(params, resolve) {
        // regular components (ie not functional)
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
                this.removeStaticMarkup();
            };
        }
        const reactComponent = react_1.createElement(this.reactComponent, params);
        const portal = react_dom_1.createPortal(reactComponent, this.eParentElement, keyGenerator_1.default() // fixed deltaRowModeRefreshCompRenderer
        );
        this.portal = portal;
        this.portalManager.mountReactPortal(portal, this, (value) => {
            resolve(value);
            // functional/stateless components have a slightly different lifecycle (no refs) so we'll clean them up
            // here
            if (this.isStatelessComponent()) {
                if (this.isSlowRenderer()) {
                    this.removeStaticMarkup();
                }
                setTimeout(() => {
                    this.removeStaticMarkup();
                });
            }
        });
    }
    fallbackMethodAvailable(name) {
        return false;
    }
    fallbackMethod(name, params) { }
    isSlowRenderer() {
        return this.staticRenderTime >= LegacyReactComponent.SLOW_RENDERING_THRESHOLD;
    }
    isNullValue() {
        return this.staticMarkup === '';
    }
    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    renderStaticMarkup(params) {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.cellRenderer) {
            return;
        }
        const originalConsoleError = console.error;
        const reactComponent = react_1.createElement(this.reactComponent, params);
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = () => {
            };
            const start = Date.now();
            const staticMarkup = server_1.renderToStaticMarkup(reactComponent);
            this.staticRenderTime = Date.now() - start;
            console.error = originalConsoleError;
            // if the render method returns null the result will be an empty string
            if (staticMarkup === '') {
                this.staticMarkup = staticMarkup;
            }
            else {
                if (staticMarkup) {
                    // we wrap the content as if there is "trailing" text etc it's not easy to safely remove
                    // the same is true for memoized renderers, renderers that that return simple strings or NaN etc
                    this.staticMarkup = document.createElement('span');
                    this.staticMarkup.innerHTML = staticMarkup;
                    this.eParentElement.appendChild(this.staticMarkup);
                }
            }
        }
        catch (e) {
            // we tried - this can happen with certain (rare) edge cases
        }
        finally {
            console.error = originalConsoleError;
        }
    }
    removeStaticMarkup() {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.cellRenderer) {
            return;
        }
        if (this.staticMarkup) {
            if (this.staticMarkup.remove) {
                // everyone else in the world
                this.staticMarkup.remove();
                this.staticMarkup = null;
            }
            else if (this.eParentElement.removeChild) {
                // ie11...
                this.eParentElement.removeChild(this.staticMarkup);
                this.staticMarkup = null;
            }
        }
    }
    rendered() {
        return this.isNullValue() ||
            !!this.staticMarkup || (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }
}
exports.LegacyReactComponent = LegacyReactComponent;
LegacyReactComponent.SLOW_RENDERING_THRESHOLD = 3;

//# sourceMappingURL=legacyReactComponent.js.map
