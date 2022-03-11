import { Vue } from 'vue-class-component';
export declare class AgChartsVue extends Vue {
    private isCreated;
    private isDestroyed;
    private chart;
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
