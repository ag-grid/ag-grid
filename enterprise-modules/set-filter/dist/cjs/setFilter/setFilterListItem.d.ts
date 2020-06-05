import { AgEvent, ColDef, Component, ISetFilterParams } from '@ag-grid-community/core';
import { ISetFilterLocaleText } from './localeText';
export interface SelectedEvent extends AgEvent {
}
export declare class SetFilterListItem extends Component {
    private readonly value;
    private readonly params;
    private readonly translate;
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private valueFormatterService;
    private userComponentFactory;
    private eFilterItemValue;
    private static TEMPLATE;
    private eCheckbox;
    private selected;
    private tooltipText;
    constructor(value: any, params: ISetFilterParams, translate: (key: keyof ISetFilterLocaleText) => string);
    private init;
    isSelected(): boolean;
    setSelected(selected: boolean, forceEvent?: boolean): void;
    private updateCheckboxIcon;
    render(): void;
    private getFormattedValue;
    private renderCell;
    getComponentHolder(): ColDef;
    getTooltipText(): string;
}
