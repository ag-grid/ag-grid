// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgGridComponentFunctionInput, AgGridRegisteredComponentInput } from "./userComponentRegistry";
import { IComponent } from "../../interfaces/iComponent";
import { ComponentClassDef, ComponentSource } from "./userComponentFactory";
export declare class AgComponentUtils {
    private componentMetadataProvider;
    adaptFunction<A extends IComponent<any> & B, B>(propertyName: string, hardcodedJsFunction: AgGridComponentFunctionInput, componentFromFramework: boolean, source: ComponentSource): ComponentClassDef<A, B>;
    adaptCellRendererFunction(callback: AgGridComponentFunctionInput): {
        new (): IComponent<any>;
    };
    doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any>>): boolean;
}
