// @ag-grid-community/react v31.0.3
import { createElement } from 'react';
import { AgPromise } from '@ag-grid-community/core';
import generateNewKey from './keyGenerator.mjs';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
export class ReactComponent {
    constructor(reactComponent, portalManager, componentType, suppressFallbackMethods) {
        this.portal = null;
        this.oldPortal = null;
        this.reactComponent = reactComponent;
        this.portalManager = portalManager;
        this.componentType = componentType;
        this.suppressFallbackMethods = !!suppressFallbackMethods;
        this.statelessComponent = this.isStateless(this.reactComponent);
        this.key = generateNewKey();
        this.portalKey = generateNewKey();
        this.instanceCreated = this.isStatelessComponent() ? AgPromise.resolve(false) : new AgPromise(resolve => {
            this.resolveInstanceCreated = resolve;
        });
    }
    getGui() {
        return this.eParentElement;
    }
    destroy() {
        if (this.componentInstance && typeof this.componentInstance.destroy == 'function') {
            this.componentInstance.destroy();
        }
        return this.portalManager.destroyPortal(this.portal);
    }
    createParentElement(params) {
        const componentWrappingElement = this.portalManager.getComponentWrappingElement();
        const eParentElement = document.createElement(componentWrappingElement || 'div');
        eParentElement.classList.add('ag-react-container');
        // DEPRECATED - use componentInstance.getReactContainerStyle or componentInstance.getReactContainerClasses instead
        // so user can have access to the react container, to add css class or style
        params.reactContainer = eParentElement;
        return eParentElement;
    }
    addParentContainerStyleAndClasses() {
        if (!this.componentInstance) {
            return;
        }
        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            Object.assign(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
        }
        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            const parentContainerClasses = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(className => this.eParentElement.classList.add(className));
        }
    }
    statelessComponentRendered() {
        // fixed fragmentsFuncRendererCreateDestroy funcRendererWithNan (changeDetectionService too for NaN)
        return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
    }
    getFrameworkComponentInstance() {
        return this.componentInstance;
    }
    isStatelessComponent() {
        return this.statelessComponent;
    }
    getReactComponentName() {
        return this.reactComponent.name;
    }
    getMemoType() {
        return this.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    }
    hasSymbol() {
        return typeof Symbol === 'function' && Symbol.for;
    }
    isStateless(Component) {
        return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' && Component.$$typeof === this.getMemoType());
    }
    hasMethod(name) {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();
        return (!!frameworkComponentInstance && frameworkComponentInstance[name] !== null) ||
            this.fallbackMethodAvailable(name);
    }
    callMethod(name, args) {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();
        if (this.isStatelessComponent()) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        }
        else if (!(!!frameworkComponentInstance)) {
            // instance not ready yet - wait for it
            setTimeout(() => this.callMethod(name, args));
            return;
        }
        const method = frameworkComponentInstance[name];
        if (!!method) {
            return method.apply(frameworkComponentInstance, args);
        }
        if (this.fallbackMethodAvailable(name)) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        }
    }
    addMethod(name, callback) {
        this[name] = callback;
    }
    init(params) {
        this.eParentElement = this.createParentElement(params);
        this.params = params;
        this.createOrUpdatePortal(params);
        return new AgPromise(resolve => this.createReactComponent(resolve));
    }
    createOrUpdatePortal(params) {
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element) => {
                var _a;
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
                (_a = this.resolveInstanceCreated) === null || _a === void 0 ? void 0 : _a.call(this, true);
                this.resolveInstanceCreated = undefined;
            };
        }
        this.reactElement = this.createElement(this.reactComponent, Object.assign(Object.assign({}, params), { key: this.key }));
        this.portal = createPortal(this.reactElement, this.eParentElement, this.portalKey // fixed deltaRowModeRefreshCompRenderer
        );
    }
    createElement(reactComponent, props) {
        return createElement(reactComponent, props);
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
            const staticMarkup = renderToStaticMarkup(createElement(this.reactComponent, params));
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
        if (!this.suppressFallbackMethods && !!method) {
            return method.bind(this)(params);
        }
    }
    fallbackMethodAvailable(name) {
        if (this.suppressFallbackMethods) {
            return false;
        }
        const method = this[`${name}Component`];
        return !!method;
    }
}
