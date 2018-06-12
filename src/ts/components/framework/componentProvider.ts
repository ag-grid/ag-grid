import {TextCellEditor} from "../../rendering/cellEditors/textCellEditor";

import {Autowired, Bean, PostConstruct} from "../../context/context";
import {IComponent} from "../../interfaces/iComponent";
import {DateFilter, DefaultDateComponent} from "../../filter/dateFilter";
import {HeaderComp} from "../../headerRendering/header/headerComp";
import {HeaderGroupComp} from "../../headerRendering/headerGroup/headerGroupComp";
import {
    DateFloatingFilterComp,
    NumberFloatingFilterComp,
    SetFloatingFilterComp,
    TextFloatingFilterComp
} from "../../filter/floatingFilter";
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
    type: ComponentType,
    source: RegisteredComponentSource
}

export type RegisteredComponentInput<A extends IComponent<any> & B, B> =
    AgGridRegisteredComponentInput<A>
    | { new(): B };
export type AgGridRegisteredComponentInput<A extends IComponent<any>> = AgGridComponentFunctionInput | { new(): A }
export type AgGridComponentFunctionInput = (params: any) => string | HTMLElement ;


export interface DeprecatedComponentName {
    propertyHolder: string,
    newComponentName: string
}

@Bean('componentProvider')
export class ComponentProvider {

    @Autowired('gridOptions')
    private gridOptions: GridOptions;

    private agGridDefaults: { [key: string]: AgGridRegisteredComponentInput<any> } = {
        //date
        agDateInput: DefaultDateComponent,

        //header
        agColumnHeader: HeaderComp,
        agColumnGroupHeader: HeaderGroupComp,

        //floating filters
        agSetColumnFloatingFilter: SetFloatingFilterComp,
        agTextColumnFloatingFilter: TextFloatingFilterComp,
        agNumberColumnFloatingFilter: NumberFloatingFilterComp,
        agDateColumnFloatingFilter: DateFloatingFilterComp,

        // renderers
        agAnimateShowChangeCellRenderer: AnimateShowChangeCellRenderer,
        agAnimateSlideCellRenderer: AnimateSlideCellRenderer,
        agGroupCellRenderer: GroupCellRenderer,
        agGroupRowRenderer: GroupCellRenderer,
        agLoadingCellRenderer: LoadingCellRenderer,

        //editors
        agCellEditor: TextCellEditor,
        agTextCellEditor: TextCellEditor,
        agSelectCellEditor: SelectCellEditor,
        agPopupTextCellEditor: PopupTextCellEditor,
        agPopupSelectCellEditor: PopupSelectCellEditor,
        agLargeTextCellEditor: LargeTextCellEditor,

        //filter
        agTextColumnFilter: TextFilter,
        agNumberColumnFilter: NumberFilter,
        agDateColumnFilter: DateFilter,

        //overlays
        agLoadingOverlay: LoadingOverlayComponent,
        agNoRowsOverlay: NoRowsOverlayComponent
    };

    private agDeprecatedNames: { [key: string]: DeprecatedComponentName } = {
        set: {
            newComponentName: 'agSetColumnFilter',
            propertyHolder: 'filter'
        },
        text: {
            newComponentName: 'agTextColumnFilter',
            propertyHolder: 'filter'
        },
        number: {
            newComponentName: 'agNumberColumnFilter',
            propertyHolder: 'filter'
        },
        date: {
            newComponentName: 'agDateColumnFilter',
            propertyHolder: 'filter'
        },


        group: {
            newComponentName: 'agGroupCellRenderer',
            propertyHolder: 'cellRenderer'
        },
        animateShowChange: {
            newComponentName: 'agAnimateShowChangeCellRenderer',
            propertyHolder: 'cellRenderer'
        },
        animateSlide: {
            newComponentName: 'agAnimateSlideCellRenderer',
            propertyHolder: 'cellRenderer'
        },

        select: {
            newComponentName: 'agSelectCellEditor',
            propertyHolder: 'cellEditor'
        },
        largeText: {
            newComponentName: 'agLargeTextCellEditor',
            propertyHolder: 'cellEditor'
        },
        popupSelect: {
            newComponentName: 'agPopupSelectCellEditor',
            propertyHolder: 'cellEditor'
        },
        popupText: {
            newComponentName: 'agPopupTextCellEditor',
            propertyHolder: 'cellEditor'
        },
        richSelect: {
            newComponentName: 'agRichSelectCellEditor',
            propertyHolder: 'cellEditor'
        },

        headerComponent: {
            newComponentName: 'agColumnHeader',
            propertyHolder: 'headerComponent'
        }

    };
    private jsComponents: { [key: string]: AgGridRegisteredComponentInput<any> } = {};
    private frameworkComponents: { [key: string]: { new(): any } } = {};

