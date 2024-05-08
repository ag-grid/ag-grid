import { CellNavigationService } from "./cellNavigationService";
import { ColumnFactory } from "./columns/columnFactory";
import { ColumnModel } from "./columns/columnModel";
import { AgStackComponentsRegistry } from "./components/agStackComponentsRegistry";
import { AgComponentUtils } from "./components/framework/agComponentUtils";
import { ComponentMetadataProvider } from "./components/framework/componentMetadataProvider";
import { UserComponentFactory } from "./components/framework/userComponentFactory";
import { UserComponentRegistry } from "./components/framework/userComponentRegistry";
import { ComponentMeta, Context, ContextParams } from "./context/context";
import { CtrlsFactory } from "./ctrlsFactory";
import { CtrlsService } from "./ctrlsService";
import { CellPositionUtils } from "./entities/cellPositionUtils";
import { GridOptions } from "./entities/gridOptions";
import { RowNodeEventThrottle } from "./entities/rowNodeEventThrottle";
import { RowPositionUtils } from "./entities/rowPositionUtils";
import { Environment } from "./environment";
import { EventService } from "./eventService";
import { FakeHScrollComp } from "./gridBodyComp/fakeHScrollComp";
import { FakeVScrollComp } from "./gridBodyComp/fakeVScrollComp";
import { GridBodyComp } from "./gridBodyComp/gridBodyComp";
import { RowContainerComp } from "./gridBodyComp/rowContainer/rowContainerComp";
import { GridComp } from "./gridComp/gridComp";
import { GridOptionsService } from "./gridOptionsService";
import { GridHeaderComp } from "./headerRendering/gridHeaderComp";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { Module } from "./interfaces/iModule";
import { RowModelType } from "./interfaces/iRowModel";
import { LocaleService } from "./localeService";
import { AnimationFrameService } from "./misc/animationFrameService";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { PaginationProxy } from "./pagination/paginationProxy";
import { AriaAnnouncementService } from "./rendering/ariaAnnouncementService";
import { Beans } from "./rendering/beans";
import { ColumnHoverService } from "./rendering/columnHoverService";
import { OverlayService } from "./rendering/overlays/overlayService";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { RowCssClassCalculator } from "./rendering/row/rowCssClassCalculator";
import { RowContainerHeightService } from "./rendering/rowContainerHeightService";
import { RowRenderer } from "./rendering/rowRenderer";
import { RowNodeSorter } from "./rowNodes/rowNodeSorter";
import { StylingService } from "./styling/stylingService";
import { SyncService } from "./syncService";
import { errorOnce } from "./utils/function";
import { missing } from "./utils/generic";
import { mergeDeep } from "./utils/object";
import { ValueService } from "./valueService/valueService";
import { VanillaFrameworkOverrides } from "./vanillaFrameworkOverrides";

export interface GridParams {
    // INTERNAL - used by Web Components
    globalEventListener?: Function;
    // INTERNAL - Always sync - for events such as gridPreDestroyed
    globalSyncEventListener?: Function;    
    // INTERNAL - this allows the base frameworks (React, Angular, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;
    // INTERNAL - bean instances to add to the context
    providedBeanInstances?: { [key: string]: any; };

    /**
     * Modules to be registered directly with this grid instance.
     */
    modules?: Module[];
}

export interface Params {
    /**
     * Modules to be registered directly with this grid instance.
     */
    modules?: Module[];
}

class GlobalGridOptions{
    static gridOptions: GridOptions | undefined = undefined;
}

/**
 * Provide gridOptions that will be shared by all grid instances.
 * Individually defined GridOptions will take precedence over global options.
 * @param gridOptions - global grid options
 */
export function provideGlobalGridOptions(gridOptions: GridOptions): void {
    GlobalGridOptions.gridOptions = gridOptions;
}

/**
 * Creates a grid inside the provided HTML element.
 * @param eGridDiv Parent element to contain the grid.
 * @param gridOptions Configuration for the grid.
 * @param params Individually register AG Grid Modules to this grid.
 * @returns api to be used to interact with the grid.
 */
export function createGrid<TData>(eGridDiv: HTMLElement, gridOptions: GridOptions<TData>, params?: Params){

    if (!gridOptions) {
        errorOnce('No gridOptions provided to createGrid');
        return {};
    }   
    const api = new GridCoreCreator().create(eGridDiv, gridOptions, context => {
        const gridComp = new GridComp(eGridDiv);
        context.createBean(gridComp);
    }, undefined, params);
    
    return api;
}


let nextGridId = 1;

// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
export class GridCoreCreator {

    public create(eGridDiv: HTMLElement, providedOptions: GridOptions, createUi: (context: Context) => void, acceptChanges?: (context: Context) => void, params?: GridParams) {

        let mergedGridOps: GridOptions = {};
        if (GlobalGridOptions.gridOptions) {
            // Merge deep to avoid leaking changes to the global options
            mergeDeep(mergedGridOps, GlobalGridOptions.gridOptions, true, true);
            // Shallow copy to ensure context reference is maintained
            mergedGridOps = {...mergedGridOps, ...providedOptions};
        }else{
            mergedGridOps = providedOptions;
        }
        const gridOptions = GridOptionsService.getCoercedGridOptions(mergedGridOps);
        
        const debug = !!gridOptions.debug;
        const gridId = gridOptions.gridId ?? String(nextGridId++);

        const registeredModules = this.getRegisteredModules(params, gridId);

        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);

