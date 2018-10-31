"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _agGridCommunity = require("ag-grid-community");

var _vueFrameworkFactory = require("./vueFrameworkFactory");

var _vueFrameworkComponentWrapper = require("./vueFrameworkComponentWrapper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var watchedProperties = {};
var props = {
  gridOptions: {
    default: function _default() {
      return {};
    }
  }
};

_agGridCommunity.ComponentUtil.ALL_PROPERTIES.forEach(function (propertyName) {
  props[propertyName] = {};

  watchedProperties[propertyName] = function (val, oldVal) {
    this.processChanges(propertyName, val, oldVal);
  };
});

_agGridCommunity.ComponentUtil.EVENTS.forEach(function (eventName) {
  props[eventName] = {};
});

var _default2 = _vue.default.extend({
  render: function render(h) {
    return h('div');
  },
  props: props,
  data: function data() {
    return {
      _initialised: false,
      _destroyed: false
    };
  },
  methods: {
    globalEventListener: function globalEventListener(eventType, event) {
      if (this._destroyed) {
        return;
      } // generically look up the eventType


      var emitter = this[eventType];

      if (emitter) {
        emitter(event);
      }
    },
    processChanges: function processChanges(propertyName, val, oldVal) {
      if (this._initialised) {
        var changes = {};
        changes[propertyName] = {
          currentValue: val,
          previousValue: oldVal
        };

        _agGridCommunity.ComponentUtil.processOnChange(changes, this.gridOptions, this.gridOptions.api, this.gridOptions.columnApi);
      }
    }
  },
  mounted: function mounted() {
    var frameworkComponentWrapper = new _vueFrameworkComponentWrapper.VueFrameworkComponentWrapper(this);
    var vueFrameworkFactory = new _vueFrameworkFactory.VueFrameworkFactory(this.$el, this);

    var gridOptions = _agGridCommunity.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

    var gridParams = {
      globalEventListener: this.globalEventListener.bind(this),
      frameworkFactory: vueFrameworkFactory,
      seedBeanInstances: {
        frameworkComponentWrapper: frameworkComponentWrapper
      }
    };
    new _agGridCommunity.Grid(this.$el, gridOptions, gridParams);
    this._initialised = true;
  },
  watch: watchedProperties,
  destroyed: function destroyed() {
    if (this._initialised) {
      if (this.gridOptions.api) {
        this.gridOptions.api.destroy();
      }

      this._destroyed = true;
    }
  }
});

exports.default = _default2;