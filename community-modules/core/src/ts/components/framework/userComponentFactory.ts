import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, Optional } from "../../context/context";
import { CellEditorSelectorFunc, CellEditorSelectorResult, CellRendererSelectorFunc, ColDef, ColGroupDef } from "../../entities/colDef";
import { GridOptions } from "../../entities/gridOptions";
import { ToolPanelDef } from "../../interfaces/iSideBar";
import { IFloatingFilterParams } from "../../filter/floating/floatingFilter";
import { IHeaderParams } from "../../headerRendering/cells/column/headerComp";
import { IHeaderGroupParams } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { IFilterDef, IFilterParams } from "../../interfaces/iFilter";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { SetFilterParams } from "../../interfaces/iSetFilter";
import { IStatusPanelParams, StatusPanelDef } from "../../interfaces/iStatusPanel";
import { IToolPanelParams } from "../../interfaces/iToolPanel";
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRendererCtrl";
import { ICellRendererParams, ISetFilterCellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { IDateParams } from "../../rendering/dateComponent";
import { ILoadingOverlayParams } from "../../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayParams } from "../../rendering/overlays/noRowsOverlayComponent";
import { ITooltipParams } from "../../rendering/tooltipComponent";
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
    LoadingOverlayComponent,
    NoRowsOverlayComponent,
    StatusPanelComponent,
    ToolPanelComponent,
    TooltipComponent
} from "./componentTypes";
import { FrameworkComponentWrapper } from "./frameworkComponentWrapper";
import { UserComponentRegistry } from "./userComponentRegistry";
import { FloatingFilterMapper } from '../../filter/floating/floatingFilterMapper';
import { ModuleNames } from '../../modules/moduleNames';
import { ModuleRegistry } from '../../modules/moduleRegistry';
import { doOnce } from "../../utils/function";
import { AgGridCommon, WithoutGridCommon } from "../../interfaces/iCommon";

