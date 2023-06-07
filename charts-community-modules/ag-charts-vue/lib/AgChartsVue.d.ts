import { Vue } from 'vue-property-decorator';
import { AgChartInstance } from 'ag-charts-community';
export declare class AgChartsVue extends Vue {
    chart?: AgChartInstance;
    private isCreated;
    private isDestroyed;
    private options;
    render(h: any): any;
    mounted(): void;
    destroyed(): void;
    private processChanges;
    private applyContainerIfNotSet;
}
