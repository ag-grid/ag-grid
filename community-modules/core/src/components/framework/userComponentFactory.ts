import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, Optional } from "../../context/context";
import { CellEditorSelectorFunc, CellEditorSelectorResult, CellRendererSelectorFunc, ColDef, ColGroupDef } from "../../entities/colDef";
import { GridOptions } from "../../entities/gridOptions";
import { ToolPanelDef } from "../../interfaces/iSideBar";
import { IHeaderParams } from "../../headerRendering/cells/column/headerComp";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { IFilterDef, IFilterParams } from "../../interfaces/iFilter";
import { IStatusPanelParams, StatusPanelDef } from "../../interfaces/iStatusPanel";
import { IToolPanelParams } from "../../interfaces/iToolPanel";
import { ICellRendererParams, ISetFilterCellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { IDateParams } from "../../interfaces/dateComponent";
import { ILoadingOverlayParams } from "../../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayParams } from "../../rendering/overlays/noRowsOverlayComponent";
import { AgPromise } from "../../utils";
import { mergeDeep } from '../../utils/object';
import { AgComponentUtils } from "./agComponentUtils";
import { ComponentMetadata, ComponentMetadataProvider } from "./componentMetadataProvider";
import {
    CellEditorComponent,
    CellRendererComponent,
    ComponentType,
    DateComponent,
    FilterComponent,
    FloatingFilterComponent,
    FullWidth,
    FullWidthDetail,
    FullWidthGroup,
    FullWidthLoading,
    HeaderComponent,
    HeaderGroupComponent,
    InnerRendererComponent,
    LoadingCellRendererComponent,
    LoadingOverlayComponent,
    MenuItemComponent,
    NoRowsOverlayComponent,
    StatusPanelComponent,
    ToolPanelComponent,
    TooltipComponent
} from "./componentTypes";
import { FrameworkComponentWrapper } from "./frameworkComponentWrapper";
import { UserComponentRegistry } from "./userComponentRegistry";
import { AgGridCommon, WithoutGridCommon } from "../../interfaces/iCommon";
import { IMenuItemParams, MenuItemDef } from "../../interfaces/menuItem";

export type DefinitionObject =
    any;

export interface UserCompDetails {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
    type: ComponentType;
    popupFromSelector?: boolean,
    popupPositionFromSelector?: 'over' | 'under',
    newAgStackInstance: () => AgPromise<any>;
}

@Bean('userComponentFactory')
export class UserComponentFactory extends BeanStub {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('agComponentUtils') private readonly agComponentUtils: AgComponentUtils;
    @Autowired('componentMetadataProvider') private readonly componentMetadataProvider: ComponentMetadataProvider;
    @Autowired('userComponentRegistry') private readonly userComponentRegistry: UserComponentRegistry;
    @Optional('frameworkComponentWrapper') private readonly frameworkComponentWrapper?: FrameworkComponentWrapper;

    public getHeaderCompDetails(colDef: ColDef, params: WithoutGridCommon<IHeaderParams>): UserCompDetails | undefined {
        return this.getCompDetails(colDef, HeaderComponent, 'agColumnHeader', params);
    }

    // CELL EDITOR
    public getCellEditorDetails(def: ColDef, params: WithoutGridCommon<ICellEditorParams>): UserCompDetails | undefined {
        return this.getCompDetails(def, CellEditorComponent, 'agCellEditor', params, true);
    }

    // FILTER
    public getFilterDetails(def: IFilterDef, params: WithoutGridCommon<IFilterParams>, defaultFilter: string): UserCompDetails | undefined {
        return this.getCompDetails(def, FilterComponent, defaultFilter, params, true);
    }

    public getDateCompDetails(params: WithoutGridCommon<IDateParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, DateComponent, 'agDateInput', params, true)!;
    }

    public getLoadingOverlayCompDetails(params: WithoutGridCommon<ILoadingOverlayParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, LoadingOverlayComponent, 'agLoadingOverlay', params, true)!;
    }

    public getNoRowsOverlayCompDetails(params: WithoutGridCommon<INoRowsOverlayParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, NoRowsOverlayComponent, 'agNoRowsOverlay', params, true)!;
    }

    public getToolPanelCompDetails(toolPanelDef: ToolPanelDef, params: WithoutGridCommon<IToolPanelParams>): UserCompDetails {
        return this.getCompDetails(toolPanelDef, ToolPanelComponent, null, params, true)!;
    }

    public getStatusPanelCompDetails(def: StatusPanelDef, params: WithoutGridCommon<IStatusPanelParams>): UserCompDetails {
        return this.getCompDetails(def, StatusPanelComponent, null, params, true)!;
    }

    public getMenuItemCompDetails(def: MenuItemDef, params: WithoutGridCommon<IMenuItemParams>): UserCompDetails {
        return this.getCompDetails(def, MenuItemComponent, 'agMenuItem', params, true)!;
    }

    private getCompDetails(defObject: DefinitionObject, type: ComponentType, defaultName: string | null | undefined, params: any, mandatory = false): UserCompDetails | undefined {

        const { propertyName, cellRenderer } = type;

        let { compName, jsComp, fwComp, paramsFromSelector, popupFromSelector, popupPositionFromSelector } = this.getCompKeys(defObject, type, params);

        const lookupFromRegistry = (key: string) => {
            const item = this.userComponentRegistry.retrieve(propertyName, key);
            if (item) {
                jsComp = !item.componentFromFramework ? item.component : undefined;
                fwComp = item.componentFromFramework ? item.component : undefined;
            }
        };

        // if compOption is a string, means we need to look the item up
        if (compName != null) {
            lookupFromRegistry(compName);
        }

        // if lookup brought nothing back, and we have a default, lookup the default
        if (jsComp == null && fwComp == null && defaultName != null) {
            lookupFromRegistry(defaultName);
        }

        // if we have a comp option, and it's a function, replace it with an object equivalent adaptor
        if (jsComp && cellRenderer && !this.agComponentUtils.doesImplementIComponent(jsComp)) {
            jsComp = this.agComponentUtils.adaptFunction(propertyName, jsComp);
        }

        if (!jsComp && !fwComp) {
            if (mandatory) {
                console.error(`AG Grid: Could not find component ${compName}, did you forget to configure this component?`);
            }
            return;
        }

        const paramsMerged = this.mergeParamsWithApplicationProvidedParams(defObject, type, params, paramsFromSelector);

        const componentFromFramework = jsComp == null;
        const componentClass = jsComp ? jsComp : fwComp;

        return {
            componentFromFramework,
            componentClass,
            params: paramsMerged,
            type: type,
            popupFromSelector,
            popupPositionFromSelector,
            newAgStackInstance: () => this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type)
        };
    }

    private getCompKeys(defObject: DefinitionObject, type: ComponentType, params?: any): {
        compName?: string,
        jsComp: any,
        fwComp: any,
        paramsFromSelector: any,
        popupFromSelector?: boolean,
        popupPositionFromSelector?: 'over' | 'under'
    } {

        const { propertyName } = type;

        let compName: string | undefined;
        let jsComp: any;
        let fwComp: any;

        let paramsFromSelector: any;
        let popupFromSelector: boolean | undefined;
        let popupPositionFromSelector: 'over' | 'under' | undefined;

        // there are two types of js comps, class based and func based. we can only check for
        // class based, by checking if getGui() exists. no way to differentiate js func based vs eg react func based
        // const isJsClassComp = (comp: any) => this.agComponentUtils.doesImplementIComponent(comp);
        // const fwActive = this.frameworkComponentWrapper != null;

        // pull from defObject if available
        if (defObject) {
            const defObjectAny = defObject as any;

            // if selector, use this
            const selectorFunc: CellEditorSelectorFunc | CellRendererSelectorFunc = defObjectAny[propertyName + 'Selector'];
            const selectorRes = selectorFunc ? selectorFunc(params) : null;

            const assignComp = (providedJsComp: any) => {
                if (typeof providedJsComp === 'string') {
                    compName = providedJsComp as string;
                } else if (providedJsComp != null && providedJsComp !== true) {
                    const isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(providedJsComp);
                    if (isFwkComp) {
                        fwComp = providedJsComp;
                    } else {
                        jsComp = providedJsComp;
                    }
                }
            };

            if (selectorRes) {
                assignComp(selectorRes.component);
                paramsFromSelector = selectorRes.params;
                popupFromSelector = (selectorRes as CellEditorSelectorResult).popup;
                popupPositionFromSelector = (selectorRes as CellEditorSelectorResult).popupPosition;
            } else {
                // if no selector, or result of selector is empty, take from defObject
                assignComp(defObjectAny[propertyName]);
            }
        }

        return { compName, jsComp, fwComp, paramsFromSelector, popupFromSelector, popupPositionFromSelector };
    }

    private newAgStackInstance(
        ComponentClass: any,
        componentFromFramework: boolean,
        params: any,
        type: ComponentType
    ): AgPromise<any> {
        const propertyName = type.propertyName;
        const jsComponent = !componentFromFramework;
        // using javascript component
        let instance: any;

        if (jsComponent) {
            instance = new ComponentClass();
        } else {
            // Using framework component
            const thisComponentConfig: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
            instance = this.frameworkComponentWrapper!.wrap(
                ComponentClass,
                thisComponentConfig.mandatoryMethodList,
                thisComponentConfig.optionalMethodList,
                type
            );
        }

        const deferredInit = this.initComponent(instance, params);

        if (deferredInit == null) {
            return AgPromise.resolve(instance);
        }
        return deferredInit.then(() => instance);
    }

    // used by Floating Filter
    public mergeParamsWithApplicationProvidedParams(
        defObject: DefinitionObject,
        type: ComponentType,
        paramsFromGrid: any,
        paramsFromSelector: any = null
    ): any {
        const params: AgGridCommon<any, any> = this.gos.getGridCommonParams();

        mergeDeep(params, paramsFromGrid);

        // pull user params from either the old prop name and new prop name
        // eg either cellRendererParams and cellCompParams
        const defObjectAny = defObject as any;
        const userParams = defObjectAny && defObjectAny[type.propertyName + 'Params'];

        if (typeof userParams === 'function') {
            const userParamsFromFunc = userParams(paramsFromGrid);
            mergeDeep(params, userParamsFromFunc);
        } else if (typeof userParams === 'object') {
            mergeDeep(params, userParams);
        }

        mergeDeep(params, paramsFromSelector);

        return params;
    }

    private initComponent(component: any, params: any): AgPromise<void> | void {
        this.context.createBean(component);
        if (component.init == null) { return; }
        return component.init(params);
    }
}
