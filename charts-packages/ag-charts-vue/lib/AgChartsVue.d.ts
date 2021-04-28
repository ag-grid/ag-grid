import { Vue } from 'vue-property-decorator';
export declare class AgChartsVue extends Vue {
    private isCreated;
    private isDestroyed;
    private chart;
    private options;
    render(h: any): any;
    mounted(): void;
    destroyed(): void;
    private processChanges;
    private applyContainerIfNotSet;
}
