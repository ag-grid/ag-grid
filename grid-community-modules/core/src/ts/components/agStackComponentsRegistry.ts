import { Bean, ComponentMeta } from "../context/context";
import { BeanStub } from "../context/beanStub";

@Bean('agStackComponentsRegistry')
export class AgStackComponentsRegistry extends BeanStub {

    private componentsMappedByName: { [key: string]: any } = {};

    public setupComponents(components: ComponentMeta[]): void {
        if (components) {
            components.forEach(componentMeta => this.addComponent(componentMeta));
        }
    }

    private addComponent(componentMeta: ComponentMeta): void {
        // get name of the class as a string
        // insert a dash after every capital letter
        // let classEscaped = className.replace(/([A-Z])/g, "-$1").toLowerCase();
        const classEscaped = componentMeta.componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        // put all to upper case
        const classUpperCase = classEscaped.toUpperCase();
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.componentClass;
    }

    public getComponentClass(htmlTag: string): any {
        return this.componentsMappedByName[htmlTag];
    }

}
