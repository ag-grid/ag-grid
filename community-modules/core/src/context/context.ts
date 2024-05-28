import type {
    AnimationFrameService,
    BaseBean,
    CellPositionUtils,
    ColumnModel,
    ColumnMoveService,
    ColumnNameService,
    ColumnSizeService,
    CtrlsService,
    DragAndDropService,
    DragService,
    Environment,
    EventService,
    FilterManager,
    FocusService,
    GridOptionsService,
    HeaderNavigationService,
    IFrameworkOverrides,
    IRangeService,
    IRowModel,
    ISelectionHandleFactory,
    ISelectionService,
    LocaleService,
    NavigationService,
    PaginationProxy,
    PopupService,
    RowPositionUtils,
    RowRenderer,
    SortController,
    StylingService,
    UserComponentFactory,
    UserComponentRegistry,
    ValueCache,
    ValueService,
    VisibleColsService,
} from '@ag-grid-community/core';

import type { ColumnViewportService } from '../columns/columnViewportService';
import type { AgStackComponentsRegistry } from '../components/agStackComponentsRegistry';
import type { CtrlsFactory } from '../ctrlsFactory';
import type { RowNodeEventThrottle } from '../entities/rowNodeEventThrottle';
import type { ResizeObserverService } from '../misc/resizeObserverService';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { AriaAnnouncementService } from '../rendering/ariaAnnouncementService';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import type { ColumnHoverService } from '../rendering/columnHoverService';
import type { RowCssClassCalculator } from '../rendering/row/rowCssClassCalculator';
import type { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import type { SyncService } from '../syncService';
import type { Component } from '../widgets/component';
import type { BeanStub } from './beanStub';

export interface ContextParams {
    providedBeanInstances: Partial<{ [key in BeanName]: BeanStub }>;
    beanClasses: SingletonBean[];
    gridId: string;
}

export interface ComponentMeta {
    componentClass: new () => object;
    componentName: string;
}

export interface ControllerMeta {
    controllerClass: new () => object;
    controllerName: string;
}

export interface SingletonBean {
    new (): BeanStub;
}

export interface CoreBeanCollection {
    context: Context;
    resizeObserverService: ResizeObserverService;
    paginationProxy: PaginationProxy;
    gos: GridOptionsService;
    environment: Environment;
    rowRenderer: RowRenderer;
    valueService: ValueService;
    eventService: EventService;
    columnModel: ColumnModel;
    columnViewportService: ColumnViewportService;
    columnNameService: ColumnNameService;
    visibleColsService: VisibleColsService;
    columnMoveService: ColumnMoveService;
    columnSizeService: ColumnSizeService;
    headerNavigationService: HeaderNavigationService;
    navigationService: NavigationService;
    columnAnimationService: ColumnAnimationService;
    focusService: FocusService;
    popupService: PopupService;
    stylingService: StylingService;
    columnHoverService: ColumnHoverService;
    userComponentFactory: UserComponentFactory;
    userComponentRegistry: UserComponentRegistry;
    animationFrameService: AnimationFrameService;
    dragService: DragService;
    dragAndDropService: DragAndDropService;
    sortController: SortController;
    filterManager: FilterManager;
    rowContainerHeightService: RowContainerHeightService;
    frameworkOverrides: IFrameworkOverrides;
    cellPositionUtils: CellPositionUtils;
    rowPositionUtils: RowPositionUtils;
    selectionService: ISelectionService;
    rowCssClassCalculator: RowCssClassCalculator;
    rowModel: IRowModel;
    ctrlsService: CtrlsService;
    ctrlsFactory: CtrlsFactory;
    agStackComponentsRegistry: AgStackComponentsRegistry;
    valueCache: ValueCache;
    rowNodeEventThrottle: RowNodeEventThrottle;
    localeService: LocaleService;
    syncService: SyncService;
    ariaAnnouncementService: AriaAnnouncementService;
    rangeService: IRangeService;
    selectionHandleFactory: ISelectionHandleFactory;
}

export type BeanCollection = CoreBeanCollection & {
    [key in Exclude<BeanName, keyof CoreBeanCollection>]: any;
};
export class Context {
    private gridId: string;
    private beans: BeanCollection = {} as BeanCollection;
    private createdBeans: BeanStub[] = [];

    private destroyed = false;

    public constructor(params: ContextParams) {
        if (!params || !params.beanClasses) {
            return;
        }

        this.gridId = params.gridId;
        this.beans.context = this;

        Object.entries(params.providedBeanInstances).forEach(([beanName, beanInstance]) => {
            this.beans[beanName as BeanName] = beanInstance;
        });

        params.beanClasses.forEach((BeanClass) => {
            const instance = new BeanClass();
            if (instance.beanName) {
                this.beans[instance.beanName] = instance;
            } else {
                console.error(`Bean ${BeanClass.name} is missing beanName`);
            }
            this.createdBeans.push(instance);
        });

        this.wireBeans(this.createdBeans);
    }

    private getBeanInstances(): BaseBean[] {
        return Object.values(this.beans);
    }

    public createBean<T extends BaseBean | null | undefined>(
        bean: T,
        afterPreCreateCallback?: (comp: Component) => void
    ): T {
        if (!bean) {
            throw Error(`Can't wire to bean since it is null`);
        }
        this.wireBeans([bean], afterPreCreateCallback);
        return bean;
    }

    private wireBeans(beanInstances: BaseBean[], afterPreCreateCallback?: (comp: Component) => void): void {
        beanInstances.forEach((instance) => instance.wireBeans?.(this.beans));
        // used by the component class
        beanInstances.forEach((instance) => (instance as any).preConstruct?.());
        if (afterPreCreateCallback) {
            beanInstances.forEach(afterPreCreateCallback);
        }
        beanInstances.forEach((instance) => instance.postConstruct?.());
    }

    public getBeans(): BeanCollection {
        return this.beans;
    }

    public getBean<T extends BeanName>(name: T): BeanCollection[T] {
        return this.beans[name];
    }

    public destroy(): void {
        if (this.destroyed) {
            return;
        }

        // Set before doing the destroy, so if context.destroy() gets called via another bean
        // we are marked as destroyed already to prevent running destroy() twice
        this.destroyed = true;

        const beanInstances = this.getBeanInstances();
        this.destroyBeans(beanInstances);

        this.beans = {} as BeanCollection;
        this.createdBeans = [];

        ModuleRegistry.__unRegisterGridModules(this.gridId);
    }

    public destroyBean(bean: BaseBean | null | undefined): undefined {
        bean?.destroy?.();
    }

    public destroyBeans(beans: (BaseBean | null | undefined)[]): [] {
        if (!beans) {
            return [];
        }

        beans.forEach(this.destroyBean);
        return [];
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }

    public getGridId(): string {
        return this.gridId;
    }
}

export type BeanName =
    | 'advancedFilterExpressionService'
    | 'advancedFilterService'
    | 'advancedSettingsMenuFactory'
    | 'aggFuncService'
    | 'agGridAngular'
    | 'agGridReact'
    | 'agGridVue'
    | 'agComponentUtils'
    | 'agStackComponentsRegistry'
    | 'aggregationStage'
    | 'alignedGridsService'
    | 'animationFrameService'
    | 'ariaAnnouncementService'
    | 'apiEventService'
    | 'autoColService'
    | 'autoWidthCalculator'
    | 'beans'
    | 'cellEditorFactory'
    | 'cellNavigationService'
    | 'cellPositionUtils'
    | 'cellRendererFactory'
    | 'cellRendererService'
    | 'changeDetectionService'
    | 'chartColumnService'
    | 'chartCrossFilterService'
    | 'chartMenuItemMapper'
    | 'chartMenuListFactory'
    | 'chartMenuService'
    | 'chartTranslationService'
    | 'chartService'
    | 'clipboardService'
    | 'columnAutosizeService'
    | 'columnChooserFactory'
    | 'columnController'
    | 'columnDefFactory'
    | 'columnEditorFactory'
    | 'columnEventDispatcher'
    | 'columnGetStateService'
    | 'columnSizeService'
    | 'columnFactory'
    | 'columnAnimationService'
    | 'columnHoverService'
    | 'columnMenuFactory'
    | 'columnModel'
    | 'columnMoveService'
    | 'columnPositionService'
    | 'columnNameService'
    | 'columnViewportService'
    | 'columnGroupStateService'
    | 'columnApplyStateService'
    | 'columnUtils'
    | 'pivotResultColsService'
    | 'componentMetadataProvider'
    | 'context'
    | 'contextMenuFactory'
    | 'ctrlsFactory'
    | 'ctrlsService'
    | 'csvCreator'
    | 'dataTypeService'
    | 'visibleColsService'
    | 'dragAndDropService'
    | 'dragService'
    | 'excelCreator'
    | 'enterpriseMenuFactory'
    | 'environment'
    | 'eventService'
    | 'eGridDiv'
    | 'expansionService'
    | 'expressionService'
    | 'filterAggregatesStage'
    | 'filterManager'
    | 'filterMenuFactory'
    | 'filterService'
    | 'filterStage'
    | 'flattenStage'
    | 'focusService'
    | 'funcColsService'
    | 'frameworkComponentWrapper'
    | 'frameworkOverrides'
    | 'globalEventListener'
    | 'globalSyncEventListener'
    | 'gridApi'
    | 'gridOptions'
    | 'gos'
    | 'gridOptionsWrapper'
    | 'gridSerializer'
    | 'groupStage'
    | 'headerNavigationService'
    | 'headerPositionUtils'
    | 'horizontalResizeService'
    | 'immutableService'
    | 'lazyBlockLoadingService'
    | 'licenseManager'
    | 'localeService'
    | 'loggerFactory'
    | 'menuItemMapper'
    | 'menuService'
    | 'menuUtils'
    | 'modelItemUtils'
    | 'mouseEventService'
    | 'navigationService'
    | 'overlayService'
    | 'paginationAutoPageSizeService'
    | 'paginationProxy'
    | 'pinnedRowModel'
    | 'pinnedWidthService'
    | 'pivotColDefService'
    | 'pivotStage'
    | 'popupService'
    | 'quickFilterService'
    | 'rangeService'
    | 'resizeObserverService'
    | 'rowContainerHeightService'
    | 'rowCssClassCalculator'
    | 'rowModel'
    | 'rowNodeBlockLoader'
    | 'rowNodeEventThrottle'
    | 'rowNodeSorter'
    | 'rowPositionUtils'
    | 'rowRenderer'
    | 'scrollVisibleService'
    | 'selectableService'
    | 'selectionController'
    | 'selectionHandleFactory'
    | 'selectionService'
    | 'showRowGroupColsService'
    | 'sideBarService'
    | 'sortController'
    | 'sortService'
    | 'sortStage'
    | 'sparklineTooltipSingleton'
    | 'ssrmBlockUtils'
    | 'ssrmExpandListener'
    | 'ssrmFilterListener'
    | 'ssrmListenerUtils'
    | 'ssrmNodeManager'
    | 'ssrmSortService'
    | 'ssrmStoreFactory'
    | 'ssrmStoreUtils'
    | 'ssrmTransactionManager'
    | 'stateService'
    | 'statusBarService'
    | 'stylingService'
    | 'syncService'
    | 'templateService'
    | 'toolPanelColDefService'
    | 'undoRedoService'
    | 'userComponentFactory'
    | 'userComponentRegistry'
    | 'valueCache'
    | 'valueService'
    | 'validationService';
