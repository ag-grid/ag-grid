import {Bean, PostConstruct} from "../../context/context";
import {IComponent} from "../../interfaces/iComponent";
import {DefaultDateComponent} from "../../filter/dateFilter";
import {HeaderComp} from "../../headerRendering/header/headerComp";
import {HeaderGroupComp} from "../../headerRendering/headerGroup/headerGroupComp";
import {
    SetFloatingFilterComp, TextFloatingFilterComp, NumberFloatingFilterComp,
    DateFloatingFilterComp, ReadModelAsStringFloatingFilterComp
} from "../../filter/floatingFilter";
import {EmptyFloatingFilterWrapperComp, FloatingFilterWrapperComp} from "../../filter/floatingFilterWrapper";
import {ComponentToUse, ComponentType} from "./componentResolver";

@Bean('componentProvider')
export class ComponentProvider {

    private agGridDefaults :{[key:string]:{new(): IComponent<any>}};
    private jsComponents :{[key:string]:{new(): IComponent<any>}} = {};
    private frameworkComponents :{[key:string]:{new(): any}} = {};

    @PostConstruct
    public postConstruct (){
        this.agGridDefaults = {
            dateComponent: DefaultDateComponent,
            headerComponent: HeaderComp,
            headerGroupComponent: HeaderGroupComp,
            setFloatingFilterComponent: SetFloatingFilterComp,
            textFloatingFilterComponent: TextFloatingFilterComp,
            numberFloatingFilterComponent:NumberFloatingFilterComp,
            dateFloatingFilterComponent: DateFloatingFilterComp,
            readModelAsStringFloatingFilterComponent: ReadModelAsStringFloatingFilterComp,
            floatingFilterWrapperComponent: FloatingFilterWrapperComp,
            emptyFloatingFilterWrapperComponent: EmptyFloatingFilterWrapperComp
        }
    }

    public registerComponent<A extends IComponent<any>> (name:string, component:{new(): IComponent<A>}){
        if (this.frameworkComponents[name]){
            console.error(`Trying to register a component that you have already registered for frameworks: ${name}`);
            return;
        }

        this.jsComponents[name] = component;
    }

    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    public registerFwComponent<A extends IComponent<any> & B, B> (name:string, component:{new(): IComponent<B>}){
        if (this.jsComponents[name]){
            console.error(`Trying to register a component that you have already registered for plain javascript: ${name}`);
            return;
        }

        this.frameworkComponents[name] = component;
    }


    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    public retrieve <A extends IComponent<any> & B, B> (name:string): ComponentToUse<A, B>{
        if (this.frameworkComponents[name]){
            return {
                type: ComponentType.FRAMEWORK,
                component: <{new(): B}>this.frameworkComponents[name]
            }
        }
        if (this.jsComponents[name]){
            return {
                type: ComponentType.AG_GRID,
                component: <{new(): A}>this.jsComponents[name]
            }
        }
        if (this.agGridDefaults[name]){
            return {
                type: ComponentType.AG_GRID,
                component: <{new(): A}>this.agGridDefaults[name]
            }
        }
        return null;
    }
}