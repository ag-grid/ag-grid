// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgGridComponentFunctionInput, AgGridRegisteredComponentInput } from "./componentProvider";
import { IComponent } from "../../interfaces/iComponent";
import { ComponentSource, ComponentType, ResolvedComponent } from "./componentResolver";
export declare class AgComponentUtils {
    private componentMetadataProvider;
    adaptFunction<A extends IComponent<any> & B, B>(propertyName: string, hardcodedJsFunction: AgGridComponentFunctionInput, type: ComponentType, source: ComponentSource): ResolvedComponent<A, B>;
    adaptCellRendererFunction(callback: AgGridComponentFunctionInput): {
        new (): IComponent<any>;
    };
    doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any>>): boolean;
}
