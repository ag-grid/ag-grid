import {TextCellEditor} from "../../rendering/cellEditors/textCellEditor";

import {Autowired, Bean, Context, PostConstruct} from "../../context/context";
import {IComponent} from "../../interfaces/iComponent";
import {DateFilter, DefaultDateComponent} from "../../filter/dateFilter";
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
import {TextFilter} from "../../filter/textFilter";
import {NumberFilter} from "../../filter/numberFilter";
import {OverlayWrapperComponent} from "../../rendering/overlays/overlayWrapperComponent";
import {LoadingOverlayComponent} from "../../rendering/overlays/loadingOverlayComponent";
import {NoRowsOverlayComponent} from "../../rendering/overlays/noRowsOverlayComponent";
import {GridOptions} from "../../entities/gridOptions";

export enum RegisteredComponentSource {
    DEFAULT, REGISTERED
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface RegisteredComponent<A extends IComponent<any> & B, B> {
    component: RegisteredComponentInput<A, B>,
    type:ComponentType,
    source:RegisteredComponentSource
}

export type RegisteredComponentInput<A extends IComponent<any> & B, B> = AgGridRegisteredComponentInput<A>| {new(): B};
export type AgGridRegisteredComponentInput<A extends IComponent<any>> = AgGridComponentFunctionInput | {new(): A}
export type AgGridComponentFunctionInput = (params:any)=>string | HTMLElement ;

export interface AgGridProvidedComponentDef {
    overridable: boolean,
    defaultImpl: AgGridRegisteredComponentInput<any>
}


@Bean('componentProvider')
export class ComponentProvider {

    @Autowired('gridOptions')
    private gridOptions: GridOptions;

    @Autowired('context')
    private context: Context;

    private agGridDefaults :{[key:string]:AgGridProvidedComponentDef};
    private jsComponents :{[key:string]:AgGridRegisteredComponentInput<any>} = {};
    private frameworkComponents :{[key:string]:{new(): any}} = {};

    @PostConstruct
    public postConstruct (){
        this.agGridDefaults = {
            //THE FOLLOWING COMPONENTS HAVE NO DEFAULTS, THEY NEED TO BE SPECIFIED AS AN SPECIFIC FLAVOUR
            //THERE ARE NO DEFAULTS THAT FIT ALL PURPOSES
            //THEY ARE ADDED HERE TO AVOID THE NOT FOUND WARNING.
            filterComponent:{
                defaultImpl: null,
                overridable: false
            },
            customFloatingFilterComponent:{
                defaultImpl: null,
                overridable: false
            },

            //date
            dateComponent: {
                defaultImpl: DefaultDateComponent,
                overridable: true
            },

            //header
            headerComponent: {
                defaultImpl: HeaderComp,
                overridable: true
            },
            headerGroupComponent: {
                defaultImpl: HeaderGroupComp,
                overridable: true
            },

            //floating filters
            setFloatingFilterComponent: {
                defaultImpl: SetFloatingFilterComp,
                overridable: true
            },
            textFloatingFilterComponent: {
                defaultImpl: TextFloatingFilterComp,
                overridable: true
            },
            numberFloatingFilterComponent:{
                defaultImpl: NumberFloatingFilterComp,
                overridable: true
            },
            dateFloatingFilterComponent: {
                defaultImpl: DateFloatingFilterComp,
                overridable: true
            },
            readModelAsStringFloatingFilterComponent: {
                defaultImpl: ReadModelAsStringFloatingFilterComp,
                overridable: false
            },
            floatingFilterWrapperComponent: {
                defaultImpl: FloatingFilterWrapperComp,
                overridable: false
            },
            emptyFloatingFilterWrapperComponent: {
                defaultImpl: EmptyFloatingFilterWrapperComp,
                overridable: false
            },

            // renderers
            cellRenderer: {
                defaultImpl: null,
                overridable: true
            },
            fullWidthCellRenderer: {
                defaultImpl: null,
                overridable: true
            },
            innerRenderer: {
                defaultImpl: null,
                overridable: true
            },
            groupRowInnerRenderer: {
                defaultImpl: null,
                overridable: true
            },
            animateShowChange: {
                defaultImpl: AnimateShowChangeCellRenderer,
                overridable: true
            },
            animateSlide: {
                defaultImpl: AnimateSlideCellRenderer,
                overridable: true
            },
            group: {
                defaultImpl: GroupCellRenderer,
                overridable: true
            },
            groupRowRenderer: {
                defaultImpl: GroupCellRenderer,
                overridable: true
            },
            loadingCellRenderer: {
                defaultImpl: LoadingCellRenderer,
                overridable: true
            },
            overlayWrapperComponent: {
                defaultImpl: OverlayWrapperComponent,
                overridable: false
            },
            loadingOverlayComponent: {
                defaultImpl: LoadingOverlayComponent,
                overridable: true
            },
            noRowsOverlayComponent: {
                defaultImpl: NoRowsOverlayComponent,
                overridable: true
            },
            pinnedRowCellRenderer: {
                defaultImpl: null,
                overridable: true
            },

            //editors
            cellEditor: {
                defaultImpl: TextCellEditor,
                overridable: false
            },
            textCellEditor: {
                defaultImpl: TextCellEditor,
                overridable: false
            },
            text: {
                defaultImpl: TextCellEditor,
                overridable: false
            },
            selectCellEditor: {
                defaultImpl: SelectCellEditor,
                overridable: false
            },
            select: {
                defaultImpl: SelectCellEditor,
                overridable: false
            },
            popupTextCellEditor: {
                defaultImpl: PopupTextCellEditor,
                overridable: false
            },
            popupText: {
                defaultImpl: PopupTextCellEditor,
                overridable: false
            },
            popupSelectCellEditor: {
                defaultImpl: PopupSelectCellEditor,
                overridable: false
            },
            popupSelect: {
                defaultImpl: PopupSelectCellEditor,
                overridable: false
            },
            largeTextCellEditor: {
                defaultImpl: LargeTextCellEditor,
                overridable: false
            },
            largeText: {
                defaultImpl: LargeTextCellEditor,
                overridable: false
            },

            //filter
            textColumnFilter: {
                defaultImpl: TextFilter,
                overridable: false
            },
            numberColumnFilter: {
                defaultImpl: NumberFilter,
                overridable: false
            },
            dateColumnFilter: {
                defaultImpl: DateFilter,
                overridable: false
            }
        }
    }

