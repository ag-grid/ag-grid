/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Qualifier = exports.Optional = exports.Autowired = exports.Bean = exports.PreDestroy = exports.PostConstruct = exports.PreConstruct = exports.Context = void 0;
const generic_1 = require("../utils/generic");
const object_1 = require("../utils/object");
const function_1 = require("../utils/function");
class Context {
    constructor(params, logger) {
        this.beanWrappers = {};
        this.destroyed = false;
        if (!params || !params.beanClasses) {
            return;
        }
        this.contextParams = params;
        this.logger = logger;
        this.logger.log(">> creating ag-Application Context");
        this.createBeans();
        const beanInstances = this.getBeanInstances();
        this.wireBeans(beanInstances);
        this.logger.log(">> ag-Application Context ready - component is alive");
    }
    getBeanInstances() {
        return generic_1.values(this.beanWrappers).map(beanEntry => beanEntry.beanInstance);
    }
    createBean(bean, afterPreCreateCallback) {
        if (!bean) {
            throw Error(`Can't wire to bean since it is null`);
        }
        this.wireBeans([bean], afterPreCreateCallback);
        return bean;
    }
    wireBeans(beanInstances, afterPreCreateCallback) {
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);
        this.callLifeCycleMethods(beanInstances, 'preConstructMethods');
        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (generic_1.exists(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }
        this.callLifeCycleMethods(beanInstances, 'postConstructMethods');
    }
    createBeans() {
        // register all normal beans
        this.contextParams.beanClasses.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name
        // instantiate all beans - overridden beans will be left out
        object_1.iterateObject(this.beanWrappers, (key, beanEntry) => {
            let constructorParamsMeta;
            if (beanEntry.bean.__agBeanMetaData && beanEntry.bean.__agBeanMetaData.autowireMethods && beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor) {
                constructorParamsMeta = beanEntry.bean.__agBeanMetaData.autowireMethods.agConstructor;
            }
            const constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            const newInstance = new (beanEntry.bean.bind.apply(beanEntry.bean, [null, ...constructorParams]));
            beanEntry.beanInstance = newInstance;
        });
        const createdBeanNames = Object.keys(this.beanWrappers).join(', ');
        this.logger.log(`created beans: ${createdBeanNames}`);
    }
    // tslint:disable-next-line
    createBeanWrapper(BeanClass) {
        const metaData = BeanClass.__agBeanMetaData;
        if (!metaData) {
            let beanName;
            if (BeanClass.prototype.constructor) {
                beanName = function_1.getFunctionName(BeanClass.prototype.constructor);
            }
            else {
                beanName = "" + BeanClass;
            }
            console.error(`Context item ${beanName} is not a bean`);
            return;
        }
        const beanEntry = {
            bean: BeanClass,
            beanInstance: null,
            beanName: metaData.beanName
        };
        this.beanWrappers[metaData.beanName] = beanEntry;
    }
    autoWireBeans(beanInstances) {
        beanInstances.forEach(beanInstance => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData, beanName) => {
                const attributes = metaData.agClassAttributes;
                if (!attributes) {
                    return;
                }
                attributes.forEach((attribute) => {
                    const otherBean = this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
                    beanInstance[attribute.attributeName] = otherBean;
                });
            });
        });
    }
    methodWireBeans(beanInstances) {
        beanInstances.forEach(beanInstance => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData, beanName) => {
                object_1.iterateObject(metaData.autowireMethods, (methodName, wireParams) => {
                    // skip constructor, as this is dealt with elsewhere
                    if (methodName === "agConstructor") {
                        return;
                    }
                    const initParams = this.getBeansForParameters(wireParams, beanName);
                    beanInstance[methodName].apply(beanInstance, initParams);
                });
            });
        });
    }
    forEachMetaDataInHierarchy(beanInstance, callback) {
        let prototype = Object.getPrototypeOf(beanInstance);
        while (prototype != null) {
            const constructor = prototype.constructor;
            if (constructor.hasOwnProperty('__agBeanMetaData')) {
                const metaData = constructor.__agBeanMetaData;
                const beanName = this.getBeanName(constructor);
                callback(metaData, beanName);
            }
            prototype = Object.getPrototypeOf(prototype);
        }
    }
    getBeanName(constructor) {
        if (constructor.__agBeanMetaData && constructor.__agBeanMetaData.beanName) {
            return constructor.__agBeanMetaData.beanName;
        }
        const constructorString = constructor.toString();
        const beanName = constructorString.substring(9, constructorString.indexOf("("));
        return beanName;
    }
    getBeansForParameters(parameters, beanName) {
        const beansList = [];
        if (parameters) {
            object_1.iterateObject(parameters, (paramIndex, otherBeanName) => {
                const otherBean = this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    }
    lookupBeanInstance(wiringBean, beanName, optional = false) {
        if (beanName === "context") {
            return this;
        }
        if (this.contextParams.providedBeanInstances && this.contextParams.providedBeanInstances.hasOwnProperty(beanName)) {
            return this.contextParams.providedBeanInstances[beanName];
        }
        const beanEntry = this.beanWrappers[beanName];
        if (beanEntry) {
            return beanEntry.beanInstance;
        }
        if (!optional) {
            console.error(`AG Grid: unable to find bean reference ${beanName} while initialising ${wiringBean}`);
        }
        return null;
    }
    callLifeCycleMethods(beanInstances, lifeCycleMethod) {
        beanInstances.forEach(beanInstance => this.callLifeCycleMethodsOnBean(beanInstance, lifeCycleMethod));
    }
    callLifeCycleMethodsOnBean(beanInstance, lifeCycleMethod, methodToIgnore) {
        // putting all methods into a map removes duplicates
        const allMethods = {};
        // dump methods from each level of the metadata hierarchy
        this.forEachMetaDataInHierarchy(beanInstance, (metaData) => {
            const methods = metaData[lifeCycleMethod];
            if (methods) {
                methods.forEach(methodName => {
                    if (methodName != methodToIgnore) {
                        allMethods[methodName] = true;
                    }
                });
            }
        });
        const allMethodsList = Object.keys(allMethods);
        allMethodsList.forEach(methodName => beanInstance[methodName]());
    }
    getBean(name) {
        return this.lookupBeanInstance("getBean", name, true);
    }
    destroy() {
        if (this.destroyed) {
            return;
        }
        this.logger.log(">> Shutting down ag-Application Context");
        const beanInstances = this.getBeanInstances();
        this.destroyBeans(beanInstances);
        this.contextParams.providedBeanInstances = null;
        this.destroyed = true;
        this.logger.log(">> ag-Application Context shut down - component is dead");
    }
    destroyBean(bean) {
        if (!bean) {
            return;
        }
        this.destroyBeans([bean]);
    }
    destroyBeans(beans) {
        if (!beans) {
            return [];
        }
        beans.forEach(bean => {
            this.callLifeCycleMethodsOnBean(bean, 'preDestroyMethods', 'destroy');
            // call destroy() explicitly if it exists
            const beanAny = bean;
            if (typeof beanAny.destroy === 'function') {
                beanAny.destroy();
            }
        });
        return [];
    }
}
exports.Context = Context;
function PreConstruct(target, methodName, descriptor) {
    const props = getOrCreateProps(target.constructor);
    if (!props.preConstructMethods) {
        props.preConstructMethods = [];
    }
    props.preConstructMethods.push(methodName);
}
exports.PreConstruct = PreConstruct;
function PostConstruct(target, methodName, descriptor) {
    const props = getOrCreateProps(target.constructor);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}
exports.PostConstruct = PostConstruct;
function PreDestroy(target, methodName, descriptor) {
    const props = getOrCreateProps(target.constructor);
    if (!props.preDestroyMethods) {
        props.preDestroyMethods = [];
    }
    props.preDestroyMethods.push(methodName);
}
exports.PreDestroy = PreDestroy;
function Bean(beanName) {
    return (classConstructor) => {
        const props = getOrCreateProps(classConstructor);
        props.beanName = beanName;
    };
}
exports.Bean = Bean;
function Autowired(name) {
    return (target, propertyKey, descriptor) => {
        autowiredFunc(target, name, false, target, propertyKey, null);
    };
}
exports.Autowired = Autowired;
function Optional(name) {
    return (target, propertyKey, descriptor) => {
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
    const props = getOrCreateProps(target.constructor);
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
    return (classPrototype, methodOrAttributeName, index) => {
        const constructor = typeof classPrototype == "function" ? classPrototype : classPrototype.constructor;
        let props;
        if (typeof index === "number") {
            // it's a parameter on a method
            let methodName;
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
