import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, Optional } from "../../context/context";
import { CellEditorSelectorFunc, CellRendererSelectorFunc, ColDef, ColGroupDef } from "../../entities/colDef";
import { GridOptions } from "../../entities/gridOptions";
import { ToolPanelDef } from "../../entities/sideBar";
import { IFloatingFilterParams } from "../../filter/floating/floatingFilter";
import { IHeaderParams } from "../../headerRendering/cells/column/headerComp";
import { IHeaderGroupParams } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { IFilterDef, IFilterParams } from "../../interfaces/iFilter";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
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

export type DefinitionObject =
    GridOptions
    | ColDef
    | ColGroupDef
    | IFilterDef
    | ISetFilterParams
    | IRichCellEditorParams
    | ToolPanelDef
    | StatusPanelDef;

export interface UserCompDetails {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
    type: ComponentType;
    newAgStackInstance: (defaultComponentName?: string | null)=> AgPromise<any>;
}

@Bean('userComponentFactory')
export class UserComponentFactory extends BeanStub {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('agComponentUtils') private readonly agComponentUtils: AgComponentUtils;
    @Autowired('componentMetadataProvider') private readonly componentMetadataProvider: ComponentMetadataProvider;
    @Autowired('userComponentRegistry') private readonly userComponentRegistry: UserComponentRegistry;
    @Optional('frameworkComponentWrapper') private readonly frameworkComponentWrapper: FrameworkComponentWrapper;

    public getHeaderCompDetails(colDef: ColDef, params: IHeaderParams): UserCompDetails | undefined {
        return this.getCompDetails(colDef, HeaderComponent, 'agColumnHeader', params);
    }

    public getHeaderGroupCompDetails(params: IHeaderGroupParams): UserCompDetails | undefined {
        const colGroupDef = params.columnGroup.getColGroupDef()!;
        return this.getCompDetails(colGroupDef, HeaderGroupComponent, 'agColumnGroupHeader', params);
    }

    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    public getFullWidthCellRendererDetails(params: ICellRendererParams, cellRendererType: string, cellRendererName: string): UserCompDetails | undefined {
        return this.getCompDetails(this.gridOptions, { propertyName: cellRendererType, isCellRenderer: () => true }, cellRendererName, params);
    }

    // CELL RENDERER
    public getInnerRendererDetails(def: GroupCellRendererParams, params: ICellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getFullWidthGroupRowInnerCellRenderer(def: any, params: ICellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getCellRendererDetails(def: ColDef | IRichCellEditorParams, params: ICellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    }

    // CELL EDITOR
    public getCellEditorDetails(def: ColDef, params: ICellEditorParams): UserCompDetails | undefined {
        return this.getCompDetails(def, CellEditorComponent, 'agCellEditor', params, true);
    }

    // FILTER
    public getFilterDetails(def: IFilterDef, params: IFilterParams, defaultFilter: string): UserCompDetails | undefined {
        return this.getCompDetails(def, FilterComponent, defaultFilter, params, true);
    }

    public getDateCompDetails(params: IDateParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, DateComponent, 'agDateInput', params, true)!;
    }

    public getLoadingOverlayCompDetails(params: ILoadingOverlayParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, LoadingOverlayComponent, 'agLoadingOverlay', params, true)!;
    }

