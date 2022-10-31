/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gridOptionsWrapper_1 = require("./gridOptionsWrapper");
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
const events_1 = require("./events");
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
const constants_1 = require("./constants/constants");
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
const agColorPicker_1 = require("./widgets/agColorPicker");
const agInputNumberField_1 = require("./widgets/agInputNumberField");
const agInputRange_1 = require("./widgets/agInputRange");
const agSelect_1 = require("./widgets/agSelect");
const agAngleSelect_1 = require("./widgets/agAngleSelect");
const agToggleButton_1 = require("./widgets/agToggleButton");
const rowPosition_1 = require("./entities/rowPosition");
const cellPosition_1 = require("./entities/cellPosition");
const pinnedRowModel_1 = require("./pinnedRowModel/pinnedRowModel");
const moduleRegistry_1 = require("./modules/moduleRegistry");
const moduleNames_1 = require("./modules/moduleNames");
const undoRedoService_1 = require("./undoRedo/undoRedoService");
const agStackComponentsRegistry_1 = require("./components/agStackComponentsRegistry");
const headerPosition_1 = require("./headerRendering/common/headerPosition");
const headerNavigationService_1 = require("./headerRendering/common/headerNavigationService");
const generic_1 = require("./utils/generic");
const object_1 = require("./utils/object");
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
// creates JavaScript vanilla Grid, including JavaScript (ag-stack) components, which can
// be wrapped by the framework wrappers
class Grid {
    constructor(eGridDiv, gridOptions, params) {
        if (!gridOptions) {
            console.error('AG Grid: no gridOptions provided to the grid');
            return;
        }
        this.gridOptions = gridOptions;
        new GridCoreCreator().create(eGridDiv, gridOptions, context => {
            const gridComp = new gridComp_1.GridComp(eGridDiv);
            context.createBean(gridComp);
        }, undefined, params);
    }
    destroy() {
        if (this.gridOptions && this.gridOptions.api) {
            this.gridOptions.api.destroy();
        }
    }
}
exports.Grid = Grid;
// created services of grid only, no UI, so frameworks can use this if providing
// their own UI
class GridCoreCreator {
    create(eGridDiv, gridOptions, createUi, acceptChanges, params) {
        const debug = !!gridOptions.debug;
        const registeredModules = this.getRegisteredModules(params);
        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);
        if (!beanClasses) {
            return;
        } // happens when no row model found
        const contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug
        };
        const logger = new logger_1.Logger('AG Grid', () => gridOptions.debug);
        const contextLogger = new logger_1.Logger('Context', () => contextParams.debug);
        const context = new context_1.Context(contextParams, contextLogger);
        const beans = context.getBean('beans');
        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);
        createUi(context);
        // we wait until the UI has finished initialising before setting in columns and rows
        beans.ctrlsService.whenReady(() => {
            this.setColumnsAndData(beans);
            this.dispatchGridReadyEvent(beans);
            const isEnterprise = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule);
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
    getRegisteredModules(params) {
        const passedViaConstructor = params ? params.modules : null;
        const registered = moduleRegistry_1.ModuleRegistry.getRegisteredModules();
        const allModules = [];
        const mapNames = {};
        // adds to list and removes duplicates
        function addModule(moduleBased, mod) {
            function addIndividualModule(currentModule) {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    moduleRegistry_1.ModuleRegistry.register(currentModule, moduleBased);
                }
            }
            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach(addModule.bind(null, moduleBased));
            }
        }
        if (passedViaConstructor) {
            passedViaConstructor.forEach(addModule.bind(null, true));
        }
        if (registered) {
            registered.forEach(addModule.bind(null, !moduleRegistry_1.ModuleRegistry.isPackageBased()));
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
        if (generic_1.missing(frameworkOverrides)) {
            frameworkOverrides = new vanillaFrameworkOverrides_1.VanillaFrameworkOverrides();
        }
        const seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            globalEventListener: params ? params.globalEventListener : null,
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
            { componentName: 'AgInputRange', componentClass: agInputRange_1.AgInputRange },
            { componentName: 'AgSelect', componentClass: agSelect_1.AgSelect },
            { componentName: 'AgSlider', componentClass: agSlider_1.AgSlider },
            { componentName: 'AgAngleSelect', componentClass: agAngleSelect_1.AgAngleSelect },
            { componentName: 'AgColorPicker', componentClass: agColorPicker_1.AgColorPicker },
            { componentName: 'AgGridBody', componentClass: gridBodyComp_1.GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: gridHeaderComp_1.GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: sortIndicatorComp_1.SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: paginationComp_1.PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: overlayWrapperComponent_1.OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: agGroupComponent_1.AgGroupComponent },
            { componentName: 'AgPanel', componentClass: agPanel_1.AgPanel },
            { componentName: 'AgDialog', componentClass: agDialog_1.AgDialog },
            { componentName: 'AgRowContainer', componentClass: rowContainerComp_1.RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: fakeHScrollComp_1.FakeHScrollComp }
        ];
        const moduleAgStackComps = this.extractModuleEntity(registeredModules, (module) => module.agStackComponents ? module.agStackComponents : []);
        components = components.concat(moduleAgStackComps);
        return components;
    }
    createBeansList(rowModelType, registeredModules) {
        const rowModelClass = this.getRowModelClass(rowModelType, registeredModules);
        if (!rowModelClass) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        const beans = [
            rowModelClass, beans_1.Beans, rowPosition_1.RowPositionUtils, cellPosition_1.CellPositionUtils, headerPosition_1.HeaderPositionUtils,
            paginationAutoPageSizeService_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
            componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentFactory_1.UserComponentFactory,
            rowContainerHeightService_1.RowContainerHeightService, horizontalResizeService_1.HorizontalResizeService,
            pinnedRowModel_1.PinnedRowModel, dragService_1.DragService, displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper,
            popupService_1.PopupService, selectionService_1.SelectionService, filterManager_1.FilterManager, columnModel_1.ColumnModel, headerNavigationService_1.HeaderNavigationService,
            paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, expressionService_1.ExpressionService, columnFactory_1.ColumnFactory, templateService_1.TemplateService,
            alignedGridsService_1.AlignedGridsService, navigationService_1.NavigationService, valueCache_1.ValueCache, valueService_1.ValueService, logger_1.LoggerFactory,
            columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, standardMenu_1.StandardMenuFactory, dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi,
            focusService_1.FocusService, mouseEventService_1.MouseEventService, environment_1.Environment, cellNavigationService_1.CellNavigationService, valueFormatterService_1.ValueFormatterService,
            stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService, sortController_1.SortController, columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService,
            selectableService_1.SelectableService, autoGroupColService_1.AutoGroupColService, changeDetectionService_1.ChangeDetectionService, animationFrameService_1.AnimationFrameService,
            undoRedoService_1.UndoRedoService, agStackComponentsRegistry_1.AgStackComponentsRegistry, columnDefFactory_1.ColumnDefFactory,
            rowCssClassCalculator_1.RowCssClassCalculator, rowNodeBlockLoader_1.RowNodeBlockLoader, rowNodeSorter_1.RowNodeSorter, ctrlsService_1.CtrlsService,
            pinnedWidthService_1.PinnedWidthService, rowNodeEventThrottle_1.RowNodeEventThrottle, ctrlsFactory_1.CtrlsFactory
        ];
        const moduleBeans = this.extractModuleEntity(registeredModules, (module) => module.beans ? module.beans : []);
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
        const columnDefs = beans.gridOptionsWrapper.getColumnDefs();
        beans.columnModel.setColumnDefs(columnDefs || [], "gridInitializing");
        beans.rowModel.start();
    }
    dispatchGridReadyEvent(beans) {
        const readyEvent = {
            type: events_1.Events.EVENT_GRID_READY,
        };
        beans.eventService.dispatchEvent(readyEvent);
    }
    getRowModelClass(rowModelType, registeredModules) {
        // default to client side
        if (!rowModelType) {
            rowModelType = constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        const rowModelClasses = {};
        registeredModules.forEach(module => {
            object_1.iterateObject(module.rowModels, (key, value) => {
                rowModelClasses[key] = value;
            });
        });
        const rowModelClass = rowModelClasses[rowModelType];
        if (generic_1.exists(rowModelClass)) {
            return rowModelClass;
        }
        if (moduleRegistry_1.ModuleRegistry.isPackageBased()) {
            if ([constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT, constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE].includes(rowModelType)) {
                // If package based only the enterprise row models could be missing.
                console.error(`AG Grid: Row Model "${rowModelType}" not found. Please ensure the package 'ag-grid-enterprise' is imported. Please see: https://www.ag-grid.com/javascript-grid/packages/`);
            }
            else {
                console.error('AG Grid: could not find row model for rowModelType ' + rowModelType);
            }
        }
        else {
            if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_INFINITE) {
                console.error(`AG Grid: Row Model "Infinite" not found. Please ensure the ${moduleNames_1.ModuleNames.InfiniteRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            }
            else if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT) {
                console.error(`AG Grid: Row Model "Viewport" not found. Please ensure the AG Grid Enterprise Module ${moduleNames_1.ModuleNames.ViewportRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            }
            else if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
                console.error(`AG Grid: Row Model "Server Side" not found. Please ensure the AG Grid Enterprise Module ${moduleNames_1.ModuleNames.ServerSideRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            }
            else if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
                console.error(`AG Grid: Row Model "Client Side" not found. Please ensure the ${moduleNames_1.ModuleNames.ClientSideRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            }
            else {
                console.error('AG Grid: could not find row model for rowModelType ' + rowModelType);
            }
        }
    }
}
exports.GridCoreCreator = GridCoreCreator;
