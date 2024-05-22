import { ILogger } from '../iLogger';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { _getFunctionName } from '../utils/function';
import { _exists, _values } from '../utils/generic';
import { _iterateObject } from '../utils/object';
import { Component } from '../widgets/component';
import { BaseBean } from './bean';

// steps in booting up:
// 1. create all beans
// 2. autowire all attributes
// 3. wire all beans
// 4. initialise the model
// 5. initialise the view
// 6. boot??? (not sure if this is needed)
// each bean is responsible for initialising itself, taking items from the gridOptionsService

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

interface BeanWrapper {
    bean: any;
    beanInstance: BaseBean;
    beanName: BeanName;
}

export class Context {
    private beanWrappers: { [key: string]: BeanWrapper } = {};
    private contextParams: ContextParams;
    private logger: ILogger;

    private destroyed = false;

    public constructor(params: ContextParams, logger: ILogger) {
        if (!params || !params.beanClasses) {
            return;
        }

        this.contextParams = params;

        this.logger = logger;
        this.logger.log('>> creating ag-Application Context');

        this.createBeans();

        const beanInstances = this.getBeanInstances();

        this.wireBeans(beanInstances);

        this.logger.log('>> ag-Application Context ready - component is alive');
    }

    private getBeanInstances(): BaseBean[] {
        return _values(this.beanWrappers).map((beanEntry) => beanEntry.beanInstance);
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
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);

        beanInstances.forEach((bean) => bean.preConstruct?.());

        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (_exists(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }

        beanInstances.forEach((bean) => bean.postConstruct?.());
    }

    private createBeans(): void {
        // register all normal beans
        this.contextParams.beanClasses.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name

        // instantiate all beans - overridden beans will be left out
        _iterateObject(this.beanWrappers, (key: string, beanEntry: BeanWrapper) => {
            let constructorParamsMeta: any;
            if (
                beanEntry.bean.__agBeanMetaData &&
                beanEntry.bean.__agBeanMetaData.autowireMethods &&
                beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor
            ) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            const constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            const newInstance = new (beanEntry.bean.bind.apply(beanEntry.bean, [null, ...constructorParams]))();
            beanEntry.beanInstance = newInstance;
        });

        const createdBeanNames = Object.keys(this.beanWrappers).join(', ');
        this.logger.log(`created beans: ${createdBeanNames}`);
    }

    // tslint:disable-next-line
    private createBeanWrapper(BeanClass: new () => Object): void {
        const metaData = (BeanClass as any).__agBeanMetaData;

        if (!metaData) {
            let beanName: string;
            if (BeanClass.prototype.constructor) {
                beanName = _getFunctionName(BeanClass.prototype.constructor);
            } else {
                beanName = '' + BeanClass;
            }
            console.error(`Context item ${beanName} is not a bean`);
            return;
        }

        const beanEntry = {
            bean: BeanClass,
            beanInstance: null as any,
            beanName: metaData.beanName,
        };

        this.beanWrappers[metaData.beanName] = beanEntry;
    }

