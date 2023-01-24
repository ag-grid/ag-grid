import {h} from 'vue';
import {Options, Vue} from 'vue-class-component';
import {AgChart, AgChartOptions, AgChartInstance} from 'ag-charts-community';
import {toRaw} from '@vue/reactivity';

@Options({
    props: {
        options: {},
    },
    emits: ['onChartReady'],
    // watch: {
    //     options: {
    //         handler(currentValue, previousValue) {
    //             this.processChanges( currentValue, previousValue);
    //         },
    //         deep: true,
    //     },
    // },
})
export class AgChartsVue extends Vue {
    public chart?: AgChartInstance;

    private isCreated = false;
    private isDestroyed = false;

    private options!: AgChartOptions;

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    public render() {
        return h('div', {style: {height: '100%'}, ref: 'agChartRef'});
    }

    public mounted() {
        const options = this.applyContainerIfNotSet(this.options);

        this.chart = AgChart.create(options);

        this.$watch('options', (newValue: any, oldValue: any) => {
            this.processChanges(newValue, oldValue);
        }, {
            deep: true,
        });

        this.isCreated = true;

        (this.chart as any).chart.waitForUpdate()
            .then(() => this.$emit('onChartReady', this.chart!));
    }

    public destroyed() {
        if (this.isCreated) {
            if (this.chart) {
                this.chart.destroy();
            }

            this.isDestroyed = true;
        }
    }

    public unmounted() {
        this.destroyed();
    }

    public processChanges(currentValue: any, previousValue: any) {
        if (this.isCreated && this.chart) {
            AgChart.update(this.chart, toRaw(this.applyContainerIfNotSet(toRaw(this.options))));
        }
    }

    private applyContainerIfNotSet(propsOptions: AgChartOptions): AgChartOptions {
        if (propsOptions.container) {
            return propsOptions;
        }

        return {...propsOptions, container: this.$refs.agChartRef as HTMLElement};
    }
}
