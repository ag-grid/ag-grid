import Vue from "vue";
import {ComponentUtil, Grid} from "ag-grid-community";
import {VueFrameworkFactory} from "./vueFrameworkFactory";
import {VueFrameworkComponentWrapper} from "./vueFrameworkComponentWrapper";

const watchedProperties = {};
const props = {
    gridOptions: {
        default: function () {
            return {};
        }
    }
};
ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
    props[propertyName] = {};

    watchedProperties[propertyName] = function (val, oldVal) {
        this.processChanges(propertyName, val, oldVal);
    };
});
ComponentUtil.EVENTS.forEach((eventName) => {
    props[eventName] = {};
});

export default Vue.extend({
    render: function (h) {
        return h('div');
    },
    props: props,
    data() {
        return {
            _initialised: false,
            _destroyed: false,
        };
    },
    methods: {
        globalEventListener(eventType, event) {
            if (this._destroyed) {
                return;
            }

            // generically look up the eventType
            let emitter = this[eventType];
            if (emitter) {
                emitter(event);
            }
        },
        processChanges(propertyName, val, oldVal) {
            if (this._initialised) {
                let changes = {};
                changes[propertyName] = {currentValue: val, previousValue: oldVal};
                ComponentUtil.processOnChange(changes, this.gridOptions, this.gridOptions.api, this.gridOptions.columnApi);
            }
        }
    },
    mounted() {
        let frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        let vueFrameworkFactory = new VueFrameworkFactory(this.$el, this);
        let gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

        let gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: vueFrameworkFactory,
            seedBeanInstances: {
                frameworkComponentWrapper: frameworkComponentWrapper
            }
        };

        new Grid(this.$el, gridOptions, gridParams);

        this._initialised = true;
    },
    watch: watchedProperties,
    destroyed() {
        if (this._initialised) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this._destroyed = true;
        }
    }
});

