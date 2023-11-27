"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridCoreCreator = exports.Grid = exports.createGrid = void 0;
const selectionService_1 = require("./selectionService");
const columnApi_1 = require("./columns/columnApi");
const columnModel_1 = require("./columns/columnModel");
const rowRenderer_1 = require("./rendering/rowRenderer");
const gridHeaderComp_1 = require("./headerRendering/gridHeaderComp");
const filterManager_1 = require("./filter/filterManager");
const valueService_1 = require("./valueService/valueService");
const eventService_1 = require("./eventService");
const gridBodyComp_1 = require("./gridBodyComp/gridBodyComp");
const gridApi_1 = require("./gridApi");
const columnFactory_1 = require("./columns/columnFactory");
const displayedGroupCreator_1 = require("./columns/displayedGroupCreator");
const expressionService_1 = require("./valueService/expressionService");
const templateService_1 = require("./templateService");
const popupService_1 = require("./widgets/popupService");
const logger_1 = require("./logger");
const columnUtils_1 = require("./columns/columnUtils");
const autoWidthCalculator_1 = require("./rendering/autoWidthCalculator");
const horizontalResizeService_1 = require("./headerRendering/common/horizontalResizeService");
const context_1 = require("./context/context");
const gridComp_1 = require("./gridComp/gridComp");
const dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
const dragService_1 = require("./dragAndDrop/dragService");
const sortController_1 = require("./sortController");
const focusService_1 = require("./focusService");
const mouseEventService_1 = require("./gridBodyComp/mouseEventService");
const cellNavigationService_1 = require("./cellNavigationService");
const valueFormatterService_1 = require("./rendering/valueFormatterService");
const agCheckbox_1 = require("./widgets/agCheckbox");
const agRadioButton_1 = require("./widgets/agRadioButton");
const vanillaFrameworkOverrides_1 = require("./vanillaFrameworkOverrides");
const scrollVisibleService_1 = require("./gridBodyComp/scrollVisibleService");
const stylingService_1 = require("./styling/stylingService");
const columnHoverService_1 = require("./rendering/columnHoverService");
const columnAnimationService_1 = require("./rendering/columnAnimationService");
const autoGroupColService_1 = require("./columns/autoGroupColService");
const paginationProxy_1 = require("./pagination/paginationProxy");
const paginationAutoPageSizeService_1 = require("./pagination/paginationAutoPageSizeService");
const valueCache_1 = require("./valueService/valueCache");
const changeDetectionService_1 = require("./valueService/changeDetectionService");
const alignedGridsService_1 = require("./alignedGridsService");
const userComponentFactory_1 = require("./components/framework/userComponentFactory");
const userComponentRegistry_1 = require("./components/framework/userComponentRegistry");
const agComponentUtils_1 = require("./components/framework/agComponentUtils");
const componentMetadataProvider_1 = require("./components/framework/componentMetadataProvider");
const beans_1 = require("./rendering/beans");
const environment_1 = require("./environment");
const animationFrameService_1 = require("./misc/animationFrameService");
const navigationService_1 = require("./gridBodyComp/navigationService");
const rowContainerHeightService_1 = require("./rendering/rowContainerHeightService");
const selectableService_1 = require("./rowNodes/selectableService");
const paginationComp_1 = require("./pagination/paginationComp");
const resizeObserverService_1 = require("./misc/resizeObserverService");
const overlayWrapperComponent_1 = require("./rendering/overlays/overlayWrapperComponent");
const agGroupComponent_1 = require("./widgets/agGroupComponent");
const agDialog_1 = require("./widgets/agDialog");
const agPanel_1 = require("./widgets/agPanel");
const agInputTextField_1 = require("./widgets/agInputTextField");
const agInputTextArea_1 = require("./widgets/agInputTextArea");
const agSlider_1 = require("./widgets/agSlider");
const agInputNumberField_1 = require("./widgets/agInputNumberField");
const agInputRange_1 = require("./widgets/agInputRange");
const agSelect_1 = require("./widgets/agSelect");
const agRichSelect_1 = require("./widgets/agRichSelect");
const agToggleButton_1 = require("./widgets/agToggleButton");
const rowPositionUtils_1 = require("./entities/rowPositionUtils");
const cellPositionUtils_1 = require("./entities/cellPositionUtils");
const pinnedRowModel_1 = require("./pinnedRowModel/pinnedRowModel");
const moduleRegistry_1 = require("./modules/moduleRegistry");
const moduleNames_1 = require("./modules/moduleNames");
const undoRedoService_1 = require("./undoRedo/undoRedoService");
const agStackComponentsRegistry_1 = require("./components/agStackComponentsRegistry");
const headerPosition_1 = require("./headerRendering/common/headerPosition");
const headerNavigationService_1 = require("./headerRendering/common/headerNavigationService");
const generic_1 = require("./utils/generic");
const columnDefFactory_1 = require("./columns/columnDefFactory");
const rowCssClassCalculator_1 = require("./rendering/row/rowCssClassCalculator");
const rowNodeBlockLoader_1 = require("./rowNodeCache/rowNodeBlockLoader");
const rowNodeSorter_1 = require("./rowNodes/rowNodeSorter");
const ctrlsService_1 = require("./ctrlsService");
const ctrlsFactory_1 = require("./ctrlsFactory");
const fakeHScrollComp_1 = require("./gridBodyComp/fakeHScrollComp");
const pinnedWidthService_1 = require("./gridBodyComp/pinnedWidthService");
const rowContainerComp_1 = require("./gridBodyComp/rowContainer/rowContainerComp");
const rowNodeEventThrottle_1 = require("./entities/rowNodeEventThrottle");
const standardMenu_1 = require("./headerRendering/cells/column/standardMenu");
const sortIndicatorComp_1 = require("./headerRendering/cells/column/sortIndicatorComp");
const gridOptionsService_1 = require("./gridOptionsService");
const localeService_1 = require("./localeService");
const fakeVScrollComp_1 = require("./gridBodyComp/fakeVScrollComp");
const dataTypeService_1 = require("./columns/dataTypeService");
const agInputDateField_1 = require("./widgets/agInputDateField");
const valueParserService_1 = require("./valueService/valueParserService");
const agAutocomplete_1 = require("./widgets/agAutocomplete");
const quickFilterService_1 = require("./filter/quickFilterService");
const function_1 = require("./utils/function");
const syncService_1 = require("./syncService");
const overlayService_1 = require("./rendering/overlays/overlayService");
const stateService_1 = require("./misc/stateService");
const expansionService_1 = require("./misc/expansionService");
const validationService_1 = require("./validation/validationService");
const apiEventService_1 = require("./misc/apiEventService");
const pageSizeSelectorComp_1 = require("./pagination/pageSizeSelector/pageSizeSelectorComp");
/**
 * Creates a grid inside the provided HTML element.
 * @param eGridDiv Parent element to contain the grid.
 * @param gridOptions Configuration for the grid.
 * @param params Individually register AG Grid Modules to this grid.
 * @returns api to be used to interact with the grid.
 */
