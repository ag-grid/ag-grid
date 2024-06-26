import type { AgEvent, BeanCollection, ColDef, ITooltipParams, SetFilterParams, ValueFormatterParams, WithoutGridCommon } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { SetFilterModelTreeItem } from './iSetDisplayValueModel';
import type { ISetFilterLocaleText } from './localeText';
export interface SetFilterListItemSelectionChangedEvent<I extends SetFilterModelTreeItem | string | null = SetFilterModelTreeItem | string | null> extends AgEvent<'selectionChanged'> {
    isSelected: boolean;
    item: I;
}
export interface SetFilterListItemExpandedChangedEvent<I extends SetFilterModelTreeItem | string | null = SetFilterModelTreeItem | string | null> extends AgEvent<'expandedChanged'> {
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
export type SetFilterListItemEvent = 'selectionChanged' | 'expandedChanged';
/** @param V type of value in the Set Filter */
export declare class SetFilterListItem<V> extends Component<SetFilterListItemEvent> {
    private valueService;
    private userComponentFactory;
    wireBeans(beans: BeanCollection): void;
    private readonly eCheckbox;
    private readonly eGroupOpenedIcon;
    private readonly eGroupClosedIcon;
    private readonly eGroupIndeterminateIcon;
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
    postConstruct(): void;
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
