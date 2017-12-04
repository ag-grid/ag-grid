/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v14.2.0
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
var namedComponentResolver_1 = require("./namedComponentResolver");
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
     *  @param componentNameOpt: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param mandatory: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     */
    ComponentResolver.prototype.getComponentToUse = function (holder, propertyName, componentNameOpt) {
        var componentName = componentNameOpt == null ? propertyName : componentNameOpt;
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
        }
        /**
         * Since we allow many types of flavors for specifying the components, let's make sure this is not an illegal
         * combination
         */
        if ((HardcodedJsComponent && HardcodedFwComponent) ||
            (hardcodedNameComponent && HardcodedFwComponent) ||
            (hardcodedJsFunction && HardcodedFwComponent)) {
            throw Error("You are trying to specify: " + propertyName + " twice as a component.");
        }
        if (HardcodedFwComponent && !this.frameworkComponentWrapper) {
            throw Error("You are specifying a framework component but you are not using a framework version of ag-grid for : " + propertyName);
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
                source: ComponentSource.HARDCODED
            };
        }
        if (HardcodedJsComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedJsComponent}`);
            return {
                type: ComponentType.AG_GRID,
                component: HardcodedJsComponent,
                source: ComponentSource.HARDCODED
            };
        }
        if (hardcodedJsFunction) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a function directly is deprecated, you should register the component by name`);
            // console.warn(`${hardcodedJsFunction}`);
            return this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, ComponentType.AG_GRID, ComponentSource.HARDCODED);
        }
        //^^^^^ABOVE DEPRECATED
        var componentNameToUse;
        if (hardcodedNameComponent) {
            componentNameToUse = hardcodedNameComponent;
        }
        else {
            componentNameToUse = componentName;
        }
        return this.namedComponentResolver.resolve(propertyName, componentNameToUse);
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
    ComponentResolver.prototype.mergeParams = function (holder, propertyName, agGridParams) {
        var customParams = holder ? holder[propertyName + "Params"] : null;
        var finalParams = {};
        utils_1._.mergeDeep(finalParams, agGridParams);
        utils_1._.mergeDeep(finalParams, customParams);
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
     *  @param componentNameOpt: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param mandatory: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     *  @param customInitParamsCb: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    ComponentResolver.prototype.createAgGridComponent = function (holderOpt, agGridParams, propertyName, componentNameOpt, mandatory, customInitParamsCb) {
        if (mandatory === void 0) { mandatory = true; }
        var holder = holderOpt == null ? this.gridOptions : holderOpt;
        var componentName = componentNameOpt == null ? propertyName : componentNameOpt;
        //Create the component instance
        var component = this.newAgGridComponent(holder, propertyName, componentName, mandatory);
        if (!component)
            return null;
        //Wire the component and call the init method with the correct params
        var finalParams = this.mergeParams(holder, propertyName, agGridParams);
        this.context.wireBean(component);
        var deferredInit;
        if (customInitParamsCb == null) {
            deferredInit = component.init(finalParams);
        }
        else {
            deferredInit = component.init(customInitParamsCb(finalParams, component));
        }
        if (deferredInit == null) {
            return utils_1.Promise.resolve(component);
            // return new Promise<A> (resolve=>{
            //     setTimeout(
            //         ()=>resolve(component),
            //         500
            //     )
            // })
        }
        else {
            var asPromise = deferredInit;
            return asPromise.map(function (notRelevant) { return component; });
        }
    };
    ComponentResolver.prototype.newAgGridComponent = function (holder, propertyName, componentName, mandatory) {
        if (mandatory === void 0) { mandatory = true; }
        var componentToUse = this.getComponentToUse(holder, propertyName, componentName);
        if (!componentToUse || !componentToUse.component) {
            if (mandatory) {
                console.error("Error creating component " + propertyName + "=>" + componentName);
            }
            return null;
        }
        if (componentToUse.type === ComponentType.AG_GRID) {
            return new componentToUse.component();
        }
        //Using framework component
        var FrameworkComponentRaw = componentToUse.component;
        var thisComponentConfig = this.componentMetadataProvider.retrieve(propertyName);
        return this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, componentName);
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
        context_1.Autowired("namedComponentResolver"),
        __metadata("design:type", namedComponentResolver_1.NamedComponentResolver)
    ], ComponentResolver.prototype, "namedComponentResolver", void 0);
    __decorate([
        context_1.Autowired("agComponentUtils"),
        __metadata("design:type", agComponentUtils_1.AgComponentUtils)
    ], ComponentResolver.prototype, "agComponentUtils", void 0);
    __decorate([
        context_1.Autowired("componentMetadataProvider"),
        __metadata("design:type", componentMetadataProvider_1.ComponentMetadataProvider)
    ], ComponentResolver.prototype, "componentMetadataProvider", void 0);
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
