// @ag-grid-community/react v31.0.3
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
                this.refreshProps = () => callback(this.getProps());
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
        return Object.assign(Object.assign({}, this.sourceParams), { key: this.key });
    }
}
