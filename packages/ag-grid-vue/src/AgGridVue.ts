import { Component, Prop, Vue } from 'vue-property-decorator';
import { Bean, ComponentUtil, Grid, GridOptions } from 'ag-grid-community';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties, Properties } from './Utils';

const [props, watch, model] = getAgGridProperties();

@Bean('agGridVue')
@Component({
    props,
    watch,
    model
})
export class AgGridVue extends Vue {

    @Prop(Boolean)
    public autoParamsRefresh!: boolean;

    @Prop({default: () => []})
    public componentDependencies!: string[];

    private gridCreated = false;
    private isDestroyed = false;
    private gridReadyFired = false;

    private gridOptions!: GridOptions;

    private static ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    public render(h: any) {
        return h('div');
    }

    public globalEventListener(eventType: string, event: any) {
        if (this.isDestroyed) {
            return;
        }

        if (eventType === 'gridReady') {
            this.gridReadyFired = true;
        }

        this.updateModelIfUsed(eventType);

        // only emit if someone is listening
        // we allow both kebab and camelCase event listeners, so check for both
        const kebabName = AgGridVue.kebabProperty(eventType);
        if (this.$listeners[kebabName]) {
            this.$emit(kebabName, event);
        } else if (this.$listeners[eventType]) {
            this.$emit(eventType, event);
        }
    }

    public processChanges(propertyName: string, currentValue: any, previousValue: any) {
        if (this.gridCreated) {
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

        this.checkForBindingConflicts();

        gridOptions.rowData = this.getRowDataBasedOnBindings();

        const gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            seedBeanInstances: {
                frameworkComponentWrapper,
            },
        };

        new Grid(this.$el as HTMLElement, gridOptions, gridParams);

        this.gridCreated = true;
    }

    private checkForBindingConflicts() {
        const thisAsAny = (this as any);
        if ((thisAsAny.rowData || this.gridOptions.rowData) &&
            thisAsAny.rowDataModel) {
            console.warn("ag-grid: Using both rowData and rowDataModel. rowData will be ignored.");
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public destroyed() {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    }

    private static kebabProperty(property: string) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    private getRowData(): any[] {
        const rowData: any[] = [];
        this.gridOptions!.api!.forEachNode((rowNode) => {
            rowData.push(rowNode.data)
        });
        return rowData;
    }

    private updateModelIfUsed(eventType: string) {
        if (this.gridReadyFired &&
            this.$listeners['data-model-changed'] &&
            AgGridVue.ROW_DATA_EVENTS.indexOf(eventType) !== -1) {
            this.$emit('data-model-changed', this.getRowData());
        }
    }

    private getRowDataBasedOnBindings() {
        const thisAsAny = (this as any);

        const rowDataModel = thisAsAny.rowDataModel;
        return rowDataModel ? rowDataModel :
            thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
    }
}
