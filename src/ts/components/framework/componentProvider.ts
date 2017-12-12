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
import {_} from "../../utils";

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


export interface DeprecatedComponentName {
    propertyHolder: string,
    newComponentName: string
}

@Bean('componentProvider')
export class ComponentProvider {

    @Autowired('gridOptions')
    private gridOptions: GridOptions;

    @Autowired('context')
    private context: Context;

    private agGridDefaults :{[key:string]:AgGridProvidedComponentDef};
    private agDeprecatedNames :{[key:string]:DeprecatedComponentName} = {};
    private jsComponents :{[key:string]:AgGridRegisteredComponentInput<any>} = {};
    private frameworkComponents :{[key:string]:{new(): any}} = {};

    @PostConstruct
    public postConstruct (){

        this.agDeprecatedNames = {
            set:{
                newComponentName: 'agSetColumnFilter',
                propertyHolder: 'filter'
            },
            text:{
                newComponentName: 'agTextColumnFilter',
                propertyHolder: 'filter'
            },
            number:{
                newComponentName: 'agNumberColumnFilter',
                propertyHolder: 'filter'
            },
            date:{
                newComponentName: 'agDateColumnFilter',
                propertyHolder: 'filter'
            },


            group:{
                newComponentName: 'agGroupCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            animateShowChange:{
                newComponentName: 'agAnimateShowChangeCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            animateSlide:{
                newComponentName: 'agAnimateSlideCellRenderer',
                propertyHolder: 'cellRenderer'
            },

            select:{
                newComponentName: 'agSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            largeText:{
                newComponentName: 'agLargeTextCellEditor',
                propertyHolder: 'cellEditor'
            },
            popupSelect:{
                newComponentName: 'agPopupSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            popupText:{
                newComponentName: 'agPopupTextCellEditor',
                propertyHolder: 'cellEditor'
            },
            richSelect:{
                newComponentName: 'agRichSelectCellEditor',
                propertyHolder: 'cellEditor'
            },

            headerComponent:{
                newComponentName: 'agColumnHeader',
                propertyHolder: 'headerComponent'
            }

        };

        this.agGridDefaults = {
            //THE FOLLOWING COMPONENTS HAVE NO DEFAULTS, THEY NEED TO BE SPECIFIED AS AN SPECIFIC FLAVOUR
            //THERE ARE NO DEFAULTS THAT FIT ALL PURPOSES
            //THEY ARE ADDED HERE TO AVOID THE NOT FOUND WARNING.
            agColumnFilter:{
                defaultImpl: null,
                overridable: false
            },
            agCustomColumnFloatingFilter:{
                defaultImpl: null,
                overridable: false
            },

            //date
            agDateInput: {
                defaultImpl: DefaultDateComponent,
                overridable: true
            },

            //header
            agColumnHeader: {
                defaultImpl: HeaderComp,
                overridable: true
            },
            agColumnGroupHeader: {
                defaultImpl: HeaderGroupComp,
                overridable: true
            },

            //floating filters
            agSetColumnFloatingFilter: {
                defaultImpl: SetFloatingFilterComp,
                overridable: true
            },
            agTextColumnFloatingFilter: {
                defaultImpl: TextFloatingFilterComp,
                overridable: true
            },
            agNumberColumnFloatingFilter:{
                defaultImpl: NumberFloatingFilterComp,
                overridable: true
            },
            agDateColumnFloatingFilter: {
                defaultImpl: DateFloatingFilterComp,
                overridable: true
            },
            agReadModelAsStringFloatingFilter: {
                defaultImpl: ReadModelAsStringFloatingFilterComp,
                overridable: false
            },
            agFloatingFilterWrapper: {
                defaultImpl: FloatingFilterWrapperComp,
                overridable: false
            },
            agEmptyFloatingFilterWrapper: {
                defaultImpl: EmptyFloatingFilterWrapperComp,
                overridable: false
            },

            // renderers
            agCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agFullWidthCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agInnerCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agGroupRowInnerCellRenderer: {
                defaultImpl: null,
                overridable: false
            },
            agAnimateShowChangeCellRenderer: {
                defaultImpl: AnimateShowChangeCellRenderer,
                overridable: true
            },
            agAnimateSlideCellRenderer: {
                defaultImpl: AnimateSlideCellRenderer,
                overridable: true
            },
            agGroupCellRenderer: {
                defaultImpl: GroupCellRenderer,
                overridable: true
            },
            agGroupRowRenderer: {
                defaultImpl: GroupCellRenderer,
                overridable: false
            },
            agLoadingCellRenderer: {
                defaultImpl: LoadingCellRenderer,
                overridable: true
            },
            agOverlayWrapper: {
                defaultImpl: OverlayWrapperComponent,
                overridable: false
            },
            agLoadingOverlay: {
                defaultImpl: LoadingOverlayComponent,
                overridable: true
            },
            agNoRowsOverlay: {
                defaultImpl: NoRowsOverlayComponent,
                overridable: true
            },
            agPinnedRowCellRenderer: {
                defaultImpl: null,
                overridable: false
            },

            //editors
            agCellEditor: {
                defaultImpl: TextCellEditor,
                overridable: false
            },
            agTextCellEditor: {
                defaultImpl: TextCellEditor,
                overridable: true
            },
            agText: {
                defaultImpl: TextCellEditor,
                overridable: false
            },
            agSelectCellEditor: {
                defaultImpl: SelectCellEditor,
                overridable: true
            },
            agSelect: {
                defaultImpl: SelectCellEditor,
                overridable: false
            },
            agPopupTextCellEditor: {
                defaultImpl: PopupTextCellEditor,
                overridable: true
            },
            agPopupText: {
                defaultImpl: PopupTextCellEditor,
                overridable: false
            },
            agPopupSelectCellEditor: {
                defaultImpl: PopupSelectCellEditor,
                overridable: true
            },
            agPopupSelect: {
                defaultImpl: PopupSelectCellEditor,
                overridable: false
            },
            agLargeTextCellEditor: {
                defaultImpl: LargeTextCellEditor,
                overridable: true
            },
            agLargeText: {
                defaultImpl: LargeTextCellEditor,
                overridable: false
            },

            //filter
            agTextColumnFilter: {
                defaultImpl: TextFilter,
                overridable: false
            },
            agNumberColumnFilter: {
                defaultImpl: NumberFilter,
                overridable: false
            },
            agDateColumnFilter: {
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

    public registerComponent<A extends IComponent<any>> (rawName:string, component:AgGridRegisteredComponentInput<A>){
        let name:string = this.translateIfDeprecated(rawName);
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
    public registerFwComponent<A extends IComponent<any> & B, B> (rawName:string, component:{new(): IComponent<B>}){
        let name:string = this.translateIfDeprecated(rawName);
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
    public retrieve <A extends IComponent<any> & B, B> (rawName:string): RegisteredComponent<A, B>{
        let name:string = this.translateIfDeprecated(rawName);
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

    private translateIfDeprecated (raw:string):string{
        let deprecatedInfo:DeprecatedComponentName= this.agDeprecatedNames[raw];
        if(deprecatedInfo != null){
            _.doOnce(()=>{
                console.warn(`ag-grid. Since v15.0 component names have been renamed to be namespaced. You should rename ${deprecatedInfo.propertyHolder}:${raw} to ${deprecatedInfo.propertyHolder}:${deprecatedInfo.newComponentName}`);
            }, 'DEPREACTE_COMPONENT_' + raw);
            return deprecatedInfo.newComponentName;
        }
        return raw;
    }
}