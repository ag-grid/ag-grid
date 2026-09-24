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
    public override frameworkComponent(name: string, components?: any, propertyName?: string): any {
        // A named slot counts as a framework component too, cellRenderer only (matches
        // VueComponentFactory's own eligibility check), so it isn't reported as unregistered.
        const slotEligible = propertyName === 'cellRenderer';
        if (slotEligible && VueComponentFactory.hasSlot(this.parent, name)) {
            return name;
        }
        let result = VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
        if (!result && components && components[name]) {
            const indirectName = components[name];
            result =
                (slotEligible && VueComponentFactory.hasSlot(this.parent, indirectName)) ||
                VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true)
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
