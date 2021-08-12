import { AgGridVue } from './AgGridVue';
export declare class VueComponentFactory {
    private static getComponentDefinition;
    private static createComponentParams;
    static createAndMountComponent(component: any, params: any, parent: AgGridVue): {
        mountedComponent: import("vue").App<Element>;
        componentInstance: any;
    } | undefined;
    static searchForComponentInstance(parent: AgGridVue, component: any, maxDepth?: number, suppressError?: boolean): any;
    private static addContext;
}
