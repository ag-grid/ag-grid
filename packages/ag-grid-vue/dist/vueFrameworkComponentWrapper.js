'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VueFrameworkComponentWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vueComponentFactory = require('./vueComponentFactory');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VueFrameworkComponentWrapper = function () {
    function VueFrameworkComponentWrapper(parent) {
        _classCallCheck(this, VueFrameworkComponentWrapper);

        this._parent = parent;
    }

    _createClass(VueFrameworkComponentWrapper, [{
        key: 'wrap',
        value: function wrap(component, methodList, optionalMethods) {
            var componentType = _vueComponentFactory.VueComponentFactory.getComponentType(this._parent, component);
            if (!componentType) {
                return;
            }

            var DynamicComponent = function () {
                function DynamicComponent() {
                    _classCallCheck(this, DynamicComponent);
                }

                _createClass(DynamicComponent, [{
                    key: 'init',
                    value: function init(params) {
                        this.component = _vueComponentFactory.VueComponentFactory.createAndMountComponent(params, componentType);
                    }
                }, {
                    key: 'getGui',
                    value: function getGui() {
                        return this.component.$el;
                    }
                }, {
                    key: 'destroy',
                    value: function destroy() {
                        this.component.$destroy();
                    }
                }, {
                    key: 'getFrameworkComponentInstance',
                    value: function getFrameworkComponentInstance() {
                        return this.component;
                    }
                }]);

                return DynamicComponent;
            }();

            var wrapper = new DynamicComponent();
            methodList.forEach(function (methodName) {
                wrapper[methodName] = function () {
                    if (wrapper.getFrameworkComponentInstance()[methodName]) {
                        var componentRef = this.getFrameworkComponentInstance();
                        return wrapper.getFrameworkComponentInstance()[methodName].apply(componentRef, arguments);
                    } else {
                        console.warn('ag-Grid: Vue component is missing the method ' + methodName + '()');
                        return null;
                    }
                };
            });
            optionalMethods.forEach(function (methodName) {
                wrapper[methodName] = function () {
                    if (wrapper.getFrameworkComponentInstance()[methodName]) {
                        var componentRef = this.getFrameworkComponentInstance();
                        return wrapper.getFrameworkComponentInstance()[methodName].apply(componentRef, arguments);
                    }
                };
            });

            return wrapper;
        }
    }]);

    return VueFrameworkComponentWrapper;
}();

VueFrameworkComponentWrapper.prototype.__agBeanMetaData = {
    beanName: "frameworkComponentWrapper"
};

exports.VueFrameworkComponentWrapper = VueFrameworkComponentWrapper;