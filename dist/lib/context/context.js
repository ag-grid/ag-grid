/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var logger_1 = require("../logger");
var Context = (function () {
    function Context(params) {
        this.beans = {};
        this.destroyed = false;
        if (!params || !params.beans) {
            return;
        }
        this.contextParams = params;
        this.logger = new logger_1.Logger('Context', this.contextParams.debug);
        this.logger.log('>> creating ag-Application Context');
        this.createBeans();
        var beans = utils_1.Utils.mapObject(this.beans, function (beanEntry) { return beanEntry.beanInstance; });
        this.wireBeans(beans);
        this.logger.log('>> ag-Application Context ready - component is alive');
    }
    Context.prototype.wireBean = function (bean) {
        this.wireBeans([bean]);
    };
    Context.prototype.wireBeans = function (beans) {
        this.autoWireBeans(beans);
        this.methodWireBeans(beans);
        this.postWire(beans);
        this.wireCompleteBeans(beans);
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
            if (beanEntry.bean.prototype.__agBeanMetaData
                && beanEntry.bean.prototype.__agBeanMetaData.agConstructor) {
                constructorParamsMeta = beanEntry.bean.prototype.__agBeanMetaData.agConstructor;
            }
            var constructorParams = _this.getBeansForParameters(constructorParamsMeta, beanEntry.beanName);
            var newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;
            _this.logger.log('bean ' + _this.getBeanName(newInstance) + ' created');
        });
    };
    Context.prototype.createBeanEntry = function (Bean) {
        var metaData = Bean.prototype.__agBeanMetaData;
        if (!metaData) {
            var beanName;
            if (Bean.prototype.constructor) {
                beanName = Bean.prototype.constructor.name;
            }
            else {
                beanName = '' + Bean;
            }
            console.error('context item ' + beanName + ' is not a bean');
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
        beans.forEach(function (bean) { return _this.methodWireBean(bean); });
    };
    Context.prototype.autoWireBean = function (bean) {
        var _this = this;
        if (!bean
            || !bean.__agBeanMetaData
            || !bean.__agBeanMetaData.agClassAttributes) {
            return;
        }
        var attributes = bean.__agBeanMetaData.agClassAttributes;
        if (!attributes) {
            return;
        }
        var beanName = this.getBeanName(bean);
        attributes.forEach(function (attribute) {
            var otherBean = _this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
            bean[attribute.attributeName] = otherBean;
        });
    };
    Context.prototype.getBeanName = function (bean) {
        var constructorString = bean.constructor.toString();
        var beanName = constructorString.substring(9, constructorString.indexOf('('));
        return beanName;
    };
    Context.prototype.methodWireBean = function (bean) {
        var beanName = this.getBeanName(bean);
        // if no init method, skip he bean
        if (!bean.agWire) {
            return;
        }
        var wireParams;
        if (bean.__agBeanMetaData
            && bean.__agBeanMetaData.agWire) {
            wireParams = bean.__agBeanMetaData.agWire;
        }
        var initParams = this.getBeansForParameters(wireParams, beanName);
        bean.agWire.apply(bean, initParams);
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
        if (beanName === 'context') {
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
                console.error('ag-Grid: unable to find bean reference ' + beanName + ' while initialising ' + wiringBean);
            }
            return null;
        }
    };
    Context.prototype.postWire = function (beans) {
        beans.forEach(function (bean) {
            // try calling init methods
            if (bean.__agBeanMetaData && bean.__agBeanMetaData.postConstructMethods) {
                bean.__agBeanMetaData.postConstructMethods.forEach(function (methodName) { return bean[methodName](); });
            }
        });
    };
    Context.prototype.wireCompleteBeans = function (beans) {
        beans.forEach(function (bean) {
            if (bean.agApplicationBoot) {
                bean.agApplicationBoot();
            }
        });
    };
    Context.prototype.destroy = function () {
        var _this = this;
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log('>> Shutting down ag-Application Context');
        utils_1.Utils.iterateObject(this.beans, function (key, beanEntry) {
            if (beanEntry.beanInstance.agDestroy) {
                if (_this.contextParams.debug) {
                    console.log('ag-Grid: destroying ' + beanEntry.beanName);
                }
                beanEntry.beanInstance.agDestroy();
            }
            _this.logger.log('bean ' + _this.getBeanName(beanEntry.beanInstance) + ' destroyed');
        });
        this.destroyed = true;
        this.logger.log('>> ag-Application Context shut down - component is dead');
    };
    return Context;
})();
exports.Context = Context;
// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
// allows calling 'apply' on a constructor
function applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}
function PostConstruct(target, methodName, descriptor) {
    // it's an attribute on the class
    var props = getOrCreateProps(target);
    if (!props.postConstructMethods) {
        props.postConstructMethods = [];
    }
    props.postConstructMethods.push(methodName);
}
exports.PostConstruct = PostConstruct;
function Bean(beanName) {
    return function (classConstructor) {
        var props = getOrCreateProps(classConstructor.prototype);
        props.beanName = beanName;
    };
}
exports.Bean = Bean;
function Autowired(name) {
    return autowiredFunc.bind(this, name, false);
}
exports.Autowired = Autowired;
function Optional(name) {
    return autowiredFunc.bind(this, name, true);
}
exports.Optional = Optional;
function autowiredFunc(name, optional, classPrototype, methodOrAttributeName, index) {
    if (name === null) {
        console.error('ag-Grid: Autowired name should not be null');
        return;
    }
    if (typeof index === 'number') {
        console.error('ag-Grid: Autowired should be on an attribute');
        return;
    }
    // it's an attribute on the class
    var props = getOrCreateProps(classPrototype);
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
        var props;
        if (typeof index === 'number') {
            // it's a parameter on a method
            var methodName;
            if (methodOrAttributeName) {
                props = getOrCreateProps(classPrototype);
                methodName = methodOrAttributeName;
            }
            else {
                props = getOrCreateProps(classPrototype.prototype);
                methodName = 'agConstructor';
            }
            if (!props[methodName]) {
                props[methodName] = {};
            }
            props[methodName][index] = name;
        }
    };
}
exports.Qualifier = Qualifier;
function getOrCreateProps(target) {
    var props = target.__agBeanMetaData;
    if (!props) {
        props = {};
        target.__agBeanMetaData = props;
    }
    return props;
}
