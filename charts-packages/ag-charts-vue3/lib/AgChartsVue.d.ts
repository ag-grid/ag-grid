import { Vue } from 'vue-class-component';
import { AgChartInstance } from 'ag-charts-community';
export declare class AgChartsVue extends Vue {
    chart?: AgChartInstance;
    private isCreated;
    private isDestroyed;
    private options;
    render(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    mounted(): void;
    destroyed(): void;
    unmounted(): void;
    processChanges(currentValue: any, previousValue: any): void;
    private applyContainerIfNotSet;
}
