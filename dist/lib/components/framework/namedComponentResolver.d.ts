// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ResolvedComponent } from "./componentResolver";
import { IAfterGuiAttachedParams, IComponent } from "../../interfaces/iComponent";
export declare class NamedComponentResolver {
    private componentProvider;
    private agComponentUtils;
    resolve<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>(propertyName: string, componentNameOpt?: string): ResolvedComponent<A, B>;
}
