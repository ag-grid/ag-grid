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
    public frameworkComponent(name: string): any {
        return !!VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true) ? name : null;
    }
}
