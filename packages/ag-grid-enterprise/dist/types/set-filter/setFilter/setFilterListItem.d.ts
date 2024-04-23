import { AgEvent, ColDef, Component, SetFilterParams, ITooltipParams, WithoutGridCommon, ValueFormatterParams } from 'ag-grid-community';
import { SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { ISetFilterLocaleText } from './localeText';
export interface SetFilterListItemSelectionChangedEvent<I extends SetFilterModelTreeItem | string | null = SetFilterModelTreeItem | string | null> extends AgEvent {
    isSelected: boolean;
    item: I;
}
export interface SetFilterListItemExpandedChangedEvent<I extends SetFilterModelTreeItem | string | null = SetFilterModelTreeItem | string | null> extends AgEvent {
    isExpanded: boolean;
    item: I;
}
export interface SetFilterListItemParams<V> {
    focusWrapper: HTMLElement;
    value: V | null | (() => string);
    params: SetFilterParams<any, V>;
    translate: (key: keyof ISetFilterLocaleText) => string;
    valueFormatter?: (params: ValueFormatterParams) => string;
    item: SetFilterModelTreeItem | string | null;
    isSelected: boolean | undefined;
    isTree?: boolean;
    depth?: number;
    groupsExist?: boolean;
    isGroup?: boolean;
    isExpanded?: boolean;
    hasIndeterminateExpandState?: boolean;
}
/** @param V type of value in the Set Filter */
export declare class SetFilterListItem<V> extends Component {
    static EVENT_SELECTION_CHANGED: string;
    static EVENT_EXPANDED_CHANGED: string;
    private readonly valueService;
    private readonly userComponentFactory;
    private static GROUP_TEMPLATE;
    private static TEMPLATE;
    private readonly eCheckbox;
    private eGroupOpenedIcon;
    private eGroupClosedIcon;
    private eGroupIndeterminateIcon;
    private readonly focusWrapper;
    private readonly value;
    private readonly params;
    private readonly translate;
    private readonly valueFormatter?;
    private readonly isTree?;
    private readonly depth;
    private readonly isGroup?;
    private readonly groupsExist?;
    private readonly hasIndeterminateExpandState?;
    private item;
    private isSelected;
    private isExpanded;
    private valueFunction?;
    private cellRendererParams;
    private cellRendererComponent?;
    private destroyCellRendererComponent?;
    constructor(params: SetFilterListItemParams<V>);
    private init;
    getFocusableElement(): HTMLElement;
    private setupExpansion;
    private onExpandOrContractClicked;
    setExpanded(isExpanded: boolean | undefined, silent?: boolean): void;
    private setExpandedIcons;
    private onCheckboxChanged;
    toggleSelected(): void;
    private setSelected;
    private refreshVariableAriaLabels;
    private setupFixedAriaLabels;
    private refreshAriaChecked;
    private refreshAriaExpanded;
    refresh(item: SetFilterModelTreeItem | string | null, isSelected: boolean | undefined, isExpanded: boolean | undefined): void;
    render(): void;
    private setTooltipAndCellRendererParams;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    private getFormattedValue;
    private renderCell;
    private renderCellWithoutCellRenderer;
    getComponentHolder(): ColDef;
}
