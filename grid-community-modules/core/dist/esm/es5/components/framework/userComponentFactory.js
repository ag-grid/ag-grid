/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, Optional } from "../../context/context";
import { AgPromise } from "../../utils";
import { mergeDeep } from '../../utils/object';
import { CellEditorComponent, CellRendererComponent, DateComponent, FilterComponent, FloatingFilterComponent, FullWidth, FullWidthDetail, FullWidthGroup, FullWidthLoading, HeaderComponent, HeaderGroupComponent, InnerRendererComponent, LoadingOverlayComponent, NoRowsOverlayComponent, StatusPanelComponent, ToolPanelComponent, TooltipComponent } from "./componentTypes";
import { FloatingFilterMapper } from '../../filter/floating/floatingFilterMapper';
import { ModuleNames } from '../../modules/moduleNames';
import { ModuleRegistry } from '../../modules/moduleRegistry';
import { doOnce } from "../../utils/function";
var UserComponentFactory = /** @class */ (function (_super) {
    __extends(UserComponentFactory, _super);
    function UserComponentFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserComponentFactory.prototype.getHeaderCompDetails = function (colDef, params) {
        return this.getCompDetails(colDef, HeaderComponent, 'agColumnHeader', params);
    };
    UserComponentFactory.prototype.getHeaderGroupCompDetails = function (params) {
        var colGroupDef = params.columnGroup.getColGroupDef();
        return this.getCompDetails(colGroupDef, HeaderGroupComponent, 'agColumnGroupHeader', params);
    };
    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    UserComponentFactory.prototype.getFullWidthCellRendererDetails = function (params) {
        return this.getCompDetails(this.gridOptions, FullWidth, null, params, true);
    };
    UserComponentFactory.prototype.getFullWidthLoadingCellRendererDetails = function (params) {
        return this.getCompDetails(this.gridOptions, FullWidthLoading, 'agLoadingCellRenderer', params, true);
    };
    UserComponentFactory.prototype.getFullWidthGroupCellRendererDetails = function (params) {
        return this.getCompDetails(this.gridOptions, FullWidthGroup, 'agGroupRowRenderer', params, true);
    };
    UserComponentFactory.prototype.getFullWidthDetailCellRendererDetails = function (params) {
        return this.getCompDetails(this.gridOptions, FullWidthDetail, 'agDetailCellRenderer', params, true);
    };
    // CELL RENDERER
    UserComponentFactory.prototype.getInnerRendererDetails = function (def, params) {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    };
    UserComponentFactory.prototype.getFullWidthGroupRowInnerCellRenderer = function (def, params) {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    };
    UserComponentFactory.prototype.getCellRendererDetails = function (def, params) {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    };
    // CELL EDITOR
    UserComponentFactory.prototype.getCellEditorDetails = function (def, params) {
        return this.getCompDetails(def, CellEditorComponent, 'agCellEditor', params, true);
    };
    // FILTER
    UserComponentFactory.prototype.getFilterDetails = function (def, params, defaultFilter) {
        return this.getCompDetails(def, FilterComponent, defaultFilter, params, true);
    };
    UserComponentFactory.prototype.getDateCompDetails = function (params) {
        return this.getCompDetails(this.gridOptions, DateComponent, 'agDateInput', params, true);
    };
    UserComponentFactory.prototype.getLoadingOverlayCompDetails = function (params) {
        return this.getCompDetails(this.gridOptions, LoadingOverlayComponent, 'agLoadingOverlay', params, true);
    };
    UserComponentFactory.prototype.getNoRowsOverlayCompDetails = function (params) {
        return this.getCompDetails(this.gridOptions, NoRowsOverlayComponent, 'agNoRowsOverlay', params, true);
    };
    UserComponentFactory.prototype.getTooltipCompDetails = function (params) {
        return this.getCompDetails(params.colDef, TooltipComponent, 'agTooltipComponent', params, true);
    };
    UserComponentFactory.prototype.getSetFilterCellRendererDetails = function (def, params) {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    };
    UserComponentFactory.prototype.getFloatingFilterCompDetails = function (def, params, defaultFloatingFilter) {
        return this.getCompDetails(def, FloatingFilterComponent, defaultFloatingFilter, params);
    };
    UserComponentFactory.prototype.getToolPanelCompDetails = function (toolPanelDef, params) {
        return this.getCompDetails(toolPanelDef, ToolPanelComponent, null, params, true);
    };
    UserComponentFactory.prototype.getStatusPanelCompDetails = function (def, params) {
        return this.getCompDetails(def, StatusPanelComponent, null, params, true);
    };
    UserComponentFactory.prototype.getCompDetails = function (defObject, type, defaultName, params, mandatory) {
        var _this = this;
        if (mandatory === void 0) { mandatory = false; }
        var propertyName = type.propertyName, cellRenderer = type.cellRenderer;
        var _a = this.getCompKeys(defObject, type, params), compName = _a.compName, jsComp = _a.jsComp, fwComp = _a.fwComp, paramsFromSelector = _a.paramsFromSelector, popupFromSelector = _a.popupFromSelector, popupPositionFromSelector = _a.popupPositionFromSelector;
        var lookupFromRegistry = function (key) {
            var item = _this.userComponentRegistry.retrieve(propertyName, key);
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
                console.error("AG Grid: Could not find component " + compName + ", did you forget to configure this component?");
            }
            return;
        }
        var paramsMerged = this.mergeParamsWithApplicationProvidedParams(defObject, type, params, paramsFromSelector);
        var componentFromFramework = jsComp == null;
        var componentClass = jsComp ? jsComp : fwComp;
        return {
            componentFromFramework: componentFromFramework,
            componentClass: componentClass,
            params: paramsMerged,
            type: type,
            popupFromSelector: popupFromSelector,
            popupPositionFromSelector: popupPositionFromSelector,
            newAgStackInstance: function () { return _this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type); }
        };
    };
    UserComponentFactory.prototype.getCompKeys = function (defObject, type, params) {
        var _this = this;
        var propertyName = type.propertyName;
        var compName;
        var jsComp;
        var fwComp;
        var paramsFromSelector;
        var popupFromSelector;
        var popupPositionFromSelector;
        // there are two types of js comps, class based and func based. we can only check for
        // class based, by checking if getGui() exists. no way to differentiate js func based vs eg react func based
        // const isJsClassComp = (comp: any) => this.agComponentUtils.doesImplementIComponent(comp);
        // const fwActive = this.frameworkComponentWrapper != null;
        // pull from defObject if available
        if (defObject) {
            var defObjectAny = defObject;
            // if selector, use this
            var selectorFunc = defObjectAny[propertyName + 'Selector'];
            var selectorRes = selectorFunc ? selectorFunc(params) : null;
            var assignComp = function (providedJsComp, providedFwComp) {
                var xxxFrameworkDeprecatedWarn = function () {
                    var warningMessage = "AG Grid: As of v27, the property " + propertyName + "Framework is deprecated. The property " + propertyName + " can now be used for JavaScript AND Framework Components.";
                    doOnce(function () { return console.warn(warningMessage); }, "UserComponentFactory." + propertyName + "FrameworkDeprecated");
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
                    var isFwkComp = _this.getFrameworkOverrides().isFrameworkComponent(providedJsComp);
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
                    var warningMessage_1 = "AG Grid: As of v27, the return for " + propertyName + "Selector has attributes [component, params] only. The attribute frameworkComponent is deprecated. You should now return back Framework Components using the 'component' attribute and the grid works out if it's a framework component or not.";
                    doOnce(function () { return console.warn(warningMessage_1); }, "UserComponentFactory." + propertyName + "FrameworkSelectorDeprecated");
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
        return { compName: compName, jsComp: jsComp, fwComp: fwComp, paramsFromSelector: paramsFromSelector, popupFromSelector: popupFromSelector, popupPositionFromSelector: popupPositionFromSelector };
    };
    UserComponentFactory.prototype.newAgStackInstance = function (ComponentClass, componentFromFramework, params, type) {
        var propertyName = type.propertyName;
        var jsComponent = !componentFromFramework;
        // using javascript component
        var instance;
        if (jsComponent) {
            instance = new ComponentClass();
        }
        else {
            // Using framework component
            var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
            instance = this.frameworkComponentWrapper.wrap(ComponentClass, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, type);
        }
        var deferredInit = this.initComponent(instance, params);
        if (deferredInit == null) {
            return AgPromise.resolve(instance);
        }
        return deferredInit.then(function () { return instance; });
    };
    // used by Floating Filter
    UserComponentFactory.prototype.mergeParamsWithApplicationProvidedParams = function (defObject, type, paramsFromGrid, paramsFromSelector) {
        if (paramsFromSelector === void 0) { paramsFromSelector = null; }
        var params = {
            context: this.gridOptionsService.context,
            columnApi: this.gridOptionsService.columnApi,
            api: this.gridOptionsService.api
        };
        mergeDeep(params, paramsFromGrid);
        // pull user params from either the old prop name and new prop name
        // eg either cellRendererParams and cellCompParams
        var defObjectAny = defObject;
        var userParams = defObjectAny && defObjectAny[type.propertyName + 'Params'];
        if (typeof userParams === 'function') {
            var userParamsFromFunc = userParams(paramsFromGrid);
            mergeDeep(params, userParamsFromFunc);
        }
        else if (typeof userParams === 'object') {
            mergeDeep(params, userParams);
        }
        mergeDeep(params, paramsFromSelector);
        return params;
    };
    UserComponentFactory.prototype.initComponent = function (component, params) {
        this.context.createBean(component);
        if (component.init == null) {
            return;
        }
        return component.init(params);
    };
    UserComponentFactory.prototype.getDefaultFloatingFilterType = function (def) {
        if (def == null) {
            return null;
        }
        var defaultFloatingFilterType = null;
        var _a = this.getCompKeys(def, FilterComponent), compName = _a.compName, jsComp = _a.jsComp, fwComp = _a.fwComp;
        if (compName) {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterMapper.getFloatingFilterType(compName);
        }
        else {
            var usingDefaultFilter = (jsComp == null && fwComp == null) && (def.filter === true);
            if (usingDefaultFilter) {
                var setFilterModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
                defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
            }
        }
        return defaultFloatingFilterType;
    };
    __decorate([
        Autowired('gridOptions')
    ], UserComponentFactory.prototype, "gridOptions", void 0);
    __decorate([
        Autowired('agComponentUtils')
    ], UserComponentFactory.prototype, "agComponentUtils", void 0);
    __decorate([
        Autowired('componentMetadataProvider')
    ], UserComponentFactory.prototype, "componentMetadataProvider", void 0);
    __decorate([
        Autowired('userComponentRegistry')
    ], UserComponentFactory.prototype, "userComponentRegistry", void 0);
    __decorate([
        Optional('frameworkComponentWrapper')
    ], UserComponentFactory.prototype, "frameworkComponentWrapper", void 0);
    UserComponentFactory = __decorate([
        Bean('userComponentFactory')
    ], UserComponentFactory);
    return UserComponentFactory;
}(BeanStub));
export { UserComponentFactory };
