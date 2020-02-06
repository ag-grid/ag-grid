import { Component, Vue } from 'vue-property-decorator';
import { AgChart, Chart } from 'ag-charts-community';

export interface AgLegendProps {
    enabled?: boolean;
    padding?: number;
    itemPaddingX?: number;
    itemPaddingY?: number;
    markerSize?: number;
    markerStrokeWidth?: number;
    labelColor?: string;
    labelFontFamily?: string;
}

export interface Series {
    type?: string;
    xKey: string;
    yKey: string;
}

export interface AgChartOptions {
    width?: number;
    height?: number;
    data?: any[];
    series: Series[];
    legend?: AgLegendProps;
}

@Component({
    props: {
        options: {},
    },
})
export class AgChartsVue extends Vue {
    private isCreated = false;
    private isDestroyed = false;

    private chart!: Chart;

    private options!: AgChartOptions;

    public render(h: any) {
        return h('div', { style: { height: '100%' } });
    }

    public mounted() {
        const options = this.applyContainerIfNotSet(this.options);

        this.chart = AgChart.create(options);

        this.$watch('options', (newValue, oldValue) => {
            this.processChanges(newValue, oldValue);
        });

        this.isCreated = true;
    }

    public destroyed() {
        if (this.isCreated) {
            if (this.chart) {
                this.chart.destroy();
            }

            this.isDestroyed = true;
        }
    }

    private processChanges(currentValue: any, previousValue: any) {
        if (this.isCreated) {
            AgChart.update(this.chart, this.applyContainerIfNotSet(this.options));
        }
    }

    private applyContainerIfNotSet(propsOptions: any) {
        if (propsOptions.container) {
            return propsOptions;
        }

        return { ...propsOptions, container: this.$el };
    }
}
