"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VueComponentFactory = void 0;

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VueComponentFactory =
/*#__PURE__*/
function () {
  function VueComponentFactory($el, parent) {
    _classCallCheck(this, VueComponentFactory);

    this.$el = $el;
    this.parent = parent;
  }

  _createClass(VueComponentFactory, [{
    key: "createRendererFromComponent",
    value: function createRendererFromComponent(component) {
      var parent = this.parent;
      var componentType = VueComponentFactory.getComponentType(parent, component);

      if (!componentType) {
        return;
      }

      var CellRendererComponent =
      /*#__PURE__*/
      function () {
        function CellRendererComponent() {
          _classCallCheck(this, CellRendererComponent);
        }

        _createClass(CellRendererComponent, [{
          key: "init",
          value: function init(params) {
            this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
          }
        }, {
          key: "getGui",
          value: function getGui() {
            return this.component.$el;
          }
        }, {
          key: "destroy",
          value: function destroy() {
            this.component.$destroy();
          }
        }]);

        return CellRendererComponent;
      }();

      return CellRendererComponent;
    }
  }, {
    key: "createEditorFromComponent",
    value: function createEditorFromComponent(component) {
      var parent = this.parent;
      var componentType = VueComponentFactory.getComponentType(parent, component);

      if (!componentType) {
        return;
      }

      var CellEditor =
      /*#__PURE__*/
      function () {
        function CellEditor() {
          _classCallCheck(this, CellEditor);
        }

        _createClass(CellEditor, [{
          key: "init",
          value: function init(params) {
            this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
          }
        }, {
          key: "getValue",
          value: function getValue() {
            return this.component.getValue();
          }
        }, {
          key: "getGui",
          value: function getGui() {
            return this.component.$el;
          }
        }, {
          key: "destroy",
          value: function destroy() {
            this.component.$destroy();
          }
        }, {
          key: "isPopup",
          value: function isPopup() {
            return this.component.isPopup ? this.component.isPopup() : false;
          }
        }, {
          key: "isCancelBeforeStart",
          value: function isCancelBeforeStart() {
            return this.component.isCancelBeforeStart ? this.component.isCancelBeforeStart() : false;
          }
        }, {
          key: "isCancelAfterEnd",
          value: function isCancelAfterEnd() {
            return this.component.isCancelAfterEnd ? this.component.isCancelAfterEnd() : false;
          }
        }, {
          key: "focusIn",
          value: function focusIn() {
            if (this.component.focusIn) {
              this.component.focusIn();
            }
          }
        }, {
          key: "focusOut",
          value: function focusOut() {
            if (this.component.focusOut) {
              this.component.focusOut();
            }
          }
        }]);

        return CellEditor;
      }();

      return CellEditor;
    }
  }, {
    key: "createFilterFromComponent",
    value: function createFilterFromComponent(component) {
      var parent = this.parent;
      var componentType = VueComponentFactory.getComponentType(parent, component);

      if (!componentType) {
        return;
      }

      var Filter =
      /*#__PURE__*/
      function () {
        function Filter() {
          _classCallCheck(this, Filter);
        }

        _createClass(Filter, [{
          key: "init",
          value: function init(params) {
            this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
          }
        }, {
          key: "getGui",
          value: function getGui() {
            return this.component.$el;
          }
        }, {
          key: "destroy",
          value: function destroy() {
            this.component.$destroy();
          }
        }, {
          key: "isFilterActive",
          value: function isFilterActive() {
            return this.component.isFilterActive();
          }
        }, {
          key: "doesFilterPass",
          value: function doesFilterPass(params) {
            return this.component.doesFilterPass(params);
          }
        }, {
          key: "getModel",
          value: function getModel() {
            return this.component.getModel();
          }
        }, {
          key: "setModel",
          value: function setModel(model) {
            this.component.setModel(model);
          }
        }, {
          key: "afterGuiAttached",
          value: function afterGuiAttached(params) {
            if (this.component.afterGuiAttached) {
              this.component.afterGuiAttached(params);
            }
          }
        }, {
          key: "getFrameworkComponentInstance",
          value: function getFrameworkComponentInstance() {
            return this.component;
          }
        }]);

        return Filter;
      }();

      return Filter;
    }
  }], [{
    key: "getComponentType",
    value: function getComponentType(parent, component) {
      if (typeof component === 'string') {
        var componentInstance = parent.$parent.$options.components[component];

        if (!componentInstance) {
          console.error("Could not find component with name of ".concat(component, ". Is it in Vue.components?"));
          return null;
        }

        return _vue.default.extend(componentInstance);
      } else {
        // assume a type
        return component;
      }
    }
  }, {
    key: "createAndMountComponent",
    value: function createAndMountComponent(params, componentType, parent) {
      var details = {
        data: {
          params: Object.freeze(params)
        },
        parent: parent,
        router: parent.$router,
        store: parent.$store
      };
      var component = new componentType(details);
      component.$mount();
      return component;
    }
  }]);

  return VueComponentFactory;
}();

exports.VueComponentFactory = VueComponentFactory;