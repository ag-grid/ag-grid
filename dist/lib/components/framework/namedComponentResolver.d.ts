// Type definitions for ag-grid v14.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ResolvedComponent } from "./componentResolver";
import { IComponent } from "../../interfaces/iComponent";
export declare class NamedComponentResolver {
    private componentProvider;
    private agComponentUtils;
    resolve<A extends IComponent<any> & B, B>(propertyName: string, componentNameOpt?: string): ResolvedComponent<A, B>;
}
