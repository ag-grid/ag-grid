"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vue = require("vue");

var _vue2 = _interopRequireDefault(_vue);

var _main = require("ag-grid/main");

var _vueFrameworkFactory = require("./vueFrameworkFactory");

var _vueFrameworkComponentWrapper = require("./vueFrameworkComponentWrapper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var watchedProperties = {};
var props = ['gridOptions'];
_main.ComponentUtil.ALL_PROPERTIES.forEach(function (propertyName) {
    props.push(propertyName);

    watchedProperties[propertyName] = function (val, oldVal) {
        this.processChanges(propertyName, val, oldVal);
    };
});
_main.ComponentUtil.EVENTS.forEach(function (eventName) {
    props.push(eventName);
});

exports.default = _vue2.default.extend({
    template: '<div></div>',
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
            }

            // generically look up the eventType
            var emitter = this[eventType];
            if (emitter) {
                emitter(event);
            } else {
                // the app isn't listening for this - ignore it
            }
        },
        processChanges: function processChanges(propertyName, val, oldVal) {
            if (this._initialised) {
                var changes = {};
                changes[propertyName] = { currentValue: val, previousValue: oldVal };
                _main.ComponentUtil.processOnChange(changes, this.gridOptions, this.gridOptions.api, this.gridOptions.columnApi);
            }
        }
    },
    mounted: function mounted() {
        var frameworkComponentWrapper = new _vueFrameworkComponentWrapper.VueFrameworkComponentWrapper(this);
        var vueFrameworkFactory = new _vueFrameworkFactory.VueFrameworkFactory(this.$el, this);
        var gridOptions = _main.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

        var gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: vueFrameworkFactory,
            seedBeanInstances: {
                frameworkComponentWrapper: frameworkComponentWrapper
            }
        };

        new _main.Grid(this.$el, gridOptions, gridParams);

        this._initialised = true;
    },

    watch: watchedProperties,
    destroyed: function destroyed() {
        if (this._initialised) {
            this.gridOptions.api.destroy();
            this._destroyed = true;
        }
    }
});