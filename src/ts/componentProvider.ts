import {Bean, Autowired, Optional, PostConstruct, Context} from "./context/context";
import {IDateComp, IDateParams} from "./rendering/dateComponent";
import {GridOptions} from "./entities/gridOptions";
import {IComponent} from "./interfaces/iComponent";
import {ColDef, ColGroupDef} from "./entities/colDef";
import {HeaderGroupComp, IHeaderGroupComp, IHeaderGroupParams} from "./headerRendering/headerGroup/headerGroupComp";
import {HeaderComp, IHeaderComp, IHeaderParams} from "./headerRendering/header/headerComp";
import {DefaultDateComponent} from "./filter/dateFilter";
import {_} from "./utils";


export interface ComponentConfig {
    methodList:string[],
    defaultComponent:{new(params:any): IComponent<any>}
}


/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface FrameworkComponentWrapper {
    <A extends IComponent<any> & B, B> (frameworkComponent:{new(params:any): B}, methodList:string[]):A
}



@Bean('componentProvider')
export class ComponentProvider {
    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("context")
    private context: Context;


    @Optional ("frameworkComponentWrapper")
    private frameworkComponentWrapper: FrameworkComponentWrapper;

    private allComponentConfig :{[key:string]:ComponentConfig}

    @PostConstruct
    public postContruct (){
        this.allComponentConfig = {
            dateComponent: {
                methodList: ['getDate', 'setDate'],
                defaultComponent: DefaultDateComponent
            },
            headerComponent: {
                methodList: [],
                defaultComponent: HeaderComp
            },
            headerGroupComponent: {
                methodList: [],
                defaultComponent: HeaderGroupComp
            }
        }
    }

    private newAgGridComponent<A extends IComponent<any> & B, B>
    (holder:GridOptions | ColDef | ColGroupDef, componentName:string): A{
        let thisComponentConfig: ComponentConfig= this.allComponentConfig[componentName];
        if (!thisComponentConfig){
            throw Error("Invalid component specified, there are no components of type : " + componentName)
        }

        let DefaultComponent : {new(): A} = <{new(): A}>thisComponentConfig.defaultComponent;
        let CustomAgGridComponent : {new(): A} = (<any>holder)[componentName];
        let FrameworkComponentRaw : {new(): B} = (<any>holder)[componentName + "Framework"];

        if (CustomAgGridComponent && FrameworkComponentRaw){
            throw Error("You are trying to register: " + componentName + " twice.")
        }

        if (FrameworkComponentRaw && !this.frameworkComponentWrapper){
            throw Error("You are specifying a framework component but you are not using a framework version of ag-grid for : " + componentName)
        }


        if (!FrameworkComponentRaw){
            let ComponentToUse:{new(): IComponent<any>}= CustomAgGridComponent || DefaultComponent;
            if (!ComponentToUse){
                throw Error ("Unexpected error loading default component for: " + componentName + " default component not found.");
            }
            return <A>new ComponentToUse ();

        }


        //Using framework component
        return <A>this.frameworkComponentWrapper(FrameworkComponentRaw, thisComponentConfig.methodList);
    }

    public createAgGridComponent<A extends IComponent<P> & B, B, P>
    (holder:GridOptions | ColDef | ColGroupDef, componentName:string, agGridParams:P): A{
        let component: A = <A>this.newAgGridComponent(holder, componentName);
        let customParams:any = (<any>holder)[componentName + "Params"];
        let finalParams:any = {};
        _.mergeDeep(finalParams, agGridParams);
        _.mergeDeep(finalParams, customParams);

        this.context.wireBean(component);
        component.init(finalParams);
        return component;
    }

    public newDateComponent (params: IDateParams): IDateComp{
        return <IDateComp>this.createAgGridComponent(this.gridOptions, "dateComponent", params);
    }

    public newHeaderComponent (params:IHeaderParams): IHeaderComp{
        return <IHeaderComp>this.createAgGridComponent(params.column.getColDef(), "headerComponent", params);
    }

    public newHeaderGroupComponent (params:IHeaderGroupParams): IHeaderGroupComp{
        return <IHeaderGroupComp>this.createAgGridComponent(params.columnGroup.getColGroupDef(), "headerGroupComponent", params);
    }
}