import { AgEvent, ColDef, Component, ISetFilterParams, ITooltipParams } from 'ag-grid-community';
import { ISetFilterLocaleText } from './localeText';
export interface SetFilterListItemSelectionChangedEvent extends AgEvent {
    isSelected: boolean;
}
export declare class SetFilterListItem extends Component {
    private readonly value;
    private readonly params;
    private readonly translate;
    private isSelected?;
    static EVENT_SELECTION_CHANGED: string;
    private readonly gridOptionsWrapper;
    private readonly valueFormatterService;
    private readonly userComponentFactory;
    private static TEMPLATE;
    private readonly eCheckbox;
    private tooltipText;
    constructor(value: string | (() => string), params: ISetFilterParams, translate: (key: keyof ISetFilterLocaleText) => string, isSelected?: boolean);
    private init;
    toggleSelected(): void;
    render(): void;
    getTooltipParams(): ITooltipParams;
    private getFormattedValue;
    private renderCell;
    getComponentHolder(): ColDef;
}
