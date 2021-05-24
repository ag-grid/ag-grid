/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var userComponentRegistry_1 = require("./userComponentRegistry");
var utils_1 = require("../../utils");
var componentTypes_1 = require("./componentTypes");
var beanStub_1 = require("../../context/beanStub");
var object_1 = require("../../utils/object");
var ComponentSource;
(function (ComponentSource) {
    ComponentSource[ComponentSource["DEFAULT"] = 0] = "DEFAULT";
    ComponentSource[ComponentSource["REGISTERED_BY_NAME"] = 1] = "REGISTERED_BY_NAME";
    ComponentSource[ComponentSource["HARDCODED"] = 2] = "HARDCODED";
})(ComponentSource = exports.ComponentSource || (exports.ComponentSource = {}));
var UserComponentFactory = /** @class */ (function (_super) {
    __extends(UserComponentFactory, _super);
    function UserComponentFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserComponentFactory.prototype.newDateComponent = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, componentTypes_1.DateComponent, 'agDateInput');
    };
    UserComponentFactory.prototype.newHeaderComponent = function (params) {
        return this.createAndInitUserComponent(params.column.getColDef(), params, componentTypes_1.HeaderComponent, 'agColumnHeader');
    };
    UserComponentFactory.prototype.newHeaderGroupComponent = function (params) {
        return this.createAndInitUserComponent(params.columnGroup.getColGroupDef(), params, componentTypes_1.HeaderGroupComponent, 'agColumnGroupHeader');
    };
    UserComponentFactory.prototype.newFullWidthGroupRowInnerCellRenderer = function (params) {
        return this.createAndInitUserComponent(this.gridOptions.groupRowRendererParams, params, componentTypes_1.InnerRendererComponent, null, true);
    };
    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    UserComponentFactory.prototype.newFullWidthCellRenderer = function (params, cellRendererType, cellRendererName) {
        return this.createAndInitUserComponent(null, params, { propertyName: cellRendererType, isCellRenderer: function () { return true; } }, cellRendererName);
    };
    UserComponentFactory.prototype.newCellRenderer = function (target, params, isPinned) {
        if (isPinned === void 0) { isPinned = false; }
        return this.createAndInitUserComponent(target, params, isPinned ? componentTypes_1.PinnedRowCellRendererComponent : componentTypes_1.CellRendererComponent, null, true);
    };
    UserComponentFactory.prototype.newCellEditor = function (colDef, params) {
        return this.createAndInitUserComponent(colDef, params, componentTypes_1.CellEditorComponent, 'agCellEditor');
    };
    UserComponentFactory.prototype.newInnerCellRenderer = function (target, params) {
        return this.createAndInitUserComponent(target, params, componentTypes_1.InnerRendererComponent, null);
    };
    UserComponentFactory.prototype.newLoadingOverlayComponent = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, componentTypes_1.LoadingOverlayComponent, 'agLoadingOverlay');
    };
    UserComponentFactory.prototype.newNoRowsOverlayComponent = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, componentTypes_1.NoRowsOverlayComponent, 'agNoRowsOverlay');
    };
    UserComponentFactory.prototype.newTooltipComponent = function (params) {
        return this.createAndInitUserComponent(params.colDef, params, componentTypes_1.TooltipComponent, 'agTooltipComponent');
    };
    UserComponentFactory.prototype.newFilterComponent = function (def, params, defaultFilter) {
        return this.createAndInitUserComponent(def, params, componentTypes_1.FilterComponent, defaultFilter, false);
    };
    UserComponentFactory.prototype.newSetFilterCellRenderer = function (target, params) {
        return this.createAndInitUserComponent(target, params, componentTypes_1.CellRendererComponent, null, true);
    };
    UserComponentFactory.prototype.newFloatingFilterComponent = function (def, params, defaultFloatingFilter) {
        return this.createAndInitUserComponent(def, params, componentTypes_1.FloatingFilterComponent, defaultFloatingFilter, true);
    };
    UserComponentFactory.prototype.newToolPanelComponent = function (toolPanelDef, params) {
        return this.createAndInitUserComponent(toolPanelDef, params, componentTypes_1.ToolPanelComponent);
    };
    UserComponentFactory.prototype.newStatusPanelComponent = function (def, params) {
        return this.createAndInitUserComponent(def, params, componentTypes_1.StatusPanelComponent);
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
    UserComponentFactory.prototype.createAndInitUserComponent = function (definitionObject, paramsFromGrid, componentType, defaultComponentName, 
    // optional items are: FloatingFilter, CellComp (for cellRenderer)
    optional) {
        if (optional === void 0) { optional = false; }
        if (!definitionObject) {
            definitionObject = this.gridOptions;
        }
        // Create the component instance
        var componentAndParams = this.createComponentInstance(definitionObject, componentType, paramsFromGrid, defaultComponentName, optional);
        if (!componentAndParams) {
            return null;
        }
        var componentInstance = componentAndParams.componentInstance;
        // Wire the component and call the init method with the correct params
        var params = this.createFinalParams(definitionObject, componentType.propertyName, paramsFromGrid, componentAndParams.paramsFromSelector);
        this.addReactHacks(params);
        var deferredInit = this.initComponent(componentInstance, params);
        if (deferredInit == null) {
            return utils_1.AgPromise.resolve(componentInstance);
        }
        return deferredInit.then(function () { return componentInstance; });
    };
    UserComponentFactory.prototype.addReactHacks = function (params) {
        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        var agGridReact = this.context.getBean('agGridReact');
        if (agGridReact) {
            params.agGridReact = object_1.cloneObject(agGridReact);
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
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    UserComponentFactory.prototype.createUserComponentFromConcreteClass = function (clazz, agGridParams) {
        var internalComponent = new clazz();
        this.initComponent(internalComponent, agGridParams);
        return internalComponent;
    };
    /**
     * This method returns the underlying representation of the component to be created. ie for Javascript the
     * underlying function where we should be calling new into. In case of the frameworks, the framework class
     * object that represents the component to be created.
     *
     * This method is handy for different reasons, for example if you want to check if a component has a particular
     * method implemented without having to create the component, just by inspecting the source component
     *
     * It takes
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param params: Params to be passed to the dynamic component function in case it needs to be
     *      invoked
     *  @param defaultComponentName: The name of the component to load if there is no component specified
     */
    UserComponentFactory.prototype.lookupComponentClassDef = function (definitionObject, propertyName, params, defaultComponentName) {
        if (params === void 0) { params = null; }
        /**
         * There are five things that can happen when resolving a component.
         *  a) HardcodedFwComponent: That holder[propertyName]Framework has associated a Framework native component
         *  b) HardcodedJsComponent: That holder[propertyName] has associate a JS component
         *  c) hardcodedJsFunction: That holder[propertyName] has associate a JS function
         *  d) hardcodedNameComponent: That holder[propertyName] has associate a string that represents a component to load
         *  e) That none of the three previous are specified, then we need to use the DefaultRegisteredComponent
         */
        var hardcodedNameComponent = null;
        var HardcodedJsComponent = null;
        var hardcodedJsFunction = null;
        var HardcodedFwComponent = null;
        var componentSelectorFunc = null;
        if (definitionObject != null) {
            var componentPropertyValue = definitionObject[propertyName];
            // for filters only, we allow 'true' for the component, which means default filter to be used
            var usingDefaultComponent = componentPropertyValue === true;
            if (componentPropertyValue != null && !usingDefaultComponent) {
                if (typeof componentPropertyValue === 'string') {
                    hardcodedNameComponent = componentPropertyValue;
                }
                else if (typeof componentPropertyValue === 'boolean') {
                    // never happens, as we test for usingDefaultComponent above,
                    // however it's needed for the next block to compile
                }
                else if (this.agComponentUtils.doesImplementIComponent(componentPropertyValue)) {
                    HardcodedJsComponent = componentPropertyValue;
                }
                else {
                    hardcodedJsFunction = componentPropertyValue;
                }
            }
            HardcodedFwComponent = definitionObject[propertyName + "Framework"];
            componentSelectorFunc = definitionObject[propertyName + "Selector"];
        }
        /**
         * Since we allow many types of flavors for specifying the components, let's make sure this is not an illegal
         * combination
         */
        if ((HardcodedJsComponent && HardcodedFwComponent) ||
            (hardcodedNameComponent && HardcodedFwComponent) ||
            (hardcodedJsFunction && HardcodedFwComponent)) {
            throw Error("ag-grid: you are trying to specify: " + propertyName + " twice as a component.");
        }
        if (HardcodedFwComponent && !this.frameworkComponentWrapper) {
            throw Error("ag-grid: you are specifying a framework component but you are not using a framework version of ag-grid for : " + propertyName);
        }
        if (componentSelectorFunc && (hardcodedNameComponent || HardcodedJsComponent || hardcodedJsFunction || HardcodedFwComponent)) {
            throw Error("ag-grid: you can't specify both, the selector and the component of ag-grid for : " + propertyName);
        }
        /**
         * At this stage we are guaranteed to either have,
         * DEPRECATED
         * - A unique HardcodedFwComponent
         * - A unique HardcodedJsComponent
         * - A unique hardcodedJsFunction
         * BY NAME- FAVOURED APPROACH
         * - A unique hardcodedNameComponent
         * - None of the previous, hence we revert to: RegisteredComponent
         */
        if (HardcodedFwComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedFwComponent}`);
            return {
                componentFromFramework: true,
                component: HardcodedFwComponent,
                source: ComponentSource.HARDCODED,
                paramsFromSelector: null
            };
        }
        if (HardcodedJsComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedJsComponent}`);
            return {
                componentFromFramework: false,
                component: HardcodedJsComponent,
                source: ComponentSource.HARDCODED,
                paramsFromSelector: null
            };
        }
        if (hardcodedJsFunction) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a function directly is deprecated, you should register the component by name`);
            // console.warn(`${hardcodedJsFunction}`);
            return this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, false, ComponentSource.HARDCODED);
        }
        var selectorResult = componentSelectorFunc ? componentSelectorFunc(params) : null;
        var componentNameToUse;
        if (selectorResult && selectorResult.component) {
            componentNameToUse = selectorResult.component;
        }
        else if (hardcodedNameComponent) {
            componentNameToUse = hardcodedNameComponent;
        }
        else {
            componentNameToUse = defaultComponentName;
        }
        if (!componentNameToUse) {
            return null;
        }
        var registeredCompClassDef = this.lookupFromRegisteredComponents(propertyName, componentNameToUse);
        if (!registeredCompClassDef) {
            return null;
        }
        return {
            componentFromFramework: registeredCompClassDef.componentFromFramework,
            component: registeredCompClassDef.component,
            source: registeredCompClassDef.source,
            paramsFromSelector: selectorResult ? selectorResult.params : null
        };
    };
    UserComponentFactory.prototype.lookupFromRegisteredComponents = function (propertyName, componentNameOpt) {
        var componentName = componentNameOpt != null ? componentNameOpt : propertyName;
        var registeredComponent = this.userComponentRegistry.retrieve(componentName);
        if (registeredComponent == null) {
            return null;
        }
        //If it is a FW it has to be registered as a component
        if (registeredComponent.componentFromFramework) {
            return {
                component: registeredComponent.component,
                componentFromFramework: true,
                source: ComponentSource.REGISTERED_BY_NAME,
                paramsFromSelector: null
            };
        }
        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(registeredComponent.component)) {
            return {
                component: registeredComponent.component,
                componentFromFramework: false,
                source: (registeredComponent.source == userComponentRegistry_1.RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT,
                paramsFromSelector: null
            };
        }
        // This is a function
        return this.agComponentUtils.adaptFunction(propertyName, registeredComponent.component, registeredComponent.componentFromFramework, (registeredComponent.source == userComponentRegistry_1.RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT);
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
    UserComponentFactory.prototype.createFinalParams = function (definitionObject, propertyName, paramsFromGrid, paramsFromSelector) {
        if (paramsFromSelector === void 0) { paramsFromSelector = null; }
        var params = {};
        object_1.mergeDeep(params, paramsFromGrid);
        var userParams = definitionObject ? definitionObject[propertyName + "Params"] : null;
        if (userParams != null) {
            if (typeof userParams === 'function') {
                var userParamsFromFunc = userParams(paramsFromGrid);
                object_1.mergeDeep(params, userParamsFromFunc);
            }
            else if (typeof userParams === 'object') {
                object_1.mergeDeep(params, userParams);
            }
        }
        object_1.mergeDeep(params, paramsFromSelector);
        return params;
    };
    UserComponentFactory.prototype.createComponentInstance = function (holder, componentType, paramsForSelector, defaultComponentName, optional) {
        var propertyName = componentType.propertyName;
        var componentToUse = this.lookupComponentClassDef(holder, propertyName, paramsForSelector, defaultComponentName);
        var missing = !componentToUse || !componentToUse.component;
        if (missing) {
            // to help the user, we print out the name they are looking for, rather than the default name.
            // i don't know why the default name was originally printed out (that doesn't help the user)
            var overrideName = holder ? holder[propertyName] : defaultComponentName;
            var nameToReport = overrideName ? overrideName : defaultComponentName;
            if (!optional) {
                console.error("Could not find component " + nameToReport + ", did you forget to configure this component?");
            }
            return null;
        }
        var componentInstance;
        if (componentToUse.componentFromFramework) {
            // Using framework component
            var FrameworkComponentRaw = componentToUse.component;
            var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
            componentInstance = this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, componentType, defaultComponentName);
        }
        else {
            // Using plain JavaScript component
            componentInstance = new componentToUse.component();
        }
        return { componentInstance: componentInstance, paramsFromSelector: componentToUse.paramsFromSelector };
    };
    UserComponentFactory.prototype.initComponent = function (component, params) {
        this.context.createBean(component);
        if (component.init == null) {
            return;
        }
        return component.init(params);
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
    return UserComponentFactory;
}(beanStub_1.BeanStub));
exports.UserComponentFactory = UserComponentFactory;

//# sourceMappingURL=userComponentFactory.js.map
