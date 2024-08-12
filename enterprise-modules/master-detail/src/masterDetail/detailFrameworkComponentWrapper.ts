import type { ComponentType, FrameworkComponentWrapper, IComponent } from '@ag-grid-community/core';

// this wrapper is to prevent detail grids from destroying the parent wrappers
export class DetailFrameworkComponentWrapper implements FrameworkComponentWrapper {
    constructor(private readonly parentWrapper: FrameworkComponentWrapper) {}

    public wrap<A extends IComponent<any>>(
        frameworkComponent: { new (): any } | null,
        methodList: string[],
        optionalMethodList: string[],
        componentType: ComponentType
    ): A {
        return this.parentWrapper.wrap(frameworkComponent, methodList, optionalMethodList, componentType);
    }
}
