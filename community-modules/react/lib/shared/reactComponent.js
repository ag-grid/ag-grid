// @ag-grid-community/react v28.1.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseReactComponent {
}
class ReactComponent extends BaseReactComponent {
    constructor(reactComponent, portalManager, componentType) {
        super();
        this.portal = null;
        this.reactComponent = reactComponent;
        this.portalManager = portalManager;
        this.componentType = componentType;
        this.statelessComponent = this.isStateless(this.reactComponent);
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
}
exports.ReactComponent = ReactComponent;

//# sourceMappingURL=reactComponent.js.map
