import {TextCellEditor} from "../../rendering/cellEditors/textCellEditor";

import {Bean, PostConstruct} from "../../context/context";
import {IAfterGuiAttachedParams, IComponent} from "../../interfaces/iComponent";
import {DefaultDateComponent} from "../../filter/dateFilter";
import {HeaderComp} from "../../headerRendering/header/headerComp";
import {HeaderGroupComp} from "../../headerRendering/headerGroup/headerGroupComp";
import {
    DateFloatingFilterComp,
    NumberFloatingFilterComp,
    ReadModelAsStringFloatingFilterComp,
    SetFloatingFilterComp,
    TextFloatingFilterComp
} from "../../filter/floatingFilter";
import {EmptyFloatingFilterWrapperComp, FloatingFilterWrapperComp} from "../../filter/floatingFilterWrapper";
import {ComponentType} from "./componentResolver";
import {GroupCellRenderer} from "../../rendering/cellRenderers/groupCellRenderer";
import {AnimateShowChangeCellRenderer} from "../../rendering/cellRenderers/animateShowChangeCellRenderer";
import {AnimateSlideCellRenderer} from "../../rendering/cellRenderers/animateSlideCellRenderer";
import {LoadingCellRenderer} from "../../rendering/rowComp";
import {SelectCellEditor} from "../../rendering/cellEditors/selectCellEditor";
import {PopupTextCellEditor} from "../../rendering/cellEditors/popupTextCellEditor";
import {PopupSelectCellEditor} from "../../rendering/cellEditors/popupSelectCellEditor";
import {LargeTextCellEditor} from "../../rendering/cellEditors/largeTextCellEditor";


export enum RegisteredComponentSource {
    DEFAULT, REGISTERED
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface RegisteredComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> {
    component: RegisteredComponentInput<A, B>,
    type:ComponentType,
    source:RegisteredComponentSource
}

export type RegisteredComponentInput<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> = AgGridRegisteredComponentInput<A>| {new(): B};
export type AgGridRegisteredComponentInput<A extends IComponent<any, IAfterGuiAttachedParams>> = AgGridComponentFunctionInput | {new(): A}
export type AgGridComponentFunctionInput = (params:any)=>string | HTMLElement ;


@Bean('componentProvider')
export class ComponentProvider {

    private agGridDefaults :{[key:string]:AgGridRegisteredComponentInput<any>};
    private jsComponents :{[key:string]:AgGridRegisteredComponentInput<any>} = {};
    private frameworkComponents :{[key:string]:{new(): any}} = {};

    @PostConstruct
    public postConstruct (){
        this.agGridDefaults = {
            //THE FOLLOWING COMPONENTS HAVE NO DEFAULTS, THEY NEED TO BE SPECIFIED AS AN SPECIFIC FLAVOUR
            //THERE ARE NO DEFAULTS THAT FIT ALL PURPOSES
            //THEY ARE ADDED HERE TO AVOID THE NOT FOUND WARNING.
            filterComponent:null,
            customFloatingFilterComponent:null,

            //date
            dateComponent: DefaultDateComponent,

            //header
            headerComponent: HeaderComp,
            headerGroupComponent: HeaderGroupComp,

            //floating filters
            setFloatingFilterComponent: SetFloatingFilterComp,
            textFloatingFilterComponent: TextFloatingFilterComp,
            numberFloatingFilterComponent:NumberFloatingFilterComp,
            dateFloatingFilterComponent: DateFloatingFilterComp,
            readModelAsStringFloatingFilterComponent: ReadModelAsStringFloatingFilterComp,
            floatingFilterWrapperComponent: FloatingFilterWrapperComp,
            emptyFloatingFilterWrapperComponent: EmptyFloatingFilterWrapperComp,

            //renderers
            cellRenderer: null,
            fullWidthCellRenderer: null,
            innerRenderer: null,
            groupRowInnerRenderer: null,
            animateShowChange: AnimateShowChangeCellRenderer,
            animateSlide: AnimateSlideCellRenderer,
            group: GroupCellRenderer,
            groupRowRenderer: GroupCellRenderer,
            loadingCellRenderer: LoadingCellRenderer,
            pinnedRowCellRenderer: null,

            //editors
            cellEditor: TextCellEditor,
            textCellEditor: TextCellEditor,
            text: TextCellEditor,
            selectCellEditor: SelectCellEditor,
            select: SelectCellEditor,
            popupTextCellEditor: PopupTextCellEditor,
            popupText: PopupTextCellEditor,
            popupSelectCellEditor: PopupSelectCellEditor,
            popupSelect: PopupSelectCellEditor,
            largeTextCellEditor: LargeTextCellEditor,
            largeText: LargeTextCellEditor
        }
    }

    public registerComponent<A extends IComponent<any, IAfterGuiAttachedParams>> (name:string, component:AgGridRegisteredComponentInput<A>){
        // console.warn(`ag-grid: registering components is a lab feature, is not intended to be used or supported yet.`);
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
    public registerFwComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> (name:string, component:{new(): IComponent<B, IAfterGuiAttachedParams>}){
        // console.warn(`ag-grid: registering components is a lab feature, is not intended to be used or supported yet.`);
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
    public retrieve <A extends IComponent<any, IAfterGuiAttachedParams> & B, B> (name:string): RegisteredComponent<A, B>{
        if (this.frameworkComponents[name]){
            return {
                type: ComponentType.FRAMEWORK,
                component: <{new(): B}>this.frameworkComponents[name],
                source: RegisteredComponentSource.REGISTERED
            }
        }
        if (this.jsComponents[name]){
            return {
                type: ComponentType.AG_GRID,
                component: <{new(): A}>this.jsComponents[name],
                source: RegisteredComponentSource.REGISTERED
            }
        }
        if (this.agGridDefaults[name]){
            return {
                type: ComponentType.AG_GRID,
                component: <{new(): A}>this.agGridDefaults[name],
                source: RegisteredComponentSource.DEFAULT
            }
        }

        if (Object.keys(this.agGridDefaults).indexOf(name) < 0){
            console.warn(`ag-grid: Looking for component [${name}] but it wasn't found.`);
        }
        return null;
    }
}