export type DefinitionObject =
    GridOptions
    | ColDef
    | ColGroupDef
    | IFilterDef
    | SetFilterParams
    | IRichCellEditorParams
    | ToolPanelDef
    | StatusPanelDef;

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
    @Optional('frameworkComponentWrapper') private readonly frameworkComponentWrapper: FrameworkComponentWrapper;

    public getHeaderCompDetails(colDef: ColDef, params: WithoutGridCommon<IHeaderParams>): UserCompDetails | undefined {
        return this.getCompDetails(colDef, HeaderComponent, 'agColumnHeader', params);
    }

    public getHeaderGroupCompDetails(params: WithoutGridCommon<IHeaderGroupParams>): UserCompDetails | undefined {
        const colGroupDef = params.columnGroup.getColGroupDef()!;
        return this.getCompDetails(colGroupDef, HeaderGroupComponent, 'agColumnGroupHeader', params);
    }

    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    public getFullWidthCellRendererDetails(params: WithoutGridCommon<ICellRendererParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidth, null, params, true)!;
    }

    public getFullWidthLoadingCellRendererDetails(params: WithoutGridCommon<ICellRendererParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidthLoading, 'agLoadingCellRenderer', params, true)!;
    }

    public getFullWidthGroupCellRendererDetails(params: WithoutGridCommon<ICellRendererParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidthGroup, 'agGroupRowRenderer', params, true)!;
    }

    public getFullWidthDetailCellRendererDetails(params: WithoutGridCommon<ICellRendererParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidthDetail, 'agDetailCellRenderer', params, true)!;
    }

    // CELL RENDERER
    public getInnerRendererDetails(def: GroupCellRendererParams, params: WithoutGridCommon<ICellRendererParams>): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getFullWidthGroupRowInnerCellRenderer(def: any, params: WithoutGridCommon<ICellRendererParams>): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getCellRendererDetails(def: ColDef | IRichCellEditorParams, params: WithoutGridCommon<ICellRendererParams>): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
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

    public getTooltipCompDetails(params: WithoutGridCommon<ITooltipParams>): UserCompDetails {
        return this.getCompDetails(params.colDef!, TooltipComponent, 'agTooltipComponent', params, true)!;
    }

    public getSetFilterCellRendererDetails<TData, V>(def: SetFilterParams<TData, V>, params: WithoutGridCommon<ISetFilterCellRendererParams>): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    }

    public getFloatingFilterCompDetails(def: IFilterDef, params: WithoutGridCommon<IFloatingFilterParams<any>>, defaultFloatingFilter: string | null): UserCompDetails | undefined {
        return this.getCompDetails(def, FloatingFilterComponent, defaultFloatingFilter, params);
    }

    public getToolPanelCompDetails(toolPanelDef: ToolPanelDef, params: WithoutGridCommon<IToolPanelParams>): UserCompDetails {
        return this.getCompDetails(toolPanelDef, ToolPanelComponent, null, params, true)!;
    }

    public getStatusPanelCompDetails(def: StatusPanelDef, params: WithoutGridCommon<IStatusPanelParams>): UserCompDetails {
        return this.getCompDetails(def, StatusPanelComponent, null, params, true)!;
    }

    private getCompDetails(defObject: DefinitionObject, type: ComponentType, defaultName: string | null | undefined, params: any, mandatory = false): UserCompDetails | undefined {

        const { propertyName, cellRenderer } = type;

        let { compName, jsComp, fwComp, paramsFromSelector, popupFromSelector, popupPositionFromSelector } = this.getCompKeys(defObject, type, params);

        const lookupFromRegistry = (key: string) => {
            const item = this.userComponentRegistry.retrieve(key);
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

            const assignComp = (providedJsComp: any, providedFwComp: any) => {

                const xxxFrameworkDeprecatedWarn = () => {
                    const warningMessage = `AG Grid: As of v27, the property ${propertyName}Framework is deprecated. The property ${propertyName} can now be used for JavaScript AND Framework Components.`;
                    doOnce(() => console.warn(warningMessage), `UserComponentFactory.${propertyName}FrameworkDeprecated`);
                };

                if (typeof providedJsComp === 'string') {
                    compName = providedJsComp as string;
                } else if (typeof providedFwComp === 'string') {
                    xxxFrameworkDeprecatedWarn();
                    compName = providedFwComp as string;
                    // comp===true for filters, which means use the default comp
                } else if (providedJsComp != null && providedJsComp !== true) {
                    const isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(providedJsComp);
                    if (isFwkComp) {
                        fwComp = providedJsComp;
                    } else {
                        jsComp = providedJsComp;
                    }
                } else if (providedFwComp != null) {
                    xxxFrameworkDeprecatedWarn();
                    fwComp = providedFwComp;
                }
            };

            if (selectorRes) {
                if (selectorRes.frameworkComponent != null) {
                    const warningMessage = `AG Grid: As of v27, the return for ${propertyName}Selector has attributes [component, params] only. The attribute frameworkComponent is deprecated. You should now return back Framework Components using the 'component' attribute and the grid works out if it's a framework component or not.`;
                    doOnce(() => console.warn(warningMessage), `UserComponentFactory.${propertyName}FrameworkSelectorDeprecated`);
                    assignComp(selectorRes.frameworkComponent, undefined);
                } else {
                    assignComp(selectorRes.component, undefined);
                }
                paramsFromSelector = selectorRes.params;
                popupFromSelector = (selectorRes as CellEditorSelectorResult).popup;
                popupPositionFromSelector = (selectorRes as CellEditorSelectorResult).popupPosition;
            } else {
                // if no selector, or result of selector is empty, take from defObject
                assignComp(defObjectAny[propertyName], defObjectAny[propertyName + 'Framework']);
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
            instance = this.frameworkComponentWrapper.wrap(
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
        return (deferredInit as AgPromise<void>).then(() => instance);
    }

    // used by Floating Filter
    public mergeParamsWithApplicationProvidedParams(
        defObject: DefinitionObject,
        type: ComponentType,
        paramsFromGrid: any,
        paramsFromSelector: any = null
    ): any {
        const params: AgGridCommon<any, any> = {
            context: this.gridOptionsService.context,
            columnApi: this.gridOptionsService.columnApi,
            api: this.gridOptionsService.api
        };

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

    public getDefaultFloatingFilterType(def: IFilterDef): string | null {
        if (def == null) { return null; }

        let defaultFloatingFilterType: string | null = null;

        let { compName, jsComp, fwComp }
            = this.getCompKeys(def, FilterComponent);

        if (compName) {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterMapper.getFloatingFilterType(compName);
        } else {
            const usingDefaultFilter = (jsComp == null && fwComp == null) && (def.filter === true);
            if (usingDefaultFilter) {
                const setFilterModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
                defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
            }
        }

        return defaultFloatingFilterType;
    }
}
