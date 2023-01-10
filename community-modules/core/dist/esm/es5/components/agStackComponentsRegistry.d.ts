// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ComponentMeta } from "../context/context";
import { BeanStub } from "../context/beanStub";
export declare class AgStackComponentsRegistry extends BeanStub {
    private componentsMappedByName;
    setupComponents(components: ComponentMeta[]): void;
    private addComponent;
    getComponentClass(htmlTag: string): any;
}
