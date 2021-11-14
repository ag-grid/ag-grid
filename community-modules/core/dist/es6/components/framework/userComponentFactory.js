/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { CellEditorComponent, CellRendererComponent, DateComponent, FilterComponent, FloatingFilterComponent, HeaderComponent, HeaderGroupComponent, InnerRendererComponent, LoadingOverlayComponent, NoRowsOverlayComponent, StatusPanelComponent, ToolPanelComponent, TooltipComponent } from "./componentTypes";
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
    UserComponentFactory.prototype.getFullWidthCellRendererDetails = function (params, cellRendererType, cellRendererName) {
        return this.getCompDetails(this.gridOptions, { propertyName: cellRendererType, isCellRenderer: function () { return true; } }, cellRendererName, params);
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
        var propertyName = type.propertyName;
        var comp;
        var frameworkComp;
        var paramsFromSelector;
        // pull from defObject if available
        if (defObject) {
            var defObjectAny = defObject;
            // if selector, use this
            var selectorFunc = defObjectAny[propertyName + 'Selector'];
            var selectorRes = selectorFunc ? selectorFunc(params) : null;
            if (selectorRes) {
                comp = selectorRes.component;
                frameworkComp = selectorRes.frameworkComponent;
                paramsFromSelector = selectorRes.params;
            }
            else {
                // if no selector, or result of selector is empty, take from defObject
                comp = defObjectAny[propertyName];
                frameworkComp = defObjectAny[propertyName + 'Framework'];
            }
            // for filters only, we allow 'true' for the component, which means default filter to be used
            if (comp === true) {
                comp = undefined;
            }
        }
        var lookupFromRegistry = function (key) {
            var item = _this.userComponentRegistry.retrieve(key);
            if (item) {
                comp = !item.componentFromFramework ? item.component : undefined;
                frameworkComp = item.componentFromFramework ? item.component : undefined;
            }
            else {
                comp = undefined;
                frameworkComp = undefined;
            }
        };
        // if compOption is a string, means we need to look the item up
        if (typeof comp === 'string') {
            lookupFromRegistry(comp);
        }
        // if lookup brought nothing back, and we have a default, lookup the default
        if (comp == null && frameworkComp == null && defaultName != null) {
            lookupFromRegistry(defaultName);
        }
        // if we have a comp option, and it's a function, replace it with an object equivalent adaptor
        if (comp && !this.agComponentUtils.doesImplementIComponent(comp)) {
            comp = this.agComponentUtils.adaptFunction(propertyName, comp);
        }
        if (!comp && !frameworkComp) {
            if (mandatory) {
                var overrideName = defObject ? defObject[propertyName] : defaultName;
                var nameToReport = overrideName ? overrideName : defaultName;
                console.error("Could not find component " + nameToReport + ", did you forget to configure this component?");
            }
            return;
        }
        var paramsMerged = this.mergeParamsWithApplicationProvidedParams(defObject, propertyName, params, paramsFromSelector);
        var componentFromFramework = comp == null;
        var componentClass = comp ? comp : frameworkComp;
        return {
            componentFromFramework: componentFromFramework,
            componentClass: componentClass,
            params: paramsMerged,
            type: type,
            newAgStackInstance: function (defaultCompName) { return _this.newAgStackInstance(componentClass, componentFromFramework, paramsMerged, type, defaultCompName); }
        };
    };
    UserComponentFactory.prototype.newAgStackInstance = function (ComponentClass, componentFromFramework, params, type, defaultComponentName) {
        var propertyName = type.propertyName;
        // using javascript component
        var instance;
        var jsComponent = !componentFromFramework;
        if (jsComponent) {
            instance = new ComponentClass();
        }
        else {
            // Using framework component
            var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
            instance = this.frameworkComponentWrapper.wrap(ComponentClass, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, type, defaultComponentName);
        }
        var deferredInit = this.initComponent(instance, params);
        if (deferredInit == null) {
            return AgPromise.resolve(instance);
        }
        return deferredInit.then(function () { return instance; });
    };
    // used by Floating Filter
    UserComponentFactory.prototype.mergeParamsWithApplicationProvidedParams = function (defObject, propertyName, paramsFromGrid, paramsFromSelector) {
        if (paramsFromSelector === void 0) { paramsFromSelector = null; }
        var params = {};
        mergeDeep(params, paramsFromGrid);
        var userParams = defObject ? defObject[propertyName + "Params"] : null;
        if (userParams != null) {
            if (typeof userParams === 'function') {
                var userParamsFromFunc = userParams(paramsFromGrid);
                mergeDeep(params, userParamsFromFunc);
            }
            else if (typeof userParams === 'object') {
                mergeDeep(params, userParams);
            }
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
