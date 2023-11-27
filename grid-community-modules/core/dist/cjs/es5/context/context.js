"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Qualifier = exports.Optional = exports.Autowired = exports.Bean = exports.PreDestroy = exports.PostConstruct = exports.PreConstruct = exports.Context = void 0;
var generic_1 = require("../utils/generic");
var object_1 = require("../utils/object");
var function_1 = require("../utils/function");
var moduleRegistry_1 = require("../modules/moduleRegistry");
var Context = /** @class */ (function () {
    function Context(params, logger) {
        this.beanWrappers = {};
        this.destroyed = false;
        if (!params || !params.beanClasses) {
            return;
        }
        this.contextParams = params;
        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");
        this.createBeans();
        var beanInstances = this.getBeanInstances();
        this.wireBeans(beanInstances);
        this.logger.log(">> ag-Application Context ready - component is alive");
    }
    Context.prototype.getBeanInstances = function () {
        return (0, generic_1.values)(this.beanWrappers).map(function (beanEntry) { return beanEntry.beanInstance; });
    };
    Context.prototype.createBean = function (bean, afterPreCreateCallback) {
        if (!bean) {
            throw Error("Can't wire to bean since it is null");
        }
        this.wireBeans([bean], afterPreCreateCallback);
        return bean;
    };
    Context.prototype.wireBeans = function (beanInstances, afterPreCreateCallback) {
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);
        this.callLifeCycleMethods(beanInstances, 'preConstructMethods');
        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if ((0, generic_1.exists)(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }
        this.callLifeCycleMethods(beanInstances, 'postConstructMethods');
    };
    Context.prototype.createBeans = function () {
        var _this = this;
        // register all normal beans
        this.contextParams.beanClasses.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name
        // instantiate all beans - overridden beans will be left out
        (0, object_1.iterateObject)(this.beanWrappers, function (key, beanEntry) {
            var constructorParamsMeta;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            var constructorParams = _this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            var newInstance = new (beanEntry.bean.bind.apply(beanEntry.bean, __spreadArray([null], __read(constructorParams), false)));
            beanEntry.beanInstance = newInstance;
        });
        var createdBeanNames = Object.keys(this.beanWrappers).join(', ');
        this.logger.log("created beans: ".concat(createdBeanNames));
    };
    // tslint:disable-next-line
    Context.prototype.createBeanWrapper = function (BeanClass) {
        var metaData = BeanClass.__agBeanMetaData;
        if (!metaData) {
            var beanName = void 0;
            if (BeanClass.prototype.constructor) {
                beanName = (0, function_1.getFunctionName)(BeanClass.prototype.constructor);
            }
            else {
                beanName = "" + BeanClass;
            }
            console.error("Context item ".concat(beanName, " is not a bean"));
            return;
        }
        var beanEntry = {
            bean: BeanClass,
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
                (0, object_1.iterateObject)(metaData.autowireMethods, function (methodName, wireParams) {
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
            (0, object_1.iterateObject)(parameters, function (paramIndex, otherBeanName) {
                var otherBean = _this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    };
    Context.prototype.lookupBeanInstance = function (wiringBean, beanName, optional) {
        if (optional === void 0) { optional = false; }
        if (this.destroyed) {
            this.logger.log("AG Grid: bean reference ".concat(beanName, " is used after the grid is destroyed!"));
            return null;
        }
        if (beanName === "context") {
            return this;
        }
        if (this.contextParams.providedBeanInstances && this.contextParams.providedBeanInstances.hasOwnProperty(beanName)) {
            return this.contextParams.providedBeanInstances[beanName];
        }
        var beanEntry = this.beanWrappers[beanName];
        if (beanEntry) {
            return beanEntry.beanInstance;
        }
        if (!optional) {
            console.error("AG Grid: unable to find bean reference ".concat(beanName, " while initialising ").concat(wiringBean));
        }
        return null;
    };
    Context.prototype.callLifeCycleMethods = function (beanInstances, lifeCycleMethod) {
        var _this = this;
        beanInstances.forEach(function (beanInstance) { return _this.callLifeCycleMethodsOnBean(beanInstance, lifeCycleMethod); });
    };
    Context.prototype.callLifeCycleMethodsOnBean = function (beanInstance, lifeCycleMethod, methodToIgnore) {
        // putting all methods into a map removes duplicates
        var allMethods = {};
        // dump methods from each level of the metadata hierarchy
        this.forEachMetaDataInHierarchy(beanInstance, function (metaData) {
            var methods = metaData[lifeCycleMethod];
            if (methods) {
                methods.forEach(function (methodName) {
                    if (methodName != methodToIgnore) {
                        allMethods[methodName] = true;
                    }
                });
            }
        });
        var allMethodsList = Object.keys(allMethods);
        allMethodsList.forEach(function (methodName) { return beanInstance[methodName](); });
    };
    Context.prototype.getBean = function (name) {
        return this.lookupBeanInstance("getBean", name, true);
    };
    Context.prototype.destroy = function () {
        if (this.destroyed) {
            return;
        }
        // Set before doing the destroy, so if context.destroy() gets called via another bean
        // we are marked as destroyed already to prevent running destroy() twice
        this.destroyed = true;
        this.logger.log(">> Shutting down ag-Application Context");
        var beanInstances = this.getBeanInstances();
        this.destroyBeans(beanInstances);
        this.contextParams.providedBeanInstances = null;
        moduleRegistry_1.ModuleRegistry.__unRegisterGridModules(this.contextParams.gridId);
        this.logger.log(">> ag-Application Context shut down - component is dead");
    };
    Context.prototype.destroyBean = function (bean) {
        if (!bean) {
            return;
        }
        this.destroyBeans([bean]);
    };
    Context.prototype.destroyBeans = function (beans) {
        var _this = this;
        if (!beans) {
            return [];
        }
        beans.forEach(function (bean) {
            _this.callLifeCycleMethodsOnBean(bean, 'preDestroyMethods', 'destroy');
            // call destroy() explicitly if it exists
            var beanAny = bean;
            if (typeof beanAny.destroy === 'function') {
                beanAny.destroy();
            }
        });
        return [];
    };
    Context.prototype.isDestroyed = function () {
        return this.destroyed;
    };
    Context.prototype.getGridId = function () {
        return this.contextParams.gridId;
    };
    return Context;
}());
exports.Context = Context;
function PreConstruct(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.preConstructMethods) {
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
        console.error("AG Grid: Autowired name should not be null");
        return;
    }
    if (typeof index === "number") {
        console.error("AG Grid: Autowired should be on an attribute");
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
