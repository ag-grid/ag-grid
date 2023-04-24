import { ComponentMeta } from "../context/context";
import { BeanStub } from "../context/beanStub";
export declare class AgStackComponentsRegistry extends BeanStub {
    private componentsMappedByName;
    setupComponents(components: ComponentMeta[]): void;
    private addComponent;
    getComponentClass(htmlTag: string): any;
}
