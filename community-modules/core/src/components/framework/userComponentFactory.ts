import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { IDragAndDropImageParams } from '../../dragAndDrop/dragAndDropImageComponent';
import type {
    CellEditorSelectorFunc,
    CellEditorSelectorResult,
    CellRendererSelectorFunc,
    ColDef,
    ColGroupDef,
} from '../../entities/colDef';
import type { GridOptions } from '../../entities/gridOptions';
import type { IFloatingFilterParams } from '../../filter/floating/floatingFilter';
import type { IHeaderParams } from '../../headerRendering/cells/column/headerComp';
import type { IHeaderGroupParams } from '../../headerRendering/cells/columnGroup/headerGroupComp';
import type { IDateParams } from '../../interfaces/dateComponent';
import type { GroupCellRendererParams } from '../../interfaces/groupCellRenderer';
import type { ICellEditorParams } from '../../interfaces/iCellEditor';
import type { AgGridCommon, WithoutGridCommon } from '../../interfaces/iCommon';
import type { IFilterDef, IFilterParams } from '../../interfaces/iFilter';
import type { IFrameworkOverrides } from '../../interfaces/iFrameworkOverrides';
import type { RichSelectParams } from '../../interfaces/iRichCellEditorParams';
import type { SetFilterParams } from '../../interfaces/iSetFilter';
import type { ToolPanelDef } from '../../interfaces/iSideBar';
import type { IStatusPanelParams, StatusPanelDef } from '../../interfaces/iStatusPanel';
import type { IToolPanelParams } from '../../interfaces/iToolPanel';
import type { IMenuItemParams, MenuItemDef } from '../../interfaces/menuItem';
import type { ICellRendererParams, ISetFilterCellRendererParams } from '../../rendering/cellRenderers/iCellRenderer';
import type { ILoadingOverlayParams } from '../../rendering/overlays/loadingOverlayComponent';
import type { INoRowsOverlayParams } from '../../rendering/overlays/noRowsOverlayComponent';
import type { ITooltipParams } from '../../rendering/tooltipComponent';
import { _errorOnce } from '../../utils/function';
import { _mergeDeep } from '../../utils/object';
import { AgPromise } from '../../utils/promise';
import type { AgComponentUtils } from './agComponentUtils';
import type { ComponentMetadata, ComponentMetadataProvider } from './componentMetadataProvider';
import type { ComponentType } from './componentTypes';
import {
    CellEditorComponent,
    CellRendererComponent,
    DateComponent,
    DragAndDropImageComponent,
    EditorRendererComponent,
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
    TooltipComponent,
} from './componentTypes';
import type { FrameworkComponentWrapper } from './frameworkComponentWrapper';
import type { UserComponentRegistry } from './userComponentRegistry';

export type DefinitionObject =
    | GridOptions
    | ColDef
    | ColGroupDef
    | IFilterDef
    | SetFilterParams
    | RichSelectParams
    | ToolPanelDef
    | StatusPanelDef
    | MenuItemDef;

export interface UserCompDetails {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
    type: ComponentType;
    popupFromSelector?: boolean;
    popupPositionFromSelector?: 'over' | 'under';
    newAgStackInstance: () => AgPromise<any>;
}

export class UserComponentFactory extends BeanStub implements NamedBean {
    beanName = 'userComponentFactory' as const;

    private gridOptions: GridOptions;
    private agComponentUtils: AgComponentUtils;
    private componentMetadataProvider: ComponentMetadataProvider;
    private userComponentRegistry: UserComponentRegistry;
    private frameworkComponentWrapper?: FrameworkComponentWrapper;

    public wireBeans(beans: BeanCollection): void {
        this.agComponentUtils = beans.agComponentUtils;
        this.componentMetadataProvider = beans.componentMetadataProvider;
        this.userComponentRegistry = beans.userComponentRegistry;
        this.frameworkComponentWrapper = beans.frameworkComponentWrapper;
        this.gridOptions = beans.gridOptions;
    }

    public getDragAndDropImageCompDetails(params: WithoutGridCommon<IDragAndDropImageParams>): UserCompDetails {
        return this.getCompDetails(this.gridOptions, DragAndDropImageComponent, 'agDragAndDropImage', params, true)!;
    }

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
    public getInnerRendererDetails(
        def: GroupCellRendererParams,
        params: WithoutGridCommon<ICellRendererParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getFullWidthGroupRowInnerCellRenderer(
        def: any,
        params: WithoutGridCommon<ICellRendererParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }

    public getCellRendererDetails(
        def: ColDef,
        params: WithoutGridCommon<ICellRendererParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    }

    public getEditorRendererDetails<TDefinition, TEditorParams extends AgGridCommon<any, any>>(
        def: TDefinition,
        params: WithoutGridCommon<TEditorParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails<TDefinition>(def, EditorRendererComponent, null, params);
    }

    public getLoadingCellRendererDetails(
        def: ColDef,
        params: WithoutGridCommon<ICellRendererParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, LoadingCellRendererComponent, 'agSkeletonCellRenderer', params, true);
    }