    @PostConstruct
    private init():void{
        let componentProvider: ComponentProvider = this.context.getBean('componentProvider');
        if (this.gridOptions.components != null) {
            Object.keys(this.gridOptions.components).forEach(it=>{
                componentProvider.registerComponent(it, this.gridOptions.components[it]);
            });
        }
        if (this.gridOptions.frameworkComponents != null) {
            Object.keys(this.gridOptions.frameworkComponents).forEach(it=>{
                componentProvider.registerFwComponent(it, this.gridOptions.frameworkComponents[it]);
            });
        }
    }

    public registerComponent<A extends IComponent<any>> (name:string, component:AgGridRegisteredComponentInput<A>){
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
    public registerFwComponent<A extends IComponent<any> & B, B> (name:string, component:{new(): IComponent<B>}){
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
    public retrieve <A extends IComponent<any> & B, B> (name:string): RegisteredComponent<A, B>{
        if (this.frameworkComponents[name]){
            return this.assertCanBeOverride(name,{
                type: ComponentType.FRAMEWORK,
                component: <{new(): B}>this.frameworkComponents[name],
                source: RegisteredComponentSource.REGISTERED
            })
        }
        if (this.jsComponents[name]){
            return this.assertCanBeOverride(name,{
                type: ComponentType.AG_GRID,
                component: <{new(): A}>this.jsComponents[name],
                source: RegisteredComponentSource.REGISTERED
            })
        }
        if (this.agGridDefaults[name]){
            return this.agGridDefaults[name].defaultImpl ?
                {
                    type: ComponentType.AG_GRID,
                    component: <{new(): A}>this.agGridDefaults[name].defaultImpl,
                    source: RegisteredComponentSource.DEFAULT
                }:
                null
        }

        if (Object.keys(this.agGridDefaults).indexOf(name) < 0){
            console.warn(`ag-grid: Looking for component [${name}] but it wasn't found.`);
        }
        return null;
    }

    private assertCanBeOverride <A extends IComponent<any> & B, B>(name: string, toAssert:RegisteredComponent<A, B>): RegisteredComponent<A, B>{
        let overridable : boolean = this.agGridDefaults[name] ? this.agGridDefaults[name].overridable : true;
        if (!overridable){
            throw Error (`ag-grid: You are trying to register a component which is not overridable and which name it is used internally in ag-grid: [${name}]. Please change the name of the component`)
        }

        return toAssert;
    }
}