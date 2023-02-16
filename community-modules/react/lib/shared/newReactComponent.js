// @ag-grid-community/react v29.1.0
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewReactComponent = void 0;
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const core_1 = require("@ag-grid-community/core");
const reactComponent_1 = require("./reactComponent");
const server_1 = require("react-dom/server");
const keyGenerator_1 = __importDefault(require("./keyGenerator"));
class NewReactComponent extends reactComponent_1.ReactComponent {
    constructor(reactComponent, parentComponent, componentType) {
        super(reactComponent, parentComponent, componentType);
        this.oldPortal = null;
        this.key = keyGenerator_1.default();
        this.portalKey = keyGenerator_1.default();
    }
    init(params) {
        this.eParentElement = this.createParentElement(params);
        this.params = params;
        this.createOrUpdatePortal(params);
        return new core_1.AgPromise(resolve => this.createReactComponent(resolve));
    }
    createOrUpdatePortal(params) {
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
            };
        }
        this.reactElement = react_1.createElement(this.reactComponent, Object.assign(Object.assign({}, params), { key: this.key }));
        this.portal = react_dom_1.createPortal(this.reactElement, this.eParentElement, this.portalKey // fixed deltaRowModeRefreshCompRenderer
        );
    }
    createReactComponent(resolve) {
        this.portalManager.mountReactPortal(this.portal, this, (value) => {
            resolve(value);
        });
    }
    isNullValue() {
        return this.valueRenderedIsNull(this.params);
    }
    rendered() {
        return (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }
    valueRenderedIsNull(params) {
        // we only do this for cellRenderers
        if (!this.componentType.cellRenderer) {
            return false;
        }
        // we've no way of knowing if a component returns null without rendering it first
        // so we render it to markup and check the output - if it'll be null we know and won't timeout
        // waiting for a component that will never be created
        const originalConsoleError = console.error;
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = () => {
            };
            const staticMarkup = server_1.renderToStaticMarkup(react_1.createElement(this.reactComponent, params));
            return staticMarkup === '';
        }
        catch (ignore) {
        }
        finally {
            console.error = originalConsoleError;
        }
        return false;
    }
    /*
    * fallback methods - these will be invoked if a corresponding instance method is not present
    * for example if refresh is called and is not available on the component instance, then refreshComponent on this
    * class will be invoked instead
    *
    * Currently only refresh is supported
    */
    refreshComponent(args) {
        this.oldPortal = this.portal;
        this.createOrUpdatePortal(args);
        this.portalManager.updateReactPortal(this.oldPortal, this.portal);
    }
    fallbackMethod(name, params) {
        const method = this[`${name}Component`];
        if (!!method) {
            return method.bind(this)(params);
        }
    }
    fallbackMethodAvailable(name) {
        const method = this[`${name}Component`];
        return !!method;
    }
}
exports.NewReactComponent = NewReactComponent;

//# sourceMappingURL=newReactComponent.js.map
