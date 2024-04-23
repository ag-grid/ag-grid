import { ILogger } from "../iLogger";
import { Component } from "../widgets/component";
export interface ContextParams {
    providedBeanInstances: any;
    beanClasses: any[];
    debug: boolean;
    gridId: string;
}
export interface ComponentMeta {
    componentClass: new () => Object;
    componentName: string;
}
export interface ControllerMeta {
    controllerClass: new () => Object;
    controllerName: string;
}
export declare class Context {
    private beanWrappers;
    private contextParams;
    private logger;
    private destroyed;
    constructor(params: ContextParams, logger: ILogger);
    private getBeanInstances;
    createBean<T extends any>(bean: T, afterPreCreateCallback?: (comp: Component) => void): T;
    private wireBeans;
    private createBeans;
    private createBeanWrapper;
    private autoWireBeans;
    private methodWireBeans;
    private forEachMetaDataInHierarchy;
    private getBeanName;
    private getBeansForParameters;
    private lookupBeanInstance;
    private callLifeCycleMethods;
    private callLifeCycleMethodsOnBean;
    getBean(name: BeanName): any;
    destroy(): void;
    destroyBean<T>(bean: T): undefined;
    destroyBeans<T>(beans: T[]): T[];
    isDestroyed(): boolean;
    getGridId(): string;
}
export declare function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function Bean(beanName: BeanName): Function;
export declare function Autowired(name?: BeanName): Function;
export declare function Optional(name?: BeanName): Function;
export declare function Qualifier(name: BeanName): Function;
export type BeanName = 'advancedFilterExpressionService' | 'advancedFilterService' | 'advancedSettingsMenuFactory' | 'aggFuncService' | 'agGridAngular' | 'agGridReact' | 'agGridVue' | 'agComponentUtils' | 'agStackComponentsRegistry' | 'aggregationStage' | 'alignedGridsService' | 'animationFrameService' | 'ariaAnnouncementService' | 'apiEventService' | 'autoGroupColService' | 'autoWidthCalculator' | 'beans' | 'cellEditorFactory' | 'cellNavigationService' | 'cellPositionUtils' | 'cellRendererFactory' | 'cellRendererService' | 'changeDetectionService' | 'chartColumnService' | 'chartCrossFilterService' | 'chartMenuItemMapper' | 'chartMenuListFactory' | 'chartMenuService' | 'chartTranslationService' | 'chartService' | 'clipboardService' | 'columnApi' | 'columnChooserFactory' | 'columnController' | 'columnDefFactory' | 'columnEditorFactory' | 'columnFactory' | 'columnAnimationService' | 'columnHoverService' | 'columnMenuFactory' | 'columnModel' | 'columnPositionService' | 'columnUtils' | 'componentMetadataProvider' | 'context' | 'contextMenuFactory' | 'ctrlsFactory' | 'ctrlsService' | 'csvCreator' | 'dataTypeService' | 'displayedGroupCreator' | 'dragAndDropService' | 'dragService' | 'excelCreator' | 'enterpriseMenuFactory' | 'environment' | 'eventService' | 'eGridDiv' | 'expansionService' | 'expressionService' | 'filterAggregatesStage' | 'filterManager' | 'filterMenuFactory' | 'filterService' | 'filterStage' | 'flattenStage' | 'focusService' | 'frameworkComponentWrapper' | 'frameworkOverrides' | 'globalEventListener' | 'globalSyncEventListener' | 'gridApi' | 'gridOptions' | 'gridOptionsService' | 'gridOptionsWrapper' | 'gridSerializer' | 'groupStage' | 'headerNavigationService' | 'headerPositionUtils' | 'horizontalResizeService' | 'immutableService' | 'lazyBlockLoadingService' | 'licenseManager' | 'localeService' | 'loggerFactory' | 'menuItemMapper' | 'menuService' | 'menuUtils' | 'modelItemUtils' | 'mouseEventService' | 'navigationService' | 'overlayService' | 'paginationAutoPageSizeService' | 'paginationProxy' | 'pinnedRowModel' | 'pinnedWidthService' | 'pivotColDefService' | 'pivotStage' | 'popupService' | 'quickFilterService' | 'rangeService' | 'resizeObserverService' | 'rowContainerHeightService' | 'rowCssClassCalculator' | 'rowModel' | 'rowNodeBlockLoader' | 'rowNodeEventThrottle' | 'rowNodeSorter' | 'rowPositionUtils' | 'rowRenderer' | 'scrollVisibleService' | 'selectableService' | 'selectionController' | 'selectionHandleFactory' | 'selectionService' | 'sideBarService' | 'sortController' | 'sortService' | 'sortStage' | 'sparklineTooltipSingleton' | 'ssrmBlockUtils' | 'ssrmExpandListener' | 'ssrmFilterListener' | 'ssrmListenerUtils' | 'ssrmNodeManager' | 'ssrmSortService' | 'ssrmStoreFactory' | 'ssrmStoreUtils' | 'ssrmTransactionManager' | 'stateService' | 'statusBarService' | 'stylingService' | 'syncService' | 'templateService' | 'toolPanelColDefService' | 'undoRedoService' | 'userComponentFactory' | 'userComponentRegistry' | 'valueCache' | 'valueService' | 'validationService';
