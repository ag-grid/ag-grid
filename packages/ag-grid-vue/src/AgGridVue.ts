import { Component, Prop, Vue } from 'vue-property-decorator';
import { Bean, ComponentUtil, Grid, GridOptions } from 'ag-grid-community';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties, Properties } from './Utils';

const [props, watch] = getAgGridProperties();

@Bean('agGridVue')
@Component({
    props,
    watch,
})
export class AgGridVue extends Vue {

    @Prop(Boolean)
    public autoParamsRefresh!: boolean;

    @Prop({default: () => []})
    public componentDependencies!: string[];
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

        // only emit if someone is listening
        // we allow both kebab and camelCase event listeners, so check for both
        const kebabName = this.kebabProperty(eventType);
        if (this.$listeners[kebabName]) {
            this.$emit(kebabName, event);
        } else if (this.$listeners[eventType]) {
            this.$emit(eventType, event);
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
        const gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);

        const gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            seedBeanInstances: {
                frameworkComponentWrapper,
            },
        };

        new Grid(this.$el as HTMLElement, gridOptions, gridParams);

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

    private kebabProperty(property: string) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
