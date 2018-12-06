import {Component, Vue} from 'vue-property-decorator';
import {ComponentUtil, Grid, GridOptions} from 'ag-grid-community';
import {VueFrameworkComponentWrapper} from './VueFrameworkComponentWrapper';
import {VueFrameworkFactory} from './VueFrameworkFactory';
import {getAgGridProperties, Properties} from './Utils';

const [props, watch] = getAgGridProperties();

@Component({
    props,
    watch,
})
export class AgGridVue extends Vue {
    private isInitialised = false;
    private isDestroyed = false;

    private gridOptions!: GridOptions;

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    public render(h: any) {
        return h('div');
    }

    public globalEventListener(eventType: string, event: any) {
        if (this.isDestroyed) {
            return;
        }

        // generically look up the eventType
        const emitter = (this as any)[eventType];
        if (emitter) {
            emitter(event);
        }
    }

    public processChanges(propertyName: string, currentValue: any, previousValue: any) {
        if (this.isInitialised) {
            const changes: Properties = {};
            changes[propertyName] = {
                currentValue,
                previousValue,
            };
            ComponentUtil.processOnChange(changes,
                this.gridOptions,
                this.gridOptions.api!,
                this.gridOptions.columnApi!);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public mounted() {
        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        const frameworkFactory = new VueFrameworkFactory(this.$el, this);
        const gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

        const gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory,
            seedBeanInstances: {
                frameworkComponentWrapper,
            },
        };

        new Grid(this.$el, gridOptions, gridParams);

        this.isInitialised = true;
    }

    // noinspection JSUnusedGlobalSymbols
    public destroyed() {
        if (this.isInitialised) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    }
}
