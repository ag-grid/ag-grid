/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, Optional } from "../../context/context";
import { AgPromise } from "../../utils";
import { CellEditorComponent, CellRendererComponent, DateComponent, FilterComponent, FloatingFilterComponent, HeaderComponent, HeaderGroupComponent, InnerRendererComponent, LoadingOverlayComponent, NoRowsOverlayComponent, StatusPanelComponent, ToolPanelComponent, TooltipComponent } from "./componentTypes";
import { BeanStub } from "../../context/beanStub";
import { cloneObject, mergeDeep } from '../../utils/object';
var UserComponentFactory = /** @class */ (function (_super) {
    __extends(UserComponentFactory, _super);
    function UserComponentFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserComponentFactory.prototype.newDateComponent = function (params) {
        return this.lookupAndCreateComponent(this.gridOptions, params, DateComponent, 'agDateInput');
    };
    UserComponentFactory.prototype.newHeaderComponent = function (params) {
        return this.lookupAndCreateComponent(params.column.getColDef(), params, HeaderComponent, 'agColumnHeader');
    };
    UserComponentFactory.prototype.newHeaderGroupComponent = function (params) {
        return this.lookupAndCreateComponent(params.columnGroup.getColGroupDef(), params, HeaderGroupComponent, 'agColumnGroupHeader');
    };
    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    UserComponentFactory.prototype.newFullWidthCellRenderer = function (params, cellRendererType, cellRendererName) {
        return this.lookupAndCreateComponent(this.gridOptions, params, { propertyName: cellRendererType, isCellRenderer: function () { return true; } }, cellRendererName);
    };
    UserComponentFactory.prototype.getFullWidthCellRendererDetails = function (params, cellRendererType, cellRendererName) {
        return this.getCompDetails(this.gridOptions, cellRendererType, cellRendererName, params);
    };
    UserComponentFactory.prototype.createFullWidthCellRenderer = function (userCompDetails, cellRendererType) {
        return this.createAndInitComponent(userCompDetails, { propertyName: cellRendererType, isCellRenderer: function () { return true; } });
    };
    // CELL RENDERER
    UserComponentFactory.prototype.newCellRenderer = function (def, params) {
        return this.lookupAndCreateComponent(def, params, CellRendererComponent, null, true);
    };
    UserComponentFactory.prototype.getInnerRendererDetails = function (def, params) {
        return this.getCompDetails(def, InnerRendererComponent.propertyName, null, params);
    };
    UserComponentFactory.prototype.getFullWidthGroupRowInnerCellRenderer = function (def, params) {
        return this.getCompDetails(def, InnerRendererComponent.propertyName, null, params);
    };
    // delete this one
    UserComponentFactory.prototype.newFullWidthGroupRowInnerCellRenderer = function (params) {
        return this.lookupAndCreateComponent(this.gridOptions.groupRowRendererParams, params, InnerRendererComponent, null, true);
    };
    // delete this one
    UserComponentFactory.prototype.newInnerCellRenderer = function (def, params) {
        return this.lookupAndCreateComponent(def, params, InnerRendererComponent, null);
    };
    UserComponentFactory.prototype.getCellRendererDetails = function (def, params) {
        return this.getCompDetails(def, CellRendererComponent.propertyName, null, params);
    };
    UserComponentFactory.prototype.createCellRenderer = function (userCompDetails) {
        return this.createAndInitComponent(userCompDetails, CellRendererComponent);
    };
    // CELL EDITOR
    UserComponentFactory.prototype.newCellEditor = function (colDef, params) {
        return this.lookupAndCreateComponent(colDef, params, CellEditorComponent, 'agCellEditor');
    };
    UserComponentFactory.prototype.getCellEditorDetails = function (def, params) {
        return this.getCompDetails(def, CellEditorComponent.propertyName, 'agCellEditor', params, true);
    };
    UserComponentFactory.prototype.createCellEditor = function (compClassAndParams) {
        return this.createAndInitComponent(compClassAndParams, CellEditorComponent);
    };
    UserComponentFactory.prototype.newLoadingOverlayComponent = function (params) {
        return this.lookupAndCreateComponent(this.gridOptions, params, LoadingOverlayComponent, 'agLoadingOverlay');
    };
    UserComponentFactory.prototype.newNoRowsOverlayComponent = function (params) {
        return this.lookupAndCreateComponent(this.gridOptions, params, NoRowsOverlayComponent, 'agNoRowsOverlay');
    };
    UserComponentFactory.prototype.newTooltipComponent = function (params) {
        return this.lookupAndCreateComponent(params.colDef, params, TooltipComponent, 'agTooltipComponent');
    };
    UserComponentFactory.prototype.newFilterComponent = function (def, params, defaultFilter) {
        return this.lookupAndCreateComponent(def, params, FilterComponent, defaultFilter, false);
    };
    UserComponentFactory.prototype.newSetFilterCellRenderer = function (def, params) {
        return this.lookupAndCreateComponent(def, params, CellRendererComponent, null, true);
    };
    UserComponentFactory.prototype.newFloatingFilterComponent = function (def, params, defaultFloatingFilter) {
        return this.lookupAndCreateComponent(def, params, FloatingFilterComponent, defaultFloatingFilter, true);
    };
    UserComponentFactory.prototype.newToolPanelComponent = function (toolPanelDef, params) {
        return this.lookupAndCreateComponent(toolPanelDef, params, ToolPanelComponent);
    };
    UserComponentFactory.prototype.newStatusPanelComponent = function (def, params) {
        return this.lookupAndCreateComponent(def, params, StatusPanelComponent);
    };
    UserComponentFactory.prototype.getCompDetails = function (defObject, propName, defaultName, params, mandatory) {
        if (mandatory === void 0) { mandatory = false; }
        var compDetails = this.lookupComponent(defObject, propName, params, defaultName);
        if (!compDetails || !compDetails.componentClass) {
            if (mandatory) {
                this.logComponentMissing(defObject, propName);
            }
            return undefined;
        }
        var paramsMerged = this.mergeParamsWithApplicationProvidedParams(defObject, propName, params, compDetails.params);
        return __assign(__assign({}, compDetails), { params: paramsMerged });
    };
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param paramsFromGrid: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param defaultComponentName: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param optional: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     */
    UserComponentFactory.prototype.lookupAndCreateComponent = function (def, paramsFromGrid, componentType, defaultComponentName, 
    // optional items are: FloatingFilter, CellComp (for cellRenderer)
    optional) {
        if (optional === void 0) { optional = false; }
        var compClassAndParams = this.getCompDetails(def, componentType.propertyName, defaultComponentName, paramsFromGrid, !optional);
        if (!compClassAndParams) {
            return null;
        }
        return this.createAndInitComponent(compClassAndParams, componentType, defaultComponentName);
    };
    UserComponentFactory.prototype.createAndInitComponent = function (compClassAndParams, componentType, defaultComponentName) {
        if (!compClassAndParams) {
            return null;
        }
        var params = compClassAndParams.params, componentClass = compClassAndParams.componentClass, componentFromFramework = compClassAndParams.componentFromFramework;
        // Create the component instance
        var instance = this.createComponentInstance(componentType, defaultComponentName, componentClass, componentFromFramework);
        if (!instance) {
            return null;
        }
        this.addReactHacks(params);
        var deferredInit = this.initComponent(instance, params);
        if (deferredInit == null) {
            return AgPromise.resolve(instance);
        }
        return deferredInit.then(function () { return instance; });
    };
    UserComponentFactory.prototype.addReactHacks = function (params) {
        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        var agGridReact = this.context.getBean('agGridReact');
        if (agGridReact) {
            params.agGridReact = cloneObject(agGridReact);
        }
        // AG-1716 - directly related to AG-1574 and AG-1715
        var frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        if (frameworkComponentWrapper) {
            params.frameworkComponentWrapper = frameworkComponentWrapper;
        }
    };
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param CompClass: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    UserComponentFactory.prototype.createUserComponentFromConcreteClass = function (CompClass, agGridParams) {
        var internalComponent = new CompClass();
        this.initComponent(internalComponent, agGridParams);
        return internalComponent;
    };
    UserComponentFactory.prototype.lookupComponent = function (defObject, propertyName, params, defaultComponentName) {
        var _this = this;
        if (params === void 0) { params = null; }
        var paramsFromSelector;
        var comp;
        var frameworkComp;
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
        if (comp == null && frameworkComp == null && defaultComponentName != null) {
            lookupFromRegistry(defaultComponentName);
        }
        // if we have a comp option, and it's a function, replace it with an object equivalent adaptor
        if (comp && !this.agComponentUtils.doesImplementIComponent(comp)) {
            comp = this.agComponentUtils.adaptFunction(propertyName, comp);
        }
        if (!comp && !frameworkComp) {
            return null;
        }
        return {
            componentFromFramework: comp == null,
            componentClass: comp ? comp : frameworkComp,
            params: paramsFromSelector
        };
    };
    /**
     * Useful to check what would be the resultant params for a given object
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param paramsFromGrid: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     * @returns {TParams} It merges the user agGridParams with the actual params specified by the user.
     */
    UserComponentFactory.prototype.mergeParamsWithApplicationProvidedParams = function (definitionObject, propertyName, paramsFromGrid, paramsFromSelector) {
        if (paramsFromSelector === void 0) { paramsFromSelector = null; }
        var params = {};
        mergeDeep(params, paramsFromGrid);
        var userParams = definitionObject ? definitionObject[propertyName + "Params"] : null;
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
    UserComponentFactory.prototype.logComponentMissing = function (holder, propertyName, defaultComponentName) {
        // to help the user, we print out the name they are looking for, rather than the default name.
        // i don't know why the default name was originally printed out (that doesn't help the user)
        var overrideName = holder ? holder[propertyName] : defaultComponentName;
        var nameToReport = overrideName ? overrideName : defaultComponentName;
        console.error("Could not find component " + nameToReport + ", did you forget to configure this component?");
    };
    UserComponentFactory.prototype.createComponentInstance = function (componentType, defaultComponentName, component, componentFromFramework) {
        var propertyName = componentType.propertyName;
        // using javascript component
        var jsComponent = !componentFromFramework;
        if (jsComponent) {
            return new component();
        }
        if (!this.frameworkComponentWrapper) {
            console.warn("AG Grid - Because you are using our new React UI (property reactUi=true), it is not possible to use a React Component for " + componentType.propertyName + ". This is work in progress and we plan to support this soon. In the meantime, please either set reactUi=false, or replace this component with one written in JavaScript.");
            return null;
        }
        // Using framework component
        var FrameworkComponentRaw = component;
        var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
        return this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, componentType, defaultComponentName);
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
