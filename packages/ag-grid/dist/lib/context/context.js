/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var Context = (function () {
    function Context(params, logger) {
        this.beans = {};
        this.componentsMappedByName = {};
        this.destroyed = false;
        if (!params || !params.beans) {
            return;
        }
        this.contextParams = params;
        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");
        this.setupComponents();
        this.createBeans();
        var beans = utils_1.Utils.mapObject(this.beans, function (beanEntry) { return beanEntry.beanInstance; });
        this.wireBeans(beans);
        this.logger.log(">> ag-Application Context ready - component is alive");
    }
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
    Context.prototype.createComponent = function (element, afterPreCreateCallback) {
        var key = element.nodeName;
        if (this.componentsMappedByName && this.componentsMappedByName[key]) {
            var newComponent = new this.componentsMappedByName[key]();
            this.wireBean(newComponent, afterPreCreateCallback);
            return newComponent;
        }
        else {
            return null;
        }
    };
    Context.prototype.wireBean = function (bean, afterPreCreateCallback) {
        if (!bean) {
            throw Error("Can't wire to bean since it is null");
        }
        this.wireBeans([bean], afterPreCreateCallback);
    };
    Context.prototype.wireBeans = function (beans, afterPreCreateCallback) {
        this.autoWireBeans(beans);
        this.methodWireBeans(beans);
        this.preConstruct(beans);
        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (utils_1.Utils.exists(afterPreCreateCallback)) {
            beans.forEach(afterPreCreateCallback);
        }
        this.postConstruct(beans);
    };
    Context.prototype.createBeans = function () {
        var _this = this;
        // register all normal beans
        this.contextParams.beans.forEach(this.createBeanEntry.bind(this));
        // register override beans, these will overwrite beans above of same name
        if (this.contextParams.overrideBeans) {
            this.contextParams.overrideBeans.forEach(this.createBeanEntry.bind(this));
        }
        // instantiate all beans - overridden beans will be left out
        utils_1.Utils.iterateObject(this.beans, function (key, beanEntry) {
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
    Context.prototype.createBeanEntry = function (Bean) {
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
        this.beans[metaData.beanName] = beanEntry;
    };
    Context.prototype.autoWireBeans = function (beans) {
        var _this = this;
        beans.forEach(function (bean) { return _this.autoWireBean(bean); });
    };
    Context.prototype.methodWireBeans = function (beans) {
        var _this = this;
        beans.forEach(function (bean) {
            if (!bean) {
                throw Error("Can't wire to bean since it is null");
            }
            return _this.methodWireBean(bean);
        });
    };
    Context.prototype.autoWireBean = function (bean) {
        var _this = this;
        var currentBean = bean;
        var _loop_1 = function () {
            var currentConstructor = currentBean.constructor;
            if (currentConstructor.__agBeanMetaData && currentConstructor.__agBeanMetaData.agClassAttributes) {
                var attributes = currentConstructor.__agBeanMetaData.agClassAttributes;
                if (!attributes) {
                    return { value: void 0 };
                }
                var beanName_1 = this_1.getBeanName(currentConstructor);
                attributes.forEach(function (attribute) {
                    var otherBean = _this.lookupBeanInstance(beanName_1, attribute.beanName, attribute.optional);
                    bean[attribute.attributeName] = otherBean;
                });
            }
            currentBean = Object.getPrototypeOf(currentBean) ? Object.getPrototypeOf(currentBean) : null;
        };
        var this_1 = this;
        while (currentBean != null) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
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
    Context.prototype.methodWireBean = function (bean) {
        var _this = this;
        var autowiredMethods;
        if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.autowireMethods) {
            autowiredMethods = bean.constructor.__agBeanMetaData.autowireMethods;
        }
        utils_1.Utils.iterateObject(autowiredMethods, function (methodName, wireParams) {
            // skip constructor, as this is dealt with elsewhere
            if (methodName === "agConstructor") {
                return;
            }
            var beanName = _this.getBeanName(bean.constructor);
            var initParams = _this.getBeansForParameters(wireParams, beanName);
            bean[methodName].apply(bean, initParams);
        });
    };
    Context.prototype.getBeansForParameters = function (parameters, beanName) {
        var _this = this;
        var beansList = [];
        if (parameters) {
            utils_1.Utils.iterateObject(parameters, function (paramIndex, otherBeanName) {
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
            var beanEntry = this.beans[beanName];
            if (beanEntry) {
                return beanEntry.beanInstance;
            }
            if (!optional) {
                console.error("ag-Grid: unable to find bean reference " + beanName + " while initialising " + wiringBean);
            }
            return null;
        }
    };
    Context.prototype.postConstruct = function (beans) {
        beans.forEach(function (bean) {
            // try calling init methods
            if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.postConstructMethods) {
                bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.postConstructMethods.forEach(function (methodName) { return bean[methodName](); });
            }
        });
    };
    Context.prototype.preConstruct = function (beans) {
        beans.forEach(function (bean) {
            // try calling init methods
            if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.preConstructMethods) {
                bean.constructor.__agBeanMetaData.preConstructMethods.forEach(function (methodName) { return bean[methodName](); });
            }
        });
    };
    Context.prototype.getBean = function (name) {
        return this.lookupBeanInstance("getBean", name, true);
    };
    Context.prototype.destroy = function () {
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log(">> Shutting down ag-Application Context");
        // try calling destroy methods
        utils_1.Utils.iterateObject(this.beans, function (key, beanEntry) {
            var bean = beanEntry.beanInstance;
            if (bean.constructor.__agBeanMetaData && bean.constructor.__agBeanMetaData.preDestroyMethods) {
                bean.constructor.__agBeanMetaData.preDestroyMethods.forEach(function (methodName) { return bean[methodName](); });
            }
        });
        this.destroyed = true;
        this.logger.log(">> ag-Application Context shut down - component is dead");
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
