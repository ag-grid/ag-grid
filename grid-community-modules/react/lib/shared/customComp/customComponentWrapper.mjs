// @ag-grid-community/react v31.1.0
import { AgPromise } from "@ag-grid-community/core";
import customWrapperComp from "../../reactUi/customComp/customWrapperComp.mjs";
import { ReactComponent } from "../reactComponent.mjs";
export function addOptionalMethods(optionalMethodNames, providedMethods, component) {
    optionalMethodNames.forEach(methodName => {
        const providedMethod = providedMethods[methodName];
        if (providedMethod) {
            component[methodName] = providedMethod;
        }
    });
}
export class CustomComponentWrapper extends ReactComponent {
    constructor() {
        super(...arguments);
        this.awaitUpdateCallback = new AgPromise(resolve => {
            this.resolveUpdateCallback = resolve;
        });
        this.wrapperComponent = customWrapperComp;
    }
    init(params) {
        this.sourceParams = params;
        return super.init(this.getProps());
    }
    addMethod() {
        // do nothing
    }
    getInstance() {
        return this.instanceCreated.then(() => this.componentInstance);
    }
    getFrameworkComponentInstance() {
        return this;
    }
    createElement(reactComponent, props) {
        return super.createElement(this.wrapperComponent, {
            initialProps: props,
            CustomComponentClass: reactComponent,
            setMethods: (methods) => this.setMethods(methods),
            addUpdateCallback: (callback) => {
                // this hooks up `CustomWrapperComp` to allow props updates to be pushed to the custom component
                this.updateCallback = () => {
                    callback(this.getProps());
                    return new AgPromise(resolve => {
                        // ensure prop updates have happened
                        setTimeout(() => {
                            resolve();
                        });
                    });
                };
                this.resolveUpdateCallback();
            }
        });
    }
    setMethods(methods) {
        this.providedMethods = methods;
        addOptionalMethods(this.getOptionalMethods(), this.providedMethods, this);
    }
    getOptionalMethods() {
        return [];
    }
    getProps() {
        return Object.assign(Object.assign({}, this.sourceParams), { key: this.key, ref: this.ref });
    }
    refreshProps() {
        if (this.updateCallback) {
            return this.updateCallback();
        }
        // `refreshProps` is assigned in an effect. It's possible it hasn't been run before the first usage, so wait.
        return new AgPromise(resolve => this.awaitUpdateCallback.then(() => {
            this.updateCallback().then(() => resolve());
        }));
    }
}
