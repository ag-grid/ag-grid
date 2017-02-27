import {Bean, Autowired, Optional, PostConstruct, Context} from "./context/context";
import {IDateComp, IDateParams} from "./rendering/dateComponent";
import {GridOptions} from "./entities/gridOptions";
import {IComponent} from "./interfaces/iComponent";
import {ColDef, ColGroupDef} from "./entities/colDef";
import {HeaderGroupComp, IHeaderGroupComp, IHeaderGroupParams} from "./headerRendering/headerGroup/headerGroupComp";
import {HeaderComp, IHeaderComp, IHeaderParams} from "./headerRendering/header/headerComp";
import {DefaultDateComponent} from "./filter/dateFilter";
import {_} from "./utils";
import {
    FloatingFilterComp, IFloatingFilterParams, TextFloatingFilterComp,
    SetFloatingFilterComp, NumberFloatingFilterComp, DateFloatingFilterComp, EmptyFloatingFilterComp
} from "./filter/floatingFilter";
import {Column} from "./entities/column";
import {GridOptionsWrapper} from "./gridOptionsWrapper";


export interface ComponentConfig {
    mandatoryMethodList:string[],
    optionalMethodList:string[],
    defaultComponent:{new(params:any): IComponent<any>}
}


/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface FrameworkComponentWrapper {
    wrap <A extends IComponent<any>> (frameworkComponent:{new(): any}, methodList:string[]):A
}



@Bean('componentProvider')
export class ComponentProvider {
    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired("context")
    private context: Context;


    @Optional ("frameworkComponentWrapper")
    private frameworkComponentWrapper: FrameworkComponentWrapper;

    private allComponentConfig :{[key:string]:ComponentConfig}

    @PostConstruct
    public postContruct (){
        this.allComponentConfig = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: [],
                defaultComponent: DefaultDateComponent
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: HeaderComp
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: HeaderGroupComp
            },
            textFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: TextFloatingFilterComp
            },
            setFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: SetFloatingFilterComp
            },
            numberFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: NumberFloatingFilterComp
            },
            dateFloatingFilterComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: DateFloatingFilterComp
            },
            customFloatingFilter: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: EmptyFloatingFilterComp
            }
        }
    }

    private newAgGridComponent<A extends IComponent<any> & B, B>
    (holder:GridOptions | ColDef | ColGroupDef, componentName:string, defaultComponentName:string): A{
        let thisComponentConfig: ComponentConfig= this.allComponentConfig[defaultComponentName];
        if (!thisComponentConfig){
            throw Error("Invalid component specified, there are no components of type : " + componentName)
        }

        let DefaultComponent : {new(): A} = <{new(): A}>thisComponentConfig.defaultComponent;
        let CustomAgGridComponent : {new(): A} = holder ? (<any>holder)[componentName] : null;
        let FrameworkComponentRaw : {new(): B} = holder ? (<any>holder)[componentName + "Framework"] : null;

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
        return <A>this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList);
    }

    public createAgGridComponent<A extends IComponent<any>> (holder:GridOptions | ColDef | ColGroupDef, componentName:string, defaultComponentName:string, agGridParams:any): A{
        let component: A = <A>this.newAgGridComponent(holder, componentName, defaultComponentName);
        let customParams:any = holder ? (<any>holder)[componentName + "Params"] : null;
        let finalParams:any = {};
        _.mergeDeep(finalParams, agGridParams);
        _.mergeDeep(finalParams, customParams);

        this.context.wireBean(component);
        component.init(finalParams);
        if (!component){
            throw Error (`Can't create ag-Grid component with name: ${componentName}`)
        }
        return component;
    }

    public newDateComponent (params: IDateParams): IDateComp{
        return <IDateComp>this.createAgGridComponent(this.gridOptions, "dateComponent", "dateComponent", params);
    }

    public newHeaderComponent (params:IHeaderParams): IHeaderComp{
        return <IHeaderComp>this.createAgGridComponent(params.column.getColDef(), "headerComponent", "headerComponent", params);
    }

    public newHeaderGroupComponent (params:IHeaderGroupParams): IHeaderGroupComp{
        return <IHeaderGroupComp>this.createAgGridComponent(params.columnGroup.getColGroupDef(), "headerGroupComponent", "headerGroupComponent", params);
    }

    public newFloatingFilterComponent<M> (params:IFloatingFilterParams<M>):FloatingFilterComp<M, any>{
        let colDef = params.column.getColDef();
        let floatingFilterToInstantiate: string;
        if (typeof  colDef.filter === 'string') {
            floatingFilterToInstantiate = colDef.filter + "FloatingFilterComponent";
        } else if (!colDef.filter){
            floatingFilterToInstantiate= this.gridOptionsWrapper.isEnterprise() ? 'setFloatingFilterComponent' : 'textFloatingFilterComponent';
        } else {
            floatingFilterToInstantiate= 'customFloatingFilter';
        }

        return <FloatingFilterComp<any, any>> this.createAgGridComponent(colDef, "floatingFilterComponent", floatingFilterToInstantiate, params);
    }
}