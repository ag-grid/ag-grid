<script>
    import {Grid, GridOptions, GridApi, ColumnApi, GridParams, ComponentUtil} from "ag-grid/main";
    import {VueFrameworkFactory} from "./vueFrameworkFactory";
    import {VueComponentFactory} from "./vueComponentFactory";

    const watchedProperties = {};
    const props = ['gridOptions'];
    ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
        props.push(propertyName);

        watchedProperties[propertyName] = function (val, oldVal) {
            this.processChanges(propertyName, val, oldVal);
        };
    });
    ComponentUtil.EVENTS.forEach((eventName) => {
        props.push(eventName);
    });

    export default {
        template: '<div></div>',
        props: props,
        data()  {
            return {
                _initialised: false,
                _destroyed: false,

                api: null,
                columnApi: null
            }
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
                } else {
                    // the app isnt listening for this - ignore it
                }
            },
            processChanges(propertyName, val, oldVal) {
                if (this._initialised) {
                    let changes = {};
                    changes[propertyName] = {currentValue: val, previousValue: oldVal};
                    ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
                }
            }
        },
        mounted() {
            let vueFrameworkFactory = new VueFrameworkFactory(this.$el, this);
            let gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

            let gridParams = {
                globalEventListener: this.globalEventListener.bind(this),
                frameworkFactory: vueFrameworkFactory
            };
            new Grid(this.$el, gridOptions, gridParams);

            if (this.gridOptions.api) {
                this.api = this.gridOptions.api;
            }

            if (this.gridOptions.columnApi) {
                this.columnApi = this.gridOptions.columnApi;
            }

            this._initialised = true;
        },
        watch: watchedProperties,
        destroyed() {
            if (this._initialised) {
                this.api.destroy();
                this._destroyed = true;
            }
        }
    };
</script>
