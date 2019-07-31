/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var Context = /** @class */ (function () {
    function Context(params, logger) {
        this.beanWrappers = {};
        this.registeredModules = [];
        this.componentsMappedByName = {};
        this.destroyed = false;
        if (!params || !params.beans) {
            return;
        }
        this.contextParams = params;
        this.registeredModules = params.registeredModules;
        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");
        this.setupComponents();
        this.createBeans();
        var beanInstances = this.getBeanInstances();
        this.wireBeans(beanInstances);
        this.logger.log(">> ag-Application Context ready - component is alive");
    }
    Context.prototype.getBeanInstances = function () {
        return utils_1._.mapObject(this.beanWrappers, function (beanEntry) { return beanEntry.beanInstance; });
    };
    Context.prototype.setupComponents = function () {
        var _this = this;
        if (this.contextParams.components) {
            this.contextParams.components.forEach(function (componentMeta) { return _this.addComponent(componentMeta); });
        }
    };
    Context.prototype.addComponent = function (componentMeta) {
        // get name of the class as a string
        // let className = _.getNameOfClass(ComponentClass);
        // insert a dash after every capital letter
        // let classEscaped = className.replace(/([A-Z])/g, "-$1").toLowerCase();
        var classEscaped = componentMeta.componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        // put all to upper case
        var classUpperCase = classEscaped.toUpperCase();
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.theClass;
    };
    Context.prototype.createComponentFromElement = function (element, afterPreCreateCallback) {
        var key = element.nodeName;
        if (this.componentsMappedByName && this.componentsMappedByName[key]) {
            var newComponent = new this.componentsMappedByName[key]();
            this.wireBean(newComponent, afterPreCreateCallback);
            return newComponent;
        }
        return null;
    };
    Context.prototype.wireBean = function (bean, afterPreCreateCallback) {
        if (!bean) {
            throw Error("Can't wire to bean since it is null");
        }
        this.wireBeans([bean], afterPreCreateCallback);
    };
    Context.prototype.wireBeans = function (beanInstances, afterPreCreateCallback) {
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);
        this.callLifeCycleMethods(beanInstances, 'preConstructMethods');
        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (utils_1._.exists(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }
        this.callLifeCycleMethods(beanInstances, 'postConstructMethods');
    };
    Context.prototype.createBeans = function () {
        var _this = this;
        // register all normal beans
        this.contextParams.beans.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name
        if (this.contextParams.overrideBeans) {
            this.contextParams.overrideBeans.forEach(this.createBeanWrapper.bind(this));
        }
        // instantiate all beans - overridden beans will be left out
        utils_1._.iterateObject(this.beanWrappers, function (key, beanEntry) {
            var constructorParamsMeta;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            var constructorParams = _this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            var newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;
            _this.logger.log("bean " + _this.getBeanName(newInstance) + " created");
        });
    };
    // tslint:disable-next-line
    Context.prototype.createBeanWrapper = function (Bean) {
        var metaData = Bean.__agBeanMetaData;
        if (!metaData) {
            var beanName = void 0;
            if (Bean.prototype.constructor) {
                beanName = Bean.prototype.constructor.name;
            }
            else {
                beanName = "" + Bean;
            }
            console.error("context item " + beanName + " is not a bean");
            return;
        }
        var beanEntry = {
            bean: Bean,
            beanInstance: null,
            beanName: metaData.beanName
        };
        this.beanWrappers[metaData.beanName] = beanEntry;
    };
    Context.prototype.autoWireBeans = function (beanInstances) {
        var _this = this;
        beanInstances.forEach(function (beanInstance) {
            _this.forEachMetaDataInHierarchy(beanInstance, function (metaData, beanName) {
                var attributes = metaData.agClassAttributes;
                if (!attributes) {
                    return;
                }
                attributes.forEach(function (attribute) {
                    var otherBean = _this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
                    beanInstance[attribute.attributeName] = otherBean;
                });
            });
        });
    };
    Context.prototype.methodWireBeans = function (beanInstances) {
        var _this = this;
        beanInstances.forEach(function (beanInstance) {
            _this.forEachMetaDataInHierarchy(beanInstance, function (metaData, beanName) {
                utils_1._.iterateObject(metaData.autowireMethods, function (methodName, wireParams) {
                    // skip constructor, as this is dealt with elsewhere
                    if (methodName === "agConstructor") {
                        return;
                    }
                    var initParams = _this.getBeansForParameters(wireParams, beanName);
                    beanInstance[methodName].apply(beanInstance, initParams);
                });
            });
        });
    };
    Context.prototype.forEachMetaDataInHierarchy = function (beanInstance, callback) {
        var prototype = Object.getPrototypeOf(beanInstance);
        while (prototype != null) {
            var constructor = prototype.constructor;
            if (constructor.hasOwnProperty('__agBeanMetaData')) {
                var metaData = constructor.__agBeanMetaData;
                var beanName = this.getBeanName(constructor);
                callback(metaData, beanName);
            }
            prototype = Object.getPrototypeOf(prototype);
        }
    };
    Context.prototype.getBeanName = function (constructor) {
        if (constructor.__agBeanMetaData && constructor.__agBeanMetaData.beanName) {
            return constructor.__agBeanMetaData.beanName;
        }
        var constructorString = constructor.toString();
        var beanName = constructorString.substring(9, constructorString.indexOf("("));
        return beanName;
    };
    Context.prototype.getBeansForParameters = function (parameters, beanName) {
        var _this = this;
        var beansList = [];
        if (parameters) {
            utils_1._.iterateObject(parameters, function (paramIndex, otherBeanName) {
                var otherBean = _this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    };
    Context.prototype.lookupBeanInstance = function (wiringBean, beanName, optional) {
        if (optional === void 0) { optional = false; }
        if (beanName === "context") {
            return this;
        }
        else if (this.contextParams.seed && this.contextParams.seed.hasOwnProperty(beanName)) {
            return this.contextParams.seed[beanName];
        }
        else {
            var beanEntry = this.beanWrappers[beanName];
            if (beanEntry) {
                return beanEntry.beanInstance;
            }
            if (!optional) {
                console.error("ag-Grid: unable to find bean reference " + beanName + " while initialising " + wiringBean);
            }
            return null;
        }
    };
    Context.prototype.callLifeCycleMethods = function (beanInstances, lifeCycleMethod) {
        var _this = this;
        beanInstances.forEach(function (beanInstance) {
            _this.forEachMetaDataInHierarchy(beanInstance, function (metaData) {
                var methods = metaData[lifeCycleMethod];
                if (!methods) {
                    return;
                }
                methods.forEach(function (methodName) { return beanInstance[methodName](); });
            });
        });
    };
    Context.prototype.getBean = function (name) {
        return this.lookupBeanInstance("getBean", name, true);
    };
    Context.prototype.getEnterpriseDefaultComponents = function () {
        return this.contextParams.enterpriseDefaultComponents;
    };
    Context.prototype.destroy = function () {
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log(">> Shutting down ag-Application Context");
        var beanInstances = this.getBeanInstances();
        this.callLifeCycleMethods(beanInstances, 'preDestroyMethods');
        this.contextParams.seed = null;
        this.destroyed = true;
        this.logger.log(">> ag-Application Context shut down - component is dead");
    };
    Context.prototype.isModuleRegistered = function (moduleName) {
        return this.registeredModules.indexOf(moduleName) !== -1;
    };
    return Context;
}());
exports.Context = Context;
// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
// allows calling 'apply' on a constructor
function applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}
function PreConstruct(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.preConstructMethods = [];
    }
    props.preConstructMethods.push(methodName);
}
exports.PreConstruct = PreConstruct;
function PostConstruct(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}
exports.PostConstruct = PostConstruct;
function PreDestroy(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.preDestroyMethods) {
        props.preDestroyMethods = [];
    }
    props.preDestroyMethods.push(methodName);
}
exports.PreDestroy = PreDestroy;
function Bean(beanName) {
    return function (classConstructor) {
        var props = getOrCreateProps(classConstructor);
        props.beanName = beanName;
    };
}
exports.Bean = Bean;
function Autowired(name) {
    return function (target, propertyKey, descriptor) {
        autowiredFunc(target, name, false, target, propertyKey, null);
    };
}
exports.Autowired = Autowired;
function Optional(name) {
    return function (target, propertyKey, descriptor) {
        autowiredFunc(target, name, true, target, propertyKey, null);
    };
}
exports.Optional = Optional;
function autowiredFunc(target, name, optional, classPrototype, methodOrAttributeName, index) {
    if (name === null) {
        console.error("ag-Grid: Autowired name should not be null");
        return;
    }
    if (typeof index === "number") {
        console.error("ag-Grid: Autowired should be on an attribute");
        return;
    }
    // it's an attribute on the class
    var props = getOrCreateProps(target.constructor);
    if (!props.agClassAttributes) {
        props.agClassAttributes = [];
    }
    props.agClassAttributes.push({
        attributeName: methodOrAttributeName,
        beanName: name,
        optional: optional
    });
}
function Qualifier(name) {
    return function (classPrototype, methodOrAttributeName, index) {
        var constructor = typeof classPrototype == "function" ? classPrototype : classPrototype.constructor;
        var props;
        if (typeof index === "number") {
            // it's a parameter on a method
            var methodName = void 0;
            if (methodOrAttributeName) {
                props = getOrCreateProps(constructor);
                methodName = methodOrAttributeName;
            }
            else {
                props = getOrCreateProps(constructor);
                methodName = "agConstructor";
            }
            if (!props.autowireMethods) {
                props.autowireMethods = {};
            }
            if (!props.autowireMethods[methodName]) {
                props.autowireMethods[methodName] = {};
            }
            props.autowireMethods[methodName][index] = name;
        }
    };
}
exports.Qualifier = Qualifier;
function getOrCreateProps(target) {
    if (!target.hasOwnProperty("__agBeanMetaData")) {
        target.__agBeanMetaData = {};
    }
    return target.__agBeanMetaData;
}