function createGrid(eGridDiv, gridOptions, params) {
    if (!gridOptions) {
        (0, function_1.errorOnce)('No gridOptions provided to createGrid');
        return {};
    }
    // Ensure we do not mutate the provided gridOptions
    const shallowCopy = gridOptionsService_1.GridOptionsService.getCoercedGridOptions(gridOptions);
    const api = new GridCoreCreator().create(eGridDiv, shallowCopy, context => {
        const gridComp = new gridComp_1.GridComp(eGridDiv);
        context.createBean(gridComp);
    }, undefined, params);
    // @deprecated v31 api / columnApi no longer mutated onto the provided gridOptions
    // Instead we place a getter that will log an error when accessed and direct users to the docs
    // Only apply for direct usages of createGrid, not for frameworks
    if (!Object.isFrozen(gridOptions) && !(params === null || params === void 0 ? void 0 : params.frameworkOverrides)) {
        const apiUrl = 'https://ag-grid.com/javascript-data-grid/grid-interface/#grid-api';
        Object.defineProperty(gridOptions, 'api', {
            get: () => {
                (0, function_1.errorOnce)(`gridOptions.api is no longer supported. See ${apiUrl}.`);
                return undefined;
            },
            configurable: true,
        });
        Object.defineProperty(gridOptions, 'columnApi', {
            get: () => {
                (0, function_1.errorOnce)(`gridOptions.columnApi is no longer supported and all methods moved to the grid api. See ${apiUrl}.`);
                return undefined;
            },
            configurable: true,
        });
    }
    return api;
}
exports.createGrid = createGrid;
/**
 * @deprecated v31 use createGrid() instead
 */
