/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var userComponentRegistry_1 = require("./userComponentRegistry");
var agComponentUtils_1 = require("./agComponentUtils");
var componentMetadataProvider_1 = require("./componentMetadataProvider");
var utils_1 = require("../../utils");
var ComponentSource;
(function (ComponentSource) {
    ComponentSource[ComponentSource["DEFAULT"] = 0] = "DEFAULT";
    ComponentSource[ComponentSource["REGISTERED_BY_NAME"] = 1] = "REGISTERED_BY_NAME";
    ComponentSource[ComponentSource["HARDCODED"] = 2] = "HARDCODED";
})(ComponentSource = exports.ComponentSource || (exports.ComponentSource = {}));
var UserComponentFactory = /** @class */ (function () {
    function UserComponentFactory() {
    }
    UserComponentFactory.prototype.newDateComponent = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, "dateComponent", "agDateInput");
    };
    UserComponentFactory.prototype.newHeaderComponent = function (params) {
        return this.createAndInitUserComponent(params.column.getColDef(), params, "headerComponent", "agColumnHeader");
    };
    UserComponentFactory.prototype.newHeaderGroupComponent = function (params) {
        return this.createAndInitUserComponent(params.columnGroup.getColGroupDef(), params, "headerGroupComponent", "agColumnGroupHeader");
    };
    UserComponentFactory.prototype.newFullWidthGroupRowInnerCellRenderer = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, "groupRowInnerRenderer", null, true);
    };
    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    UserComponentFactory.prototype.newFullWidthCellRenderer = function (params, cellRendererType, cellRendererName) {
        return this.createAndInitUserComponent(null, params, cellRendererType, cellRendererName);
    };
    UserComponentFactory.prototype.newCellRenderer = function (target, params) {
        return this.createAndInitUserComponent(target, params, "cellRenderer", null, true);
    };
    UserComponentFactory.prototype.newPinnedRowCellRenderer = function (target, params) {
        return this.createAndInitUserComponent(target, params, "pinnedRowCellRenderer", null, true);
    };
    UserComponentFactory.prototype.newCellEditor = function (colDef, params) {
        return this.createAndInitUserComponent(colDef, params, 'cellEditor', 'agCellEditor');
    };
    UserComponentFactory.prototype.newInnerCellRenderer = function (target, params) {
        return this.createAndInitUserComponent(target, params, "innerRenderer", null);
    };
    UserComponentFactory.prototype.newLoadingOverlayComponent = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, "loadingOverlayComponent", "agLoadingOverlay");
    };
    UserComponentFactory.prototype.newNoRowsOverlayComponent = function (params) {
        return this.createAndInitUserComponent(this.gridOptions, params, "noRowsOverlayComponent", "agNoRowsOverlay");
    };
    UserComponentFactory.prototype.newTooltipComponent = function (params) {
        var colDef = params.colDef;
        return this.createAndInitUserComponent(colDef, params, "tooltipComponent", 'agTooltipComponent');
    };
    UserComponentFactory.prototype.newFilterComponent = function (colDef, params, defaultFilter, modifyParamsCallback) {
        return this.createAndInitUserComponent(colDef, params, 'filter', defaultFilter, false, modifyParamsCallback);
    };
    UserComponentFactory.prototype.newFloatingFilterComponent = function (colDef, params, defaultFloatingFilter) {
        return this.createAndInitUserComponent(colDef, params, "floatingFilterComponent", defaultFloatingFilter, true);
    };
    UserComponentFactory.prototype.newToolPanelComponent = function (toolPanelDef, params) {
        return this.createAndInitUserComponent(toolPanelDef, params, 'toolPanel');
    };
    UserComponentFactory.prototype.newStatusPanelComponent = function (def, params) {
        return this.createAndInitUserComponent(def, params, 'statusPanel');
    };
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param paramsFromGrid: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param defaultComponentName: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param optional: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    UserComponentFactory.prototype.createAndInitUserComponent = function (definitionObject, paramsFromGrid, propertyName, defaultComponentName, 
    // optional items are: FloatingFilter, CellComp (for cellRenderer)
    optional, 
    // used by FilterManager only
    modifyParamsCallback) {
        if (optional === void 0) { optional = false; }
        if (!definitionObject) {
            definitionObject = this.gridOptions;
        }
        // Create the component instance
        var componentAndParams = this.createComponentInstance(definitionObject, propertyName, paramsFromGrid, defaultComponentName, optional);
        if (!componentAndParams) {
            return null;
        }
        var componentInstance = componentAndParams.componentInstance;
        // Wire the component and call the init method with the correct params
        var params = this.createFinalParams(definitionObject, propertyName, paramsFromGrid, componentAndParams.paramsFromSelector);
        this.addReactHacks(params);
        // give caller chance to set any params that depend on the componentInstance (need here as the
        // componentInstance was not available when createUserComponent was called)
        var paramsAfterCallback = modifyParamsCallback ? modifyParamsCallback(params, componentInstance) : params;
        var deferredInit = this.initComponent(componentInstance, paramsAfterCallback);
        if (deferredInit == null) {
            // const p = new Promise<A>(resolve => {
            //     setTimeout( ()=> {
            //         resolve(componentInstance);
            //     }, 1000);
            // });
            // return p;
            return utils_1.Promise.resolve(componentInstance);
        }
        else {
            var asPromise = deferredInit;
            return asPromise.map(function (notRelevant) { return componentInstance; });
        }
    };
    UserComponentFactory.prototype.addReactHacks = function (params) {
        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        var agGridReact = this.context.getBean('agGridReact');
        if (agGridReact) {
            params.agGridReact = utils_1._.cloneObject(agGridReact);
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
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
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
        var componentSelectorFunc;
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
     *  @param paramsFromGrid: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     * @returns {any} It merges the user agGridParams with the actual params specified by the user.
     */
    UserComponentFactory.prototype.createFinalParams = function (definitionObject, propertyName, paramsFromGrid, paramsFromSelector) {
        if (paramsFromSelector === void 0) { paramsFromSelector = null; }
        var res = {};
        utils_1._.mergeDeep(res, paramsFromGrid);
        var userParams = definitionObject ? definitionObject[propertyName + "Params"] : null;
        if (userParams != null) {
            if (typeof userParams === 'function') {
                utils_1._.mergeDeep(res, userParams(paramsFromGrid));
            }
            else if (typeof userParams === 'object') {
                utils_1._.mergeDeep(res, userParams);
            }
        }
        utils_1._.mergeDeep(res, paramsFromSelector);
        return res;
    };
    UserComponentFactory.prototype.createComponentInstance = function (holder, propertyName, paramsForSelector, defaultComponentName, optional) {
        var componentToUse = this.lookupComponentClassDef(holder, propertyName, paramsForSelector, defaultComponentName);
        var missing = !componentToUse || !componentToUse.component;
        if (missing) {
            if (!optional) {
                console.error("Error creating component " + propertyName + "=>" + defaultComponentName);
            }
            return null;
        }
        var componentInstance;
        if (componentToUse.componentFromFramework) {
            // Using framework component
            var FrameworkComponentRaw = componentToUse.component;
            var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
            componentInstance = this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, defaultComponentName);
        }
        else {
            // Using plain JavaScript component
            componentInstance = new componentToUse.component();
        }
        return { componentInstance: componentInstance, paramsFromSelector: componentToUse.paramsFromSelector };
    };
    UserComponentFactory.prototype.initComponent = function (component, finalParams) {
        this.context.wireBean(component);
        if (component.init == null) {
            return;
        }
        else {
            return component.init(finalParams);
        }
    };
    __decorate([
        context_1.Autowired("gridOptions"),
        __metadata("design:type", Object)
    ], UserComponentFactory.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], UserComponentFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired("context"),
        __metadata("design:type", context_1.Context)
    ], UserComponentFactory.prototype, "context", void 0);
    __decorate([
        context_1.Autowired("agComponentUtils"),
        __metadata("design:type", agComponentUtils_1.AgComponentUtils)
    ], UserComponentFactory.prototype, "agComponentUtils", void 0);
    __decorate([
        context_1.Autowired("componentMetadataProvider"),
        __metadata("design:type", componentMetadataProvider_1.ComponentMetadataProvider)
    ], UserComponentFactory.prototype, "componentMetadataProvider", void 0);
    __decorate([
        context_1.Autowired("userComponentRegistry"),
        __metadata("design:type", userComponentRegistry_1.UserComponentRegistry)
    ], UserComponentFactory.prototype, "userComponentRegistry", void 0);
    __decorate([
        context_1.Optional("frameworkComponentWrapper"),
        __metadata("design:type", Object)
    ], UserComponentFactory.prototype, "frameworkComponentWrapper", void 0);
    UserComponentFactory = __decorate([
        context_1.Bean('userComponentFactory')
    ], UserComponentFactory);
    return UserComponentFactory;
}());
exports.UserComponentFactory = UserComponentFactory;