        if (!beanClasses) { 
            // Detailed error message will have been printed by createBeansList
            errorOnce('Failed to create grid.');
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined as any; 
        } 

        const contextParams: ContextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug,
            gridId: gridId,
        };

        const context = new Context(contextParams);
        const beans = context.getBean('beans') as Beans;

        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);

        createUi(context);

        beans.syncService.start();

        if (acceptChanges) { acceptChanges(context); }
        
        return context.getBean('gridOptionsService');
    }

    private registerControllers(beans: Beans, registeredModules: Module[]): void {
        registeredModules.forEach(module => {
            if (module.controllers) {
                module.controllers.forEach(meta => beans.ctrlsFactory.register(meta));
            }
        });
    }

    private registerStackComponents(beans: Beans, registeredModules: Module[]): void {
        const agStackComponents = this.createAgStackComponentsList(registeredModules);
        beans.agStackComponentsRegistry.setupComponents(agStackComponents);
    }

    private getRegisteredModules(params: GridParams | undefined, gridId: string): Module[] {
        const passedViaConstructor: Module[] | undefined | null = params ? params.modules : null;
        const registered = ModuleRegistry.__getRegisteredModules(gridId);

        const allModules: Module[] = [];
        const mapNames: { [name: string]: boolean; } = {};

        // adds to list and removes duplicates
        const addModule = (moduleBased: boolean, mod: Module, gridId: string | undefined) => {
            const addIndividualModule = (currentModule: Module) => {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    ModuleRegistry.__register(currentModule, moduleBased, gridId);
                }
            }

            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach(m => addModule(moduleBased, m, gridId));
            }
        }

        if (passedViaConstructor) {
            passedViaConstructor.forEach(m => addModule(true, m, gridId));
        }

        if (registered) {
            registered.forEach(m => addModule(!ModuleRegistry.__isPackageBased(), m, undefined));
        }

        return allModules;
    }

    private registerModuleUserComponents(beans: Beans, registeredModules: Module[]): void {
        const moduleUserComps: { componentName: string, componentClass: any; }[]
            = this.extractModuleEntity(registeredModules,
                (module) => module.userComponents ? module.userComponents : []);

        moduleUserComps.forEach(compMeta => {
            beans.userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
        });
    }

    private createProvidedBeans(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams): any {
        let frameworkOverrides = params ? params.frameworkOverrides : null;
        if (missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
        }

        const seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            globalEventListener: params ? params.globalEventListener : null,
            globalSyncEventListener: params ? params.globalSyncEventListener : null,
            frameworkOverrides: frameworkOverrides
        };
        if (params && params.providedBeanInstances) {
            Object.assign(seed, params.providedBeanInstances);
        }

        return seed;
    }

    private createAgStackComponentsList(registeredModules: Module[]): any[] {
        let components: ComponentMeta[] = [
            { componentName: 'AgGridBody', componentClass: GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: GridHeaderComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgRowContainer', componentClass: RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: FakeVScrollComp },
        ];

        const moduleAgStackComps = this.extractModuleEntity(registeredModules,
            (module) => module.agStackComponents ? module.agStackComponents : []);

        components = components.concat(moduleAgStackComps);

        return components;
    }

    private createBeansList(rowModelType: RowModelType | undefined = 'clientSide', registeredModules: Module[], gridId: string): any[] | undefined {
        // only load beans matching the required row model
        const rowModelModules = registeredModules.filter(module => !module.rowModel || module.rowModel === rowModelType);


        // assert that the relevant module has been loaded
        const rowModelModuleNames: Record<RowModelType, ModuleNames> = {
            clientSide: ModuleNames.ClientSideRowModelModule,
            infinite: ModuleNames.InfiniteRowModelModule,
            serverSide: ModuleNames.ServerSideRowModelModule,
            viewport: ModuleNames.ViewportRowModelModule
        };

        if (!rowModelModuleNames[rowModelType]) {
            errorOnce('Could not find row model for rowModelType = ' + rowModelType);
            return;
        }

        if (!ModuleRegistry.__assertRegistered(rowModelModuleNames[rowModelType], `rowModelType = '${rowModelType}'`, gridId)) {
            return;
        }

        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        const beans = [
            Beans, RowPositionUtils, CellPositionUtils, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            RowContainerHeightService, LocaleService,              
            EventService, GridOptionsService,
            ColumnModel,
            PaginationProxy, RowRenderer, ColumnFactory,
            ValueService,
              Environment, CellNavigationService, StylingService,
             ColumnHoverService,
             AnimationFrameService,
            AgStackComponentsRegistry, RowCssClassCalculator, 
            RowNodeSorter, CtrlsService, RowNodeEventThrottle,
            CtrlsFactory, SyncService, OverlayService,
             AriaAnnouncementService
        ];

        const moduleBeans = this.extractModuleEntity(rowModelModules, (module) => module.beans ? module.beans : []);
        beans.push(...moduleBeans);

        // check for duplicates, as different modules could include the same beans that
        // they depend on, eg ClientSideRowModel in enterprise, and ClientSideRowModel in community
        const beansNoDuplicates: any[] = [];
        beans.forEach(bean => {
            if (beansNoDuplicates.indexOf(bean) < 0) {
                beansNoDuplicates.push(bean);
            }
        });

        return beansNoDuplicates;
    }

    private extractModuleEntity(moduleEntities: any[], extractor: (module: any) => any) {
        return [].concat(...moduleEntities.map(extractor));
    }
}