class Grid {
    constructor(eGridDiv, gridOptions, params) {
        (0, function_1.warnOnce)('Since v31 new Grid(...) is deprecated. Use createGrid instead: `const gridApi = createGrid(...)`. The grid api is returned from createGrid and will not be available on gridOptions.');
        if (!gridOptions) {
            (0, function_1.errorOnce)('No gridOptions provided to the grid');
            return;
        }
        this.gridOptions = gridOptions;
        const api = new GridCoreCreator().create(eGridDiv, gridOptions, (context) => {
            const gridComp = new gridComp_1.GridComp(eGridDiv);
            const bean = context.createBean(gridComp);
            bean.addDestroyFunc(() => {
                this.destroy();
            });
        }, undefined, params);
        // Maintain existing behaviour by mutating gridOptions with the apis for deprecated new Grid()
        this.gridOptions.api = api;
        this.gridOptions.columnApi = new columnApi_1.ColumnApi(api);
    }
    destroy() {
        var _a;
        if (this.gridOptions) {
            (_a = this.gridOptions.api) === null || _a === void 0 ? void 0 : _a.destroy();
            // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
            // remove the references in case the user keeps the grid options, we want the rest
            // of the grid to be picked up by the garbage collector
            delete this.gridOptions.api;
            delete this.gridOptions.columnApi;
        }
    }
}
exports.Grid = Grid;
let nextGridId = 1;
// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
class GridCoreCreator {
    create(eGridDiv, gridOptions, createUi, acceptChanges, params) {
        var _a;
        // Shallow copy to prevent user provided gridOptions from being mutated.
        const debug = !!gridOptions.debug;
        const gridId = (_a = gridOptions.gridId) !== null && _a !== void 0 ? _a : String(nextGridId++);
        const registeredModules = this.getRegisteredModules(params, gridId);
        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);
        if (!beanClasses) {
            // Detailed error message will have been printed by createBeansList
            (0, function_1.errorOnce)('Failed to create grid.');
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined;
        }
        const contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug,
            gridId: gridId,
        };
        const contextLogger = new logger_1.Logger('Context', () => contextParams.debug);
        const context = new context_1.Context(contextParams, contextLogger);
        const beans = context.getBean('beans');
        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);
        createUi(context);
        beans.syncService.start();
        if (acceptChanges) {
            acceptChanges(context);
        }
        return beans.gridApi;
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
        const registered = moduleRegistry_1.ModuleRegistry.__getRegisteredModules(gridId);
        const allModules = [];
        const mapNames = {};
        // adds to list and removes duplicates
        const addModule = (moduleBased, mod, gridId) => {
            const addIndividualModule = (currentModule) => {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    moduleRegistry_1.ModuleRegistry.__register(currentModule, moduleBased, gridId);
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
            registered.forEach(m => addModule(!moduleRegistry_1.ModuleRegistry.__isPackageBased(), m, undefined));
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
        if ((0, generic_1.missing)(frameworkOverrides)) {
            frameworkOverrides = new vanillaFrameworkOverrides_1.VanillaFrameworkOverrides();
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
            { componentName: 'AgCheckbox', componentClass: agCheckbox_1.AgCheckbox },
            { componentName: 'AgRadioButton', componentClass: agRadioButton_1.AgRadioButton },
            { componentName: 'AgToggleButton', componentClass: agToggleButton_1.AgToggleButton },
            { componentName: 'AgInputTextField', componentClass: agInputTextField_1.AgInputTextField },
            { componentName: 'AgInputTextArea', componentClass: agInputTextArea_1.AgInputTextArea },
            { componentName: 'AgInputNumberField', componentClass: agInputNumberField_1.AgInputNumberField },
            { componentName: 'AgInputDateField', componentClass: agInputDateField_1.AgInputDateField },
            { componentName: 'AgInputRange', componentClass: agInputRange_1.AgInputRange },
            { componentName: 'AgRichSelect', componentClass: agRichSelect_1.AgRichSelect },
            { componentName: 'AgSelect', componentClass: agSelect_1.AgSelect },
            { componentName: 'AgSlider', componentClass: agSlider_1.AgSlider },
            { componentName: 'AgGridBody', componentClass: gridBodyComp_1.GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: gridHeaderComp_1.GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: sortIndicatorComp_1.SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: paginationComp_1.PaginationComp },
            { componentName: 'AgPageSizeSelector', componentClass: pageSizeSelectorComp_1.PageSizeSelectorComp },
            { componentName: 'AgOverlayWrapper', componentClass: overlayWrapperComponent_1.OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: agGroupComponent_1.AgGroupComponent },
            { componentName: 'AgPanel', componentClass: agPanel_1.AgPanel },
            { componentName: 'AgDialog', componentClass: agDialog_1.AgDialog },
            { componentName: 'AgRowContainer', componentClass: rowContainerComp_1.RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: fakeHScrollComp_1.FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: fakeVScrollComp_1.FakeVScrollComp },
            { componentName: 'AgAutocomplete', componentClass: agAutocomplete_1.AgAutocomplete },
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
            clientSide: moduleNames_1.ModuleNames.ClientSideRowModelModule,
            infinite: moduleNames_1.ModuleNames.InfiniteRowModelModule,
            serverSide: moduleNames_1.ModuleNames.ServerSideRowModelModule,
            viewport: moduleNames_1.ModuleNames.ViewportRowModelModule
        };
        if (!rowModelModuleNames[rowModelType]) {
            (0, function_1.errorOnce)('Could not find row model for rowModelType = ' + rowModelType);
            return;
        }
        if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(rowModelModuleNames[rowModelType], `rowModelType = '${rowModelType}'`, gridId)) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        const beans = [
            beans_1.Beans, rowPositionUtils_1.RowPositionUtils, cellPositionUtils_1.CellPositionUtils, headerPosition_1.HeaderPositionUtils,
            paginationAutoPageSizeService_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
            componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentFactory_1.UserComponentFactory,
            rowContainerHeightService_1.RowContainerHeightService, horizontalResizeService_1.HorizontalResizeService, localeService_1.LocaleService, validationService_1.ValidationService,
            pinnedRowModel_1.PinnedRowModel, dragService_1.DragService, displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsService_1.GridOptionsService,
            popupService_1.PopupService, selectionService_1.SelectionService, filterManager_1.FilterManager, columnModel_1.ColumnModel, headerNavigationService_1.HeaderNavigationService,
            paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, expressionService_1.ExpressionService, columnFactory_1.ColumnFactory, templateService_1.TemplateService,
            alignedGridsService_1.AlignedGridsService, navigationService_1.NavigationService, valueCache_1.ValueCache, valueService_1.ValueService, logger_1.LoggerFactory,
            columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, standardMenu_1.StandardMenuFactory, dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi,
            focusService_1.FocusService, mouseEventService_1.MouseEventService, environment_1.Environment, cellNavigationService_1.CellNavigationService, valueFormatterService_1.ValueFormatterService,
            stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService, sortController_1.SortController, columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService,
            selectableService_1.SelectableService, autoGroupColService_1.AutoGroupColService, changeDetectionService_1.ChangeDetectionService, animationFrameService_1.AnimationFrameService,
            undoRedoService_1.UndoRedoService, agStackComponentsRegistry_1.AgStackComponentsRegistry, columnDefFactory_1.ColumnDefFactory,
            rowCssClassCalculator_1.RowCssClassCalculator, rowNodeBlockLoader_1.RowNodeBlockLoader, rowNodeSorter_1.RowNodeSorter, ctrlsService_1.CtrlsService,
            pinnedWidthService_1.PinnedWidthService, rowNodeEventThrottle_1.RowNodeEventThrottle, ctrlsFactory_1.CtrlsFactory, dataTypeService_1.DataTypeService, valueParserService_1.ValueParserService,
            quickFilterService_1.QuickFilterService, syncService_1.SyncService, overlayService_1.OverlayService, stateService_1.StateService, expansionService_1.ExpansionService,
            apiEventService_1.ApiEventService,
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
}
exports.GridCoreCreator = GridCoreCreator;
