/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserComponentFactory = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const utils_1 = require("../../utils");
const object_1 = require("../../utils/object");
const componentTypes_1 = require("./componentTypes");
const floatingFilterMapper_1 = require("../../filter/floating/floatingFilterMapper");
const moduleNames_1 = require("../../modules/moduleNames");
const moduleRegistry_1 = require("../../modules/moduleRegistry");
const function_1 = require("../../utils/function");
let UserComponentFactory = class UserComponentFactory extends beanStub_1.BeanStub {
    getHeaderCompDetails(colDef, params) {
        return this.getCompDetails(colDef, componentTypes_1.HeaderComponent, 'agColumnHeader', params);
    }
    getHeaderGroupCompDetails(params) {
        const colGroupDef = params.columnGroup.getColGroupDef();
        return this.getCompDetails(colGroupDef, componentTypes_1.HeaderGroupComponent, 'agColumnGroupHeader', params);
    }
    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    getFullWidthCellRendererDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.FullWidth, null, params, true);
    }
    getFullWidthLoadingCellRendererDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.FullWidthLoading, 'agLoadingCellRenderer', params, true);
    }
    getFullWidthGroupCellRendererDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.FullWidthGroup, 'agGroupRowRenderer', params, true);
    }
    getFullWidthDetailCellRendererDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.FullWidthDetail, 'agDetailCellRenderer', params, true);
    }
    // CELL RENDERER
    getInnerRendererDetails(def, params) {
        return this.getCompDetails(def, componentTypes_1.InnerRendererComponent, null, params);
    }
    getFullWidthGroupRowInnerCellRenderer(def, params) {
        return this.getCompDetails(def, componentTypes_1.InnerRendererComponent, null, params);
    }
    getCellRendererDetails(def, params) {
        return this.getCompDetails(def, componentTypes_1.CellRendererComponent, null, params);
    }
    // CELL EDITOR
    getCellEditorDetails(def, params) {
        return this.getCompDetails(def, componentTypes_1.CellEditorComponent, 'agCellEditor', params, true);
    }
    // FILTER
    getFilterDetails(def, params, defaultFilter) {
        return this.getCompDetails(def, componentTypes_1.FilterComponent, defaultFilter, params, true);
    }
    getDateCompDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.DateComponent, 'agDateInput', params, true);
    }
    getLoadingOverlayCompDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.LoadingOverlayComponent, 'agLoadingOverlay', params, true);
    }
    getNoRowsOverlayCompDetails(params) {
        return this.getCompDetails(this.gridOptions, componentTypes_1.NoRowsOverlayComponent, 'agNoRowsOverlay', params, true);
    }
    getTooltipCompDetails(params) {
        return this.getCompDetails(params.colDef, componentTypes_1.TooltipComponent, 'agTooltipComponent', params, true);
    }
    getSetFilterCellRendererDetails(def, params) {
        return this.getCompDetails(def, componentTypes_1.CellRendererComponent, null, params);
    }
    getFloatingFilterCompDetails(def, params, defaultFloatingFilter) {
        return this.getCompDetails(def, componentTypes_1.FloatingFilterComponent, defaultFloatingFilter, params);
    }
    getToolPanelCompDetails(toolPanelDef, params) {
        return this.getCompDetails(toolPanelDef, componentTypes_1.ToolPanelComponent, null, params, true);
    }
    getStatusPanelCompDetails(def, params) {
        return this.getCompDetails(def, componentTypes_1.StatusPanelComponent, null, params, true);
    }
    getCompDetails(defObject, type, defaultName, params, mandatory = false) {
        const { propertyName, cellRenderer } = type;
        let { compName, jsComp, fwComp, paramsFromSelector, popupFromSelector, popupPositionFromSelector } = this.getCompKeys(defObject, type, params);
        const lookupFromRegistry = (key) => {
            const item = this.userComponentRegistry.retrieve(propertyName, key);
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
                console.error(`AG Grid: Could not find component ${compName}, did you forget to configure this component?`);
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
            popupFromSelector,
            popupPositionFromSelector,
            newAgStackInstance: () => this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type)
        };
    }
    getCompKeys(defObject, type, params) {
        const { propertyName } = type;
        let compName;
        let jsComp;
        let fwComp;
        let paramsFromSelector;
        let popupFromSelector;
        let popupPositionFromSelector;
        // there are two types of js comps, class based and func based. we can only check for
        // class based, by checking if getGui() exists. no way to differentiate js func based vs eg react func based
        // const isJsClassComp = (comp: any) => this.agComponentUtils.doesImplementIComponent(comp);
        // const fwActive = this.frameworkComponentWrapper != null;
        // pull from defObject if available
        if (defObject) {
            const defObjectAny = defObject;
            // if selector, use this
            const selectorFunc = defObjectAny[propertyName + 'Selector'];
            const selectorRes = selectorFunc ? selectorFunc(params) : null;
            const assignComp = (providedJsComp, providedFwComp) => {
                const xxxFrameworkDeprecatedWarn = () => {
                    const warningMessage = `AG Grid: As of v27, the property ${propertyName}Framework is deprecated. The property ${propertyName} can now be used for JavaScript AND Framework Components.`;
                    function_1.doOnce(() => console.warn(warningMessage), `UserComponentFactory.${propertyName}FrameworkDeprecated`);
                };
                if (typeof providedJsComp === 'string') {
                    compName = providedJsComp;
                }
                else if (typeof providedFwComp === 'string') {
                    xxxFrameworkDeprecatedWarn();
                    compName = providedFwComp;
                    // comp===true for filters, which means use the default comp
                }
                else if (providedJsComp != null && providedJsComp !== true) {
                    const isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(providedJsComp);
                    if (isFwkComp) {
                        fwComp = providedJsComp;
                    }
                    else {
                        jsComp = providedJsComp;
                    }
                }
                else if (providedFwComp != null) {
                    xxxFrameworkDeprecatedWarn();
                    fwComp = providedFwComp;
                }
            };
            if (selectorRes) {
                if (selectorRes.frameworkComponent != null) {
                    const warningMessage = `AG Grid: As of v27, the return for ${propertyName}Selector has attributes [component, params] only. The attribute frameworkComponent is deprecated. You should now return back Framework Components using the 'component' attribute and the grid works out if it's a framework component or not.`;
                    function_1.doOnce(() => console.warn(warningMessage), `UserComponentFactory.${propertyName}FrameworkSelectorDeprecated`);
                    assignComp(selectorRes.frameworkComponent, undefined);
                }
                else {
                    assignComp(selectorRes.component, undefined);
                }
                paramsFromSelector = selectorRes.params;
                popupFromSelector = selectorRes.popup;
                popupPositionFromSelector = selectorRes.popupPosition;
            }
            else {
                // if no selector, or result of selector is empty, take from defObject
                assignComp(defObjectAny[propertyName], defObjectAny[propertyName + 'Framework']);
            }
        }
        return { compName, jsComp, fwComp, paramsFromSelector, popupFromSelector, popupPositionFromSelector };
    }
    newAgStackInstance(ComponentClass, componentFromFramework, params, type) {
        const propertyName = type.propertyName;
        const jsComponent = !componentFromFramework;
        // using javascript component
        let instance;
        if (jsComponent) {
            instance = new ComponentClass();
        }
        else {
            // Using framework component
            const thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
            instance = this.frameworkComponentWrapper.wrap(ComponentClass, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, type);
        }
        const deferredInit = this.initComponent(instance, params);
        if (deferredInit == null) {
            return utils_1.AgPromise.resolve(instance);
        }
        return deferredInit.then(() => instance);
    }
    // used by Floating Filter
    mergeParamsWithApplicationProvidedParams(defObject, type, paramsFromGrid, paramsFromSelector = null) {
        const params = {
            context: this.gridOptionsService.context,
            columnApi: this.gridOptionsService.columnApi,
            api: this.gridOptionsService.api
        };
        object_1.mergeDeep(params, paramsFromGrid);
        // pull user params from either the old prop name and new prop name
        // eg either cellRendererParams and cellCompParams
        const defObjectAny = defObject;
        const userParams = defObjectAny && defObjectAny[type.propertyName + 'Params'];
        if (typeof userParams === 'function') {
            const userParamsFromFunc = userParams(paramsFromGrid);
            object_1.mergeDeep(params, userParamsFromFunc);
        }
        else if (typeof userParams === 'object') {
            object_1.mergeDeep(params, userParams);
        }
        object_1.mergeDeep(params, paramsFromSelector);
        return params;
    }
    initComponent(component, params) {
        this.context.createBean(component);
        if (component.init == null) {
            return;
        }
        return component.init(params);
    }
    getDefaultFloatingFilterType(def) {
        if (def == null) {
            return null;
        }
        let defaultFloatingFilterType = null;
        let { compName, jsComp, fwComp } = this.getCompKeys(def, componentTypes_1.FilterComponent);
        if (compName) {
            // will be undefined if not in the map
            defaultFloatingFilterType = floatingFilterMapper_1.FloatingFilterMapper.getFloatingFilterType(compName);
        }
        else {
            const usingDefaultFilter = (jsComp == null && fwComp == null) && (def.filter === true);
            if (usingDefaultFilter) {
                const setFilterModuleLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.SetFilterModule);
                defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
            }
        }
        return defaultFloatingFilterType;
    }
};
__decorate([
    context_1.Autowired('gridOptions')
], UserComponentFactory.prototype, "gridOptions", void 0);
__decorate([
    context_1.Autowired('agComponentUtils')
], UserComponentFactory.prototype, "agComponentUtils", void 0);
__decorate([
    context_1.Autowired('componentMetadataProvider')
], UserComponentFactory.prototype, "componentMetadataProvider", void 0);
__decorate([
    context_1.Autowired('userComponentRegistry')
], UserComponentFactory.prototype, "userComponentRegistry", void 0);
__decorate([
    context_1.Optional('frameworkComponentWrapper')
], UserComponentFactory.prototype, "frameworkComponentWrapper", void 0);
UserComponentFactory = __decorate([
    context_1.Bean('userComponentFactory')
], UserComponentFactory);
exports.UserComponentFactory = UserComponentFactory;
