import {ComponentMeta} from "../context/context";
import {AgGridRegisteredComponentInput} from "../components/framework/userComponentRegistry";
import {IComponent} from "./iComponent";

export interface Module {
    moduleName: string;
    beans?: any[];
    agStackComponents?: ComponentMeta[];
    userComponents?: {componentName: string, componentClass: AgGridRegisteredComponentInput<IComponent<any>>}[];
}
