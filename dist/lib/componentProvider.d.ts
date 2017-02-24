// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IDateComp, IDateParams } from "./rendering/dateComponent";
import { GridOptions } from "./entities/gridOptions";
import { IComponent } from "./interfaces/iComponent";
import { ColDef, ColGroupDef } from "./entities/colDef";
import { IHeaderGroupComp, IHeaderGroupParams } from "./headerRendering/headerGroup/headerGroupComp";
import { IHeaderComp, IHeaderParams } from "./headerRendering/header/headerComp";
export interface ComponentConfig {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    defaultComponent: {
        new (params: any): IComponent<any>;
    };
}
/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(frameworkComponent: {
        new (): any;
    }, methodList: string[]): A;
}
export declare class ComponentProvider {
    private gridOptions;
    private context;
    private frameworkComponentWrapper;
    private allComponentConfig;
    postContruct(): void;
    private newAgGridComponent<A, B>(holder, componentName);
    createAgGridComponent<A extends IComponent<any>>(holder: GridOptions | ColDef | ColGroupDef, componentName: string, agGridParams: any): A;
    newDateComponent(params: IDateParams): IDateComp;
    newHeaderComponent(params: IHeaderParams): IHeaderComp;
    newHeaderGroupComponent(params: IHeaderGroupParams): IHeaderGroupComp;
}