    private autoWireBeans(beanInstances: any[]): void {
        beanInstances.forEach((beanInstance) => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any, beanName: string) => {
                const attributes = metaData.agClassAttributes;
                if (!attributes) {
                    return;
                }

                attributes.forEach((attribute: any) => {
                    const otherBean = this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
                    beanInstance[attribute.attributeName] = otherBean;
                });
            });
        });
    }

    private methodWireBeans(beanInstances: any[]): void {
        beanInstances.forEach((beanInstance) => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any, beanName: BeanName) => {
                _iterateObject(metaData.autowireMethods, (methodName: string, wireParams: any[]) => {
                    // skip constructor, as this is dealt with elsewhere
                    if (methodName === 'agConstructor') {
                        return;
                    }
                    const initParams = this.getBeansForParameters(wireParams, beanName);
                    beanInstance[methodName].apply(beanInstance, initParams);
                });
            });
        });
    }

    private forEachMetaDataInHierarchy(beanInstance: any, callback: (metaData: any, beanName: string) => void): void {
        let prototype: any = Object.getPrototypeOf(beanInstance);
        while (prototype != null) {
            const constructor: any = prototype.constructor;

            if (constructor.hasOwnProperty('__agBeanMetaData')) {
                const metaData = constructor.__agBeanMetaData;
                const beanName = this.getBeanName(constructor);
                callback(metaData, beanName);
            }

            prototype = Object.getPrototypeOf(prototype);
        }
    }

    private getBeanName(constructor: any): string {
        if (constructor.__agBeanMetaData && constructor.__agBeanMetaData.beanName) {
            return constructor.__agBeanMetaData.beanName;
        }

        const constructorString = constructor.toString();
        const beanName = constructorString.substring(9, constructorString.indexOf('('));
        return beanName;
    }

    private getBeansForParameters(parameters: any, beanName: BeanName): any[] {
        const beansList: any[] = [];
        if (parameters) {
            _iterateObject(parameters, (paramIndex: string, otherBeanName: BeanName) => {
                const otherBean = this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    }

    private lookupBeanInstance(wiringBean: string, beanName: BeanName, optional = false): any {
        if (this.destroyed) {
            this.logger.log(`AG Grid: bean reference ${beanName} is used after the grid is destroyed!`);
            return null;
        }

        if (beanName === 'context') {
            return this;
        }

        if (
            this.contextParams.providedBeanInstances &&
            this.contextParams.providedBeanInstances.hasOwnProperty(beanName)
        ) {
            return this.contextParams.providedBeanInstances[beanName];
        }

        const beanEntry = this.beanWrappers[beanName];

        if (beanEntry) {
            return beanEntry.beanInstance;
        }

        if (!optional) {
            console.error(`AG Grid: unable to find bean reference ${beanName} while initialising ${wiringBean}`);
        }

        return null;
    }

    public getBean(name: BeanName): any {
        return this.lookupBeanInstance('getBean', name, true);
    }

    public destroy(): void {
        if (this.destroyed) {
            return;
        }

        // Set before doing the destroy, so if context.destroy() gets called via another bean
        // we are marked as destroyed already to prevent running destroy() twice
        this.destroyed = true;

        this.logger.log('>> Shutting down ag-Application Context');

        const beanInstances = this.getBeanInstances();
        this.destroyBeans(beanInstances);

        this.contextParams.providedBeanInstances = null;

        ModuleRegistry.__unRegisterGridModules(this.contextParams.gridId);

        this.logger.log('>> ag-Application Context shut down - component is dead');
    }

    public destroyBean<T extends BaseBean | null | undefined>(bean: T): undefined {
        if (!bean) {
            return;
        }

        this.destroyBeans([bean]);
    }

    public destroyBeans<T extends BaseBean | null | undefined>(beans: T[]): T[] {
        if (!beans) {
            return [];
        }

        beans.forEach((bean) => bean?.destroy?.());

        return [];
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }

    public getGridId(): string {
        return this.contextParams.gridId;
    }
}

export function Bean(beanName: BeanName): Function {
    return (classConstructor: any) => {
        const props = getOrCreateProps(classConstructor);
        props.beanName = beanName;
    };
}

export function Autowired(name?: BeanName): Function {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        autowiredFunc(target, name, false, target, propertyKey, null);
    };
}

export function Optional(name?: BeanName): Function {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        autowiredFunc(target, name, true, target, propertyKey, null);
    };
}

function autowiredFunc(
    target: any,
    name: string | undefined,
    optional: boolean,
    classPrototype: any,
    methodOrAttributeName: string,
    index: number | null
) {
    if (name === null) {
        console.error('AG Grid: Autowired name should not be null');
        return;
    }
    if (typeof index === 'number') {
        console.error('AG Grid: Autowired should be on an attribute');
        return;
    }

    // it's an attribute on the class
    const props = getOrCreateProps(target.constructor);
    if (!props.agClassAttributes) {
        props.agClassAttributes = [];
    }
    props.agClassAttributes.push({
        attributeName: methodOrAttributeName,
        beanName: name,
        optional: optional,
    });
}

export function Qualifier(name: BeanName): Function {
    return (classPrototype: any, methodOrAttributeName: string, index: number) => {
        const constructor: any = typeof classPrototype == 'function' ? classPrototype : classPrototype.constructor;
        let props: any;

        if (typeof index === 'number') {
            // it's a parameter on a method
            let methodName: string;
            if (methodOrAttributeName) {
                props = getOrCreateProps(constructor);
                methodName = methodOrAttributeName;
            } else {
                props = getOrCreateProps(constructor);
                methodName = 'agConstructor';
            }
            if (!props.autowireMethods) {
                props.autowireMethods = {};
            }
            if (!props.autowireMethods[methodName]) {
                props.autowireMethods[methodName] = {};
            }
            props.autowireMethods[methodName][index] = name;
        }
    };
}

function getOrCreateProps(target: any): any {
    if (!target.hasOwnProperty('__agBeanMetaData')) {
        target.__agBeanMetaData = {};
    }

    return target.__agBeanMetaData;
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
    | 'gridOptionsService'
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
