/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { values, exists } from "../utils/generic";
import { iterateObject } from "../utils/object";
import { getFunctionName } from "../utils/function";
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
        return values(this.beanWrappers).map(function (beanEntry) { return beanEntry.beanInstance; });
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
        if (exists(afterPreCreateCallback)) {
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
        iterateObject(this.beanWrappers, function (key, beanEntry) {
            var constructorParamsMeta;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            var constructorParams = _this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            var newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;
        });
        var createdBeanNames = Object.keys(this.beanWrappers).join(', ');
        this.logger.log("created beans: " + createdBeanNames);
    };
    // tslint:disable-next-line
    Context.prototype.createBeanWrapper = function (BeanClass) {
        var metaData = BeanClass.__agBeanMetaData;
        if (!metaData) {
            var beanName = void 0;
            if (BeanClass.prototype.constructor) {
                beanName = getFunctionName(BeanClass.prototype.constructor);
            }
            else {
                beanName = "" + BeanClass;
            }
            console.error("Context item " + beanName + " is not a bean");
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
                iterateObject(metaData.autowireMethods, function (methodName, wireParams) {
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
            iterateObject(parameters, function (paramIndex, otherBeanName) {
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
        if (this.contextParams.providedBeanInstances && this.contextParams.providedBeanInstances.hasOwnProperty(beanName)) {
            return this.contextParams.providedBeanInstances[beanName];
        }
        var beanEntry = this.beanWrappers[beanName];
        if (beanEntry) {
            return beanEntry.beanInstance;
        }
        if (!optional) {
            console.error("AG Grid: unable to find bean reference " + beanName + " while initialising " + wiringBean);
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
        this.logger.log(">> Shutting down ag-Application Context");
        var beanInstances = this.getBeanInstances();
        this.destroyBeans(beanInstances);
        this.contextParams.providedBeanInstances = null;
        this.destroyed = true;
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
    return Context;
}());
export { Context };
// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
// allows calling 'apply' on a constructor
function applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}
export function PreConstruct(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.preConstructMethods) {
        props.preConstructMethods = [];
    }
    props.preConstructMethods.push(methodName);
}
export function PostConstruct(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}
export function PreDestroy(target, methodName, descriptor) {
    var props = getOrCreateProps(target.constructor);
    if (!props.preDestroyMethods) {
        props.preDestroyMethods = [];
    }
    props.preDestroyMethods.push(methodName);
}
export function Bean(beanName) {
    return function (classConstructor) {
        var props = getOrCreateProps(classConstructor);
        props.beanName = beanName;
    };
}
export function Autowired(name) {
    return function (target, propertyKey, descriptor) {
        autowiredFunc(target, name, false, target, propertyKey, null);
    };
}
export function Optional(name) {
    return function (target, propertyKey, descriptor) {
        autowiredFunc(target, name, true, target, propertyKey, null);
    };
}
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
export function Qualifier(name) {
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
function getOrCreateProps(target) {
    if (!target.hasOwnProperty("__agBeanMetaData")) {
        target.__agBeanMetaData = {};
    }
    return target.__agBeanMetaData;
}
