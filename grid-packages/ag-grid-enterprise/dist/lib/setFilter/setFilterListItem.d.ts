import { AgEvent, ColDef, Component, ISetFilterParams } from 'ag-grid-community';
export interface SelectedEvent extends AgEvent {
}
export declare class SetFilterListItem extends Component {
    private readonly value;
    private readonly params;
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private valueFormatterService;
    private userComponentFactory;
    private eFilterItemValue;
    private static TEMPLATE;
    private eCheckbox;
    private selected;
    private tooltipText;
    constructor(value: any, params: ISetFilterParams);
    private init;
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    private updateCheckboxIcon;
    render(): void;
    private getFormattedValue;
    private renderCell;
    getComponentHolder(): ColDef;
    getTooltipText(): string;
}
