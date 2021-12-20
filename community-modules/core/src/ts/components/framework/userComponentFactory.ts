import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, Optional } from "../../context/context";
import { CellCompSelectorFunc, EditorCompSelectorFunc, CompSelectorResult, CellEditorSelectorFunc, CellRendererSelectorFunc, ColDef, ColGroupDef } from "../../entities/colDef";
import { GridOptions } from "../../entities/gridOptions";
import { ToolPanelDef } from "../../entities/sideBar";
import { IFloatingFilterParams } from "../../filter/floating/floatingFilter";
import { IHeaderParams } from "../../headerRendering/cells/column/headerComp";
import { IHeaderGroupParams } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { IFilterDef, IFilterParams } from "../../interfaces/iFilter";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { ISetFilterParams } from "../../interfaces/iSetFilter";
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
    newAgStackInstance: () => AgPromise<any>;
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
    public getFullWidthCellRendererDetails(params: ICellRendererParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidth, null, params, true)!;
    }

    public getFullWidthLoadingCellRendererDetails(params: ICellRendererParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidthLoading, 'agLoadingCellRenderer', params, true)!;
    }

    public getFullWidthGroupCellRendererDetails(params: ICellRendererParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidthGroup, 'agGroupRowRenderer', params, true)!;
    }

    public getFullWidthDetailCellRendererDetails(params: ICellRendererParams): UserCompDetails {
        return this.getCompDetails(this.gridOptions, FullWidthDetail, 'agDetailCellRenderer', params, true)!;
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

    public getFloatingFilterCompDetails(def: IFilterDef, params: IFloatingFilterParams<any>, defaultFloatingFilter: string | null):  UserCompDetails | undefined {
        return this.getCompDetails(def, FloatingFilterComponent, defaultFloatingFilter, params);
    }

    public getToolPanelCompDetails(toolPanelDef: ToolPanelDef, params: IToolPanelParams):  UserCompDetails {
        return this.getCompDetails(toolPanelDef, ToolPanelComponent, null, params, true)!;
    }

    public getStatusPanelCompDetails(def: StatusPanelDef, params: IStatusPanelParams):  UserCompDetails {
        return this.getCompDetails(def, StatusPanelComponent, null, params, true)!;
    }

    private getCompDetails(defObject: DefinitionObject, type: ComponentType, defaultName: string | null | undefined, params: any, mandatory = false): UserCompDetails | undefined {

        const {propertyName, newPropName, cellRenderer} = type;

        let compName: string | undefined;
        let jsComp: any;
        let fwComp: any;

        let paramsFromSelector: any;

        // there are two types of js comps, class based and func based. we can only check for
        // class based, by checking if getGui() exists. no way to differentiate js func based vs eg react func based
        const isJsClassComp = (comp: any) => this.agComponentUtils.doesImplementIComponent(comp);
        const fwActive = this.frameworkComponentWrapper != null;

        // pull from defObject if available
        if (defObject) {
            const defObjectAny = defObject as any;

            const pullUsingNewCompAttribute = () => {
                const selectorFunc: CellCompSelectorFunc | EditorCompSelectorFunc = defObjectAny[newPropName + 'Selector'];
                const selectorRes = selectorFunc ? selectorFunc(params) : null;

                const assignComp = (comp: any) => {
                    // comp===true for filters, which means use the default comp
                    if (comp==null || comp===true) { return; }
                    if (typeof comp === 'string') {
                        compName = comp as string;
                    // we allow functional JS comps when FW is not active
                    } else if (fwActive && !isJsClassComp(comp)) {
                        fwComp = comp;
                    } else {
                        jsComp = comp;
                    }
                };

                if (selectorRes) {
                    assignComp(selectorRes.comp);
                    paramsFromSelector = selectorRes.params;
                } else {
                    assignComp(defObjectAny[newPropName]);
                }
            };

            const pullUsingOldCompAttribute = () => {
                // if selector, use this
                const selectorFunc: CellEditorSelectorFunc | CellRendererSelectorFunc = defObjectAny[propertyName + 'Selector'];
                const selectorRes = selectorFunc ? selectorFunc(params) : null;

                const assignComp = (providedJsComp: any, providedFwComp: any) => {
                    // comp===true for filters, which means use the default comp
                    if ( (providedJsComp==null && providedFwComp==null) || providedJsComp===true) { return; }
                    if (typeof providedJsComp === 'string') {
                        compName = providedJsComp as string;
                    } else if (providedJsComp!=null) {
                        jsComp = providedJsComp;
                    } else {
                        fwComp = providedFwComp;
                    }
                };
                
                if (selectorRes) {
                    assignComp(selectorRes.component, selectorRes.frameworkComponent);
                    paramsFromSelector = selectorRes.params;
                } else {
                    // if no selector, or result of selector is empty, take from defObject
                    assignComp(defObjectAny[propertyName], defObjectAny[propertyName + 'Framework']);
                }
            };

            pullUsingNewCompAttribute();
            const compNotAssigned = compName==null && jsComp==null && fwComp==null;
            if (compNotAssigned) {
                pullUsingOldCompAttribute();
            }
        }

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
                console.error(`Could not find component ${compName}, did you forget to configure this component?`);
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
            newAgStackInstance: () => this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type)
        };
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
        const params = {} as any;

        mergeDeep(params, paramsFromGrid);

        // pull user params from either the old prop name or new prop name, whichever present
        // (but not both, providing both doesn't make sense so we ignore the second one)
        // eg either cellRendererParams or cellCompParams
        const defObjectAny = defObject as any;
        let userParams: any;
        const keys = [type.newPropName + 'Params', type.propertyName + 'Params'];
        keys.forEach( key => {
            if (defObject && defObjectAny[key]) {
                userParams = defObjectAny[key];
            }
        });

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
