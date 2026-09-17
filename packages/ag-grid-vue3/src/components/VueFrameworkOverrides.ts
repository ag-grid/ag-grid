import { VanillaFrameworkOverrides } from 'ag-grid-community';

import { VueComponentFactory } from './VueComponentFactory';

export class VueFrameworkOverrides extends VanillaFrameworkOverrides {
    private readonly parent: any;

    constructor(parent: any) {
        super('vue');

        this.parent = parent;
    }

    /*
     * vue components are specified in the "components" part of the vue component - as such we need a way to determine
     * if a given component is within that context - this method provides this
     * Note: This is only really used/necessary with cellRendererSelectors
     */
    public override frameworkComponent(name: string, components?: any): any {
        // A named slot on this AgGridVue instance counts as a framework component too, so a
        // slot-only name (no registered component) still reaches VueComponentFactory instead of
        // being reported as an unregistered component before Vue-specific resolution runs.
        if (this.parent.slots?.[name]) {
            return name;
        }
        let result = VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
        if (!result && components && components[name]) {
            const indirectName = components[name];
            result = VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true)
                ? indirectName
                : null;
        }
        return result;
    }

    public override isFrameworkComponent(comp: any): boolean {
        // Reject null (typeof null === 'object') and arrays (which pass typeof check but aren't Vue components)
        return comp !== null && typeof comp === 'object' && !Array.isArray(comp);
    }
}
