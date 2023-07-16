import { VanillaFrameworkOverrides } from 'ag-grid-community';
import { VueComponentFactory } from './VueComponentFactory';
export class VueFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    /*
     * vue components are specified in the "components" part of the vue component - as such we need a way to determine
     * if a given component is within that context - this method provides this
     * Note: This is only really used/necessary with cellRendererSelectors
     */
    frameworkComponent(name, components) {
        let result = !!VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
        if (!result && components && components[name]) {
            const indirectName = components[name];
            result = !!VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true) ? indirectName : null;
        }
        return result;
    }
    isFrameworkComponent(comp) {
        return typeof comp === 'object';
    }
}
