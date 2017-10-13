// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgGridComponentFunctionInput, AgGridRegisteredComponentInput } from "./componentProvider";
import { IAfterGuiAttachedParams, IComponent } from "../../interfaces/iComponent";
import { ComponentSource, ComponentType, ResolvedComponent } from "./componentResolver";
import { ICellRendererComp, ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
export declare class DefaultCellRenderer implements ICellRendererComp {
    private params;
    init?(params: ICellRendererParams): void;
    refresh(params: any): boolean;
    getGui(): HTMLElement | string;
}
export declare class AgComponentUtils {
    private componentMetadataProvider;
    adaptFunction<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>(propertyName: string, hardcodedJsFunction: AgGridComponentFunctionInput, type: ComponentType, source: ComponentSource): ResolvedComponent<A, B>;
    adaptCellRendererFunction(callback: AgGridComponentFunctionInput): {
        new (): IComponent<any, IAfterGuiAttachedParams>;
    };
    doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any, IAfterGuiAttachedParams>>): boolean;
}
