import { SelectionService } from "./selectionService.mjs";
import { ColumnApi } from "./columns/columnApi.mjs";
import { ColumnModel } from "./columns/columnModel.mjs";
import { RowRenderer } from "./rendering/rowRenderer.mjs";
import { GridHeaderComp } from "./headerRendering/gridHeaderComp.mjs";
import { FilterManager } from "./filter/filterManager.mjs";
import { ValueService } from "./valueService/valueService.mjs";
import { EventService } from "./eventService.mjs";
import { GridBodyComp } from "./gridBodyComp/gridBodyComp.mjs";
import { GridApi } from "./gridApi.mjs";
import { ColumnFactory } from "./columns/columnFactory.mjs";
import { DisplayedGroupCreator } from "./columns/displayedGroupCreator.mjs";
import { ExpressionService } from "./valueService/expressionService.mjs";
import { TemplateService } from "./templateService.mjs";
import { PopupService } from "./widgets/popupService.mjs";
import { Logger, LoggerFactory } from "./logger.mjs";
import { ColumnUtils } from "./columns/columnUtils.mjs";
import { AutoWidthCalculator } from "./rendering/autoWidthCalculator.mjs";
import { HorizontalResizeService } from "./headerRendering/common/horizontalResizeService.mjs";
import { Context } from "./context/context.mjs";
import { GridComp } from "./gridComp/gridComp.mjs";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService.mjs";
import { DragService } from "./dragAndDrop/dragService.mjs";
import { SortController } from "./sortController.mjs";
import { FocusService } from "./focusService.mjs";
import { MouseEventService } from "./gridBodyComp/mouseEventService.mjs";
import { CellNavigationService } from "./cellNavigationService.mjs";
import { Events } from "./events.mjs";
import { ValueFormatterService } from "./rendering/valueFormatterService.mjs";
import { AgCheckbox } from "./widgets/agCheckbox.mjs";
import { AgRadioButton } from "./widgets/agRadioButton.mjs";
import { VanillaFrameworkOverrides } from "./vanillaFrameworkOverrides.mjs";
import { ScrollVisibleService } from "./gridBodyComp/scrollVisibleService.mjs";
import { StylingService } from "./styling/stylingService.mjs";
import { ColumnHoverService } from "./rendering/columnHoverService.mjs";
import { ColumnAnimationService } from "./rendering/columnAnimationService.mjs";
import { AutoGroupColService } from "./columns/autoGroupColService.mjs";
import { PaginationProxy } from "./pagination/paginationProxy.mjs";
import { PaginationAutoPageSizeService } from "./pagination/paginationAutoPageSizeService.mjs";
import { ValueCache } from "./valueService/valueCache.mjs";
import { ChangeDetectionService } from "./valueService/changeDetectionService.mjs";
import { AlignedGridsService } from "./alignedGridsService.mjs";
import { UserComponentFactory } from "./components/framework/userComponentFactory.mjs";
import { UserComponentRegistry } from "./components/framework/userComponentRegistry.mjs";
import { AgComponentUtils } from "./components/framework/agComponentUtils.mjs";
import { ComponentMetadataProvider } from "./components/framework/componentMetadataProvider.mjs";
import { Beans } from "./rendering/beans.mjs";
import { Environment } from "./environment.mjs";
import { AnimationFrameService } from "./misc/animationFrameService.mjs";
import { NavigationService } from "./gridBodyComp/navigationService.mjs";
import { RowContainerHeightService } from "./rendering/rowContainerHeightService.mjs";
import { SelectableService } from "./rowNodes/selectableService.mjs";
import { PaginationComp } from "./pagination/paginationComp.mjs";
import { ResizeObserverService } from "./misc/resizeObserverService.mjs";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent.mjs";
import { AgGroupComponent } from "./widgets/agGroupComponent.mjs";
import { AgDialog } from "./widgets/agDialog.mjs";
import { AgPanel } from "./widgets/agPanel.mjs";
import { AgInputTextField } from "./widgets/agInputTextField.mjs";
import { AgInputTextArea } from "./widgets/agInputTextArea.mjs";
import { AgSlider } from "./widgets/agSlider.mjs";
import { AgInputNumberField } from "./widgets/agInputNumberField.mjs";
import { AgInputRange } from "./widgets/agInputRange.mjs";
import { AgSelect } from "./widgets/agSelect.mjs";
import { AgRichSelect } from "./widgets/agRichSelect.mjs";
import { AgToggleButton } from "./widgets/agToggleButton.mjs";
import { RowPositionUtils } from "./entities/rowPositionUtils.mjs";
import { CellPositionUtils } from "./entities/cellPositionUtils.mjs";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel.mjs";
import { ModuleRegistry } from "./modules/moduleRegistry.mjs";
import { ModuleNames } from "./modules/moduleNames.mjs";
import { UndoRedoService } from "./undoRedo/undoRedoService.mjs";
import { AgStackComponentsRegistry } from "./components/agStackComponentsRegistry.mjs";
import { HeaderPositionUtils } from "./headerRendering/common/headerPosition.mjs";
import { HeaderNavigationService } from "./headerRendering/common/headerNavigationService.mjs";
import { missing } from "./utils/generic.mjs";
import { ColumnDefFactory } from "./columns/columnDefFactory.mjs";
import { RowCssClassCalculator } from "./rendering/row/rowCssClassCalculator.mjs";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader.mjs";
import { RowNodeSorter } from "./rowNodes/rowNodeSorter.mjs";
import { CtrlsService } from "./ctrlsService.mjs";
import { CtrlsFactory } from "./ctrlsFactory.mjs";
import { FakeHScrollComp } from "./gridBodyComp/fakeHScrollComp.mjs";
import { PinnedWidthService } from "./gridBodyComp/pinnedWidthService.mjs";
import { RowContainerComp } from "./gridBodyComp/rowContainer/rowContainerComp.mjs";
import { RowNodeEventThrottle } from "./entities/rowNodeEventThrottle.mjs";
import { StandardMenuFactory } from "./headerRendering/cells/column/standardMenu.mjs";
import { SortIndicatorComp } from "./headerRendering/cells/column/sortIndicatorComp.mjs";
import { GridOptionsService } from "./gridOptionsService.mjs";
import { LocaleService } from "./localeService.mjs";
import { GridOptionsValidator } from "./gridOptionsValidator.mjs";
import { FakeVScrollComp } from "./gridBodyComp/fakeVScrollComp.mjs";
import { DataTypeService } from "./columns/dataTypeService.mjs";
import { AgInputDateField } from "./widgets/agInputDateField.mjs";
import { ValueParserService } from "./valueService/valueParserService.mjs";
import { AgAutocomplete } from "./widgets/agAutocomplete.mjs";
import { QuickFilterService } from "./filter/quickFilterService.mjs";
// creates JavaScript vanilla Grid, including JavaScript (ag-stack) components, which can
// be wrapped by the framework wrappers
export class Grid {
    constructor(eGridDiv, gridOptions, params) {
        if (!gridOptions) {
            console.error('AG Grid: no gridOptions provided to the grid');
            return;
        }
        this.gridOptions = gridOptions;
        new GridCoreCreator().create(eGridDiv, gridOptions, context => {
            const gridComp = new GridComp(eGridDiv);
            context.createBean(gridComp);
        }, undefined, params);
    }
    destroy() {
        if (this.gridOptions && this.gridOptions.api) {
            this.gridOptions.api.destroy();
        }
    }
}
let nextGridId = 1;
// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
export class GridCoreCreator {
    create(eGridDiv, gridOptions, createUi, acceptChanges, params) {
        var _a;
        const debug = !!gridOptions.debug;
        const gridId = (_a = gridOptions.gridId) !== null && _a !== void 0 ? _a : String(nextGridId++);
        const registeredModules = this.getRegisteredModules(params, gridId);
        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);
        if (!beanClasses) {
            return;
        } // happens when no row model found
        const contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug,
            gridId: gridId,
        };
        const logger = new Logger('AG Grid', () => gridOptions.debug);
        const contextLogger = new Logger('Context', () => contextParams.debug);
        const context = new Context(contextParams, contextLogger);
        const beans = context.getBean('beans');
        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);
        createUi(context);
        // we wait until the UI has finished initialising before setting in columns and rows
        beans.ctrlsService.whenReady(() => {
            this.setColumnsAndData(beans);
            this.dispatchGridReadyEvent(beans);
            const isEnterprise = ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, gridId);
            logger.log(`initialised successfully, enterprise = ${isEnterprise}`);
        });
        if (acceptChanges) {
            acceptChanges(context);
        }
    }
    registerControllers(beans, registeredModules) {
        registeredModules.forEach(module => {
            if (module.controllers) {
                module.controllers.forEach(meta => beans.ctrlsFactory.register(meta));
            }
        });
    }
    registerStackComponents(beans, registeredModules) {
        const agStackComponents = this.createAgStackComponentsList(registeredModules);
        beans.agStackComponentsRegistry.setupComponents(agStackComponents);
    }
    getRegisteredModules(params, gridId) {
        const passedViaConstructor = params ? params.modules : null;
        const registered = ModuleRegistry.__getRegisteredModules(gridId);
        const allModules = [];
        const mapNames = {};
        // adds to list and removes duplicates
        const addModule = (moduleBased, mod, gridId) => {
            const addIndividualModule = (currentModule) => {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    ModuleRegistry.__register(currentModule, moduleBased, gridId);
                }
            };
            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach(m => addModule(moduleBased, m, gridId));
            }
        };
        if (passedViaConstructor) {
            passedViaConstructor.forEach(m => addModule(true, m, gridId));
        }
        if (registered) {
            registered.forEach(m => addModule(!ModuleRegistry.__isPackageBased(), m, undefined));
        }
        return allModules;
    }
    registerModuleUserComponents(beans, registeredModules) {
        const moduleUserComps = this.extractModuleEntity(registeredModules, (module) => module.userComponents ? module.userComponents : []);
        moduleUserComps.forEach(compMeta => {
            beans.userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
        });
    }
    createProvidedBeans(eGridDiv, gridOptions, params) {
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
    createAgStackComponentsList(registeredModules) {
        let components = [
            { componentName: 'AgCheckbox', componentClass: AgCheckbox },
            { componentName: 'AgRadioButton', componentClass: AgRadioButton },
            { componentName: 'AgToggleButton', componentClass: AgToggleButton },
            { componentName: 'AgInputTextField', componentClass: AgInputTextField },
            { componentName: 'AgInputTextArea', componentClass: AgInputTextArea },
            { componentName: 'AgInputNumberField', componentClass: AgInputNumberField },
            { componentName: 'AgInputDateField', componentClass: AgInputDateField },
            { componentName: 'AgInputRange', componentClass: AgInputRange },
            { componentName: 'AgRichSelect', componentClass: AgRichSelect },
            { componentName: 'AgSelect', componentClass: AgSelect },
            { componentName: 'AgSlider', componentClass: AgSlider },
            { componentName: 'AgGridBody', componentClass: GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: AgGroupComponent },
            { componentName: 'AgPanel', componentClass: AgPanel },
            { componentName: 'AgDialog', componentClass: AgDialog },
            { componentName: 'AgRowContainer', componentClass: RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: FakeVScrollComp },
            { componentName: 'AgAutocomplete', componentClass: AgAutocomplete },
        ];
        const moduleAgStackComps = this.extractModuleEntity(registeredModules, (module) => module.agStackComponents ? module.agStackComponents : []);
        components = components.concat(moduleAgStackComps);
        return components;
    }
    createBeansList(rowModelType = 'clientSide', registeredModules, gridId) {
        // only load beans matching the required row model
        const rowModelModules = registeredModules.filter(module => !module.rowModel || module.rowModel === rowModelType);
        // assert that the relevant module has been loaded
        const rowModelModuleNames = {
            clientSide: ModuleNames.ClientSideRowModelModule,
            infinite: ModuleNames.InfiniteRowModelModule,
            serverSide: ModuleNames.ServerSideRowModelModule,
            viewport: ModuleNames.ViewportRowModelModule
        };
        if (!rowModelModuleNames[rowModelType]) {
            console.error('AG Grid: could not find row model for rowModelType = ' + rowModelType);
            return;
        }
        if (!ModuleRegistry.__assertRegistered(rowModelModuleNames[rowModelType], `rowModelType = '${rowModelType}'`, gridId)) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        const beans = [
            Beans, RowPositionUtils, CellPositionUtils, HeaderPositionUtils,
            PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            RowContainerHeightService, HorizontalResizeService, LocaleService, GridOptionsValidator,
            PinnedRowModel, DragService, DisplayedGroupCreator, EventService, GridOptionsService,
            PopupService, SelectionService, FilterManager, ColumnModel, HeaderNavigationService,
            PaginationProxy, RowRenderer, ExpressionService, ColumnFactory, TemplateService,
            AlignedGridsService, NavigationService, ValueCache, ValueService, LoggerFactory,
            ColumnUtils, AutoWidthCalculator, StandardMenuFactory, DragAndDropService, ColumnApi,
            FocusService, MouseEventService, Environment, CellNavigationService, ValueFormatterService,
            StylingService, ScrollVisibleService, SortController, ColumnHoverService, ColumnAnimationService,
            SelectableService, AutoGroupColService, ChangeDetectionService, AnimationFrameService,
            UndoRedoService, AgStackComponentsRegistry, ColumnDefFactory,
            RowCssClassCalculator, RowNodeBlockLoader, RowNodeSorter, CtrlsService,
            PinnedWidthService, RowNodeEventThrottle, CtrlsFactory, DataTypeService, ValueParserService,
            QuickFilterService
        ];
        const moduleBeans = this.extractModuleEntity(rowModelModules, (module) => module.beans ? module.beans : []);
        beans.push(...moduleBeans);
        // check for duplicates, as different modules could include the same beans that
        // they depend on, eg ClientSideRowModel in enterprise, and ClientSideRowModel in community
        const beansNoDuplicates = [];
        beans.forEach(bean => {
            if (beansNoDuplicates.indexOf(bean) < 0) {
                beansNoDuplicates.push(bean);
            }
        });
        return beansNoDuplicates;
    }
    extractModuleEntity(moduleEntities, extractor) {
        return [].concat(...moduleEntities.map(extractor));
    }
    setColumnsAndData(beans) {
        const columnDefs = beans.gridOptionsService.get('columnDefs');
        beans.columnModel.setColumnDefs(columnDefs || [], "gridInitializing");
        beans.rowModel.start();
    }
    dispatchGridReadyEvent(beans) {
        const readyEvent = {
            type: Events.EVENT_GRID_READY,
        };
        beans.eventService.dispatchEvent(readyEvent);
    }
}
