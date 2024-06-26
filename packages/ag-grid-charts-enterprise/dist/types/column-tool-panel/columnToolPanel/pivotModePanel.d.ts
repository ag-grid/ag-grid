import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class PivotModePanel extends Component {
    private columnModel;
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    private readonly cbPivotMode;
    private createTemplate;
    postConstruct(): void;
    private onBtPivotMode;
    private onPivotModeChanged;
}