    @PostConstruct
    private init(): void {
        if (this.gridOptions.components != null) {
            Object.keys(this.gridOptions.components).forEach(it => {
                this.registerComponent(it, this.gridOptions.components[it]);
            });
        }
        if (this.gridOptions.frameworkComponents != null) {
            Object.keys(this.gridOptions.frameworkComponents).forEach(it => {
                this.registerFwComponent(it, this.gridOptions.frameworkComponents[it]);
            });
        }
    }

    public registerDefaultComponent<A extends IComponent<any>>(rawName: string, component: AgGridRegisteredComponentInput<A>, overridable: boolean = true) {
        let name: string = this.translateIfDeprecated(rawName);
        if (this.agGridDefaults[name]) {
            console.error(`Trying to overwrite a default component. You should call registerComponent`);
            return;
        }

        this.agGridDefaults[name] = component;
    }

    public registerComponent<A extends IComponent<any>>(rawName: string, component: AgGridRegisteredComponentInput<A>) {
        let name: string = this.translateIfDeprecated(rawName);
        if (this.frameworkComponents[name]) {
            console.error(`Trying to register a component that you have already registered for frameworks: ${name}`);
            return;
        }

        this.jsComponents[name] = component;
    }

    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    public registerFwComponent<A extends IComponent<any> & B, B>(rawName: string, component: { new(): IComponent<B> }) {
        let name: string = this.translateIfDeprecated(rawName);
        if (this.jsComponents[name]) {
            console.error(`Trying to register a component that you have already registered for plain javascript: ${name}`);
            return;
        }

        this.frameworkComponents[name] = component;
    }


    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    public retrieve<A extends IComponent<any> & B, B>(rawName: string): RegisteredComponent<A, B> {
        let name: string = this.translateIfDeprecated(rawName);
        if (this.frameworkComponents[name]) {
            return {
                type: ComponentType.FRAMEWORK,
                component: <{ new(): B }>this.frameworkComponents[name],
                source: RegisteredComponentSource.REGISTERED
            };
        }
        if (this.jsComponents[name]) {
            return {
                type: ComponentType.AG_GRID,
                component: <{ new(): A }>this.jsComponents[name],
                source: RegisteredComponentSource.REGISTERED
            };
        }
        if (this.agGridDefaults[name]) {
            return this.agGridDefaults[name] ?
                {
                    type: ComponentType.AG_GRID,
                    component: <{ new(): A }>this.agGridDefaults[name],
                    source: RegisteredComponentSource.DEFAULT
                } :
                null
        }

        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn(`ag-grid: Looking for component [${name}] but it wasn't found.`);
        }
        return null;
    }

    private translateIfDeprecated(raw: string): string {
        let deprecatedInfo: DeprecatedComponentName = this.agDeprecatedNames[raw];
        if (deprecatedInfo != null) {
            _.doOnce(() => {
                console.warn(`ag-grid. Since v15.0 component names have been renamed to be namespaced. You should rename ${deprecatedInfo.propertyHolder}:${raw} to ${deprecatedInfo.propertyHolder}:${deprecatedInfo.newComponentName}`);
            }, 'DEPREACTE_COMPONENT_' + raw);
            return deprecatedInfo.newComponentName;
        }
        return raw;
    }
}