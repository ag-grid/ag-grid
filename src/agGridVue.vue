<script>
    import {Grid, GridOptions, GridApi, ColumnApi, GridParams, ComponentUtil} from "ag-grid/main";

    const props = ['gridOptions'];
    ComponentUtil.ALL_PROPERTIES.forEach((propertyName) => {
        props.push(propertyName);
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
                if (emitter && emitter instanceof Function) {
                    emitter(event);
                } else {
                    console.log('ag-Grid-vue: could not find event emitter for: ' + eventType);
                }
            }
        },
        mounted() {
            let gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
            let gridParams = {
                globalEventListener: this.globalEventListener.bind(this),
//                frameworkFactory: this.auFrameworkFactory
            };
//            new Grid(this.$el, this.gridOptions, this.gridParams);
            new Grid(this.$el, gridOptions, gridParams);

            if (this.gridOptions.api) {
                this.api = this.gridOptions.api;
            }

            if (this.gridOptions.columnApi) {
                this.columnApi = this.gridOptions.columnApi;
            }

            this._initialised = true;
        },
        destroyed() {
            if(this._initialised) {
                this.api.destroy();
                this._destroyed = true;
            }
        }
    };
</script>
