/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var utils_1 = require("../../utils");
var componentProvider_1 = require("./componentProvider");
var agComponentUtils_1 = require("./agComponentUtils");
var componentMetadataProvider_1 = require("./componentMetadataProvider");
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["AG_GRID"] = 0] = "AG_GRID";
    ComponentType[ComponentType["FRAMEWORK"] = 1] = "FRAMEWORK";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
var ComponentSource;
(function (ComponentSource) {
    ComponentSource[ComponentSource["DEFAULT"] = 0] = "DEFAULT";
    ComponentSource[ComponentSource["REGISTERED_BY_NAME"] = 1] = "REGISTERED_BY_NAME";
    ComponentSource[ComponentSource["HARDCODED"] = 2] = "HARDCODED";
})(ComponentSource = exports.ComponentSource || (exports.ComponentSource = {}));
var ComponentResolver = (function () {
    function ComponentResolver() {
    }
    /**
     * This method returns the underlying representation of the component to be created. ie for Javascript the
     * underlying function where we should be calling new into. In case of the frameworks, the framework class
     * object that represents the component to be created.
     *
     * This method is handy for different reasons, for example if you want to check if a component has a particular
     * method implemented without having to create the component, just by inspecting the source component
     *
     * It takes
     *  @param holder: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param dynamicComponentParams: Params to be passed to the dynamic component function in case it needs to be
     *      invoked
     *  @param defaultComponentName: The name of the component to load if there is no component specified
     */
    ComponentResolver.prototype.getComponentToUse = function (holder, propertyName, dynamicComponentParams, defaultComponentName) {
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
        var dynamicComponentFn;
        if (holder != null) {
            var componentPropertyValue = holder[propertyName];
            if (componentPropertyValue != null) {
                if (typeof componentPropertyValue === 'string') {
                    hardcodedNameComponent = componentPropertyValue;
                }
                else if (this.agComponentUtils.doesImplementIComponent(componentPropertyValue)) {
                    HardcodedJsComponent = componentPropertyValue;
                }
                else {
                    hardcodedJsFunction = componentPropertyValue;
                }
            }
            HardcodedFwComponent = holder[propertyName + "Framework"];
            dynamicComponentFn = holder[propertyName + "Selector"];
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
        if (dynamicComponentFn && (hardcodedNameComponent || HardcodedJsComponent || hardcodedJsFunction || HardcodedFwComponent)) {
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
                type: ComponentType.FRAMEWORK,
                component: HardcodedFwComponent,
                source: ComponentSource.HARDCODED,
                dynamicParams: null
            };
        }
        if (HardcodedJsComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedJsComponent}`);
            return {
                type: ComponentType.AG_GRID,
                component: HardcodedJsComponent,
                source: ComponentSource.HARDCODED,
                dynamicParams: null
            };
        }
        if (hardcodedJsFunction) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a function directly is deprecated, you should register the component by name`);
            // console.warn(`${hardcodedJsFunction}`);
            return this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, ComponentType.AG_GRID, ComponentSource.HARDCODED);
        }
        if (dynamicComponentFn) {
            var dynamicComponentDef = dynamicComponentFn(dynamicComponentParams);
            if (dynamicComponentDef != null) {
                if (dynamicComponentDef.component == null) {
                    dynamicComponentDef.component = defaultComponentName;
                }
                var dynamicComponent = this.resolveByName(propertyName, dynamicComponentDef.component);
                return utils_1._.assign(dynamicComponent, {
                    dynamicParams: dynamicComponentDef.params
                });
            }
        }
        //^^^^^ABOVE DEPRECATED - AT THIS POINT WE ARE RESOLVING BY NAME
        var componentNameToUse;
        if (hardcodedNameComponent) {
            componentNameToUse = hardcodedNameComponent;
        }
        else {
            componentNameToUse = defaultComponentName;
        }
        return componentNameToUse == null ? null : this.resolveByName(propertyName, componentNameToUse);
    };
    ComponentResolver.prototype.resolveByName = function (propertyName, componentNameOpt) {
        var componentName = componentNameOpt != null ? componentNameOpt : propertyName;
        var registeredComponent = this.componentProvider.retrieve(componentName);
        if (registeredComponent == null)
            return null;
        //If it is a FW it has to be registered as a component
        if (registeredComponent.type == ComponentType.FRAMEWORK) {
            return {
                component: registeredComponent.component,
                type: ComponentType.FRAMEWORK,
                source: ComponentSource.REGISTERED_BY_NAME,
                dynamicParams: null
            };
        }
        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(registeredComponent.component)) {
            return {
                component: registeredComponent.component,
                type: ComponentType.AG_GRID,
                source: (registeredComponent.source == componentProvider_1.RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT,
                dynamicParams: null
            };
        }
        // This is a function
        return this.agComponentUtils.adaptFunction(propertyName, registeredComponent.component, registeredComponent.type, (registeredComponent.source == componentProvider_1.RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT);
    };
    /**
     * Useful to check what would be the resultant params for a given object
     *  @param holder: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     * @returns {any} It merges the user agGridParams with the actual params specified by the user.
     */
    ComponentResolver.prototype.mergeParams = function (holder, propertyName, agGridParams, dynamicCustomParams, dynamicParams) {
        if (dynamicParams === void 0) { dynamicParams = null; }
        var customParamsRaw = holder ? holder[propertyName + "Params"] : null;
        var finalParams = {};
        utils_1._.mergeDeep(finalParams, agGridParams);
        if (customParamsRaw != null) {
            var customParams = null;
            if (typeof customParamsRaw === 'function') {
                customParams = customParamsRaw(dynamicCustomParams);
            }
            else {
                customParams = customParamsRaw;
            }
            utils_1._.mergeDeep(finalParams, customParams);
        }
        utils_1._.mergeDeep(finalParams, dynamicParams);
        if (!finalParams.api) {
            finalParams.api = this.gridOptions.api;
        }
        return finalParams;
    };
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param holderOpt: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param dynamicComponentParams: Params to be passed to the dynamic component function in case it needs to be
     *      invoked
     *  @param defaultComponentName: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param mandatory: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     *  @param customInitParamsCb: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    ComponentResolver.prototype.createAgGridComponent = function (holderOpt, agGridParams, propertyName, dynamicComponentParams, defaultComponentName, mandatory, customInitParamsCb) {
        if (mandatory === void 0) { mandatory = true; }
        var holder = holderOpt == null ? this.gridOptions : holderOpt;
        //Create the component instance
        var componentAndParams = this.newAgGridComponent(holder, propertyName, dynamicComponentParams, defaultComponentName, mandatory);
        if (!componentAndParams)
            return null;
        // Wire the component and call the init method with the correct params
        var finalParams = this.mergeParams(holder, propertyName, agGridParams, dynamicComponentParams, componentAndParams[1]);
        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        finalParams.agGridReact = this.context.getBean('agGridReact') ? utils_1._.cloneObject(this.context.getBean('agGridReact')) : {};
        // AG-1716 - directly related to AG-1574 and AG-1715
        finalParams.frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper') ? this.context.getBean('frameworkComponentWrapper') : {};
        var deferredInit = this.initialiseComponent(componentAndParams[0], finalParams, customInitParamsCb);
        if (deferredInit == null) {
            return utils_1.Promise.resolve(componentAndParams[0]);
        }
        else {
            var asPromise = deferredInit;
            return asPromise.map(function (notRelevant) { return componentAndParams[0]; });
        }
    };
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param customInitParamsCb: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    ComponentResolver.prototype.createInternalAgGridComponent = function (clazz, agGridParams, customInitParamsCb) {
        var internalComponent = new clazz();
        this.initialiseComponent(internalComponent, agGridParams, customInitParamsCb);
        return internalComponent;
    };
    ComponentResolver.prototype.newAgGridComponent = function (holder, propertyName, dynamicComponentParams, defaultComponentName, mandatory) {
        if (mandatory === void 0) { mandatory = true; }
        var componentToUse = this.getComponentToUse(holder, propertyName, dynamicComponentParams, defaultComponentName);
        if (!componentToUse || !componentToUse.component) {
            if (mandatory) {
                console.error("Error creating component " + propertyName + "=>" + defaultComponentName);
            }
            return null;
        }
        if (componentToUse.type === ComponentType.AG_GRID) {
            return [
                new componentToUse.component(),
                componentToUse.dynamicParams
            ];
        }
        //Using framework component
        var FrameworkComponentRaw = componentToUse.component;
        var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
        return [
            this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, defaultComponentName),
            componentToUse.dynamicParams
        ];
    };
    ComponentResolver.prototype.initialiseComponent = function (component, agGridParams, customInitParamsCb) {
        this.context.wireBean(component);
        if (customInitParamsCb == null) {
            return component.init(agGridParams);
        }
        else {
            return component.init(customInitParamsCb(agGridParams, component));
        }
    };
    __decorate([
        context_1.Autowired("gridOptions"),
        __metadata("design:type", Object)
    ], ComponentResolver.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ComponentResolver.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired("context"),
        __metadata("design:type", context_1.Context)
    ], ComponentResolver.prototype, "context", void 0);
    __decorate([
        context_1.Autowired("agComponentUtils"),
        __metadata("design:type", agComponentUtils_1.AgComponentUtils)
    ], ComponentResolver.prototype, "agComponentUtils", void 0);
    __decorate([
        context_1.Autowired("componentMetadataProvider"),
        __metadata("design:type", componentMetadataProvider_1.ComponentMetadataProvider)
    ], ComponentResolver.prototype, "componentMetadataProvider", void 0);
    __decorate([
        context_1.Autowired("componentProvider"),
        __metadata("design:type", componentProvider_1.ComponentProvider)
    ], ComponentResolver.prototype, "componentProvider", void 0);
    __decorate([
        context_1.Optional("frameworkComponentWrapper"),
        __metadata("design:type", Object)
    ], ComponentResolver.prototype, "frameworkComponentWrapper", void 0);
    ComponentResolver = __decorate([
        context_1.Bean('componentResolver')
    ], ComponentResolver);
    return ComponentResolver;
}());
exports.ComponentResolver = ComponentResolver;