    public getNoRowsOverlayCompDetails(params: INoRowsOverlayParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, NoRowsOverlayComponent, 'agNoRowsOverlay', params, true)!;
    }

    public getTooltipCompDetails(params: ITooltipParams): UserCompDetails {
        return this.getCompDetails(params.colDef!, TooltipComponent, 'agTooltipComponent', params, true)!;
    }

    public getSetFilterCellRendererDetails(def: ISetFilterParams, params: ISetFilterCellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    }

    public getFloatingFilterCompDetails(def: IFilterDef, params: IFloatingFilterParams, defaultFloatingFilter: string | null):  UserCompDetails | undefined {
        return this.getCompDetails(def, FloatingFilterComponent, defaultFloatingFilter, params);
    }

    public getToolPanelCompDetails(toolPanelDef: ToolPanelDef, params: IToolPanelParams):  UserCompDetails {
        return this.getCompDetails(toolPanelDef, ToolPanelComponent, null, params, true)!;
    }

    public getStatusPanelCompDetails(def: StatusPanelDef, params: IStatusPanelParams):  UserCompDetails {
        return this.getCompDetails(def, StatusPanelComponent, null, params, true)!;
    }

    private getCompDetails(defObject: DefinitionObject, type: ComponentType, defaultName: string | null | undefined, params: any, mandatory = false): UserCompDetails | undefined {

        const propertyName = type.propertyName;

        let comp: any;
        let frameworkComp: any;
        let paramsFromSelector: any;

        // pull from defObject if available
        if (defObject) {
            let defObjectAny = defObject as any;

            // if selector, use this
            const selectorFunc: CellEditorSelectorFunc | CellRendererSelectorFunc = defObjectAny[propertyName + 'Selector'];
            const selectorRes = selectorFunc ? selectorFunc(params) : null;
            if (selectorRes) {
                comp = selectorRes.component;
                frameworkComp = selectorRes.frameworkComponent;
                paramsFromSelector = selectorRes.params;
            } else {
                // if no selector, or result of selector is empty, take from defObject
                comp = defObjectAny[propertyName];
                frameworkComp = defObjectAny[propertyName + 'Framework'];
            }

            // for filters only, we allow 'true' for the component, which means default filter to be used
            if (comp === true) {
                comp = undefined;
            }
        }

        const lookupFromRegistry = (key: string) => {
            const item = this.userComponentRegistry.retrieve(key);
            if (item) {
                comp = !item.componentFromFramework ? item.component : undefined;
                frameworkComp = item.componentFromFramework ? item.component : undefined;
            } else {
                comp = undefined;
                frameworkComp = undefined;
            }
        };

        // if compOption is a string, means we need to look the item up
        if (typeof comp === 'string') {
            lookupFromRegistry(comp);
        }

        // if lookup brought nothing back, and we have a default, lookup the default
        if (comp == null && frameworkComp == null && defaultName != null) {
            lookupFromRegistry(defaultName);
        }

        // if we have a comp option, and it's a function, replace it with an object equivalent adaptor
        if (comp && !this.agComponentUtils.doesImplementIComponent(comp)) {
            comp = this.agComponentUtils.adaptFunction(propertyName, comp);
        }

        if (!comp && !frameworkComp) {
            if (mandatory) {
                const overrideName = defObject ? (defObject as any)[propertyName] : defaultName;
                const nameToReport = overrideName ? overrideName : defaultName;
                console.error(`Could not find component ${nameToReport}, did you forget to configure this component?`);
            }
            return;
        }

        const paramsMerged = this.mergeParamsWithApplicationProvidedParams(defObject, propertyName, params, paramsFromSelector);

        const componentFromFramework = comp == null;
        const componentClass = comp ? comp : frameworkComp;

        return {
            componentFromFramework,
            componentClass,
            params: paramsMerged,
            type: type,
            newAgStackInstance: (defaultCompName?: string) => this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type, defaultCompName)
        };
    }

    private newAgStackInstance(ComponentClass: any, componentFromFramework: boolean, params: any, 
        type: ComponentType, defaultComponentName: string | null | undefined): AgPromise<any> {

        const propertyName = type.propertyName;

        // using javascript component
        let instance: any;
        const jsComponent = !componentFromFramework;

        if (jsComponent) {
            instance = new ComponentClass();
        } else {
            // Using framework component
            const thisComponentConfig: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
            instance = this.frameworkComponentWrapper.wrap(
                ComponentClass,
                thisComponentConfig.mandatoryMethodList,
                thisComponentConfig.optionalMethodList,
                type,
                defaultComponentName
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
        propertyName: string,
        paramsFromGrid: any,
        paramsFromSelector: any = null): any {
            
        const params = {} as any;

        mergeDeep(params, paramsFromGrid);

        const userParams = defObject ? (defObject as any)[propertyName + "Params"] : null;

        if (userParams != null) {
            if (typeof userParams === 'function') {
                const userParamsFromFunc = userParams(paramsFromGrid);
                mergeDeep(params, userParamsFromFunc);
            } else if (typeof userParams === 'object') {
                mergeDeep(params, userParams);
            }
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
