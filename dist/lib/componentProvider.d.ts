// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IDateComp, IDateParams } from "./rendering/dateComponent";
import { GridOptions } from "./entities/gridOptions";
import { IComponent } from "./interfaces/iComponent";
import { ColDef, ColGroupDef } from "./entities/colDef";
import { IHeaderGroupComp, IHeaderGroupParams } from "./headerRendering/headerGroup/headerGroupComp";
import { IHeaderComp, IHeaderParams } from "./headerRendering/header/headerComp";
import { IFloatingFilterParams } from "./filter/floatingFilter";
import { IFloatingFilterWrapperComp } from "./filter/floatingFilterWrapper";
import { Column } from "./entities/column";
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
    }, methodList: string[], optionalMethodList?: string[]): A;
}
export declare class ComponentProvider {
    private gridOptions;
    private gridOptionsWrapper;
    private filterManager;
    private context;
    private frameworkComponentWrapper;
    private allComponentConfig;
    postContruct(): void;
    /**
     * This method returns the underlying representation of the component to be created. ie for Javascript the
     * underlying function where we should be calling new into. In case of the frameworks, the framework class
     * object that represents the component to be created.
     *
     * This method is handy if you want to check if a component has a particular method implemented withougt
     * having to create the method itself
     */
    private getComponentToUse<A, B>(holder, componentName, thisComponentConfig, mandatory?);
    private newAgGridComponent<A, B>(holder, componentName, defaultComponentName, mandatory?);
    createAgGridComponent<A extends IComponent<any>>(holder: GridOptions | ColDef | ColGroupDef, componentName: string, defaultComponentName: string, agGridParams: any, mandatory?: boolean): A;
    private getParams(holder, componentName, agGridParams);
    newDateComponent(params: IDateParams): IDateComp;
    newHeaderComponent(params: IHeaderParams): IHeaderComp;
    newHeaderGroupComponent(params: IHeaderGroupParams): IHeaderGroupComp;
    private newFloatingFilterComponent<M>(type, colDef, params);
    private getFilterComponentPrototype<A, B>(colDef);
    newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>>(column: Column, params: IFloatingFilterParams<M, any>): IFloatingFilterWrapperComp<M, any, any, any>;
    private newEmptyFloatingFilterWrapperComponent(column);
}
