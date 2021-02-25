import { AgGridComponentFunctionInput, AgGridRegisteredComponentInput } from "./userComponentRegistry";
import { IComponent } from "../../interfaces/iComponent";
import { ComponentClassDef, ComponentSource } from "./userComponentFactory";
import { ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { BeanStub } from "../../context/beanStub";
export declare class AgComponentUtils extends BeanStub {
    private componentMetadataProvider;
    adaptFunction<A extends IComponent<any> & B, B, TParams>(propertyName: string, hardcodedJsFunction: AgGridComponentFunctionInput, componentFromFramework: boolean, source: ComponentSource): ComponentClassDef<A, B, TParams> | null;
    adaptCellRendererFunction(callback: AgGridComponentFunctionInput): {
        new (): IComponent<ICellRendererParams>;
    };
    doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any>>): boolean;
}