    // CELL EDITOR
    public getCellEditorDetails(
        def: ColDef,
        params: WithoutGridCommon<ICellEditorParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, CellEditorComponent, 'agCellEditor', params, true);
    }

    // FILTER
    public getFilterDetails(
        def: IFilterDef,
        params: WithoutGridCommon<IFilterParams>,
        defaultFilter: string
    ): UserCompDetails | undefined {
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

    public getSetFilterCellRendererDetails<TData, V>(
        def: SetFilterParams<TData, V>,
        params: WithoutGridCommon<ISetFilterCellRendererParams>
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    }

    public getFloatingFilterCompDetails(
        def: IFilterDef,
        params: WithoutGridCommon<IFloatingFilterParams<any>>,
        defaultFloatingFilter: string | null
    ): UserCompDetails | undefined {
        return this.getCompDetails(def, FloatingFilterComponent, defaultFloatingFilter, params);
    }

    public getToolPanelCompDetails(
        toolPanelDef: ToolPanelDef,
        params: WithoutGridCommon<IToolPanelParams>
    ): UserCompDetails {
        return this.getCompDetails(toolPanelDef, ToolPanelComponent, null, params, true)!;
    }

    public getStatusPanelCompDetails(
        def: StatusPanelDef,
        params: WithoutGridCommon<IStatusPanelParams>
    ): UserCompDetails {
        return this.getCompDetails(def, StatusPanelComponent, null, params, true)!;
    }

    public getMenuItemCompDetails(def: MenuItemDef, params: WithoutGridCommon<IMenuItemParams>): UserCompDetails {
        return this.getCompDetails(def, MenuItemComponent, 'agMenuItem', params, true)!;
    }

    private getCompDetails<TDefinition = DefinitionObject>(
        defObject: TDefinition,
        type: ComponentType,
        defaultName: string | null | undefined,
        params: any,
        mandatory = false
    ): UserCompDetails | undefined {
        const { propertyName, cellRenderer } = type;

        // eslint-disable-next-line prefer-const
        let { compName, jsComp, fwComp, paramsFromSelector, popupFromSelector, popupPositionFromSelector } =
            UserComponentFactory.getCompKeys(this.frameworkOverrides, defObject, type, params);

        // for grid-provided comps only
        let defaultCompParams: any;

        const lookupFromRegistry = (key: string) => {
            const item = this.userComponentRegistry.retrieve(propertyName, key);
            if (item) {
                jsComp = !item.componentFromFramework ? item.component : undefined;
                fwComp = item.componentFromFramework ? item.component : undefined;
                defaultCompParams = item.params;
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
                _errorOnce(`Could not find component ${compName}, did you forget to configure this component?`);
            }
            return;
        }

        const paramsMerged = this.mergeParamsWithApplicationProvidedParams(
            defObject,
            type,
            params,
            paramsFromSelector,
            defaultCompParams
        );

        const componentFromFramework = jsComp == null;
        const componentClass = jsComp ? jsComp : fwComp;

        return {
            componentFromFramework,
            componentClass,
            params: paramsMerged,
            type: type,
            popupFromSelector,
            popupPositionFromSelector,
            newAgStackInstance: () =>
                this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type),
        };
    }

    public static getCompKeys<TDefinition = DefinitionObject>(
        frameworkOverrides: IFrameworkOverrides,
        defObject: TDefinition,
        type: ComponentType,
        params?: any
    ): {
        compName?: string;
        jsComp: any;
        fwComp: any;
        paramsFromSelector: any;
        popupFromSelector?: boolean;
        popupPositionFromSelector?: 'over' | 'under';
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
            const selectorFunc: CellEditorSelectorFunc | CellRendererSelectorFunc =
                defObjectAny[propertyName + 'Selector'];
            const selectorRes = selectorFunc ? selectorFunc(params) : null;

            const assignComp = (providedJsComp: any) => {
                if (typeof providedJsComp === 'string') {
                    compName = providedJsComp as string;
                } else if (providedJsComp != null && providedJsComp !== true) {
                    const isFwkComp = frameworkOverrides.isFrameworkComponent(providedJsComp);
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
    public mergeParamsWithApplicationProvidedParams<TDefinition = DefinitionObject>(
        defObject: TDefinition,
        type: ComponentType,
        paramsFromGrid: any,
        paramsFromSelector: any = null,
        defaultCompParams?: any
    ): any {
        const params: AgGridCommon<any, any> = this.gos.getGridCommonParams();

        _mergeDeep(params, paramsFromGrid);

        if (defaultCompParams) {
            _mergeDeep(params, defaultCompParams);
        }

        // pull user params from either the old prop name and new prop name
        // eg either cellRendererParams and cellCompParams
        const defObjectAny = defObject as any;
        const userParams = defObjectAny && defObjectAny[type.propertyName + 'Params'];

        if (typeof userParams === 'function') {
            const userParamsFromFunc = userParams(paramsFromGrid);
            _mergeDeep(params, userParamsFromFunc);
        } else if (typeof userParams === 'object') {
            _mergeDeep(params, userParams);
        }

        _mergeDeep(params, paramsFromSelector);

        return params;
    }

    private initComponent(component: any, params: any): AgPromise<void> | void {
        this.createBean(component);
        if (component.init == null) {
            return;
        }
        return component.init(params);
    }
}
