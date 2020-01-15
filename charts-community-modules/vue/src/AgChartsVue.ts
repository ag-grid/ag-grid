import {Component, Vue} from 'vue-property-decorator';
import {AgChart, Chart} from 'ag-charts-community';

@Component({
    watch: {
        $props: {
            handler: (this as any).processChanges,
            deep: true,
            immediate: true,
        },
    },
})
export class AgChartsVue extends Vue {
    private isCreated = false;
    private isDestroyed = false;

    private chart!: Chart;

    public render(h: any) {
        return h('div');
    }

    public processChanges(currentValue: any, previousValue: any) {
        console.log(currentValue, previousValue);
        if (this.isCreated) {
            console.log('Created');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public mounted() {
        console.log(this);
        console.log((this as any).$vm);
        this.isCreated = true;
    }

    // noinspection JSUnusedGlobalSymbols
    public destroyed() {
        if (this.isCreated) {
            if (this.chart) {
                this.chart.destroy();
            }
            this.isDestroyed = true;
        }
    }
}
