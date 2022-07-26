import {VanillaFrameworkOverrides} from '@ag-grid-community/core';
import {VueComponentFactory} from './VueComponentFactory';

export class VueFrameworkOverrides extends VanillaFrameworkOverrides {
    private readonly parent: any;

    constructor(parent: any) {
        super();

        this.parent = parent;
    }

    /*
     * vue components are specified in the "components" part of the vue component - as such we need a way to determine
     * if a given component is within that context - this method provides this
     * Note: This is only really used/necessary with cellRendererSelectors
     */
    public frameworkComponent(name: string, components?: any): any {
        let result = !!VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
        if (!result && components && components[name]) {
            const indirectName = components[name];
            result = !!VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true) ? indirectName : null;
        }
        return result;
    }

    public isFrameworkComponent(comp: any): boolean {
        return typeof comp === 'object';
    }
}
